'use strict';
// Temáticas personalizadas ("CREAR TEMA").
//  1) Con ANTHROPIC_API_KEY el servidor pide a Claude que escriba todo el contenido del tema.
//  2) Sin clave, el organizador puede pegar el JSON que le genere Claude (el prompt se copia desde la app).
//  3) Si no hay ninguna de las dos, se usa un paquete de cultura general con el nombre y los equipos del tema.
const content = require('./content');
const U = require('./util');

const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';
const PALETTES = [['#38bdf8', '#6366f1'], ['#f472b6', '#8b5cf6'], ['#34d399', '#0ea5e9'], ['#fbbf24', '#ef4444'], ['#a78bfa', '#22d3ee'], ['#fb7185', '#f59e0b']];

function enabled() { return !!process.env.ANTHROPIC_API_KEY; }

const SCHEMA_EXAMPLE = `{
  "name": "Nombre del tema",
  "emoji": "🪐",
  "teamNames": ["Los Astronautas", "... 8 nombres de equipo temáticos"],
  "symbols": ["🪐", "... 8 emojis, uno por equipo"],
  "quiz": [{"q": "Pregunta", "options": ["A", "B", "C", "D"], "answer": 0, "hard": false, "why": "Explicación breve"}],
  "tf": [{"q": "Afirmación", "answer": true, "why": "Explicación breve"}],
  "wwyd": [{"q": "Situación práctica…", "options": ["mejor decisión", "decisión aceptable", "mala decisión"], "why": "Por qué"}],
  "order": [{"q": "Ordena de … a …", "items": ["primero", "segundo", "tercero", "cuarto"], "why": "Por qué"}],
  "memory": [{"title": "Título de la ficha", "lines": ["dato 1", "dato 2", "dato 3", "dato 4"], "q": "Pregunta sobre la ficha", "options": ["A", "B", "C", "D"], "answer": 0}],
  "guess": [{"category": "personaje / objeto / lugar / concepto", "clues": ["pista muy difícil", "pista difícil", "pista media", "pista fácil", "pista casi regalada"], "answers": ["respuesta principal", "sinónimo aceptado"], "why": "Dato curioso"}],
  "connection": [{"words": ["p1", "p2", "p3", "p4", "p5"], "options": ["lo que tienen en común", "distractor", "distractor", "distractor"], "answer": 0, "why": "Por qué"}],
  "quick": [{"q": "Pregunta sencilla", "options": ["A", "B", "C", "D"], "answer": 0, "why": ""}],
  "strategic": [{"q": "Situación estratégica del tema", "safe": "acción prudente (etiqueta corta)", "risk": "acción arriesgada (etiqueta corta)", "ally": "pedir ayuda a aliados (etiqueta corta)"}],
  "boss": [{"boss": "Nombre del jefe final", "q": "Pregunta difícil", "options": ["A", "B", "C", "D"], "answer": 0, "why": "Explicación"}]
}`;

function promptFor(topic, audience = 'estudiantes universitarios') {
  return `Eres diseñador de juegos educativos. Crea el contenido de un juego de equipos sobre el tema «${topic}» para ${audience}.
Responde ÚNICAMENTE con un objeto JSON válido (sin texto antes o después y sin bloques de código) que siga exactamente esta estructura:

${SCHEMA_EXAMPLE}

Cantidades: teamNames 8 y symbols 8; quiz 6 (2 de ellas con "hard": true); tf 4; wwyd 2 (siempre 3 opciones ordenadas de la MEJOR a la PEOR); order 2 (4 o 5 elementos escritos en el orden CORRECTO); memory 2; guess 2 (5 pistas de la más difícil a la más fácil; answers con variantes aceptadas); connection 3 (5 palabras); quick 4; strategic 2; boss 2.
Reglas: español neutro; datos verificables y correctos; una sola respuesta correcta con distractores plausibles; reparte la posición de la respuesta correcta (campo "answer" entre 0 y 3) en lugar de dejarla siempre en 0; incluye situaciones prácticas, no sólo memorización; todo el contenido debe estar realmente relacionado con «${topic}»; evita preguntas repetidas.`;
}

function str(x, max = 400) { return U.cleanText(x, max); }

function opts4(o) {
  if (!Array.isArray(o) || o.length < 4) throw new Error('una pregunta tiene menos de 4 opciones');
  return o.slice(0, 4).map((x) => str(x, 160));
}

function conv(raw, topic) {
  const g = content.general().bank;
  const out = {};
  const need = { quiz: 4, tf: 3, wwyd: 1, order: 1, memory: 1, guess: 1, connection: 2, quick: 3, strategic: 1, boss: 1 };
  const fills = [];
  const take = (key, arr, fn) => {
    const list = [];
    for (const it of Array.isArray(arr) ? arr : []) {
      try { const x = fn(it); if (x) list.push(x); } catch (e) { /* se descarta el elemento inválido */ }
    }
    out[key] = list;
  };
  take('quiz', raw.quiz, (it) => ({ q: str(it.q), o: opts4(it.options), a: U.clamp(parseInt(it.answer, 10) || 0, 0, 3), hard: !!it.hard, why: str(it.why) }));
  take('quick', raw.quick, (it) => ({ q: str(it.q), o: opts4(it.options), a: U.clamp(parseInt(it.answer, 10) || 0, 0, 3), why: str(it.why) }));
  take('tf', raw.tf, (it) => ({ q: str(it.q), a: it.answer === true || it.answer === 'true', why: str(it.why) }));
  take('wwyd', raw.wwyd, (it) => {
    const o = (it.options || []).slice(0, 4).map((x) => str(x, 200));
    if (o.length < 3) throw new Error('wwyd');
    return { q: str(it.q, 600), o, s: [100, 50, 0, 0].slice(0, o.length), why: str(it.why) };
  });
  take('order', raw.order, (it) => {
    const items = (it.items || []).slice(0, 5).map((x) => str(x, 120));
    if (items.length < 3) throw new Error('order');
    return { q: str(it.q), items, why: str(it.why) };
  });
  take('memory', raw.memory, (it) => ({ title: str(it.title, 100), lines: (it.lines || []).slice(0, 6).map((x) => str(x, 120)), q: str(it.q), o: opts4(it.options), a: U.clamp(parseInt(it.answer, 10) || 0, 0, 3) }));
  take('guess', raw.guess, (it) => {
    const clues = (it.clues || []).slice(0, 5).map((x) => str(x, 200));
    const ans = (it.answers || []).map((x) => str(x, 80)).filter(Boolean);
    if (clues.length < 3 || !ans.length) throw new Error('guess');
    return { cat: str(it.category, 60), clues, ans, why: str(it.why) };
  });
  take('connection', raw.connection, (it) => {
    const words = (it.words || []).slice(0, 6).map((x) => str(x, 60));
    if (words.length < 3) throw new Error('connection');
    return { words, o: opts4(it.options), a: U.clamp(parseInt(it.answer, 10) || 0, 0, 3), why: str(it.why) };
  });
  take('strategic', raw.strategic, (it) => ({ q: str(it.q, 500), safe: str(it.safe, 120), risk: str(it.risk, 120), ally: str(it.ally, 120) }));
  take('boss', raw.boss, (it) => ({ boss: str(it.boss, 60) || 'El Jefe Final', q: str(it.q, 500), o: opts4(it.options), a: U.clamp(parseInt(it.answer, 10) || 0, 0, 3), hard: true, why: str(it.why) }));
  for (const [k, min] of Object.entries(need)) {
    if (out[k].length < min) {
      fills.push(k);
      out[k] = out[k].concat(U.shuffle(g[k] || []).slice(0, Math.max(0, min - out[k].length + 2)));
    }
  }
  return { bank: out, fills };
}

function normalizeTheme(raw, topic) {
  if (!raw || typeof raw !== 'object') throw new Error('el contenido no es un objeto');
  const name = str(raw.name || topic, 50) || 'Tema libre';
  const { bank, fills } = conv(raw, topic);
  const syms = (raw.symbols || []).filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim().slice(0, 4));
  const names = (raw.teamNames || []).filter((x) => typeof x === 'string' && x.trim()).map((x) => str(x, 28));
  const caos = content.caos.teams;
  const teams = [];
  for (let i = 0; i < 8; i++) {
    teams.push({ n: names[i] || `${caos[i].n}`, s: syms[i] || caos[i].s });
  }
  const pal = PALETTES[Math.abs([...name].reduce((h, c) => h + c.charCodeAt(0), 0)) % PALETTES.length];
  const emoji = (raw.emoji && String(raw.emoji).trim().slice(0, 4)) || syms[0] || '🎯';
  return {
    id: 'custom', name, emoji, desc: 'Tema personalizado', a: pal[0], b: pal[1], bg: [emoji, ...syms.slice(1, 4)],
    teams, bank, surprise: [`El universo de «${name}» te sorprende…`, 'Un giro inesperado…'], notes: fills.length ? `Se completó con cultura general: ${fills.join(', ')}` : '',
  };
}

function generalTheme(topic) {
  const g = content.general();
  const name = str(topic, 50) || 'Tema libre';
  const pal = PALETTES[Math.abs([...name].reduce((h, c) => h + c.charCodeAt(0), 0)) % PALETTES.length];
  return {
    id: 'custom', name, emoji: '🎯', desc: 'Tema personalizado (preguntas de cultura general)', a: pal[0], b: pal[1], bg: ['🎯', '🌟', '🧩', '🚀'],
    teams: g.teams, bank: g.bank, surprise: ['Un giro inesperado…'], notes: 'Sin IA ni JSON: se usan preguntas de cultura general.',
  };
}

async function generateTheme(topic) {
  if (!enabled()) throw new Error('El servidor no tiene ANTHROPIC_API_KEY configurada');
  const base = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '');
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 150000);
  try {
    const res = await fetch(`${base}/v1/messages`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 16000, messages: [{ role: 'user', content: promptFor(topic) }] }),
    });
    if (!res.ok) throw new Error(`La API respondió ${res.status}`);
    const data = await res.json();
    const text = (data.content || []).map((b) => b.text || '').join('');
    const a = text.indexOf('{');
    const b = text.lastIndexOf('}');
    if (a < 0 || b < 0) throw new Error('La respuesta no contiene JSON');
    return normalizeTheme(JSON.parse(text.slice(a, b + 1)), topic);
  } finally {
    clearTimeout(to);
  }
}

module.exports = { enabled, promptFor, normalizeTheme, generalTheme, generateTheme };
