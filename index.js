'use strict';
// Registro de temáticas. Cada temática trae su propio contenido (preguntas, retos, nombres de equipo, símbolos).
const themes = {};
const order = [];

function reg(list) {
  for (const t of list) {
    themes[t.id] = t;
    order.push(t.id);
  }
}

for (const f of ['./pack1', './pack2', './pack3', './pack4']) {
  try { reg(require(f)); } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') throw e;
  }
}

const caos = {
  id: 'caos', name: 'MODO CAOS', emoji: '🌀', desc: 'Cada reto viene de un universo distinto. ¡Nunca dos partidas iguales!',
  a: '#e879f9', b: '#22d3ee', bg: ['🌀', '🎲', '✨', '🔮'],
  teams: [
    { n: 'Los Dragones', s: '🐉' }, { n: 'Los Guardianes', s: '🛡️' }, { n: 'Los Lobos', s: '🐺' }, { n: 'Los Titanes', s: '⚡' },
    { n: 'Los Cuervos', s: '🦅' }, { n: 'Los Leones', s: '🦁' }, { n: 'Los Fénix', s: '🔥' }, { n: 'Los Centauros', s: '🏹' },
  ],
  surprise: ['El multiverso se agita…', 'Una grieta dimensional se abre…', 'El caos decide…'],
  bank: {},
};

function exists(id) { return id === 'caos' || !!themes[id]; }

function get(id) { return id === 'caos' ? caos : themes[id] || null; }

function meta(t) {
  return { id: t.id, name: t.name, emoji: t.emoji, desc: t.desc || '', a: t.a, b: t.b, bg: t.bg || [t.emoji] };
}

function list() { return order.map((id) => meta(themes[id])); }

function chaosPool() { return order.slice(); }

let _general = null;
function general() {
  if (_general) return _general;
  const keys = ['quiz', 'tf', 'wwyd', 'order', 'memory', 'guess', 'connection', 'quick', 'strategic', 'boss'];
  const src = ['ciencia', 'geografia', 'historia', 'educacion', 'tecnologia'].map((id) => themes[id]).filter(Boolean);
  const bank = {};
  for (const k of keys) bank[k] = src.flatMap((t) => (t.bank && t.bank[k]) || []);
  _general = { id: 'general', name: 'Cultura general', emoji: '🎯', a: '#38bdf8', b: '#818cf8', bg: ['🎯'], teams: caos.teams, bank };
  return _general;
}

module.exports = { exists, get, meta, list, chaosPool, general, caos };
