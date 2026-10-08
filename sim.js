'use strict';
// Simulación determinista del motor (reloj simulado): juega una partida DEMO completa sin red.
const realNow = Date.now.bind(Date);
let T = realNow();
Date.now = () => T;
const { Game } = require('../server/game');

const hub = { newCode: () => 'SIM01' };
const themeId = process.argv[2] || 'vikingos';
const demo = parseInt(process.argv[3], 10) || 20;
const chaos = process.argv[4] === 'chaos';
const g = new Game(hub, { name: 'Simulación', themeId, demo, chaos, length: process.argv[5] || 'normal', fast: true });
clearInterval(g.timer);
const host = { role: 'host', ws: { readyState: 1, send() {} } };
g.clients.add(host);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  await sleep(140 * demo + 800); // los bots entran con temporizadores reales
  console.log('Jugadores:', g.players.size, '| equipos:', g.teams.map((t) => `${t.name}(${g.members(t).length})`).join(', '));
  if (g.start()) throw new Error('no arrancó');
  let ticks = 0;
  let lastState = '';
  while (g.status !== 'finished' && ticks < 20000) {
    T += 250; ticks++;
    g.tick();
    const r = g.round;
    const st = r ? `${r.idx}:${r.kind}:${r.state}` : 'ready';
    if (st !== lastState) {
      lastState = st;
      if (r && r.state === 'reveal') {
        const line = r.results.map((x) => `${g.teamById(x.teamId).name.slice(0, 14)}=${x.pts}${x.correct ? '✔' : ''}`).join(' | ');
        console.log(`R${r.idx + 1} ${r.kind}${r.semi ? '(semi)' : ''} [${r.theme.name}] t=${Math.round(ticks / 4)}s → ${line}`);
      }
    }
    // Validación: la vista de un jugador nunca debe incluir secretos
    if (ticks % 40 === 0 && r && r.state === 'active') {
      const p = [...g.players.values()].find((x) => !x.bot) || [...g.players.values()][0];
      const v = JSON.stringify(g.viewFor({ role: 'player', pid: p.id, ws: { readyState: 1 } }));
      if (v.includes('"secret"') || v.includes('"answers"')) throw new Error('¡Fuga de secretos en la vista del jugador!');
    }
  }
  if (g.status !== 'finished') throw new Error('La partida no terminó (ticks=' + ticks + ', fase=' + g.phase() + ')');
  const rank = g.teams.slice().sort((a, b) => b.score - a.score);
  console.log('\nFINAL:');
  rank.forEach((t, i) => console.log(`${i + 1}. ${t.name} — ${t.score} pts · superó ${t.stats.passed || 0}/${g.plan.length} · insignias: ${t.badges.join(', ') || '—'}`));
  console.log(`\nSimulado: ${Math.round(ticks / 4)} s de juego en ${ticks} ticks. Eventos:`, g.log.length);
  g.destroy();
  process.exit(0);
})().catch((e) => { console.error('FALLÓ:', e); process.exit(1); });
