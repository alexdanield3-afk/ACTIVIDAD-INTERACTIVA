'use strict';
// Motor del juego MULTIVERSE CHALLENGE (servidor autoritativo).
// El servidor es la única fuente de verdad: temporizador, puntuación, respuestas correctas y salas de chat.
// Los clientes sólo reciben una "vista" (snapshot) filtrada: nunca se envían respuestas correctas antes del reveal.

const U = require('./util');
const shields = require('./shields');
const content = require('./content');
const { DemoBots } = require('./bots');

const INTRO_MS = 4000;
const MAX_PLAYERS = 40;
const STEAL_POWER = 40;
const STEAL_ROULETTE = 50;
const SPIN_WINDOW_MS = 25000;
const SPEED_MAX = 25; // la rapidez nunca vale más que acertar
const READY_AUTO_MS = 9000;
const REVEAL_AUTO_MS = 11000;
const SCORE_AUTO_MS = 10000;

const POWERS = {
  shield: { name: 'Escudo', emoji: '🛡️', desc: 'Protege al equipo de perder puntos. Se activa solo cuando llega una pérdida.' },
  double: { name: 'Doble', emoji: '✨', desc: 'Duplica los puntos de la prueba en curso. Actívalo antes de bloquear la respuesta.' },
  hint: { name: 'Pista', emoji: '💡', desc: 'Elimina opciones incorrectas, revela una pista extra o el primer elemento.' },
  time: { name: 'Tiempo extra', emoji: '⏱️', desc: 'Agrega 15 segundos a tu equipo en la prueba en curso.' },
  steal: { name: 'Robo', emoji: '🦝', desc: `Quita ${STEAL_POWER} puntos a otro equipo (un escudo lo bloquea).` },
};

const SEGMENTS = [
  { id: 'p100', label: '+100', sub: 'PUNTOS', emoji: '💰', color: '#f59e0b' },
  { id: 'double', label: 'DOBLE', sub: 'PUNTUACIÓN', emoji: '✨', color: '#a855f7' },
  { id: 'easy', label: 'PREGUNTA', sub: 'FÁCIL', emoji: '🟢', color: '#16a34a' },
  { id: 'steal50', label: 'ROBA 50', sub: 'PUNTOS', emoji: '🦝', color: '#ef4444' },
  { id: 'p200', label: '+200', sub: 'PUNTOS', emoji: '💎', color: '#0891b2' },
  { id: 'shield', label: 'ESCUDO', sub: '', emoji: '🛡️', color: '#2563eb' },
  { id: 'hard', label: 'PREGUNTA', sub: 'DIFÍCIL', emoji: '🔴', color: '#b91c1c' },
  { id: 'minus50', label: '-50', sub: 'PUNTOS', emoji: '💀', color: '#475569' },
  { id: 'bonus', label: 'BONUS', sub: '+50 y poder', emoji: '🎁', color: '#db2777' },
  { id: 'surprise', label: 'RETO', sub: 'SORPRESA', emoji: '🎲', color: '#0d9488' },
  { id: 'hint', label: 'PISTA', sub: '', emoji: '💡', color: '#ca8a04' },
  { id: 'organizer', label: 'EL ORGANIZADOR', sub: 'DECIDE', emoji: '🎓', color: '#7c3aed' },
];

const KINDS = {
  quiz: { label: 'QUIZ', short: 'QUIZ', icon: '❓', dur: 60, type: 'choice' },
  tf: { label: 'VERDADERO O FALSO', short: 'V / F', icon: '⚖️', dur: 40, type: 'tf' },
  wwyd: { label: '¿QUÉ HARÍAS?', short: '¿QUÉ HARÍAS?', icon: '🧭', dur: 60, type: 'wwyd' },
  order: { label: 'ORDENA', short: 'ORDENA', icon: '🔢', dur: 60, type: 'order' },
  memory: { label: 'MEMORIA', short: 'MEMORIA', icon: '🧠', dur: 60, type: 'choice' },
  guess: { label: 'ADIVINA', short: 'ADIVINA', icon: '🕵️', dur: 60, type: 'guess' },
  connection: { label: 'CONEXIÓN', short: 'CONEXIÓN', icon: '🔗', dur: 60, type: 'choice' },
  quick: { label: 'RETO RÁPIDO', short: 'RÁPIDO', icon: '⚡', dur: 20, type: 'choice' },
  strategic: { label: 'ELECCIÓN ESTRATÉGICA', short: 'ESTRATEGIA', icon: '♟️', dur: 45, type: 'strategic' },
  bonus: { label: 'BONUS', short: 'BONUS', icon: '🎁', dur: 30, type: 'choice' },
  boss: { label: 'JEFE FINAL', short: 'JEFE FINAL', icon: '🐲', dur: 60, type: 'choice' },
  roulette: { label: 'RULETA', short: 'RULETA', icon: '🎡', dur: 60, type: 'roulette' },
};

const BADGES = {
  racha: { name: 'Racha de fuego', emoji: '🔥', desc: '3 retos superados seguidos', test: (t) => t.stats.bestStreak >= 3 },
  jefe: { name: 'Cazadores de jefes', emoji: '🐲', desc: 'Vencieron al jefe final', test: (t) => t.stats.boss },
  rayo: { name: 'Rayo', emoji: '⚡', desc: 'Las respuestas correctas más rápidas (2+ veces)', test: (t) => t.stats.fastest >= 2 },
  ruleta: { name: 'Reyes de la ruleta', emoji: '🎰', desc: 'Más de 250 puntos ganados en la ruleta', test: (t) => t.stats.rouletteGain >= 250 },
  ladron: { name: 'Ladrones de guante blanco', emoji: '🦝', desc: 'Robaron puntos 2 veces o más', test: (t) => t.stats.steals >= 2 },
  muro: { name: 'Muro inquebrantable', emoji: '🛡️', desc: 'Su escudo bloqueó una pérdida', test: (t) => t.stats.shieldBlocks >= 1 },
  memoria: { name: 'Memoria de elefante', emoji: '🐘', desc: 'Superaron un reto de memoria', test: (t) => t.stats.memoryOk >= 1 },
  mente: { name: 'Mente maestra', emoji: '🧠', desc: 'Ganaron una apuesta estratégica', test: (t) => t.stats.gambleWins >= 1 },
  charla: { name: 'Equipo hablador', emoji: '💬', desc: 'Más de 15 mensajes en su chat', test: (t) => t.stats.chat >= 15 },
  perfecto: { name: 'Intachables', emoji: '💎', desc: 'Superaron todos los retos puntuables', test: (t, g) => t.stats.scored >= 5 && t.stats.failed === 0 && g.status === 'finished' },
  campeon: { name: 'Campeones', emoji: '👑', desc: 'Ganaron la aventura', test: (t) => t.stats.champion },
};

function newStats() {
  return { streak: 0, bestStreak: 0, fastest: 0, rouletteGain: 0, steals: 0, shieldBlocks: 0, memoryOk: 0, boss: false, gambleWins: 0, chat: 0, scored: 0, failed: 0, champion: false };
}

function newTR() {
  return {
    draft: null, draftBy: null, locked: false, lockedAt: null, doubleOn: false, hidden: [], extraMs: 0,
    timeUsed: false, hintUsed: false, extraClues: 0, attempts: 3, guesses: [], guessCorrect: false, cluesAtSolve: 0,
    hintText: null, dl: null, autoSpinAt: null, rl: null, rq: null,
  };
}

function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

function stripArticles(s) {
  return s.replace(/^(el|la|los|las|un|una|de|del)\s+/, '').trim();
}

function guessMatches(text, answers) {
  const t = stripArticles(U.norm(text));
  if (!t) return false;
  return answers.some((a) => {
    const n = stripArticles(U.norm(a));
    if (t === n) return true;
    if (n.length >= 6 && lev(t, n) <= 1) return true;
    if (n.length >= 10 && lev(t, n) <= 2) return true;
    return false;
  });
}

class Game {
  constructor(hub, cfg) {
    this.hub = hub;
    this.code = hub.newCode();
    this.hostKey = U.uid(16);
    this.name = U.cleanText(cfg.name, 40) || 'Multiverse Challenge';
    const demo = [10, 15, 20, 25, 30].includes(+cfg.demo) ? +cfg.demo : 0;
    const expected = demo || U.clamp(parseInt(cfg.expected, 10) || 20, 2, MAX_PLAYERS);
    const tw = parseInt(cfg.teams, 10);
    this.cfg = {
      expected,
      teamsWanted: tw >= 2 && tw <= 8 ? tw : null,
      themeId: content.exists(cfg.themeId) && cfg.themeId !== 'caos' ? cfg.themeId : (content.exists('ia') ? 'ia' : content.list()[0].id),
      chaos: !!cfg.chaos,
      length: ['corta', 'normal', 'larga'].includes(cfg.length) ? cfg.length : 'normal',
      spy: !!cfg.spy,
      auto: demo ? true : !!cfg.auto,
      demo,
      fast: !!(demo && cfg.fast),
    };
    this.status = 'lobby';
    this.paused = false;
    this.pausedAt = 0;
    this.teams = [];
    this.players = new Map();
    this.plan = [];
    this.stageIdx = -1;
    this.round = null;
    this.readyAt = null;
    this.chat = {};
    this.log = [];
    this.clients = new Set();
    this.used = new Map();
    this.custom = null;
    this.final = null;
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
    this._dirty = false;
    this._sig = '';
    this.buildTeams(this.cfg.teamsWanted || U.recommendTeams(expected));
    this.timer = setInterval(() => this.tick(), 250);
    if (demo) {
      this.bots = new DemoBots(this);
      this.bots.spawn(demo);
    }
  }

  destroy() {
    clearInterval(this.timer);
    if (this.bots) this.bots.stop();
    for (const c of this.clients) {
      try { c.ws.close(); } catch (e) { /* noop */ }
    }
    this.clients.clear();
  }

  // ---- Utilidades ------------------------------------------------------------
  revealMs() { return this.cfg.fast ? 6000 : REVEAL_AUTO_MS; }

  scoreMs() { return this.cfg.fast ? 5000 : SCORE_AUTO_MS; }

  phase() {
    if (this.status === 'lobby') return 'lobby';
    if (this.status === 'finished') return 'finished';
    return this.round ? this.round.state : 'ready';
  }

  teamById(id) { return this.teams.find((t) => t.id === id) || null; }

  themeData(id) {
    if (id === 'custom' && this.custom) return this.custom;
    return content.get(id) || content.get('ia') || content.get(content.list()[0].id);
  }

  currentThemeId() { return this.cfg.chaos ? 'caos' : this.cfg.themeId; }

  themeMeta(id) {
    return content.meta(this.themeData(id || this.currentThemeId()));
  }

  mark() {
    if (this._dirty) return;
    this._dirty = true;
    setTimeout(() => this.flush(), 70);
  }

  flush() {
    this._dirty = false;
    this.rankTeams();
    for (const c of this.clients) this.send(c, { t: 'snap', v: this.viewFor(c) });
  }

  send(c, msg) {
    if (c.ws && c.ws.readyState === 1) {
      try { c.ws.send(JSON.stringify(msg)); } catch (e) { /* noop */ }
    }
  }

  toast(c, text, kind = 'info') { this.send(c, { t: 'toast', text, kind }); }

  toHosts(msg) {
    for (const c of this.clients) if (c.role === 'host') this.send(c, msg);
  }

  toTeam(team, msg) {
    for (const c of this.clients) {
      if (c.role === 'player') {
        const p = this.players.get(c.pid);
        if (p && p.teamId === team.id) this.send(c, msg);
      }
    }
  }

  logEvent(text, kind = 'info', teamId = null) {
    this.log.push({ ts: Date.now(), text, kind, teamId });
    if (this.log.length > 60) this.log.shift();
  }

  sysChat(team, text) {
    const msg = { id: U.uid(6), tid: team.id, pid: null, name: 'Sistema', text, ts: Date.now(), sys: true };
    this.pushChat(team, msg);
  }

  pushChat(team, msg) {
    const arr = (this.chat[team.id] = this.chat[team.id] || []);
    arr.push(msg);
    if (arr.length > 150) arr.shift();
    this.toTeam(team, { t: 'chat', msg });
    if (this.cfg.spy) this.toHosts({ t: 'chat', msg });
  }

  rankTeams() {
    const sorted = this.teams.slice().sort((a, b) => b.score - a.score);
    for (const t of this.teams) t.rank = 1 + sorted.filter((o) => o.score > t.score).length;
  }

  grantPower(team, power, n = 1) {
    team.powers[power] = (team.powers[power] || 0) + n;
  }

  randomPower(allowSteal = true) {
    const bag = [['hint', 30], ['time', 25], ['double', 20], ['shield', 15]];
    if (allowSteal) bag.push(['steal', 10]);
    const total = bag.reduce((s, b) => s + b[1], 0);
    let x = Math.random() * total;
    for (const [p, w] of bag) { x -= w; if (x <= 0) return p; }
    return 'hint';
  }

  // Aplica un cambio de puntos. Las pérdidas pueden ser bloqueadas por un escudo.
  applyDelta(team, delta, why = '') {
    if (delta < 0 && team.powers.shield > 0) {
      team.powers.shield--;
      team.stats.shieldBlocks++;
      this.logEvent(`🛡️ El escudo de ${team.name} bloqueó una pérdida de ${-delta} puntos`, 'shield', team.id);
      this.sysChat(team, `🛡️ ¡El escudo del equipo bloqueó la pérdida de ${-delta} puntos!`);
      this.checkBadges(team);
      return { blocked: true, applied: 0 };
    }
    const before = team.score;
    team.score = Math.max(0, team.score + delta);
    return { blocked: false, applied: team.score - before };
  }

  doSteal(thief, amount, target, why = 'robo') {
    if (!target || target.id === thief.id) return { blocked: false, applied: 0, none: true };
    if (target.powers.shield > 0) {
      target.powers.shield--;
      target.stats.shieldBlocks++;
      this.logEvent(`🛡️ ${target.name} bloqueó el robo de ${thief.name}`, 'shield', target.id);
      this.sysChat(target, `🛡️ ¡Su escudo bloqueó un robo de ${thief.name}!`);
      this.sysChat(thief, `🛡️ ${target.name} tenía escudo: el robo fue bloqueado.`);
      this.checkBadges(target);
      return { blocked: true, applied: 0 };
    }
    const taken = Math.min(amount, target.score);
    target.score -= taken;
    thief.score += taken;
    if (taken > 0) {
      thief.stats.steals++;
      this.logEvent(`🦝 ${thief.name} robó ${taken} puntos a ${target.name}`, 'steal', thief.id);
      this.sysChat(thief, `🦝 Robaron ${taken} puntos a ${target.name}.`);
      this.sysChat(target, `🦝 ${thief.name} les robó ${taken} puntos.`);
    }
    this.checkBadges(thief);
    return { blocked: false, applied: taken, target };
  }

  checkBadges(team) {
    for (const [id, b] of Object.entries(BADGES)) {
      if (!team.badges.includes(id) && b.test(team, this)) {
        team.badges.push(id);
        this.logEvent(`${b.emoji} ${team.name} consiguió la insignia «${b.name}»`, 'badge', team.id);
        this.sysChat(team, `${b.emoji} ¡Nueva insignia: ${b.name}!`);
      }
    }
  }

  // ---- Equipos ---------------------------------------------------------------
  makeTeam(i, nameObj, shield) {
    return {
      id: 't' + (i + 1), idx: i, name: nameObj ? nameObj.n : `Equipo ${i + 1}`, customName: false,
      shield, color: shield.c1, score: 0, prevScore: 0, rank: 1, prevRank: 1, progress: 0,
      powers: { shield: 0, double: 0, hint: 0, time: 0, steal: 0 }, stats: newStats(), badges: [],
      skill: 0.45 + Math.random() * 0.42,
    };
  }

  buildTeams(k, keepExisting = false) {
    const theme = this.themeData(this.currentThemeId());
    const pool = U.shuffle(theme.teams);
    const symbols = pool.map((x) => x.s);
    const shs = shields.makeShields(k, symbols);
    const old = keepExisting ? this.teams : [];
    const usedNames = new Set(old.slice(0, k).map((t) => t.name));
    const free = pool.filter((p) => !usedNames.has(p.n));
    const out = [];
    for (let i = 0; i < k; i++) {
      if (old[i]) { out.push(old[i]); continue; }
      const nm = free.shift() || pool[i % pool.length];
      let name = nm && !usedNames.has(nm.n) ? nm : { n: `Equipo ${i + 1}`, s: shs[i].symbol };
      usedNames.add(name.n);
      const sh = { ...shs[i], symbol: name.s || shs[i].symbol };
      out.push(this.makeTeam(i, name, sh));
    }
    this.teams = out.map((t, i) => { t.idx = i; t.id = 't' + (i + 1); return t; });
    for (const t of this.teams) if (!this.chat[t.id]) this.chat[t.id] = [];
  }

  members(team) {
    return [...this.players.values()].filter((p) => p.teamId === team.id);
  }

  onlineCount(team) {
    return this.members(team).filter((p) => p.online || p.bot).length;
  }

  assignTeam() {
    const counts = this.teams.map((t) => ({ t, n: this.members(t).length }));
    const min = Math.min(...counts.map((c) => c.n));
    return U.pick(counts.filter((c) => c.n === min)).t;
  }

  addPlayer(name, opts = {}) {
    if (this.players.size >= MAX_PLAYERS && !opts.bot) return null;
    let nm = U.cleanText(name, 18) || 'Jugador';
    const exists = (x) => [...this.players.values()].some((p) => p.name.toLowerCase() === x.toLowerCase());
    if (exists(nm)) { let i = 2; while (exists(`${nm} (${i})`)) i++; nm = `${nm} (${i})`; }
    const team = opts.team || this.assignTeam();
    const p = { id: U.uid(8), token: U.uid(16), name: nm, teamId: team.id, online: !!opts.online, bot: !!opts.bot, conns: 0, lastChat: [], joinedAt: Date.now() };
    this.players.set(p.id, p);
    return p;
  }

  redistribute(k) {
    const n = this.players.size;
    const count = k || this.cfg.teamsWanted || U.recommendTeams(Math.max(n, 2));
    this.buildTeams(U.clamp(count, 2, 8), true);
    const ps = U.shuffle([...this.players.values()]);
    const counts = Object.fromEntries(this.teams.map((t) => [t.id, 0]));
    for (const p of ps) {
      const min = Math.min(...Object.values(counts));
      const cand = this.teams.filter((t) => counts[t.id] === min);
      const t = U.pick(cand);
      p.teamId = t.id;
      counts[t.id]++;
    }
  }

  reskinTeams() {
    const theme = this.themeData(this.currentThemeId());
    const pool = U.shuffle(theme.teams);
    const symbols = pool.map((x) => x.s);
    const shs = shields.makeShields(this.teams.length, symbols);
    const takenCustom = new Set(this.teams.filter((t) => t.customName).map((t) => t.name));
    const free = pool.filter((p) => !takenCustom.has(p.n));
    this.teams.forEach((t, i) => {
      const nm = free.shift() || { n: `Equipo ${i + 1}`, s: shs[i].symbol };
      if (!t.customName) t.name = nm.n;
      t.shield = { ...shs[i], c1: t.shield.c1, symbol: nm.s || shs[i].symbol };
      t.color = t.shield.c1;
    });
  }

  // ---- Conexiones ------------------------------------------------------------
  attach(c) {
    this.clients.add(c);
    this.lastActivity = Date.now();
    if (c.role === 'player') {
      const p = this.players.get(c.pid);
      if (p) {
        p.conns++;
        p.online = true;
        const t = this.teamById(p.teamId);
        if (t) this.send(c, { t: 'chatHistory', teamId: t.id, msgs: this.chat[t.id] || [] });
      }
    } else if (this.cfg.spy) {
      this.send(c, { t: 'chatHistory', all: true, chats: this.chat });
    }
    this.send(c, { t: 'hello', powers: POWERS, segments: SEGMENTS, badges: Object.fromEntries(Object.entries(BADGES).map(([k, b]) => [k, { name: b.name, emoji: b.emoji, desc: b.desc }])), kinds: KINDS });
    this.send(c, { t: 'snap', v: this.viewFor(c) });
    this.mark();
  }

  detach(c) {
    this.clients.delete(c);
    if (c.role === 'player') {
      const p = this.players.get(c.pid);
      if (p) {
        p.conns = Math.max(0, p.conns - 1);
        if (!p.conns) p.online = false;
      }
    }
    this.mark();
  }

  // ---- Plan de aventura ------------------------------------------------------
  makePlan() {
    const n = { corta: 8, normal: 11, larga: 14 }[this.cfg.length];
    const arr = new Array(n).fill(null);
    arr[0] = 'quiz';
    arr[n - 1] = 'boss';
    arr[n - 2] = 'semi';
    const free = () => arr.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0);
    const place = (idx, kind) => {
      let i = idx;
      while (i < n - 2 && arr[i] !== null) i++;
      if (arr[i] === null) arr[i] = kind;
    };
    place(1, 'roulette');
    if (n >= 11) place(Math.round(n * 0.62), 'roulette');
    place(Math.round(n * 0.42), 'bonus');
    const pool = ['tf', 'wwyd', 'order', 'memory', 'guess', 'connection', 'quick', 'strategic', 'quiz'];
    let bag = U.shuffle(pool);
    for (const i of free()) {
      let k;
      for (let tries = 0; tries < 12; tries++) {
        if (!bag.length) bag = U.shuffle(pool);
        k = bag.shift();
        if (k !== arr[i - 1] && k !== arr[i + 1]) break;
        bag.push(k);
      }
      arr[i] = k;
    }
    let prevTheme = null;
    this.plan = arr.map((kind, idx) => {
      const semi = kind === 'semi';
      const realKind = semi ? 'quiz' : kind;
      let themeId = this.cfg.themeId;
      if (this.cfg.chaos) {
        const ids = content.chaosPool().filter((x) => x !== prevTheme);
        themeId = U.pick(ids);
        prevTheme = themeId;
      }
      return { idx, kind: realKind, semi, themeId, label: semi ? 'SEMIFINAL' : KINDS[realKind].short, icon: semi ? '🏰' : KINDS[realKind].icon, status: 'pending' };
    });
  }

  pickItem(themeId, bank, filter) {
    const data = this.themeData(themeId);
    let list = (data.bank && data.bank[bank]) || [];
    if (!list.length) list = (content.general().bank[bank]) || [];
    const key = `${themeId}:${bank}`;
    const used = this.used.get(key) || new Set();
    let cand = list.map((it, i) => i).filter((i) => !used.has(i) && (!filter || filter(list[i])));
    if (!cand.length) { used.clear(); cand = list.map((it, i) => i).filter((i) => !filter || filter(list[i])); }
    if (!cand.length) cand = list.map((it, i) => i);
    const i = U.pick(cand);
    used.add(i);
    this.used.set(key, used);
    return list[i];
  }

  // ---- Construcción de retos -------------------------------------------------
  makeCtx(kind, item, opt = {}) {
    const type = KINDS[kind].type;
    if (type === 'choice') {
      const idxs = U.shuffle([0, 1, 2, 3]);
      const options = idxs.map((i) => item.o[i]);
      const answer = idxs.indexOf(item.a || 0);
      const base = opt.base != null ? opt.base : ({ quiz: item.hard ? 200 : 100, memory: 100, connection: 100, quick: 75, bonus: 50, boss: 500 }[kind] || 100);
      const pub = { type: 'choice', q: item.q || '', options };
      if (kind === 'connection') { pub.words = U.shuffle(item.words); pub.q = '¿Qué tienen en común estas palabras?'; }
      if (kind === 'memory') pub.memory = { title: item.title, lines: item.lines };
      if (kind === 'boss') pub.boss = item.boss || 'El Jefe';
      return { type: 'choice', kind, base, speed: !['bonus', 'boss'].includes(kind), hard: base >= 200, pub, secret: { answer, why: item.why || '' }, power: kind === 'bonus' };
    }
    if (type === 'tf') {
      return { type: 'tf', kind, base: 75, speed: true, pub: { type: 'tf', q: item.q }, secret: { answer: !!item.a, why: item.why || '' } };
    }
    if (type === 'wwyd') {
      const idxs = U.shuffle(item.o.map((_, i) => i));
      const options = idxs.map((i) => item.o[i]);
      const scores = idxs.map((i) => item.s[i]);
      return { type: 'wwyd', kind, base: 100, speed: true, pub: { type: 'wwyd', q: item.q, options }, secret: { scores, best: scores.indexOf(Math.max(...scores)), why: item.why || '' } };
    }
    if (type === 'order') {
      const n = item.items.length;
      let perm;
      do { perm = U.shuffle([...Array(n).keys()]); } while (perm.every((v, i) => v === i));
      const display = perm.map((i) => item.items[i]);
      const correct = item.items.map((_, k) => perm.indexOf(k));
      return { type: 'order', kind, base: 100, speed: true, pub: { type: 'order', q: item.q, items: display }, secret: { correct, ordered: item.items, why: item.why || '' } };
    }
    if (type === 'guess') {
      const clues = item.clues.slice(0, 5);
      return { type: 'guess', kind, base: 200, speed: false, pub: { type: 'guess', cat: item.cat, n: clues.length }, secret: { clues, answers: item.ans, why: item.why || '' } };
    }
    if (type === 'strategic') {
      const options = [
        { label: item.safe, desc: 'Seguro: +80 puntos' },
        { label: item.risk, desc: 'Arriesgado: 50 % de +220 · 50 % de −60' },
        { label: item.ally, desc: 'Aliados: +40 puntos y un poder sorpresa' },
      ];
      return { type: 'strategic', kind, base: 0, speed: false, pub: { type: 'strategic', q: item.q, options }, secret: { why: '' } };
    }
    return null;
  }

  buildRoundCtx(stage) {
    const th = stage.themeId;
    const k = stage.kind;
    if (stage.semi) {
      const it = this.pickItem(th, 'quiz', (x) => x.hard) || this.pickItem(th, 'quiz');
      return this.makeCtx('quiz', it, { base: 200 });
    }
    const bankOf = { bonus: 'quick', quick: 'quick' };
    if (k === 'roulette') return null;
    return this.makeCtx(k, this.pickItem(th, bankOf[k] || k));
  }

  beginStage(idx, forceKind) {
    if (idx >= this.plan.length) return this.finish();
    const stage = this.plan[idx];
    if (forceKind) {
      const semi = false;
      stage.kind = forceKind;
      stage.semi = semi;
      stage.label = KINDS[forceKind].short;
      stage.icon = KINDS[forceKind].icon;
    }
    this.stageIdx = idx;
    stage.status = 'current';
    for (const t of this.teams) { t.prevScore = t.score; t.prevRank = t.rank; }
    const kd = KINDS[stage.kind];
    const now = Date.now();
    const r = {
      id: U.uid(6), idx, kind: stage.kind, semi: stage.semi, label: stage.semi ? 'SEMIFINAL' : kd.label, icon: stage.icon,
      themeId: stage.themeId, theme: content.meta(this.themeData(stage.themeId)),
      state: 'intro', dur: kd.dur, tStart: now + INTRO_MS, tEnd: null, tNext: null, memShowUntil: 0,
      ctx: this.buildRoundCtx(stage), teams: {}, results: null, reveal: null, stealUsed: {}, allDoneAt: null,
    };
    for (const t of this.teams) {
      const tr = newTR();
      if (r.ctx && r.ctx.type === 'order') tr.draft = r.ctx.pub.items.map((_, i) => i);
      r.teams[t.id] = tr;
    }
    if (r.ctx && r.ctx.type === 'guess') r.clueEvery = 11000;
    this.round = r;
    this.logEvent(`${stage.icon} ${r.label} — comienza el reto`, 'round');
    if (this.bots) this.bots.onIntro(r);
    this.mark();
  }

  activate() {
    const r = this.round;
    if (!r || r.state !== 'intro') return;
    const now = Date.now();
    r.state = 'active';
    r.tStart = now;
    r.tEnd = now + r.dur * 1000;
    if (r.kind === 'memory') r.memShowUntil = now + 10000;
    if (r.kind === 'roulette') {
      for (const t of this.teams) r.teams[t.id].autoSpinAt = now + SPIN_WINDOW_MS;
    }
    if (this.bots) this.bots.onActive(r);
    this.mark();
  }

  ctxOf(r, tr) { return r.kind === 'roulette' ? tr.rq : r.ctx; }

  deadlineOf(r, tr) { return (tr.dl || r.tEnd) + tr.extraMs; }

  isDone(r, tr) {
    if (r.kind === 'roulette') return !!tr.rl && (!tr.rq || tr.locked) && !tr.rl.pending;
    return tr.locked;
  }

  clueCount(r, tr) {
    const ctx = r.ctx;
    const n = ctx.pub.n;
    if (r.state !== 'active') return n;
    const base = 1 + Math.floor((Date.now() - r.tStart) / r.clueEvery);
    return Math.min(n, base + (tr ? tr.extraClues : 0));
  }

  // ---- Bucle principal -------------------------------------------------------
  tick() {
    if (this.status !== 'running' || this.paused) return;
    const now = Date.now();
    const r = this.round;
    if (!r) {
      if (this.cfg.auto && this.readyAt && now >= this.readyAt) { this.readyAt = null; this.beginStage(0); }
    } else if (r.state === 'intro') {
      if (now >= r.tStart) this.activate();
    } else if (r.state === 'active') {
      this.tickActive(now);
    } else if (r.state === 'reveal') {
      if (this.cfg.auto && r.tNext && now >= r.tNext) this.toScoreboard();
    } else if (r.state === 'scoreboard') {
      if (this.cfg.auto && r.tNext && now >= r.tNext) this.next();
    }
    if (this.bots) this.bots.tick(now);
    // Firma temporal: sólo se difunde cuando cambia algo visible dependiente del reloj.
    const rr = this.round;
    let sig = rr ? rr.state : 'none';
    if (rr && rr.state === 'active') {
      if (rr.ctx && rr.ctx.type === 'guess') sig += ':c' + this.clueCount(rr, null);
      if (rr.kind === 'memory') sig += ':m' + (now < rr.memShowUntil ? 1 : 0);
    }
    if (sig !== this._sig) { this._sig = sig; this.mark(); }
  }

  tickActive(now) {
    const r = this.round;
    let maxDl = r.tEnd;
    let allDone = true;
    let anyActiveTeam = false;
    for (const t of this.teams) {
      const tr = r.teams[t.id];
      const dl = this.deadlineOf(r, tr);
      if (r.kind === 'roulette' && !tr.rl && now >= tr.autoSpinAt) this.spinTeam(t, { auto: true });
      if (!this.isDone(r, tr) && now >= dl) {
        if (r.kind === 'roulette' && !tr.rl) this.spinTeam(t, { auto: true });
        if (!tr.locked) this.lockTeam(t, true);
      }
      if (dl > maxDl) maxDl = dl;
      if (this.onlineCount(t) > 0) {
        anyActiveTeam = true;
        if (!this.isDone(r, tr)) allDone = false;
      }
    }
    if (now >= maxDl) return this.endRound('time');
    if (allDone && anyActiveTeam) {
      if (!r.allDoneAt) r.allDoneAt = now;
      if (now - r.allDoneAt > 1200) this.endRound('all');
    } else r.allDoneAt = null;
  }

  // ---- Acciones de jugadores -------------------------------------------------
  setDraft(team, player, value) {
    const r = this.round;
    if (!r || r.state !== 'active' || this.paused) return 'No se puede responder ahora.';
    const tr = r.teams[team.id];
    const ctx = this.ctxOf(r, tr);
    if (!ctx || tr.locked) return 'La respuesta ya está bloqueada.';
    if (r.kind === 'memory' && Date.now() < r.memShowUntil) return 'Esperen a que se oculte la información.';
    const pub = ctx.pub;
    if (pub.type === 'choice' || pub.type === 'wwyd' || pub.type === 'strategic') {
      const i = parseInt(value, 10);
      if (!(i >= 0 && i < pub.options.length) || tr.hidden.includes(i)) return null;
      tr.draft = i;
    } else if (pub.type === 'tf') {
      tr.draft = !!value;
    } else if (pub.type === 'order') {
      const n = pub.items.length;
      if (!Array.isArray(value) || value.length !== n) return null;
      const arr = value.map((x) => parseInt(x, 10));
      if (new Set(arr).size !== n || arr.some((x) => !(x >= 0 && x < n))) return null;
      tr.draft = arr;
    } else if (pub.type === 'guess') {
      tr.draft = U.cleanText(value, 60);
    }
    tr.draftBy = player.name;
    this.mark();
    return null;
  }

  lockTeam(team, byTimeout = false, player = null) {
    const r = this.round;
    if (!r || r.state !== 'active') return;
    const tr = r.teams[team.id];
    if (tr.locked) return;
    const ctx = this.ctxOf(r, tr);
    if (!ctx) return;
    if (ctx.type === 'guess') {
      tr.locked = true;
      tr.lockedAt = byTimeout ? null : Date.now();
    } else {
      tr.locked = true;
      tr.lockedAt = byTimeout ? null : Date.now();
    }
    if (!byTimeout) {
      const secs = Math.round((tr.lockedAt - r.tStart) / 1000);
      this.sysChat(team, `🔒 Respuesta bloqueada${player ? ' por ' + player.name : ''}.`);
    } else if (tr.draft != null && tr.draft !== '') {
      this.sysChat(team, '⏰ Se acabó el tiempo: se envió la respuesta seleccionada.');
    }
    this.mark();
  }

  submitGuess(team, player, text) {
    const r = this.round;
    if (!r || r.state !== 'active' || this.paused) return 'No se puede responder ahora.';
    const tr = r.teams[team.id];
    const ctx = this.ctxOf(r, tr);
    if (!ctx || ctx.type !== 'guess') return 'Este reto no es de adivinar.';
    if (tr.locked || tr.attempts <= 0) return 'Ya no tienen intentos.';
    text = U.cleanText(text, 60);
    if (!text) return null;
    tr.guesses.push(text);
    if (guessMatches(text, ctx.secret.answers)) {
      tr.guessCorrect = true;
      tr.cluesAtSolve = this.clueCount(r, tr);
      tr.locked = true;
      tr.lockedAt = Date.now();
      this.sysChat(team, `✅ ¡${player.name} acertó con «${text}»! (la solución se revela al final)`);
    } else {
      tr.attempts--;
      this.sysChat(team, `❌ ${player.name} intentó «${text}»: no es correcto. Quedan ${tr.attempts} intentos.`);
      if (tr.attempts <= 0) { tr.locked = true; tr.lockedAt = null; this.sysChat(team, '😵 Se acabaron los intentos.'); }
    }
    this.mark();
    return null;
  }

  usePower(team, player, power, targetId) {
    const r = this.round;
    if (!POWERS[power]) return 'Poder desconocido.';
    if (this.paused) return 'La partida está en pausa.';
    if ((team.powers[power] || 0) <= 0) return 'No tienen ese poder.';
    if (power === 'shield') return 'El escudo se activa solo cuando llega una pérdida de puntos.';
    if (power === 'steal') {
      if (!r || !['active', 'reveal', 'scoreboard'].includes(r.state)) return 'El robo sólo se puede usar durante la aventura.';
      if (r.stealUsed[team.id]) return 'Sólo un robo por reto.';
      const target = this.teamById(targetId);
      if (!target || target.id === team.id) return 'Elige otro equipo.';
      team.powers.steal--;
      r.stealUsed[team.id] = true;
      this.doSteal(team, STEAL_POWER, target, 'poder');
      this.mark();
      return null;
    }
    if (!r || r.state !== 'active') return 'Este poder sólo se usa durante un reto.';
    const tr = r.teams[team.id];
    const ctx = this.ctxOf(r, tr);
    if (!ctx || tr.locked) return 'Ya bloquearon la respuesta.';
    if (Date.now() >= this.deadlineOf(r, tr)) return 'Se acabó el tiempo.';
    if (power === 'double') {
      if (tr.doubleOn) return 'El doble ya está activado.';
      team.powers.double--;
      tr.doubleOn = true;
      this.sysChat(team, `✨ ${player.name} activó DOBLE: esta prueba vale el doble.`);
    } else if (power === 'time') {
      if (tr.timeUsed) return 'Sólo un tiempo extra por reto.';
      team.powers.time--;
      tr.timeUsed = true;
      tr.extraMs += 15000;
      this.sysChat(team, `⏱️ ${player.name} activó TIEMPO EXTRA: +15 segundos para el equipo.`);
    } else if (power === 'hint') {
      if (tr.hintUsed) return 'Sólo una pista por reto.';
      const pub = ctx.pub;
      if (pub.type === 'tf' || pub.type === 'strategic') return 'La pista no aplica en este tipo de reto.';
      if (pub.type === 'choice') {
        const wrong = pub.options.map((_, i) => i).filter((i) => i !== ctx.secret.answer && !tr.hidden.includes(i));
        tr.hidden.push(...U.shuffle(wrong).slice(0, 2));
      } else if (pub.type === 'wwyd') {
        const worst = pub.options.map((_, i) => i).filter((i) => ctx.secret.scores[i] === 0 && !tr.hidden.includes(i));
        tr.hidden.push(...U.shuffle(worst).slice(0, 2));
      } else if (pub.type === 'order') {
        const first = pub.items[ctx.secret.correct[0]];
        tr.hintText = `El primer elemento es: «${first}»`;
      } else if (pub.type === 'guess') {
        if (this.clueCount(r, tr) >= pub.n) return 'Ya se ven todas las pistas.';
        tr.extraClues++;
      }
      if (tr.draft != null && tr.hidden.includes(tr.draft)) tr.draft = null;
      team.powers.hint--;
      tr.hintUsed = true;
      this.sysChat(team, `💡 ${player.name} usó PISTA.`);
    }
    this.mark();
    return null;
  }

  // ---- Ruleta ----------------------------------------------------------------
  spinTeam(team, opts = {}) {
    const r = this.round;
    if (!r || r.kind !== 'roulette' || r.state !== 'active') return 'La ruleta no está disponible.';
    const tr = r.teams[team.id];
    if (tr.rl) return 'Ya giraron la ruleta.';
    let idx = opts.segId ? SEGMENTS.findIndex((s) => s.id === opts.segId) : -1;
    if (idx < 0) idx = Math.floor(Math.random() * SEGMENTS.length);
    const seg = SEGMENTS[idx];
    const now = Date.now();
    tr.rl = { segIdx: idx, segId: seg.id, spunAt: now, auto: !!opts.auto, text: '', pending: false };
    const rl = tr.rl;
    const th = r.themeId;
    let text = '';
    switch (seg.id) {
      case 'p100': { this.applyDelta(team, 100); team.stats.rouletteGain += 100; text = '+100 puntos'; break; }
      case 'p200': { this.applyDelta(team, 200); team.stats.rouletteGain += 200; text = '+200 puntos'; break; }
      case 'double': { this.grantPower(team, 'double'); text = 'Ganaron un poder DOBLE ✨'; break; }
      case 'shield': { this.grantPower(team, 'shield'); text = 'Ganaron un ESCUDO 🛡️'; break; }
      case 'hint': { this.grantPower(team, 'hint'); text = 'Ganaron una PISTA 💡'; break; }
      case 'minus50': {
        const res = this.applyDelta(team, -50);
        text = res.blocked ? '¡Perdían 50 puntos, pero el ESCUDO los protegió!' : '−50 puntos';
        break;
      }
      case 'steal50': {
        const others = this.teams.filter((t) => t.id !== team.id).sort((a, b) => b.score - a.score);
        const res = this.doSteal(team, STEAL_ROULETTE, others[0], 'ruleta');
        if (res.none) text = 'No hay a quién robar';
        else if (res.blocked) text = `${others[0].name} tenía escudo: robo bloqueado`;
        else { text = `Robaron ${res.applied} puntos a ${others[0].name}`; team.stats.rouletteGain += res.applied; }
        break;
      }
      case 'bonus': {
        this.applyDelta(team, 50);
        const p = this.randomPower(false);
        this.grantPower(team, p);
        team.stats.rouletteGain += 50;
        text = `+50 puntos y un poder: ${POWERS[p].emoji} ${POWERS[p].name}`;
        break;
      }
      case 'surprise': {
        const roll = Math.random();
        const flavor = this.themeData(th).surprise || ['Un giro inesperado del destino…'];
        const f = U.pick(flavor);
        if (roll < 0.34) { this.applyDelta(team, 150); team.stats.rouletteGain += 150; text = `${f} +150 puntos`; }
        else if (roll < 0.62) { const p = this.randomPower(); this.grantPower(team, p); text = `${f} Poder: ${POWERS[p].emoji} ${POWERS[p].name}`; }
        else if (roll < 0.82) { const res = this.applyDelta(team, -75); text = res.blocked ? `${f} …¡pero el ESCUDO los salvó!` : `${f} Pierden 75 puntos`; }
        else {
          const others = this.teams.filter((t) => t.id !== team.id);
          const other = U.pick(others);
          if (other) { this.applyDelta(other, -50); this.applyDelta(team, 50); text = `${f} Intercambio: +50 para ustedes y −50 para ${other.name}`; }
          else { this.applyDelta(team, 50); text = `${f} +50 puntos`; }
        }
        break;
      }
      case 'easy': case 'hard': {
        const isHard = seg.id === 'hard';
        const it = isHard ? (this.pickItem(th, 'quiz', (x) => x.hard) || this.pickItem(th, 'quiz')) : this.pickItem(th, 'quick');
        tr.rq = this.makeCtx('quiz', it, { base: isHard ? 200 : 100 });
        tr.rq.speed = false;
        tr.rq.isHard = isHard;
        tr.draft = null; tr.locked = false; tr.lockedAt = null; tr.hidden = [];
        tr.dl = Math.max(r.tEnd, now + 30000);
        text = isHard ? 'Pregunta DIFÍCIL: +200 si aciertan' : 'Pregunta FÁCIL: +100 si aciertan';
        break;
      }
      case 'organizer': {
        rl.pending = true;
        text = 'El organizador decidirá su premio…';
        this.toHosts({ t: 'toast', text: `🎓 ${team.name} cayó en «El organizador decide»`, kind: 'warn' });
        break;
      }
      default: break;
    }
    rl.text = text;
    this.logEvent(`🎡 ${team.name} giró la ruleta: ${seg.label} ${seg.sub}`.trim() + ` → ${text}`, 'roulette', team.id);
    this.sysChat(team, `🎡 Ruleta: ${seg.label} ${seg.sub} — ${text}`);
    this.checkBadges(team);
    this.mark();
    return null;
  }

  decideOrganizer(teamId, points) {
    const r = this.round;
    if (!r || r.kind !== 'roulette') return 'No hay ruleta activa.';
    const team = this.teamById(teamId);
    if (!team) return 'Equipo inválido.';
    const tr = r.teams[team.id];
    if (!tr.rl || !tr.rl.pending) return 'Ese equipo no espera decisión.';
    const pts = U.clamp(parseInt(points, 10) || 0, -200, 500);
    const res = pts < 0 ? this.applyDelta(team, pts) : (this.applyDelta(team, pts), { blocked: false });
    tr.rl.pending = false;
    tr.rl.text = res.blocked ? `El organizador quitó ${-pts}, pero el escudo los protegió` : `El organizador decidió: ${pts >= 0 ? '+' : ''}${pts} puntos`;
    if (pts > 0) team.stats.rouletteGain += pts;
    this.logEvent(`🎓 ${tr.rl.text} (${team.name})`, 'roulette', team.id);
    this.sysChat(team, `🎓 ${tr.rl.text}`);
    this.mark();
    return null;
  }

  // ---- Resolución de ronda ---------------------------------------------------
  speedBonus(r, tr, ctx) {
    if (!ctx.speed || !tr.lockedAt) return 0;
    const frac = U.clamp((r.tEnd - tr.lockedAt) / (r.dur * 1000), 0, 1);
    return Math.floor(SPEED_MAX * frac);
  }

  chosenText(ctx, draft) {
    if (!ctx || draft == null || draft === '') return null;
    const pub = ctx.pub;
    if (pub.type === 'choice' || pub.type === 'wwyd' || pub.type === 'strategic') return `${'ABCD'[draft]}) ${pub.options[draft] && (pub.options[draft].label || pub.options[draft])}`;
    if (pub.type === 'tf') return draft ? 'Verdadero' : 'Falso';
    if (pub.type === 'order') return draft.map((i) => pub.items[i]).join(' → ');
    if (pub.type === 'guess') return String(draft);
    return null;
  }

  scoreTeam(r, team, tr) {
    const res = { teamId: team.id, correct: false, passed: false, pts: 0, speed: 0, mult: 1, note: '', chosen: null, lockSec: null };
    const ctx = this.ctxOf(r, tr);
    if (r.kind === 'roulette') {
      res.passed = !!tr.rl;
      res.note = tr.rl ? tr.rl.text : 'No giraron';
      if (tr.rq) {
        res.chosen = this.chosenText(tr.rq, tr.draft);
        const ok = tr.draft === tr.rq.secret.answer;
        res.correct = ok;
        if (ok) { res.pts = tr.rq.base; if (tr.doubleOn) { res.pts *= 2; res.mult = 2; } this.applyDelta(team, res.pts); team.stats.rouletteGain += res.pts; res.note += ` · ¡Acertaron! +${res.pts}`; }
        else res.note += res.chosen ? ' · Fallaron la pregunta' : ' · Sin respuesta';
      }
      if (tr.rl && tr.rl.pending) { tr.rl.pending = false; tr.rl.text = 'El organizador no alcanzó a decidir'; res.note = tr.rl.text; }
      return res;
    }
    if (!ctx) return res;
    if (tr.lockedAt) res.lockSec = Math.round((tr.lockedAt - r.tStart) / 1000);
    res.chosen = this.chosenText(ctx, tr.draft);
    let pts = 0;
    switch (ctx.type) {
      case 'choice': case 'tf': {
        const ok = tr.draft != null && tr.draft === ctx.secret.answer;
        res.correct = ok; res.passed = ok;
        if (ok) { pts = ctx.base; res.speed = this.speedBonus(r, tr, ctx); pts += res.speed; }
        break;
      }
      case 'wwyd': {
        const sc = tr.draft != null ? ctx.secret.scores[tr.draft] : 0;
        res.passed = sc >= 50; res.correct = sc === 100;
        pts = sc;
        if (sc === 100) { res.speed = this.speedBonus(r, tr, ctx); pts += res.speed; }
        break;
      }
      case 'order': {
        const d = tr.draft || [];
        const ok = d.filter((v, i) => v === ctx.secret.correct[i]).length;
        const n = ctx.secret.correct.length;
        pts = Math.floor((ctx.base * ok) / n);
        res.correct = ok === n; res.passed = res.correct;
        res.note = `${ok}/${n} en su lugar`;
        if (res.correct) { res.speed = this.speedBonus(r, tr, ctx); pts += res.speed; }
        break;
      }
      case 'guess': {
        if (tr.guessCorrect) { pts = 200 - (Math.max(1, tr.cluesAtSolve) - 1) * 35; res.correct = true; res.passed = true; res.note = `Resuelto con ${tr.cluesAtSolve} pista${tr.cluesAtSolve > 1 ? 's' : ''}`; }
        else res.note = tr.guesses.length ? 'No lo adivinaron' : 'Sin intentos';
        res.chosen = tr.guesses.length ? tr.guesses.join(' · ') : null;
        break;
      }
      case 'strategic': {
        if (tr.draft == null) { res.note = 'No eligieron camino'; break; }
        if (tr.draft === 0) { pts = 80; res.note = 'Camino seguro'; res.passed = true; }
        else if (tr.draft === 1) {
          if (Math.random() < 0.5) { pts = 220; res.note = '¡La apuesta salió bien!'; res.passed = true; team.stats.gambleWins++; }
          else { pts = -60; res.note = 'La apuesta salió mal…'; }
        } else {
          pts = 40; res.passed = true;
          const p = this.randomPower();
          this.grantPower(team, p);
          res.note = `Aliados: poder ${POWERS[p].emoji} ${POWERS[p].name}`;
        }
        res.correct = res.passed;
        break;
      }
      default: break;
    }
    if (tr.doubleOn && pts > 0) { pts *= 2; res.mult = 2; }
    if (pts < 0) {
      const a = this.applyDelta(team, pts);
      res.pts = a.blocked ? 0 : a.applied;
      if (a.blocked) res.note += ' · 🛡️ el escudo los protegió';
    } else {
      this.applyDelta(team, pts);
      res.pts = pts;
    }
    if (ctx.power && res.correct) {
      const p = this.randomPower(false);
      this.grantPower(team, p);
      res.note = `Poder ganado: ${POWERS[p].emoji} ${POWERS[p].name}`;
    }
    return res;
  }

  endRound(reason = 'host') {
    const r = this.round;
    if (!r || r.state !== 'active') return;
    const now = Date.now();
    // Bloqueo final de todos los equipos
    for (const t of this.teams) {
      const tr = r.teams[t.id];
      if (r.kind === 'roulette' && !tr.rl) this.spinTeam(t, { auto: true });
      if (!tr.locked) this.lockTeam(t, true);
    }
    const results = [];
    for (const t of this.teams) {
      const tr = r.teams[t.id];
      const res = this.scoreTeam(r, t, tr);
      results.push(res);
    }
    // Quién fue el más rápido entre los que acertaron
    const ok = results.filter((x) => x.correct && x.lockSec != null && r.kind !== 'roulette');
    if (ok.length >= 2) {
      const fastest = ok.reduce((a, b) => ((r.teams[a.teamId].lockedAt || Infinity) <= (r.teams[b.teamId].lockedAt || Infinity) ? a : b));
      this.teamById(fastest.teamId).stats.fastest++;
      fastest.fastest = true;
    }
    // Estadísticas
    for (const res of results) {
      const t = this.teamById(res.teamId);
      const scorable = !['roulette', 'strategic'].includes(r.kind);
      if (res.passed) { t.progress++; t.stats.passed = (t.stats.passed || 0) + 1; }
      if (scorable) {
        t.stats.scored++;
        if (res.passed) { t.stats.streak++; t.stats.bestStreak = Math.max(t.stats.bestStreak, t.stats.streak); }
        else { t.stats.streak = 0; t.stats.failed++; }
      }
      if (r.kind === 'memory' && res.correct) t.stats.memoryOk++;
      if (r.kind === 'boss' && res.correct) t.stats.boss = true;
      if (res.pts !== 0) this.logEvent(`${res.pts > 0 ? '✅' : '⚠️'} ${t.name}: ${res.pts > 0 ? '+' : ''}${res.pts}`, 'score', t.id);
      this.checkBadges(t);
    }
    r.results = results.sort((a, b) => b.pts - a.pts);
    r.reveal = this.revealOf(r);
    r.state = 'reveal';
    r.tNext = Date.now() + this.revealMs();
    this.plan[r.idx].status = 'done';
    this.rankTeams();
    if (this.bots) this.bots.onReveal(r);
    this.mark();
  }

  revealOf(r) {
    const ctx = r.ctx;
    if (!ctx) return { type: 'roulette' };
    const s = ctx.secret;
    const out = { type: ctx.type, why: s.why || '' };
    if (ctx.type === 'choice') { out.answer = s.answer; out.answerText = ctx.pub.options[s.answer]; }
    else if (ctx.type === 'tf') { out.answer = s.answer; out.answerText = s.answer ? 'Verdadero' : 'Falso'; }
    else if (ctx.type === 'wwyd') { out.answer = s.best; out.scores = s.scores; out.answerText = ctx.pub.options[s.best]; }
    else if (ctx.type === 'order') { out.answerText = s.ordered.join(' → '); out.ordered = s.ordered; }
    else if (ctx.type === 'guess') { out.answerText = s.answers[0]; out.clues = s.clues; }
    else if (ctx.type === 'strategic') { out.answerText = 'No hay una única respuesta: depende del riesgo.'; }
    return out;
  }

  toScoreboard() {
    const r = this.round;
    if (!r || r.state !== 'reveal') return;
    r.state = 'scoreboard';
    r.tNext = Date.now() + this.scoreMs();
    if (this.bots) this.bots.onScoreboard(r);
    this.mark();
  }

  // ---- Flujo principal del organizador --------------------------------------
  start() {
    if (this.status !== 'lobby') return 'La partida ya empezó.';
    if (this.players.size < 1) return 'Todavía no hay participantes.';
    this.rankTeams();
    for (const t of this.teams) { t.prevRank = t.rank; t.prevScore = 0; }
    this.makePlan();
    this.status = 'running';
    this.stageIdx = -1;
    this.round = null;
    this.readyAt = Date.now() + READY_AUTO_MS;
    this.logEvent('🚀 ¡Comienza la aventura!', 'start');
    for (const t of this.teams) this.sysChat(t, `🚀 ¡Bienvenidos, ${t.name}! Usen este chat para decidir juntos antes de responder.`);
    this.mark();
    return null;
  }

  next() {
    if (this.status !== 'running') return 'La partida no está en curso.';
    if (this.paused) return 'La partida está en pausa.';
    const r = this.round;
    if (!r) { this.readyAt = null; this.beginStage(0); return null; }
    if (r.state === 'intro') { r.tStart = Date.now(); this.activate(); return null; }
    if (r.state === 'active') return 'Primero finaliza la ronda en curso.';
    if (r.state === 'reveal') { this.toScoreboard(); return null; }
    if (r.state === 'scoreboard') {
      if (this.stageIdx >= this.plan.length - 1) this.finish();
      else this.beginStage(this.stageIdx + 1);
      return null;
    }
    return null;
  }

  pause() {
    if (this.status !== 'running' || this.paused) return;
    this.paused = true;
    this.pausedAt = Date.now();
    this.logEvent('⏸️ Partida en pausa', 'pause');
    this.mark();
  }

  resume() {
    if (!this.paused) return;
    const d = Date.now() - this.pausedAt;
    this.paused = false;
    this.shiftTimes(d);
    this.logEvent('▶️ Partida reanudada', 'pause');
    this.mark();
  }

  shiftTimes(d) {
    if (this.readyAt) this.readyAt += d;
    const r = this.round;
    if (r) {
      for (const k of ['tStart', 'tEnd', 'tNext', 'memShowUntil']) if (r[k]) r[k] += d;
      for (const tr of Object.values(r.teams)) {
        if (tr.dl) tr.dl += d;
        if (tr.autoSpinAt) tr.autoSpinAt += d;
        if (tr.lockedAt) tr.lockedAt += d;
        if (tr.rl && tr.rl.spunAt) tr.rl.spunAt += d;
      }
    }
    if (this.bots) this.bots.shift(d);
  }

  abortRound() {
    // Cancela la ronda en curso sin puntuarla (los puntos ya aplicados por la ruleta se mantienen).
    const r = this.round;
    if (!r) return;
    this.logEvent(`↩️ Se cambió la ronda «${r.label}»`, 'round');
    this.round = null;
  }

  pickRound(kind, themeId) {
    if (this.status !== 'running') return 'La partida no está en curso.';
    if (!KINDS[kind]) return 'Tipo de reto desconocido.';
    const r = this.round;
    if (r && (r.state === 'intro' || r.state === 'active')) {
      const idx = r.idx;
      this.abortRound();
      if (themeId && content.exists(themeId)) this.plan[idx].themeId = themeId;
      this.plan[idx].semi = false;
      this.beginStage(idx, kind);
      return null;
    }
    // Entre rondas: reemplaza el siguiente reto
    const nextIdx = r ? this.stageIdx + 1 : 0;
    if (nextIdx >= this.plan.length) return 'No quedan retos que cambiar.';
    const st = this.plan[nextIdx];
    st.kind = kind; st.semi = false; st.label = KINDS[kind].short; st.icon = KINDS[kind].icon; st.status = 'pending';
    if (themeId && content.exists(themeId)) st.themeId = themeId;
    this.logEvent(`🎯 El organizador cambió el siguiente reto: ${KINDS[kind].label}`, 'round');
    this.mark();
    return null;
  }

  hostBonus(teamId) {
    if (this.status !== 'running') return 'La partida no está en curso.';
    if (teamId) {
      const t = this.teamById(teamId);
      if (!t) return 'Equipo inválido.';
      this.applyDelta(t, 50);
      const p = this.randomPower(false);
      this.grantPower(t, p);
      this.logEvent(`🎁 Bonus del organizador para ${t.name}: +50 y ${POWERS[p].name}`, 'bonus', t.id);
      this.sysChat(t, `🎁 ¡Bonus del organizador! +50 puntos y un poder: ${POWERS[p].emoji} ${POWERS[p].name}`);
      this.checkBadges(t);
      this.mark();
      return null;
    }
    return this.pickRound('bonus');
  }

  hostGrant(teamId, power) {
    const t = this.teamById(teamId);
    if (!t || !POWERS[power]) return 'Datos inválidos.';
    this.grantPower(t, power);
    this.logEvent(`🎓 El organizador entregó ${POWERS[power].emoji} ${POWERS[power].name} a ${t.name}`, 'bonus', t.id);
    this.sysChat(t, `🎓 El organizador les entregó un poder: ${POWERS[power].emoji} ${POWERS[power].name}`);
    this.mark();
    return null;
  }

  hostPoints(teamId, pts) {
    const t = this.teamById(teamId);
    if (!t) return 'Equipo inválido.';
    const v = U.clamp(parseInt(pts, 10) || 0, -500, 500);
    t.score = Math.max(0, t.score + v);
    this.logEvent(`🎓 Ajuste del organizador: ${t.name} ${v >= 0 ? '+' : ''}${v}`, 'bonus', t.id);
    this.mark();
    return null;
  }

  finish() {
    if (this.status === 'finished') return;
    if (this.round && (this.round.state === 'intro' || this.round.state === 'active')) this.endRound('finish');
    this.rankTeams();
    const sorted = this.teams.slice().sort((a, b) => b.score - a.score || b.progress - a.progress);
    if (sorted[0]) sorted[0].stats.champion = true;
    this.status = 'finished';
    this.paused = false;
    for (const t of this.teams) this.checkBadges(t);
    this.final = { at: Date.now(), ranking: sorted.map((t) => t.id), rounds: this.plan.filter((p) => p.status === 'done').length };
    this.logEvent(`🏆 ¡${sorted[0] ? sorted[0].name : 'Nadie'} gana la aventura!`, 'end');
    this.mark();
  }

  restart() {
    this.status = 'lobby';
    this.paused = false;
    this.round = null;
    this.stageIdx = -1;
    this.plan = [];
    this.final = null;
    this.readyAt = null;
    this.used = new Map();
    this.log = [];
    for (const t of this.teams) {
      t.score = 0; t.prevScore = 0; t.prevRank = 1; t.rank = 1; t.progress = 0;
      t.powers = { shield: 0, double: 0, hint: 0, time: 0, steal: 0 };
      t.stats = newStats(); t.badges = [];
      this.chat[t.id] = [];
    }
    this.toHosts({ t: 'chatHistory', all: true, chats: this.chat });
    for (const c of this.clients) if (c.role === 'player') {
      const p = this.players.get(c.pid);
      const t = p && this.teamById(p.teamId);
      if (t) this.send(c, { t: 'chatHistory', teamId: t.id, msgs: [] });
    }
    if (this.bots) this.bots.reset();
    this.mark();
  }

  // ---- Mensajes entrantes ----------------------------------------------------
  handlePlayer(c, msg) {
    const p = this.players.get(c.pid);
    if (!p) return;
    const team = this.teamById(p.teamId);
    if (!team) return;
    this.lastActivity = Date.now();
    let err = null;
    switch (msg.t) {
      case 'chat': {
        const now = Date.now();
        p.lastChat = p.lastChat.filter((x) => now - x < 4000);
        if (p.lastChat.length >= 5) return this.toast(c, 'Vas muy rápido, espera un momento.', 'warn');
        const text = U.cleanText(msg.text, 240);
        if (!text) return;
        p.lastChat.push(now);
        team.stats.chat++;
        this.pushChat(team, { id: U.uid(6), tid: team.id, pid: p.id, name: p.name, text, ts: now });
        this.checkBadges(team);
        break;
      }
      case 'draft': err = this.setDraft(team, p, msg.value); break;
      case 'lock': {
        const r = this.round;
        if (!r || r.state !== 'active') break;
        const tr = r.teams[team.id];
        if (tr.draft == null || tr.draft === '') { err = 'Primero elijan una respuesta.'; break; }
        if (r.kind === 'memory' && Date.now() < r.memShowUntil) { err = 'Esperen a que se oculte la información.'; break; }
        this.lockTeam(team, false, p);
        break;
      }
      case 'guess': err = this.submitGuess(team, p, msg.text); break;
      case 'spin': err = this.spinTeam(team); break;
      case 'power': err = this.usePower(team, p, msg.power, msg.target); break;
      default: break;
    }
    if (err) this.toast(c, err, 'warn');
  }

  handleHost(c, msg) {
    this.lastActivity = Date.now();
    let err = null;
    switch (msg.t) {
      case 'host:start': err = this.start(); break;
      case 'host:next': err = this.next(); break;
      case 'host:pause': this.pause(); break;
      case 'host:resume': this.resume(); break;
      case 'host:endRound': if (this.round && this.round.state === 'active') this.endRound('host'); break;
      case 'host:endGame': this.finish(); break;
      case 'host:restart': this.restart(); break;
      case 'host:pick': err = this.pickRound(msg.kind, msg.themeId); break;
      case 'host:bonus': err = this.hostBonus(msg.teamId); break;
      case 'host:grant': err = this.hostGrant(msg.teamId, msg.power); break;
      case 'host:points': err = this.hostPoints(msg.teamId, msg.points); break;
      case 'host:spin': {
        const r = this.round;
        if (!r || r.kind !== 'roulette' || r.state !== 'active') { err = 'No hay una ruleta activa.'; break; }
        const targets = msg.teamId ? [this.teamById(msg.teamId)] : this.teams;
        for (const t of targets) if (t && !r.teams[t.id].rl) this.spinTeam(t, { segId: msg.segId || null });
        break;
      }
      case 'host:decide': err = this.decideOrganizer(msg.teamId, msg.points); break;
      case 'host:setCfg': {
        if (typeof msg.spy === 'boolean') {
          this.cfg.spy = msg.spy;
          if (msg.spy) this.toHosts({ t: 'chatHistory', all: true, chats: this.chat });
        }
        if (typeof msg.fast === 'boolean' && this.cfg.demo) this.cfg.fast = msg.fast;
        if (typeof msg.auto === 'boolean') {
          this.cfg.auto = msg.auto;
          const r = this.round;
          if (msg.auto) {
            if (!r && this.status === 'running') this.readyAt = Date.now() + 4000;
            else if (r && r.state === 'reveal') r.tNext = Date.now() + this.revealMs();
            else if (r && r.state === 'scoreboard') r.tNext = Date.now() + this.scoreMs();
          }
        }
        if (this.status === 'lobby') {
          if (['corta', 'normal', 'larga'].includes(msg.length)) this.cfg.length = msg.length;
        }
        this.mark();
        break;
      }
      case 'host:setTheme': err = this.setTheme(msg.themeId, !!msg.chaos); break;
      case 'host:renameTeam': {
        const t = this.teamById(msg.teamId);
        const nm = U.cleanText(msg.name, 28);
        if (t && nm) { t.name = nm; t.customName = true; this.mark(); }
        break;
      }
      case 'host:regenShield': {
        const t = this.teamById(msg.teamId);
        if (t) {
          const th = this.themeData(this.currentThemeId());
          t.shield = shields.regenShield(t.shield, this.teams.filter((x) => x.id !== t.id).map((x) => x.shield), th.teams.map((x) => x.s));
          this.mark();
        }
        break;
      }
      case 'host:redistribute': {
        if (this.status !== 'lobby') { err = 'Sólo se puede redistribuir en la sala de espera.'; break; }
        const k = parseInt(msg.teams, 10);
        if (k >= 2 && k <= 8) this.cfg.teamsWanted = k;
        else if (msg.teams === 'auto') this.cfg.teamsWanted = null;
        this.redistribute(this.cfg.teamsWanted);
        this.logEvent('🔀 Equipos redistribuidos', 'info');
        this.mark();
        break;
      }
      case 'host:kick': {
        const p = this.players.get(msg.playerId);
        if (p) {
          for (const cl of [...this.clients]) if (cl.pid === p.id) { this.send(cl, { t: 'kicked' }); try { cl.ws.close(); } catch (e) { /* noop */ } this.clients.delete(cl); }
          this.players.delete(p.id);
          this.mark();
        }
        break;
      }
      case 'host:genTheme': this.genTheme(c, msg); break;
      case 'host:importTheme': err = this.importTheme(msg); break;
      case 'host:generalTheme': this.useGeneralTheme(U.cleanText(msg.topic, 60) || 'Tema libre'); break;
      default: break;
    }
    if (err) this.toast(c, err, 'warn');
  }

  setTheme(themeId, chaos) {
    if (themeId !== 'custom' && !content.exists(themeId)) return 'Temática desconocida.';
    if (themeId === 'custom' && !this.custom) return 'Primero crea el tema personalizado.';
    this.cfg.themeId = themeId;
    this.cfg.chaos = !!chaos;
    if (this.status === 'lobby') this.reskinTeams();
    else {
      for (const st of this.plan) {
        if (st.status === 'pending') {
          st.themeId = this.cfg.chaos ? U.pick(content.chaosPool()) : themeId;
        }
      }
    }
    this.mark();
    return null;
  }

  async genTheme(c, msg) {
    const ai = require('./ai');
    const topic = U.cleanText(msg.topic, 60);
    if (!topic) return this.toast(c, 'Escribe un tema.', 'warn');
    this.toHosts({ t: 'themeBusy', on: true, topic });
    try {
      const theme = await ai.generateTheme(topic);
      this.custom = theme;
      this.setTheme('custom', false);
      this.toHosts({ t: 'themeBusy', on: false, ok: true, topic });
    } catch (e) {
      this.toHosts({ t: 'themeBusy', on: false, ok: false, error: String(e.message || e).slice(0, 200) });
    }
  }

  importTheme(msg) {
    const ai = require('./ai');
    const topic = U.cleanText(msg.topic, 60);
    try {
      let raw = msg.json;
      if (typeof raw === 'string') {
        const a = raw.indexOf('{');
        const b = raw.lastIndexOf('}');
        raw = JSON.parse(raw.slice(a, b + 1));
      }
      const theme = ai.normalizeTheme(raw, topic || (raw && raw.name) || 'Tema libre');
      this.custom = theme;
      this.setTheme('custom', false);
      this.toHosts({ t: 'themeBusy', on: false, ok: true, topic: theme.name, imported: true });
      return null;
    } catch (e) {
      return 'No se pudo leer el JSON: ' + String(e.message || e).slice(0, 120);
    }
  }

  useGeneralTheme(topic) {
    const ai = require('./ai');
    this.custom = ai.generalTheme(topic);
    this.setTheme('custom', false);
  }

  // ---- Vistas ----------------------------------------------------------------
  teamView(t, detail) {
    const mem = this.members(t);
    return {
      id: t.id, name: t.name, shield: t.shield, color: t.color, score: t.score, prevScore: t.prevScore,
      rank: t.rank, prevRank: t.prevRank, progress: t.progress, powers: t.powers, badges: t.badges,
      size: mem.length, online: mem.filter((p) => p.online || p.bot).length,
      members: mem.map((p) => ({ id: p.id, name: p.name, online: p.online || p.bot, bot: p.bot })),
      stats: detail || this.status === 'finished' ? { passed: t.stats.passed || 0, failed: t.stats.failed, scored: t.stats.scored, chat: t.stats.chat, bestStreak: t.stats.bestStreak } : undefined,
    };
  }

  viewFor(c) {
    const isHost = c.role === 'host';
    const me = isHost ? null : this.players.get(c.pid);
    const myTeam = me ? this.teamById(me.teamId) : null;
    const now = Date.now();
    const online = [...this.players.values()].filter((p) => p.online || p.bot).length;
    const v = {
      now, code: this.code, name: this.name, phase: this.phase(), paused: this.paused, pausedAt: this.paused ? this.pausedAt : 0,
      theme: this.themeMeta(), cfg: this.cfg, teams: this.teams.map((t) => this.teamView(t, isHost || (myTeam && t.id === myTeam.id))),
      plan: this.plan.map((s) => ({ idx: s.idx, kind: s.kind, semi: s.semi, label: s.label, icon: s.icon, status: s.status, themeId: s.themeId })),
      stageIdx: this.stageIdx, log: this.log.slice(-14), playersTotal: this.players.size, playersOnline: online,
      me: me ? { pid: me.id, name: me.name, teamId: me.teamId } : null, readyAt: this.readyAt,
      round: this.round ? this.roundView(c, myTeam, now, isHost) : null,
      final: this.final,
    };
    return v;
  }

  roundView(c, myTeam, now, isHost) {
    const r = this.round;
    const out = {
      id: r.id, idx: r.idx, kind: r.kind, label: r.label, icon: r.icon, semi: r.semi, state: r.state, theme: r.theme,
      dur: r.dur, tStart: r.tStart, tEnd: r.tEnd, tNext: r.tNext, memShowUntil: r.memShowUntil,
    };
    if (r.ctx) out.pub = this.pubOf(r, r.ctx, null, now, isHost);
    out.status = this.teams.map((t) => {
      const tr = r.teams[t.id];
      const o = { id: t.id, done: this.isDone(r, tr) };
      if (r.kind === 'roulette') { o.spun = !!tr.rl; o.seg = tr.rl ? tr.rl.segId : null; o.pending = tr.rl ? tr.rl.pending : false; }
      if (isHost) {
        const ctx = this.ctxOf(r, tr);
        o.chosen = ctx ? this.chosenText(ctx, tr.draft) : null;
        o.doubleOn = tr.doubleOn;
        if (r.kind === 'roulette' && tr.rl) { o.text = tr.rl.text; }
      }
      return o;
    });
    if (myTeam) {
      const tr = r.teams[myTeam.id];
      const ctx = this.ctxOf(r, tr);
      const mine = {
        draft: tr.draft, draftBy: tr.draftBy, locked: tr.locked, doubleOn: tr.doubleOn, hidden: tr.hidden, deadline: this.deadlineOf(r, tr),
        attempts: tr.attempts, guesses: tr.guesses, hintText: tr.hintText, timeUsed: tr.timeUsed, hintUsed: tr.hintUsed, correctNow: tr.guessCorrect,
        stealUsed: !!r.stealUsed[myTeam.id],
      };
      if (r.ctx && r.ctx.type === 'guess') mine.clueCount = this.clueCount(r, tr);
      if (r.ctx && r.ctx.type === 'guess') mine.clues = r.ctx.secret.clues.slice(0, mine.clueCount);
      if (r.kind === 'roulette') {
        mine.autoSpinAt = tr.autoSpinAt;
        mine.rl = tr.rl ? { segIdx: tr.rl.segIdx, segId: tr.rl.segId, spunAt: tr.rl.spunAt, text: tr.rl.text, pending: tr.rl.pending, auto: tr.rl.auto } : null;
        if (tr.rq) mine.rq = this.pubOf(r, tr.rq, tr, now, false);
      }
      out.mine = mine;
    }
    if (r.state === 'reveal' || r.state === 'scoreboard') {
      out.reveal = r.reveal;
      out.results = r.results;
    }
    if (isHost) {
      out.secret = r.ctx ? this.secretView(r.ctx) : null;
      if (r.kind === 'roulette') {
        out.rteams = this.teams.map((t) => { const tr = r.teams[t.id]; return tr.rq ? { id: t.id, q: tr.rq.pub.q, answer: tr.rq.pub.options[tr.rq.secret.answer] } : { id: t.id }; });
      }
    }
    return out;
  }

  pubOf(r, ctx, tr, now, isHost) {
    const pub = JSON.parse(JSON.stringify(ctx.pub));
    if (pub.type === 'guess') {
      // las pistas visibles las controla el servidor; el resto no se envía
      const count = this.clueCount(r, null);
      pub.clues = ctx.secret.clues.slice(0, count);
      pub.count = count;
    }
    if (pub.type === 'choice' && pub.memory) {
      const reviewing = r.state === 'reveal' || r.state === 'scoreboard';
      const showing = r.state === 'active' && now < r.memShowUntil;
      if (showing || reviewing) pub.memory.visible = true;
      else { delete pub.memory.lines; pub.memory.visible = false; }
      if (r.state === 'intro' || showing) {
        // mientras se memoriza (o antes de empezar) no se revela la pregunta ni las opciones
        pub.q = '';
        pub.options = pub.options.map(() => '');
      }
      if (showing) pub.hiddenUntil = r.memShowUntil;
    }
    return pub;
  }

  secretView(ctx) {
    const s = ctx.secret;
    if (ctx.type === 'choice') return { text: ctx.pub.options[s.answer], idx: s.answer, why: s.why };
    if (ctx.type === 'tf') return { text: s.answer ? 'Verdadero' : 'Falso', why: s.why };
    if (ctx.type === 'wwyd') return { text: ctx.pub.options[s.best], idx: s.best, why: s.why };
    if (ctx.type === 'order') return { text: s.ordered.join(' → ') };
    if (ctx.type === 'guess') return { text: s.answers.join(' / '), clues: s.clues };
    return null;
  }
}

module.exports = { Game, POWERS, SEGMENTS, KINDS, BADGES, MAX_PLAYERS, guessMatches };
