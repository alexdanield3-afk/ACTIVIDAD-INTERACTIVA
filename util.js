'use strict';
const crypto = require('crypto');

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function uid(n = 10) {
  return crypto.randomBytes(n).toString('hex').slice(0, n);
}

function code(n = 5) {
  let s = '';
  for (let i = 0; i < n; i++) s += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
  return s;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// Normaliza texto para comparar respuestas escritas (sin tildes, minúsculas, sin signos).
function norm(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanText(s, max = 240) {
  return String(s == null ? '' : s)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

// ---- Distribución de equipos -------------------------------------------------
// Objetivo: equipos de 4 o 5 personas, lo más equilibrados posible.
function sizesFor(n, k) {
  const base = Math.floor(n / k);
  const extra = n % k;
  return Array.from({ length: k }, (_, i) => base + (i < extra ? 1 : 0));
}

function penalty(sizes) {
  return sizes.reduce((p, s) => p + Math.max(0, 4 - s) + Math.max(0, s - 5), 0);
}

// Devuelve la cantidad de equipos recomendada. En empate gana el menor número de equipos
// (20 -> 4x5, 24 -> 5 equipos de 4/5, 28 -> 6, 30 -> 6x5).
function recommendTeams(n) {
  n = Math.max(2, Math.floor(n));
  let best = null;
  const maxK = Math.min(8, n);
  for (let k = 2; k <= maxK; k++) {
    const p = penalty(sizesFor(n, k));
    if (best === null || p < best.p) best = { k, p };
  }
  return best ? best.k : 2;
}

module.exports = { uid, code, pick, shuffle, clamp, norm, cleanText, sizesFor, recommendTeams };
