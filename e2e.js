'use strict';
// Prueba de extremo a extremo por WebSocket real: 30 participantes + organizador.
// Uso: node test/e2e.js [http://localhost:3100]
const WebSocket = require('ws');
const BASE = process.argv[2] || 'http://localhost:3100';
const WS = BASE.replace(/^http/, 'ws') + '/ws';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
let checks = 0;
function ok(cond, msg) { checks++; if (!cond) { fails++; console.log('  ✖ FALLA:', msg); } else console.log('  ✔', msg); }

class C {
  constructor(role) { this.role = role; this.v = null; this.chat = []; this.hist = null; this.toasts = []; this.errs = []; this.raw = []; this.msgs = []; }
  open() {
    return new Promise((res) => {
      this.ws = new WebSocket(WS);
      this.ws.on('open', res);
      this.ws.on('message', (d) => {
        const m = JSON.parse(d.toString());
        this.msgs.push(m.t);
        if (m.t === 'snap') { this.v = m.v; this.lastSnapRaw = d.toString(); if (m.v.round && m.v.round.state === 'active') this.activeRaw = d.toString(); }
        else if (m.t === 'chat') this.chat.push(m.msg);
        else if (m.t === 'chatHistory') this.hist = m;
        else if (m.t === 'toast') this.toasts.push(m.text);
        else if (m.t === 'err') this.errs.push(m.msg);
        else if (m.t === 'joined') { this.pid = m.pid; this.token = m.token; this.code = m.code; this.joined = true; }
        else if (m.t === 'joinFail') this.joinFail = m.msg;
        else if (m.t === 'host:created') { this.code = m.code; this.hostKey = m.hostKey; }
      });
    });
  }
  send(o) { this.ws.send(JSON.stringify(o)); }
  close() { try { this.ws.close(); } catch (e) { /* noop */ } }
  get team() { return this.v && this.v.me ? this.v.teams.find((t) => t.id === this.v.me.teamId) : null; }
}

async function until(fn, ms, what) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (fn()) return true; await sleep(60); }
  console.log('  (timeout esperando: ' + what + ')');
  return false;
}

(async () => {
  const host = new C('host');
  await host.open();
  host.send({ t: 'host:create', cfg: { name: 'E2E', expected: 30, themeId: 'vikingos', length: 'corta', auto: false, spy: false } });
  await until(() => host.code && host.v, 3000, 'partida creada');
  console.log('Partida', host.code);
  ok(host.v.teams.length === 6, 'para 30 participantes se recomiendan 6 equipos (' + host.v.teams.length + ')');

  // ---- 30 jugadores
  const ps = [];
  for (let i = 0; i < 30; i++) {
    const c = new C('player');
    await c.open();
    c.send({ t: 'join', name: 'Jugador' + (i + 1), code: host.code });
    ps.push(c);
  }
  await until(() => ps.every((p) => p.joined && p.v && p.v.me), 5000, 'todos unidos');
  ok(ps.every((p) => p.joined), '30 participantes entraron');
  await sleep(300);
  const sizes = {};
  ps.forEach((p) => { sizes[p.v.me.teamId] = (sizes[p.v.me.teamId] || 0) + 1; });
  ok(Object.values(sizes).every((n) => n === 5) && Object.keys(sizes).length === 6, 'equipos balanceados 6×5: ' + JSON.stringify(sizes));
  ok(new Set(host.v.teams.map((t) => JSON.stringify(t.shield))).size === 6, 'los 6 escudos son distintos');
  ok(new Set(host.v.teams.map((t) => t.name)).size === 6, 'los 6 nombres son distintos');
  const bad = new C('player'); await bad.open(); bad.send({ t: 'join', name: 'X', code: 'ZZZZZ' }); await sleep(200);
  ok(!!bad.joinFail, 'un código inválido es rechazado');
  bad.close();

  // ---- chat privado por equipo
  const byTeam = {};
  ps.forEach((p) => { (byTeam[p.v.me.teamId] = byTeam[p.v.me.teamId] || []).push(p); });
  const tids = Object.keys(byTeam);
  const sender = byTeam[tids[0]][0];
  sender.send({ t: 'chat', text: 'secreto-' + tids[0] });
  await sleep(300);
  ok(byTeam[tids[0]].every((p) => p.chat.some((m) => m.text === 'secreto-' + tids[0])), 'los 5 miembros del equipo reciben el mensaje');
  ok(ps.filter((p) => p.v.me.teamId !== tids[0]).every((p) => !p.chat.some((m) => m.text === 'secreto-' + tids[0])), 'los otros 25 jugadores NO reciben el mensaje');
  ok(!host.chat.some((m) => m.text === 'secreto-' + tids[0]), 'el organizador no lo recibe con la observación apagada');
  host.send({ t: 'host:setCfg', spy: true });
  await sleep(300);
  ok(host.hist && host.hist.all && JSON.stringify(host.hist.chats).includes('secreto-' + tids[0]), 'al activar «observar chats» el organizador ve el historial');
  byTeam[tids[1]][0].send({ t: 'chat', text: 'otro-' + tids[1] });
  await sleep(250);
  ok(host.chat.some((m) => m.text === 'otro-' + tids[1]), 'con observación activa recibe mensajes en vivo');
  ok(!JSON.stringify(sender.v).includes('otro-'), 'el snapshot de un jugador no contiene chats ajenos');

  // ---- reconexión
  const rj = byTeam[tids[2]][1];
  const oldPid = rj.pid; const tok = rj.token;
  rj.close(); await sleep(250);
  ok(host.v.teams.find((t) => t.id === tids[2]).online === 4, 'al caerse un jugador el equipo marca 4/5 conectados');
  const rj2 = new C('player'); await rj2.open();
  rj2.send({ t: 'rejoin', code: host.code, pid: oldPid, token: tok });
  await until(() => rj2.v && rj2.v.me, 2000, 'reconexión');
  ok(rj2.v && rj2.v.me && rj2.v.me.teamId === tids[2], 'el jugador reconecta con su mismo equipo');
  byTeam[tids[2]][1] = rj2; ps[ps.indexOf(rj)] = rj2;
  const rj3 = new C('player'); await rj3.open(); rj3.send({ t: 'rejoin', code: host.code, pid: oldPid, token: 'mal' }); await sleep(200);
  ok(rj3.msgs.includes('rejoinFail'), 'un token inválido no permite reconectar');
  rj3.close();

  // ---- inicio
  host.send({ t: 'host:start' });
  await until(() => host.v.phase === 'ready', 2000, 'ready');
  ok(host.v.phase === 'ready' && host.v.plan.length === 8, 'aventura corta con 8 retos');
  ok(ps[0].v.cfg && !ps[0].v.round, 'antes del primer reto no hay ronda');

  const gameLog = [];
  const sawKinds = new Set();
  let leaks = 0; let crossDraft = 0;
  for (let stage = 0; stage < 8; stage++) {
    if (stage === 0) host.send({ t: 'host:next' });
    await until(() => host.v.round && host.v.round.idx === stage && host.v.round.state === 'active', 9000, 'reto activo ' + stage);
    const r = host.v.round;
    sawKinds.add(r.kind);
    // anti-filtración: los jugadores no reciben secretos ni respuestas antes del reveal
    const raw = ps[3].activeRaw || '';
    if (/"secret"|"reveal":\{|"rteams"|"answerText"/.test(raw)) leaks++;
    ps.forEach((p) => { if (p.v.round && p.v.round.status.some((s) => 'chosen' in s)) leaks++; });
    if (stage === 1) {
      // pausa: el tiempo no corre
      const before = host.v.round.tEnd;
      host.send({ t: 'host:pause' }); await sleep(1500);
      ok(host.v.paused && ps[0].v.paused, 'la pausa llega a todos');
      ps[0].send({ t: 'draft', value: 0 }); await sleep(150);
      host.send({ t: 'host:resume' }); await sleep(300);
      ok(!host.v.paused && host.v.round.tEnd >= before + 1300, 'al reanudar se descuenta la pausa del tiempo (+' + (host.v.round.tEnd - before) + ' ms)');
    }
    if (stage === 2) {
      // poderes del organizador y uso de tiempo extra / doble
      const team = byTeam[tids[0]];
      host.send({ t: 'host:grant', teamId: tids[0], power: 'time' });
      host.send({ t: 'host:grant', teamId: tids[0], power: 'double' });
      await sleep(250);
      const before = team[0].v.round && team[0].v.round.mine ? team[0].v.round.mine.deadline : 0;
      team[0].send({ t: 'power', power: 'time' }); team[1].send({ t: 'power', power: 'double' }); await sleep(300);
      const m = team[2].v.round.mine;
      ok(m && m.timeUsed && m.deadline - before === 15000 || r.kind === 'roulette', 'TIEMPO EXTRA suma 15 s al equipo (' + (m && m.deadline - before) + ')');
      ok(m && m.doubleOn || r.kind === 'roulette', 'DOBLE queda activo para todo el equipo');
      ok(!byTeam[tids[3]][0].v.round.mine.timeUsed, 'el poder de un equipo no afecta a otro');
    }
    // cada equipo responde: un miembro elige, otro bloquea
    for (const tid of tids) {
      const [a, b] = byTeam[tid];
      if (r.kind === 'roulette') { a.send({ t: 'spin' }); continue; }
      const pub = r.pub;
      let val = 0;
      if (pub.type === 'tf') val = Math.random() < 0.5;
      else if (pub.type === 'order') val = pub.items.map((_, i) => i).reverse();
      else if (pub.type === 'guess') val = 'respuesta';
      else if (pub.type === 'choice' || pub.type === 'wwyd') val = Math.floor(Math.random() * 4);
      else if (pub.type === 'strategic') val = Math.floor(Math.random() * 3);
      if (pub.type === 'guess') { a.send({ t: 'guess', text: 'prueba' }); a.send({ t: 'guess', text: 'otra' }); a.send({ t: 'guess', text: 'mas' }); continue; }
      if (pub.memory && Date.now() < r.memShowUntil + 100) await sleep(Math.max(0, r.memShowUntil + 200 - (Date.now() + (host.v.now - Date.now()))));
      a.send({ t: 'draft', value: val });
      await sleep(40);
      b.send({ t: 'lock' });
    }
    if (r.kind === 'roulette') {
      await sleep(400);
      if (stage >= 1) {
        // forzar «el organizador decide» en un equipo para probar esa vía
        // (la ruleta ya giró: sólo se verifica el estado si cayó)
      }
      for (const tid of tids) {
        const s = host.v.round.status.find((x) => x.id === tid);
        if (s.pending) host.send({ t: 'host:decide', teamId: tid, points: 120 });
      }
      await sleep(300);
      for (const tid of tids) {
        const p = byTeam[tid][1];
        const rq = p.v.round && p.v.round.mine && p.v.round.mine.rq;
        if (rq) { p.send({ t: 'draft', value: 0 }); await sleep(30); byTeam[tid][2].send({ t: 'lock' }); }
      }
    }
    // el borrador de un equipo no es visible para otro
    const a0 = byTeam[tids[0]][0]; const o0 = byTeam[tids[1]][0];
    if (o0.v.round && o0.v.round.mine && a0.v.round && a0.v.round.mine && o0.v.round.mine.draftBy && o0.v.round.mine.draftBy === a0.v.me.name) crossDraft++;
    const reached = await until(() => host.v.round && host.v.round.idx === stage && (host.v.round.state === 'reveal' || host.v.round.state === 'scoreboard'), 75000, 'reveal ' + stage);
    ok(reached, `reto ${stage + 1} (${r.kind}) termina y muestra resultado`);
    const rv = host.v.round;
    if (rv.state === 'reveal') {
      ok(Array.isArray(rv.results) && rv.results.length === 6, '  resultados de los 6 equipos');
      ok(ps[7].v.round.reveal && ps[7].v.round.results, '  los jugadores reciben la revelación recién al terminar');
    }
    gameLog.push(`${stage + 1}:${r.kind}`);
    host.send({ t: 'host:next' }); // marcador
    await sleep(250);
    if (host.v.round && host.v.round.state === 'scoreboard') ok(true, '  marcador visible');
    host.send({ t: 'host:next' }); // siguiente reto o final
    await sleep(250);
  }
  await until(() => host.v.phase === 'finished', 8000, 'final');
  ok(host.v.phase === 'finished', 'la aventura termina (' + gameLog.join(', ') + ')');
  ok(leaks === 0, 'sin filtraciones de respuestas a los jugadores antes del reveal (' + leaks + ')');
  ok(crossDraft === 0, 'los borradores de un equipo no aparecen en otro');
  ok(host.v.final && host.v.final.ranking.length === 6, 'el ranking final incluye a los 6 equipos');
  const sc = host.v.teams.map((t) => t.score);
  console.log('  puntajes finales:', host.v.teams.map((t) => `${t.name}=${t.score}`).join(' | '));
  ok(Math.max(...sc) > 0, 'hubo puntos repartidos');
  ok(ps.every((p) => p.v.phase === 'finished'), 'los 30 jugadores ven la pantalla final');
  ok(host.errs.length === 0 && ps.every((p) => p.errs.length === 0), 'sin mensajes de error del servidor');
  console.log('  tipos de reto jugados:', [...sawKinds].join(', '));

  // ---- reinicio
  host.send({ t: 'host:restart' });
  await sleep(500);
  ok(host.v.phase === 'lobby' && host.v.teams.every((t) => t.score === 0) && ps.every((p) => p.v.phase === 'lobby'), 'reiniciar devuelve a todos a la sala de espera con 0 puntos');

  ps.forEach((p) => p.close()); host.close();
  console.log(`\n${checks - fails}/${checks} comprobaciones correctas`);
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
