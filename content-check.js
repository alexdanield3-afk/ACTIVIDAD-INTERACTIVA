'use strict';
// Valida la estructura y coherencia de todo el contenido temático.
const content = require('../server/content');
let errors = 0, items = 0;
const err = (t, k, i, m) => { errors++; console.log(`✖ ${t}.${k}[${i}]: ${m}`); };
const min = { quiz: 6, tf: 4, wwyd: 2, order: 2, memory: 2, guess: 2, connection: 3, quick: 4, strategic: 2, boss: 2 };
for (const m of content.list()) {
  const t = content.get(m.id);
  if (t.teams.length < 8) err(m.id, 'teams', 0, 'faltan equipos');
  if (new Set(t.teams.map((x) => x.n)).size !== t.teams.length) err(m.id, 'teams', 0, 'nombres repetidos');
  for (const [k, n] of Object.entries(min)) {
    const arr = t.bank[k] || [];
    if (arr.length < n) err(m.id, k, 0, `solo ${arr.length} (mín ${n})`);
    arr.forEach((it, i) => {
      items++;
      const strs = (x) => (Array.isArray(x) ? x : [x]);
      if (['quiz', 'quick', 'boss', 'memory', 'connection'].includes(k)) {
        if (!it.o || it.o.length !== 4) return err(m.id, k, i, 'no tiene 4 opciones');
        if (new Set(it.o.map((x) => x.trim().toLowerCase())).size !== 4) err(m.id, k, i, 'opciones repetidas: ' + it.o.join(' | '));
        if (it.o.some((x) => !x || !x.trim())) err(m.id, k, i, 'opción vacía');
        if (it.a !== 0) err(m.id, k, i, 'la correcta debe ir primero');
        const q = it.q || (it.words || []).join();
        if (!q) err(m.id, k, i, 'sin pregunta');
        const others = it.o.slice(1);
        const avg = others.reduce((a, x) => a + x.length, 0) / others.length;
        if (it.o[0].length > 38 && it.o[0].length > Math.max(...others.map((x) => x.length)) && it.o[0].length > avg * 1.45) err(m.id, k, i, `la correcta es mucho más larga (${it.o[0].length} vs ~${Math.round(avg)}): ${it.o[0].slice(0, 45)}`);
      }
      if (k === 'tf' && typeof it.a !== 'boolean') err(m.id, k, i, 'a no booleana');
      if (k === 'wwyd' && !(it.o.length >= 3 && it.s[0] === 100)) err(m.id, k, i, 'wwyd mal formado');
      if (k === 'order' && !(it.items.length >= 3 && new Set(it.items).size === it.items.length)) err(m.id, k, i, 'order mal formado');
      if (k === 'guess' && !(it.clues.length === 5 && it.ans.length >= 1)) err(m.id, k, i, 'guess necesita 5 pistas');
      if (k === 'memory' && !(it.lines.length >= 3)) err(m.id, k, i, 'memory sin líneas');
      if (k === 'strategic' && !(it.q && it.safe && it.risk && it.ally)) err(m.id, k, i, 'strategic incompleto');
    });
  }
}
console.log(`\nTemáticas: ${content.list().length} · ítems revisados: ${items} · errores: ${errors}`);
process.exit(errors ? 1 : 0);
