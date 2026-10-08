'use strict';
// Servidor HTTP + WebSocket de MULTIVERSE CHALLENGE.
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { WebSocketServer } = require('ws');
const QRCode = require('qrcode');
const U = require('./util');
const { Game, MAX_PLAYERS } = require('./game');
const content = require('./content');
const ai = require('./ai');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };

function lanUrls() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || []) if (i.family === 'IPv4' && !i.internal) out.push(`http://${i.address}:${PORT}`);
  }
  return out;
}

class Hub {
  constructor() {
    this.games = new Map();
    this.sweeper = setInterval(() => this.sweep(), 10 * 60 * 1000);
    this.sweeper.unref();
  }

  newCode() {
    let c;
    do { c = U.code(5); } while (this.games.has(c));
    return c;
  }

  sweep() {
    const now = Date.now();
    for (const [code, g] of this.games) {
      if (now - g.lastActivity > 8 * 3600 * 1000 && g.clients.size === 0) { g.destroy(); this.games.delete(code); }
    }
  }

  err(c, msg) { try { c.ws.send(JSON.stringify({ t: 'err', msg })); } catch (e) { /* noop */ } }

  handle(c, msg) {
    if (!msg || typeof msg.t !== 'string') return;
    switch (msg.t) {
      case 'ping': return c.ws.send(JSON.stringify({ t: 'pong', now: Date.now() }));
      case 'host:create': {
        if (this.games.size >= 60) return this.err(c, 'Hay demasiadas partidas activas en este servidor.');
        const cfg = msg.cfg || {};
        const game = new Game(this, { ...cfg, themeId: cfg.themeId === 'custom' ? 'ia' : cfg.themeId });
        this.games.set(game.code, game);
        c.role = 'host';
        c.game = game;
        c.ws.send(JSON.stringify({ t: 'host:created', code: game.code, hostKey: game.hostKey }));
        game.attach(c);
        if (cfg.themeId === 'custom') {
          const topic = U.cleanText(cfg.customTopic, 60) || 'Tema libre';
          if (cfg.customJson) {
            const e = game.importTheme({ topic, json: cfg.customJson });
            if (e) { game.toast(c, e, 'warn'); game.useGeneralTheme(topic); }
          } else if (cfg.customMode === 'ai' && ai.enabled()) game.genTheme(c, { topic });
          else game.useGeneralTheme(topic);
        }
        return null;
      }
      case 'host:reconnect': {
        const game = this.games.get(String(msg.code || '').toUpperCase());
        if (!game || game.hostKey !== msg.hostKey) return c.ws.send(JSON.stringify({ t: 'host:gone' }));
        c.role = 'host';
        c.game = game;
        c.ws.send(JSON.stringify({ t: 'host:created', code: game.code, hostKey: game.hostKey }));
        game.attach(c);
        return null;
      }
      case 'join': {
        const code = String(msg.code || '').trim().toUpperCase();
        const game = this.games.get(code);
        if (!game) return c.ws.send(JSON.stringify({ t: 'joinFail', msg: 'No encontramos esa partida. Revisa el código.' }));
        const name = U.cleanText(msg.name, 18);
        if (name.length < 2) return c.ws.send(JSON.stringify({ t: 'joinFail', msg: 'Escribe tu nombre (mínimo 2 letras).' }));
        if (game.status === 'finished') return c.ws.send(JSON.stringify({ t: 'joinFail', msg: 'Esa aventura ya terminó.' }));
        const p = game.addPlayer(name, { online: true });
        if (!p) return c.ws.send(JSON.stringify({ t: 'joinFail', msg: `La partida está llena (máximo ${MAX_PLAYERS}).` }));
        c.role = 'player';
        c.game = game;
        c.pid = p.id;
        c.ws.send(JSON.stringify({ t: 'joined', pid: p.id, token: p.token, code: game.code, name: p.name }));
        game.attach(c);
        game.logEvent(`👋 ${p.name} se unió`, 'join');
        return null;
      }
      case 'rejoin': {
        const game = this.games.get(String(msg.code || '').toUpperCase());
        const p = game && game.players.get(msg.pid);
        if (!game || !p || p.token !== msg.token) return c.ws.send(JSON.stringify({ t: 'rejoinFail' }));
        c.role = 'player';
        c.game = game;
        c.pid = p.id;
        c.ws.send(JSON.stringify({ t: 'joined', pid: p.id, token: p.token, code: game.code, name: p.name }));
        game.attach(c);
        return null;
      }
      default: {
        const game = c.game;
        if (!game) return null;
        if (c.role === 'host' && msg.t.startsWith('host:')) game.handleHost(c, msg);
        else if (c.role === 'player' && !msg.t.startsWith('host:')) game.handlePlayer(c, msg);
        return null;
      }
    }
  }
}

const hub = new Hub();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/api/info') {
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      return res.end(JSON.stringify({ port: PORT, lan: lanUrls(), publicUrl: process.env.PUBLIC_URL || null, ai: ai.enabled(), themes: content.list(), maxPlayers: MAX_PLAYERS }));
    }
    if (url.pathname === '/api/prompt') {
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      return res.end(JSON.stringify({ prompt: ai.promptFor(U.cleanText(url.searchParams.get('topic'), 60) || 'el tema elegido') }));
    }
    if (url.pathname === '/api/recommend') {
      const n = U.clamp(parseInt(url.searchParams.get('n'), 10) || 20, 2, MAX_PLAYERS);
      const k = U.recommendTeams(n);
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      return res.end(JSON.stringify({ n, k, sizes: U.sizesFor(n, k) }));
    }
    if (url.pathname === '/qr') {
      const text = String(url.searchParams.get('text') || '').slice(0, 300);
      const svg = await QRCode.toString(text, { type: 'svg', margin: 1, color: { dark: '#0b1020', light: '#ffffff' } });
      res.writeHead(200, { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=3600' });
      return res.end(svg);
    }
    if (url.pathname === '/healthz') { res.writeHead(200); return res.end('ok'); }
    let p = decodeURIComponent(url.pathname);
    if (p === '/') p = '/index.html';
    if (p === '/host') p = '/host.html';
    const file = path.normalize(path.join(PUBLIC_DIR, p));
    if (!file.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end('forbidden'); }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('No encontrado'); }
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' });
      return res.end(data);
    });
    return null;
  } catch (e) {
    res.writeHead(500);
    return res.end('error');
  }
});

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 512 * 1024 });
wss.on('connection', (ws) => {
  const c = { ws, role: null, game: null, pid: null, tokens: 40, last: Date.now(), alive: true };
  ws.on('pong', () => { c.alive = true; });
  ws.on('message', (raw) => {
    const now = Date.now();
    c.tokens = Math.min(40, c.tokens + ((now - c.last) / 1000) * 20);
    c.last = now;
    if (c.tokens < 1) return;
    c.tokens -= 1;
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch (e) { return; }
    try { hub.handle(c, msg); } catch (e) { console.error('Error en mensaje', msg && msg.t, e); }
  });
  ws.on('close', () => { if (c.game) c.game.detach(c); });
  ws.on('error', () => {});
});

setInterval(() => {
  for (const ws of wss.clients) {
    ws.isAlive = ws.isAlive === undefined ? true : ws.isAlive;
  }
  wss.clients.forEach((ws) => { try { ws.ping(); } catch (e) { /* noop */ } });
}, 25000).unref();

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n  🌌  MULTIVERSE CHALLENGE listo\n');
  console.log(`  Organizador (esta computadora):  http://localhost:${PORT}/host`);
  const lan = lanUrls();
  if (lan.length) {
    console.log('  Estudiantes (misma red Wi-Fi):');
    for (const u of lan) console.log(`     ${u}`);
  }
  if (process.env.PUBLIC_URL) console.log(`  URL pública configurada: ${process.env.PUBLIC_URL}`);
  console.log(ai.enabled() ? '  IA de temas personalizados: activada (ANTHROPIC_API_KEY)\n' : '  IA de temas personalizados: desactivada (opcional, ver README)\n');
});

module.exports = { hub, server };
