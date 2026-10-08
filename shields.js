'use strict';
const { shuffle, pick } = require('./util');

// Los escudos son emblemas heráldicos genéricos: forma + patrón + colores + símbolo.
// El cliente los dibuja como SVG (ver public/js/shared.js -> shieldSVG).
const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#14b8a6', '#ec4899', '#f97316', '#06b6d4', '#84cc16'];
const SECOND = ['#fff7d6', '#111827', '#f8fafc', '#fde68a', '#0f172a'];
const GENERIC_SYMBOLS = ['🐉', '🛡️', '🐺', '⚔️', '🦅', '🦁', '🔥', '⚡', '🌟', '👑', '🏹', '🦂', '🐍', '🦉', '🌙', '☀️', '🪐', '💎', '🧭', '🚀'];
const SHAPES = 6;
const PATTERNS = 6;

function key(s) {
  return `${s.shape}-${s.pattern}-${s.symbol}`;
}

// Genera escudos distintos entre sí para `count` equipos.
function makeShields(count, symbols) {
  const colors = shuffle(COLORS);
  const shapes = shuffle([...Array(SHAPES).keys()]);
  const patterns = shuffle([...Array(PATTERNS).keys()]);
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push({
      shape: shapes[i % SHAPES],
      pattern: patterns[(i * 2 + 1) % PATTERNS],
      c1: colors[i % colors.length],
      c2: pick(SECOND),
      symbol: (symbols && symbols[i % symbols.length]) || GENERIC_SYMBOLS[i % GENERIC_SYMBOLS.length],
    });
  }
  return out;
}

// Regenera el escudo de un equipo manteniendo su color principal y evitando repetir los de los demás.
function regenShield(current, others, symbols) {
  const taken = new Set(others.map(key));
  const pool = (symbols && symbols.length ? symbols : []).concat(GENERIC_SYMBOLS);
  for (let tries = 0; tries < 60; tries++) {
    const cand = {
      shape: Math.floor(Math.random() * SHAPES),
      pattern: Math.floor(Math.random() * PATTERNS),
      c1: current.c1,
      c2: pick(SECOND),
      symbol: pick(pool),
    };
    if (!taken.has(key(cand)) && key(cand) !== key(current)) return cand;
  }
  return { ...current, shape: (current.shape + 1) % SHAPES };
}

module.exports = { makeShields, regenShield, COLORS, GENERIC_SYMBOLS };
