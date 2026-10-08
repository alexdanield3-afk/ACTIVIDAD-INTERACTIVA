/* MULTIVERSE CHALLENGE — utilidades compartidas del cliente (sin dependencias externas). */
(function () {
  'use strict';
  const MV = (window.MV = { offset: 0, hello: null, view: null });

  MV.$ = (s, r) => (r || document).querySelector(s);
  MV.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  MV.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  MV.pad = (n) => String(n).padStart(2, '0');
  MV.store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* noop */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* noop */ } },
  };

  // ---- Reloj sincronizado con el servidor -------------------------------------
  MV.setView = function (v) {
    MV.view = v;
    MV.offset = v.now - Date.now();
  };
  // "ahora" del servidor; en pausa el reloj queda congelado en el instante de la pausa
  MV.now = function () {
    const v = MV.view;
    if (v && v.paused && v.pausedAt) return v.pausedAt;
    return Date.now() + MV.offset;
  };
  MV.fmtTimer = function (ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    if (s < 100) return '00:' + MV.pad(s);
    return MV.pad(Math.floor(s / 60)) + ':' + MV.pad(s % 60);
  };

  // ---- Conexión WebSocket con reconexión automática ----------------------------
  MV.connect = function (h) {
    let ws = null; let tries = 0; let ping = null; let stopped = false;
    function open() {
      ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws');
      ws.onopen = () => { tries = 0; if (h.open) h.open(); };
      ws.onmessage = (e) => {
        let m; try { m = JSON.parse(e.data); } catch (err) { return; }
        if (m.t === 'hello') MV.hello = m;
        if (m.t === 'snap') MV.setView(m.v);
        h.msg(m);
      };
      ws.onclose = () => {
        if (h.close) h.close();
        if (!stopped) setTimeout(open, Math.min(4000, 400 + tries++ * 500));
      };
      ws.onerror = () => {};
    }
    open();
    ping = setInterval(() => { if (ws && ws.readyState === 1) ws.send('{"t":"ping"}'); }, 20000);
    return {
      send(o) { if (ws && ws.readyState === 1) { ws.send(JSON.stringify(o)); return true; } return false; },
      get open() { return !!ws && ws.readyState === 1; },
      stop() { stopped = true; clearInterval(ping); try { ws.close(); } catch (e) { /* noop */ } },
    };
  };

  // ---- Escudos heráldicos genéricos (SVG) --------------------------------------
  let sid = 0;
  const PATHS = [
    'M10 10 H90 V60 Q90 100 50 114 Q10 100 10 60 Z',
    'M50 6 L92 22 V62 Q92 98 50 116 Q8 98 8 62 V22 Z',
    'M12 12 H88 V70 L50 114 L12 70 Z',
    'M2 60 A48 48 0 0 1 98 60 A48 48 0 0 1 2 60 Z',
    'M50 6 L92 30 V82 L50 114 L8 82 V30 Z',
    'M8 10 Q50 26 92 10 V66 Q92 98 50 114 Q8 98 8 66 Z',
  ];
  MV.shield = function (s, size, o) {
    o = o || {};
    s = s || { shape: 0, pattern: 0, c1: '#64748b', c2: '#fff', symbol: '🛡️' };
    const id = 'sh' + (++sid);
    const d = PATHS[(s.shape | 0) % PATHS.length];
    const c1 = MV.esc(s.c1); const c2 = MV.esc(s.c2);
    let pat = '';
    switch ((s.pattern | 0) % 6) {
      case 1: pat = `<rect x="50" y="0" width="50" height="120" fill="${c2}" opacity=".88"/>`; break;
      case 2: pat = `<rect x="0" y="44" width="100" height="28" fill="${c2}" opacity=".88"/>`; break;
      case 3: pat = `<g transform="rotate(-35 50 60)" fill="${c2}" opacity=".85"><rect x="-30" y="14" width="160" height="14"/><rect x="-30" y="52" width="160" height="14"/><rect x="-30" y="90" width="160" height="14"/></g>`; break;
      case 4: pat = `<path d="M0 36 L50 78 L100 36 L100 58 L50 100 L0 58 Z" fill="${c2}" opacity=".88"/>`; break;
      case 5: pat = `<rect x="42" y="0" width="16" height="120" fill="${c2}" opacity=".88"/><rect x="0" y="46" width="100" height="16" fill="${c2}" opacity=".88"/>`; break;
      default: break;
    }
    const sym = MV.esc(s.symbol || '🛡️');
    const xy = o.x != null ? ` x="${o.x}" y="${o.y}"` : '';
    return `<svg class="shield-svg ${o.cls || ''}"${xy} width="${size}" height="${Math.round(size * 1.2)}" viewBox="0 0 100 120" role="img" aria-label="Escudo">
      <defs><clipPath id="${id}c"><path d="${d}"/></clipPath>
      <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient></defs>
      <path d="${d}" fill="#000" opacity=".35" transform="translate(2 4)"/>
      <g clip-path="url(#${id}c)"><rect width="100" height="120" fill="${c1}"/>${pat}<rect width="100" height="120" fill="url(#${id}g)"/></g>
      <path d="${d}" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="50" cy="58" r="26" fill="#000" opacity=".38"/><circle cx="50" cy="58" r="26" fill="none" stroke="${c2}" stroke-width="2.5" opacity=".9"/>
      <text x="50" y="71" font-size="34" text-anchor="middle" font-family="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif">${sym}</text></svg>`;
  };

  // ---- Tema visual (colores + emojis flotantes) --------------------------------
  MV.applyTheme = function (meta) {
    if (!meta) return;
    const r = document.documentElement.style;
    r.setProperty('--a', meta.a || '#7c5cff');
    r.setProperty('--b', meta.b || '#22d3ee');
    let fx = document.getElementById('bgfx');
    if (!fx) { fx = document.createElement('div'); fx.id = 'bgfx'; document.body.prepend(fx); }
    const key = (meta.bg || []).join('');
    if (fx.dataset.k === key) return;
    fx.dataset.k = key;
    fx.innerHTML = '';
    const list = meta.bg && meta.bg.length ? meta.bg : ['✨'];
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span');
      s.textContent = list[i % list.length];
      s.style.left = (Math.random() * 96) + '%';
      s.style.animationDuration = (16 + Math.random() * 22) + 's';
      s.style.animationDelay = (-Math.random() * 30) + 's';
      s.style.fontSize = (24 + Math.random() * 40) + 'px';
      fx.appendChild(s);
    }
  };

  // ---- Sonidos (WebAudio, sin archivos) -----------------------------------------
  const sfx = (MV.sfx = {
    on: MV.store.get('mv_sound') !== false,
    ctx: null,
    unlock() {
      try {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === 'suspended') this.ctx.resume();
      } catch (e) { /* noop */ }
    },
    tone(f, d, type, vol, delay) {
      if (!this.on || !this.ctx) return;
      try {
        const t0 = this.ctx.currentTime + (delay || 0);
        const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
        o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
        o.connect(g); g.connect(this.ctx.destination);
        o.start(t0); o.stop(t0 + d + 0.05);
      } catch (e) { /* noop */ }
    },
    play(n) {
      if (!this.on) return;
      this.unlock();
      const T = (f, d, ty, v, dl) => this.tone(f, d, ty, v, dl);
      switch (n) {
        case 'tick': T(900, 0.05, 'square', 0.05); break;
        case 'warn': T(1200, 0.09, 'square', 0.09); break;
        case 'go': T(440, 0.12, 'triangle', 0.18); T(660, 0.12, 'triangle', 0.18, 0.12); T(880, 0.25, 'triangle', 0.2, 0.24); break;
        case 'count': T(520, 0.16, 'triangle', 0.2); break;
        case 'lock': T(300, 0.08, 'square', 0.1); T(600, 0.12, 'square', 0.1, 0.07); break;
        case 'correct': [523, 659, 784, 1047].forEach((f, i) => T(f, 0.2, 'triangle', 0.18, i * 0.09)); break;
        case 'wrong': T(220, 0.25, 'sawtooth', 0.12); T(165, 0.35, 'sawtooth', 0.12, 0.2); break;
        case 'spin': for (let i = 0; i < 22; i++) T(500 + (i % 4) * 90, 0.04, 'square', 0.05, i * (0.07 + i * 0.006)); break;
        case 'power': T(700, 0.1, 'sine', 0.15); T(1000, 0.18, 'sine', 0.15, 0.1); break;
        case 'steal': T(500, 0.1, 'sawtooth', 0.1); T(300, 0.2, 'sawtooth', 0.1, 0.1); break;
        case 'msg': T(780, 0.06, 'sine', 0.07); break;
        case 'win': [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => T(f, 0.28, 'triangle', 0.2, i * 0.14)); break;
        default: break;
      }
    },
    toggle() { this.on = !this.on; MV.store.set('mv_sound', this.on); if (this.on) { this.unlock(); this.play('power'); } return this.on; },
  });
  window.addEventListener('pointerdown', () => sfx.unlock(), { once: true });

  // ---- Avisos ------------------------------------------------------------------
  MV.toast = function (text, kind) {
    let box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
    const t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.textContent = text;
    box.appendChild(t);
    while (box.children.length > 4) box.removeChild(box.firstChild);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; setTimeout(() => t.remove(), 450); }, 3800);
  };

  // ---- Confeti -----------------------------------------------------------------
  MV.confetti = function (ms, power) {
    let cv = document.getElementById('fx');
    if (!cv) { cv = document.createElement('canvas'); cv.id = 'fx'; document.body.appendChild(cv); }
    const ctx = cv.getContext('2d');
    const W = (cv.width = window.innerWidth); const H = (cv.height = window.innerHeight);
    const cols = ['#fcd34d', '#f472b6', '#60a5fa', '#34d399', '#f97316', '#a78bfa', '#fff'];
    const n = power || 140;
    const ps = Array.from({ length: n }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.5, y: H * 0.35, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4,
      s: 5 + Math.random() * 7, c: cols[(Math.random() * cols.length) | 0], r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
    }));
    const t0 = performance.now();
    (function frame(t) {
      const dt = t - t0;
      ctx.clearRect(0, 0, W, H);
      ps.forEach((p) => {
        p.vy += 0.32; p.x += p.vx; p.y += p.vy; p.vx *= 0.995; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
      });
      if (dt < (ms || 3500)) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
    })(t0);
  };

  // ---- Ruleta (SVG) ------------------------------------------------------------
  MV.wheelSVG = function (segments) {
    const n = segments.length; const R = 190; const C = 200;
    const step = 360 / n;
    let out = `<svg class="wheel" viewBox="0 0 400 400"><circle cx="${C}" cy="${C}" r="196" fill="#0b1020" stroke="#fcd34d" stroke-width="6"/>`;
    segments.forEach((sg, i) => {
      const a0 = (i * step - 90) * Math.PI / 180; const a1 = ((i + 1) * step - 90) * Math.PI / 180;
      const x0 = C + R * Math.cos(a0); const y0 = C + R * Math.sin(a0);
      const x1 = C + R * Math.cos(a1); const y1 = C + R * Math.sin(a1);
      out += `<path d="M${C} ${C} L${x0.toFixed(1)} ${y0.toFixed(1)} A${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${sg.color}" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>`;
      const mid = i * step + step / 2;
      const L = sg.label.length;
      const fs = L <= 8 ? 15 : L <= 11 ? 12.5 : 10.5;
      const st = 'font-weight="900" fill="#fff" stroke="#0008" stroke-width="3" paint-order="stroke" text-anchor="middle"';
      out += `<g transform="rotate(${mid} ${C} ${C})"><text x="${C}" y="${C - 160}" text-anchor="middle" font-size="22">${sg.emoji}</text>`
        + `<g transform="translate(${C} ${C - 104}) rotate(-90)"><text x="0" y="${sg.sub ? -2 : 5}" font-size="${fs}" ${st}>${MV.esc(sg.label)}</text>`
        + (sg.sub ? `<text x="0" y="12" font-size="${sg.sub.length > 8 ? 9 : 10.5}" ${st}>${MV.esc(sg.sub)}</text>` : '') + '</g></g>';
    });
    out += `<circle cx="${C}" cy="${C}" r="34" fill="#111936" stroke="#fcd34d" stroke-width="5"/><text x="${C}" y="${C + 10}" text-anchor="middle" font-size="30">🌌</text></svg>`;
    return out;
  };
  // Ángulo final para dejar el segmento idx bajo el puntero (arriba)
  MV.wheelAngle = function (idx, n, turns) {
    const step = 360 / n;
    const jitter = (Math.random() - 0.5) * step * 0.6;
    return (turns || 6) * 360 - (idx * step + step / 2) + jitter;
  };

  // ---- Marcador animado (FLIP) ------------------------------------------------
  MV.leaderboard = function (box, teams, o) {
    o = o || {};
    const rowH = o.big ? 74 : 64; const gap = 8;
    box.classList.add('lb');
    box._rows = box._rows || {};
    const sorted = teams.slice().sort((a, b) => b.score - a.score || b.progress - a.progress || a.name.localeCompare(b.name));
    const byPrev = teams.slice().sort((a, b) => (a.prevRank - b.prevRank) || a.name.localeCompare(b.name));
    const replay = !!o.animate && box._key !== o.key;
    box._key = o.key;
    box.style.height = (teams.length * (rowH + gap)) + 'px';
    const y = (i) => `translateY(${i * (rowH + gap)}px)`;
    const pl = Math.max(1, o.planLen || 1);
    teams.forEach((t) => {
      let row = box._rows[t.id];
      if (!row) {
        row = document.createElement('div');
        row.className = 'lb-row' + (o.big ? ' big' : '');
        row.innerHTML = '<div class="pos"></div><div class="sh"></div><div class="nm"><span class="n"></span><small class="s"></small><div class="bar"><i></i></div></div><div class="sc"><span class="num">0</span><small class="dl"></small></div>';
        row.style.height = rowH + 'px';
        row.style.transition = 'none';
        box.appendChild(row);
        box._rows[t.id] = row;
      }
      row.classList.toggle('mine', t.id === o.myId);
      const shKey = JSON.stringify(t.shield) + (o.big ? 'b' : 's');
      if (row._sh !== shKey) { row._sh = shKey; row.querySelector('.sh').innerHTML = MV.shield(t.shield, o.big ? 52 : 40); }
      row.querySelector('.n').textContent = t.name;
      const pw = ['shield', 'double', 'hint', 'time', 'steal'].filter((k) => t.powers && t.powers[k] > 0).map((k) => (MV.hello ? MV.hello.powers[k].emoji : '') + (t.powers[k] > 1 ? '×' + t.powers[k] : '')).join(' ');
      row.querySelector('.s').textContent = `${t.online}/${t.size} en línea` + (pw ? '  ·  ' + pw : '');
      row.querySelector('.bar i').style.width = Math.min(100, (t.progress / pl) * 100) + '%';
      row.style.height = rowH + 'px';
    });
    const anyPrev = teams.some((t) => t.prevScore > 0);
    const showFinal = () => {
      sorted.forEach((t, i) => {
        const row = box._rows[t.id];
        row.style.transition = '';
        row.style.transform = y(i);
        row.querySelector('.pos').textContent = (t.score > 0 && ['🥇', '🥈', '🥉'][t.rank - 1]) || t.rank + '°';
        const diff = t.score - t.prevScore;
        const mv = t.prevRank - t.rank;
        const dl = row.querySelector('.dl');
        const showD = o.delta && (diff !== 0 || (anyPrev && mv !== 0));
        dl.innerHTML = showD ? `<span class="${diff >= 0 ? 'up' : 'dn'}">${diff > 0 ? '+' : ''}${diff !== 0 ? diff : ''}</span> ${anyPrev && mv > 0 ? `<span class="up">▲${mv}</span>` : anyPrev && mv < 0 ? `<span class="dn">▼${-mv}</span>` : ''}` : '';
      });
    };
    if (replay) {
      byPrev.forEach((t, i) => {
        const row = box._rows[t.id];
        row.style.transition = 'none';
        row.style.transform = y(i);
        row.querySelector('.pos').textContent = (t.prevScore > 0 && ['🥇', '🥈', '🥉'][t.prevRank - 1]) || t.prevRank + '°';
        row.querySelector('.num').textContent = t.prevScore;
        row.querySelector('.dl').innerHTML = '';
      });
      void box.offsetHeight;
      clearTimeout(box._t1);
      box._busyUntil = Date.now() + (o.delay != null ? o.delay : 500) + 1900;
      box._t1 = setTimeout(() => {
        // cuenta ascendente de puntos y luego reordenamiento
        const t0 = performance.now(); const dur = 1000;
        (function step(now) {
          const k = Math.min(1, (now - t0) / dur);
          teams.forEach((t) => { box._rows[t.id].querySelector('.num').textContent = Math.round(t.prevScore + (t.score - t.prevScore) * k); });
          if (k < 1 && box._key === o.key) requestAnimationFrame(step);
        })(t0);
        setTimeout(() => { if (box._key === o.key) showFinal(); }, 700);
      }, o.delay != null ? o.delay : 500);
    } else {
      if (Date.now() < (box._busyUntil || 0)) return;
      teams.forEach((t) => { box._rows[t.id].querySelector('.num').textContent = t.score; });
      showFinal();
    }
  };

  // ---- Mapa de aventura ---------------------------------------------------------
  MV.mapHTML = function (plan, teams, myId, meta) {
    const n = plan.length;
    if (!n) return '<div class="empty">El mapa aparecerá cuando comience la aventura.</div>';
    const perRow = n <= 6 ? n : Math.ceil(n / Math.ceil(n / 6));
    const rows = Math.ceil(n / perRow);
    const W = 1000; const rowH = 170; const top = 80; const H = top + rows * rowH;
    const pts = plan.map((s, i) => {
      const r = Math.floor(i / perRow); let c = i % perRow;
      if (r % 2 === 1) c = perRow - 1 - c;
      const x = 150 + c * ((W - 300) / Math.max(1, perRow - 1));
      return { x: perRow === 1 ? W / 2 : x, y: top + r * rowH + 40 };
    });
    const start = { x: Math.max(60, pts[0].x - 90), y: pts[0].y };
    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Mapa de aventura"><defs><filter id="glw"><feGaussianBlur stdDeviation="4"/></filter></defs>`;
    // camino
    let d = `M${start.x} ${start.y}`;
    pts.forEach((p, i) => { const prev = i === 0 ? start : pts[i - 1]; if (Math.abs(prev.y - p.y) > 5) { d += ` Q${prev.x > W / 2 ? W - 40 : 40} ${(prev.y + p.y) / 2} ${p.x} ${p.y}`; } else d += ` L${p.x} ${p.y}`; });
    svg += `<path d="${d}" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="16" stroke-linecap="round"/><path d="${d}" fill="none" stroke="var(--b)" stroke-opacity=".8" stroke-width="4" stroke-dasharray="3 12" stroke-linecap="round"/>`;
    svg += `<text x="${start.x}" y="${start.y + 5}" text-anchor="middle" font-size="26">🚩</text><text x="${start.x}" y="${start.y + 34}" class="node-label">SALIDA</text>`;
    plan.forEach((s, i) => {
      const p = pts[i];
      const cls = s.status === 'done' ? '#16a34a' : s.status === 'current' ? '#f59e0b' : '#334155';
      const last = i === n - 1;
      svg += `<g>${s.status === 'current' ? `<circle cx="${p.x}" cy="${p.y}" r="38" fill="#f59e0b" opacity=".55" filter="url(#glw)"/>` : ''}`
        + `<circle cx="${p.x}" cy="${p.y}" r="${last ? 34 : 28}" fill="${cls}" stroke="#fff" stroke-width="3"/>`
        + `<text x="${p.x}" y="${p.y + 9}" text-anchor="middle" font-size="${last ? 32 : 26}">${s.icon}</text>`
        + `<text x="${p.x}" y="${p.y + (last ? 56 : 50)}" class="node-label">${i + 1}. ${MV.esc(s.label)}</text></g>`;
    });
    // fichas de equipos
    const slots = {};
    teams.forEach((t) => {
      const k = Math.min(n, t.progress);
      (slots[k] = slots[k] || []).push(t);
    });
    Object.keys(slots).forEach((k) => {
      const list = slots[k]; const idx = +k;
      const base = idx === 0 ? start : pts[idx - 1];
      list.forEach((t, j) => {
        const per = 4; const row = Math.floor(j / per); const col = j % per; const inRow = Math.min(per, list.length - row * per);
        const sz = 30;
        const x = Math.max(4, Math.min(W - sz - 4, base.x - ((inRow - 1) * (sz + 2)) / 2 + col * (sz + 2) - sz / 2));
        const y = base.y - 58 - row * 40;
        svg += `<g class="tok${t.id === myId ? ' mine' : ''}">${t.id === myId ? `<circle cx="${x + sz / 2}" cy="${y + sz * 0.6}" r="${sz * 0.85}" fill="#fcd34d" opacity=".4" filter="url(#glw)"/>` : ''}${MV.shield(t.shield, sz, { x, y })}</g>`;
      });
    });
    svg += '</svg>';
    return `<div class="mapwrap">${svg}</div><div class="row" style="margin-top:10px;gap:8px">${teams.map((t) => `<span class="chip" style="border-color:${MV.esc(t.color)}">${MV.shield(t.shield, 16)} ${MV.esc(t.name)} · ${t.progress}/${n}</span>`).join('')}</div>`;
  };

  // ---- Pantalla final -----------------------------------------------------------
  MV.finalHTML = function (v, myId) {
    const byId = {}; v.teams.forEach((t) => { byId[t.id] = t; });
    const rank = (v.final && v.final.ranking ? v.final.ranking : v.teams.slice().sort((a, b) => b.score - a.score).map((t) => t.id)).map((id) => byId[id]).filter(Boolean);
    const b = (MV.hello && MV.hello.badges) || {};
    const rounds = (v.final && v.final.rounds) || v.plan.filter((p) => p.status === 'done').length;
    const pod = (t, cls, medal) => (t ? `<div class="pod ${cls}">${cls === 'p1' ? '<div class="crown">👑</div>' : ''}${MV.shield(t.shield, cls === 'p1' ? 110 : 80)}<div class="pn">${MV.esc(t.name)}</div><div class="ps">${t.score} pts</div><div class="blk">${medal}</div></div>` : '');
    const win = rank[0];
    let h = '<div class="final"><div class="logo" style="font-size:1rem">MULTIVERSE CHALLENGE</div><h1>🏆 Aventura completada</h1>';
    h += `<div class="podium">${pod(rank[1], 'p2', '2')}${pod(rank[0], 'p1', '1')}${pod(rank[2], 'p3', '3')}</div>`;
    if (win) {
      const wb = (win.badges || []).map((k) => (b[k] ? `<span class="badge" title="${MV.esc(b[k].desc)}">${b[k].emoji} ${MV.esc(b[k].name)}</span>` : '')).join('');
      h += `<div class="ceremony"><div style="font-size:3rem">🏆</div><h2>Campeones del Multiverse Challenge</h2><div style="display:flex;justify-content:center;margin:10px 0">${MV.shield(win.shield, 120)}</div>`
        + `<div class="title-font" style="font-size:1.8rem">${MV.esc(win.name)}</div><div class="muted">${win.score} puntos · ${win.members.map((m) => MV.esc(m.name)).join(', ')}</div><div class="badges">${wb}</div></div>`;
    }
    h += '<div class="card" style="text-align:left;overflow-x:auto"><table class="tbl"><thead><tr><th>#</th><th>Equipo</th><th>Puntos</th><th>Retos superados</th><th>Mejor racha</th><th>Insignias</th></tr></thead><tbody>';
    rank.forEach((t, i) => {
      const st = t.stats || {};
      h += `<tr style="${t.id === myId ? 'background:rgba(252,211,77,.12)' : ''}"><td>${['🥇', '🥈', '🥉'][i] || i + 1}</td><td><span style="display:inline-flex;align-items:center;gap:8px">${MV.shield(t.shield, 26)}<b>${MV.esc(t.name)}</b></span></td><td><b>${t.score}</b></td><td>${t.progress}/${rounds || t.progress}</td><td>${st.bestStreak || 0}</td><td>${(t.badges || []).map((k) => (b[k] ? `<span title="${MV.esc(b[k].name)}: ${MV.esc(b[k].desc)}">${b[k].emoji}</span>` : '')).join(' ') || '—'}</td></tr>`;
    });
    h += '</tbody></table></div></div>';
    return h;
  };

  MV.kindClass = (r) => (r.semi ? 'semi' : r.kind === 'boss' ? 'boss' : '');
  MV.badgeList = (t) => (t.badges || []).map((k) => { const x = MV.hello && MV.hello.badges[k]; return x ? `<span class="badge" title="${MV.esc(x.desc)}">${x.emoji} ${MV.esc(x.name)}</span>` : ''; }).join('');

  // Texto de una opción (las de estrategia son objetos {label, desc})
  MV.optText = (o) => (o && typeof o === 'object' ? o.label : o);

  // Chat: pinta un mensaje
  MV.chatNode = function (m, myPid) {
    const d = document.createElement('div');
    d.className = 'msg' + (m.sys ? ' sys' : '') + (m.pid && m.pid === myPid ? ' me' : '');
    if (m.sys) d.textContent = m.text;
    else { const b = document.createElement('b'); b.textContent = m.name; d.appendChild(b); d.appendChild(document.createTextNode(m.text)); }
    return d;
  };
})();
