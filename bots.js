'use strict';
// Jugadores ficticios para el MODO DEMO: chatean, responden, giran la ruleta, usan poderes y roban puntos.
const U = require('./util');

const NAMES = ['Laura', 'Carlos', 'Sofía', 'Andrés', 'Valentina', 'Mateo', 'Camila', 'Santiago', 'Daniela', 'Juan', 'Isabella', 'Sebastián', 'Mariana', 'Felipe', 'Natalia', 'David', 'Paula', 'Nicolás', 'Luisa', 'Diego', 'Gabriela', 'Esteban', 'Manuela', 'Alejandro', 'Juliana', 'Tomás', 'Sara', 'Julián', 'María', 'Samuel', 'Valeria', 'Emilio', 'Antonia', 'Cristian', 'Lucía', 'Brayan', 'Karen', 'Jhon', 'Dayana', 'Yeison'];

const OPEN = ['A ver, leamos con calma 👀', '¿Qué opinan?', 'Esta me suena…', 'Rápido, que el tiempo corre ⏱️', 'Mmm, difícil esta 🤔', 'Yo ya tengo una idea', 'Revisemos bien las opciones', 'Tranquilos, podemos con esta 💪'];
const AGREE = ['Yo también', 'De acuerdo 👍', 'Mmm, no estoy tan seguro…', 'Confío en ustedes', 'Vamos con esa', 'Sí, tiene sentido', 'Yo dudaba, pero ok', '¡Eso mismo pensaba!'];
const LOCK = ['¡Bloqueamos!', 'Listo, enviamos 🚀', '¡Vamos con todo!', 'Ya está, confirmamos'];
const WIN = ['¡¡Sí!! 🎉', '¡Lo sabía! 😎', '¡Qué equipazo!', '¡Vamos por más! 🔥'];
const LOSE = ['Ouch 😅', 'Casi…', 'Fue mala suerte', 'La próxima la sacamos 💪', 'No pasa nada, seguimos'];

class DemoBots {
  constructor(game) {
    this.g = game;
    this.events = [];
    this.timers = [];
    this.n = 0;
  }

  stop() {
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
    this.events = [];
  }

  reset() { this.events = []; }

  shift(d) { for (const e of this.events) e.at += d; }

  spawn(n) {
    this.n = n;
    const names = U.shuffle(NAMES);
    for (let i = 0; i < n; i++) {
      const t = setTimeout(() => {
        const nm = names[i % names.length] + (i >= names.length ? ' ' + String.fromCharCode(65 + (i % 26)) + '.' : '');
        this.g.addPlayer(nm, { bot: true });
        this.g.mark();
      }, 250 + i * 140);
      this.timers.push(t);
    }
  }

  at(ms, fn) { this.events.push({ at: Date.now() + ms, fn }); }

  tick(now) {
    if (!this.events.length) return;
    const due = this.events.filter((e) => e.at <= now);
    if (!due.length) return;
    this.events = this.events.filter((e) => e.at > now);
    for (const e of due) {
      try { e.fn(); } catch (err) { /* un bot nunca debe romper la partida */ }
    }
  }

  isBotTeam(t) {
    const m = this.g.members(t);
    return m.length > 0 && m.every((p) => p.bot);
  }

  botOf(t, avoid) {
    const m = this.g.members(t).filter((p) => p.bot);
    const others = avoid ? m.filter((p) => p.id !== avoid.id) : m;
    return U.pick(others.length ? others : m);
  }

  say(t, text, from) {
    const g = this.g;
    const p = from || this.botOf(t);
    if (!p) return;
    t.stats.chat++;
    g.pushChat(t, { id: U.uid(6), tid: t.id, pid: p.id, name: p.name, text, ts: Date.now() });
    g.checkBadges(t);
  }

  fast() { return !!this.g.cfg.fast; }

  onIntro(r) {
    for (const t of this.g.teams) {
      if (this.isBotTeam(t) && Math.random() < 0.5) this.at(600 + Math.random() * 2500, () => this.say(t, U.pick(['¡Prepárense!', '¡Vamos equipo!', 'A concentrarse 🎯', 'Aquí vamos…'])));
    }
  }

  onActive(r) {
    const g = this.g;
    const dur = r.dur * 1000;
    const f = this.fast() ? 0.45 : 1;
    for (const t of g.teams) {
      if (!this.isBotTeam(t)) continue;
      const tr = r.teams[t.id];
      // Poderes: algunos bots los usan
      if (r.kind !== 'roulette') {
        if (t.powers.double > 0 && Math.random() < 0.45) this.at(1500 + Math.random() * 2000, () => this.usePower(t, 'double'));
        if (t.powers.hint > 0 && Math.random() < 0.3) this.at(3500 + Math.random() * 4000, () => this.usePower(t, 'hint'));
        if (t.powers.time > 0 && Math.random() < 0.25 && dur > 25000) this.at(dur - 14000, () => this.usePower(t, 'time'));
      }
      if (r.kind === 'roulette') {
        this.at((2000 + Math.random() * 7000) * f, () => {
          if (r.teams[t.id].rl) return;
          const who = this.botOf(t);
          this.say(t, U.pick(['¡A girar! 🎡', 'Que sea suerte buena 🤞', 'Yo giro', '¡Vamos ruleta!']), who);
          g.spinTeam(t);
        });
        // si cayó en pregunta, responderla
        this.at((9000 + Math.random() * 3000) * f, () => this.answerRouletteQ(r, t));
        this.at((20000 + Math.random() * 6000) * f, () => this.answerRouletteQ(r, t, true));
        continue;
      }
      const ctx = r.ctx;
      if (!ctx) continue;
      const skill = t.skill * (ctx.hard || r.kind === 'boss' ? 0.82 : 1);
      const memDelay = r.kind === 'memory' ? 11000 : 0;
      const tSay = memDelay + (2000 + Math.random() * 4000) * f;
      const tDraft = tSay + (1500 + Math.random() * 2500) * f;
      let tLock = memDelay + dur * (0.3 + Math.random() * 0.5) * f;
      tLock = Math.max(tLock, tDraft + 2500);
      tLock = Math.min(tLock, dur - 3500);

      this.at(Math.max(500, tSay - 3000), () => this.say(t, U.pick(OPEN)));
      if (ctx.type === 'guess') { this.planGuess(r, t, skill, f); continue; }

      let value;
      let line;
      if (ctx.type === 'choice') {
        const ans = ctx.secret.answer;
        value = Math.random() < skill ? ans : U.pick([0, 1, 2, 3].filter((i) => i !== ans));
        line = `Yo creo que es la ${'ABCD'[value]}`;
      } else if (ctx.type === 'tf') {
        const ans = ctx.secret.answer;
        value = Math.random() < skill ? ans : !ans;
        line = `Yo diría que es ${value ? 'verdadero' : 'falso'}`;
      } else if (ctx.type === 'wwyd') {
        value = Math.random() < skill ? ctx.secret.best : U.pick(ctx.pub.options.map((_, i) => i).filter((i) => i !== ctx.secret.best));
        line = `Me inclino por la ${'ABCD'[value]}`;
      } else if (ctx.type === 'order') {
        const arr = ctx.secret.correct.slice();
        const swaps = Math.random() < skill ? 0 : 1 + Math.floor(Math.random() * 2);
        for (let s = 0; s < swaps; s++) { const i = Math.floor(Math.random() * (arr.length - 1)); [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; }
        value = arr;
        line = 'Yo empezaría por el que suene más lógico, miren el orden que armé';
      } else if (ctx.type === 'strategic') {
        const x = Math.random();
        value = x < 0.4 ? 0 : x < 0.78 ? 1 : 2;
        line = value === 0 ? 'Vayamos seguros, sumemos puntos' : value === 1 ? '¡Arriesguemos! 🎲' : 'Pidamos ayuda a los aliados 🤝';
      }
      this.at(tSay, () => this.say(t, line));
      this.at(tSay + 1200 + Math.random() * 1500, () => this.say(t, U.pick(AGREE), this.botOf(t)));
      this.at(tDraft, () => {
        const p = this.botOf(t);
        const tr2 = r.teams[t.id];
        // si la pista ocultó la opción elegida, elige otra visible
        let v = value;
        if ((ctx.type === 'choice' || ctx.type === 'wwyd') && tr2.hidden.includes(v)) v = ctx.type === 'choice' ? ctx.secret.answer : ctx.secret.best;
        g.setDraft(t, p, v);
      });
      this.at(tLock, () => {
        const tr2 = r.teams[t.id];
        if (tr2.locked || tr2.draft == null) return;
        const p = this.botOf(t);
        if (Math.random() < 0.6) this.say(t, U.pick(LOCK), p);
        g.lockTeam(t, false, p);
      });
    }
  }

  planGuess(r, t, skill, f) {
    const g = this.g;
    const ctx = r.ctx;
    const k = 1 + Math.floor((1 - skill) * 4 * Math.random() + Math.random() * 1.2);
    const clue = Math.min(ctx.pub.n, Math.max(1, k));
    const when = ((clue - 1) * r.clueEvery + 2500 + Math.random() * 3000) * (this.fast() ? 0.6 : 1);
    const ok = Math.random() < 0.55 + skill * 0.4;
    this.at(Math.max(1500, when - 2500), () => this.say(t, U.pick(['Creo que ya sé 🤫', 'Mmm, esto me suena a algo…', 'Esperen, déjenme pensar 🤔', 'Una pista más y lo tenemos'])));
    this.at(when, () => {
      const tr = r.teams[t.id];
      if (tr.locked) return;
      const p = this.botOf(t);
      if (!ok && Math.random() < 0.6) g.submitGuess(t, p, U.pick(['no sé', 'tal vez el primero', 'una sorpresa']));
      const tr2 = r.teams[t.id];
      if (!tr2.locked && tr2.attempts > 0) this.at(2500 + Math.random() * 3000, () => {
        const tr3 = r.teams[t.id];
        if (!tr3.locked) g.submitGuess(t, this.botOf(t), ok ? ctx.secret.answers[0] : 'ni idea');
      });
    });
  }

  answerRouletteQ(r, t, force) {
    const g = this.g;
    if (g.round !== r || r.state !== 'active') return;
    const tr = r.teams[t.id];
    if (!tr.rq || tr.locked) return;
    const p = this.botOf(t);
    if (tr.draft == null) {
      const skill = t.skill * (tr.rq.isHard ? 0.8 : 1);
      const ans = tr.rq.secret.answer;
      const v = Math.random() < skill ? ans : U.pick([0, 1, 2, 3].filter((i) => i !== ans && !tr.hidden.includes(i)));
      this.say(t, `Yo creo que es la ${'ABCD'[v]}`, p);
      g.setDraft(t, p, v);
    }
    if (force || Math.random() < 0.5) g.lockTeam(t, false, p);
    else this.at(3000 + Math.random() * 4000, () => { const x = r.teams[t.id]; if (!x.locked && x.draft != null) g.lockTeam(t, false, p); });
  }

  usePower(t, power) {
    const g = this.g;
    const r = g.round;
    if (!r || r.state !== 'active') return;
    const p = this.botOf(t);
    g.usePower(t, p, power);
  }

  onReveal(r) {
    const g = this.g;
    for (const res of r.results || []) {
      const t = g.teamById(res.teamId);
      if (!t || !this.isBotTeam(t)) continue;
      if (Math.random() < 0.55) this.at(500 + Math.random() * 3500, () => this.say(t, U.pick(res.pts > 0 ? WIN : LOSE)));
      // robo
      if (t.powers.steal > 0 && Math.random() < 0.55) {
        this.at(2000 + Math.random() * 4000, () => {
          const rr = g.round;
          if (!rr || !['reveal', 'scoreboard'].includes(rr.state) || t.powers.steal <= 0) return;
          const others = g.teams.filter((x) => x.id !== t.id).sort((a, b) => b.score - a.score);
          if (!others.length) return;
          const target = Math.random() < 0.7 ? others[0] : U.pick(others);
          g.usePower(t, this.botOf(t), 'steal', target.id);
        });
      }
    }
  }

  onScoreboard(r) { /* espacio para animaciones futuras */ }
}

module.exports = { DemoBots, NAMES };
