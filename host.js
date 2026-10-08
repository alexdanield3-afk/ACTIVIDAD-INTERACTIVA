/* MULTIVERSE CHALLENGE — panel del organizador */
(function () {
  'use strict';
  const { $, $$, esc } = MV;
  const LET = 'ABCD';
  const params = new URLSearchParams(location.search);
  let conn = null;
  let info = { themes: [], lan: [], ai: false };
  let v = null;
  let chats = {};
  let game = MV.store.get('mv_host');
  let tab = 'marcador';
  let showAns = false;
  let proj = params.get('proj') === '1';
  let setup = { themeId: 'vikingos', len: 'normal', n: 20, demo: 0 };
  let custom = { topic: '', mode: 'general', json: '' };
  let modalTheme = null;
  let busy = null;
  let lastKey = '';
  let ovNum = null;
  let tickSec = -1;
  let extraKey = '';
  const chatBoxes = {};

  const CAOS = { id: 'caos', name: 'MODO CAOS', emoji: '🌀', desc: 'Cada reto viene de un universo distinto. ¡Nunca dos partidas iguales!', a: '#e879f9', b: '#22d3ee', bg: ['🌀', '🎲', '✨', '🔮'] };
  const CUSTOM = { id: 'custom', name: 'CREAR TEMA', emoji: '✨', desc: 'Escribe cualquier tema (tu materia, tu equipo, tu serie…) y el juego se adapta.', a: '#14b8a6', b: '#f59e0b', bg: ['✨', '💡', '🧩', '🎨'] };

  function setHTML(el, html) {
    if (el._h === html) return false;
    const af = document.activeElement;
    if (af && el.contains(af) && /^(INPUT|TEXTAREA|SELECT)$/.test(af.tagName)) return false; // no pisar lo que el organizador escribe
    el._h = html;
    el.innerHTML = html;
    return true;
  }
  const teamById = (id) => (v ? v.teams.find((t) => t.id === id) : null);
  const stageOf = () => (v && v.round ? v.round : null);

  // ================================================================ Conexión
  conn = MV.connect({
    open() {
      $('#conn').classList.add('hidden');
      if (game && game.code) conn.send({ t: 'host:reconnect', code: game.code, hostKey: game.hostKey });
      else showSetup();
    },
    close() { $('#conn').classList.remove('hidden'); },
    msg: onMsg,
  });

  function onMsg(m) {
    switch (m.t) {
      case 'host:created':
        game = { code: m.code, hostKey: m.hostKey };
        MV.store.set('mv_host', game);
        chats = {};
        break;
      case 'host:gone':
        game = null; MV.store.del('mv_host'); v = null; showSetup('La partida anterior ya no existe en el servidor.');
        break;
      case 'chatHistory': if (m.all) { chats = m.chats || {}; Object.keys(chatBoxes).forEach((k) => delete chatBoxes[k]); if (tab === 'chats') renderSide(); } break;
      case 'chat': {
        const msg = m.msg;
        (chats[msg.tid] = chats[msg.tid] || []).push(msg);
        const box = chatBoxes[msg.tid];
        if (box && tab === 'chats') { const near = box.scrollHeight - box.scrollTop - box.clientHeight < 60; box.appendChild(MV.chatNode(msg, null)); if (near) box.scrollTop = box.scrollHeight; }
        break;
      }
      case 'toast': MV.toast(m.text, m.kind === 'warn' ? 'warn' : ''); break;
      case 'err': MV.toast(m.msg, 'bad'); showSetupErr(m.msg); break;
      case 'themeBusy':
        busy = m.on ? m.topic : null;
        if (!m.on) MV.toast(m.ok ? `✨ Tema «${m.topic}» listo` : `No se pudo generar el tema: ${m.error || ''}. Usa «JSON» o «Rápido».`, m.ok ? 'good' : 'bad');
        if (v) renderAll();
        break;
      case 'snap':
        v = m.v;
        renderAll();
        break;
      default: break;
    }
  }

  // ================================================================ Preparación
  function showSetup(msg) {
    $('#hMain').classList.add('hidden');
    $('#hBar').classList.add('hidden');
    $('#hSetup').classList.remove('hidden');
    document.body.classList.remove('proj');
    if (msg) showSetupErr(msg);
  }
  function showSetupErr(msg) {
    const e = $('#setupErr');
    if (!$('#hSetup').classList.contains('hidden') && msg) { e.textContent = msg; e.classList.remove('hidden'); }
  }

  function themeCards(sel) {
    const all = info.themes.concat([CAOS, CUSTOM]);
    return all.map((t) => `<button class="thcard ${sel === t.id ? 'sel' : ''}" data-theme="${esc(t.id)}" data-bg="${esc((t.bg || []).join(' '))}" style="--ca:${esc(t.a)};--cb:${esc(t.b)}"><span class="em">${esc(t.emoji)}</span><b>${esc(t.name)}</b><small>${esc(t.desc)}</small></button>`).join('');
  }

  function customPanel() {
    const modes = [['ai', '🤖 IA de Claude', info.ai], ['json', '📋 Pegar JSON', true], ['general', '⚡ Rápido (general)', true]].filter((x) => x[2]);
    if (!modes.some((x) => x[0] === custom.mode)) custom.mode = 'general';
    return `<div class="card" style="background:rgba(0,0,0,.25)"><h3>✨ Crear tema</h3>
      <label class="lbl">¿De qué trata tu tema?</label>
      <input type="text" id="cTopic" maxlength="60" placeholder="Ej: Contabilidad, Cine de terror, Piratas del Caribe…" value="${esc(custom.topic)}">
      <label class="lbl">¿Cómo generamos las preguntas?</label>
      <div class="seg" id="cMode">${modes.map((m) => `<button data-m="${m[0]}" class="${custom.mode === m[0] ? 'on' : ''}">${m[1]}</button>`).join('')}</div>
      <div class="muted" style="font-size:.85rem;margin-top:8px">${custom.mode === 'ai' ? 'Claude escribe preguntas, equipos y retos del tema (tarda ~20-40 s).' : custom.mode === 'json' ? 'Copia las instrucciones, pégalas en cualquier IA (Claude, ChatGPT…) y pega aquí el JSON que te devuelva.' : 'Usa preguntas de cultura general con el nombre de tu tema en los equipos y mensajes. Funciona sin internet.'}</div>
      ${custom.mode === 'json' ? `<div class="row" style="margin-top:8px"><button class="btn ghost sm" data-h="copyPrompt">📋 Copiar instrucciones para la IA</button></div><textarea id="cJson" rows="6" placeholder='Pega aquí el JSON…' style="margin-top:8px">${esc(custom.json)}</textarea>` : ''}
    </div>`;
  }

  function renderSetupThemes() {
    $('#themeGrid').innerHTML = themeCards(setup.themeId);
    const cb = $('#customBox');
    cb.classList.toggle('hidden', setup.themeId !== 'custom');
    if (setup.themeId === 'custom') cb.innerHTML = customPanel();
  }

  async function updateReco() {
    const n = Math.max(2, Math.min(40, parseInt($('#gN').value, 10) || 20));
    setup.n = n;
    try {
      const r = await (await fetch('/api/recommend?n=' + n)).json();
      const g = {}; r.sizes.forEach((s) => { g[s] = (g[s] || 0) + 1; });
      const parts = Object.keys(g).sort((a, b) => b - a).map((s) => `${g[s]} de ${s}`);
      const uniform = Object.keys(g).length === 1;
      $('#recoBox').innerHTML = `👥 <b>${n}</b> participantes → <b>${r.k} equipos</b> ${uniform ? `de ${r.sizes[0]}` : `(${parts.join(' y ')})`}`;
    } catch (e) { $('#recoBox').textContent = ''; }
    $$('#nQuick button').forEach((b) => b.classList.toggle('on', +b.dataset.n === n));
  }

  function buildCfg(demo) {
    const cfg = {
      name: $('#gName').value.trim() || 'Multiverse Challenge',
      expected: setup.n,
      teams: $('#gTeams').value ? +$('#gTeams').value : null,
      length: setup.len,
      auto: $('#gAuto').checked,
      spy: $('#gSpy').checked,
    };
    if (demo) { cfg.demo = demo; cfg.fast = $('#demoFast').checked; cfg.auto = true; }
    if (setup.themeId === 'caos') { cfg.themeId = 'ia'; cfg.chaos = true; } else if (setup.themeId === 'custom') {
      cfg.themeId = 'custom'; cfg.customTopic = custom.topic.trim(); cfg.customMode = custom.mode;
      if (custom.mode === 'json') cfg.customJson = custom.json;
    } else cfg.themeId = setup.themeId;
    return cfg;
  }

  function create(demo) {
    if (setup.themeId === 'custom') {
      if (!custom.topic.trim()) { showSetupErr('Escribe de qué trata tu tema personalizado.'); return; }
      if (custom.mode === 'json' && !custom.json.trim()) { showSetupErr('Pega el JSON del tema o elige otro modo.'); return; }
    }
    $('#setupErr').classList.add('hidden');
    MV.sfx.unlock();
    conn.send({ t: 'host:create', cfg: buildCfg(demo) });
  }

  fetch('/api/info').then((r) => r.json()).then((i) => { info = i; custom.mode = i.ai ? 'ai' : 'general'; renderSetupThemes(); updateReco(); }).catch(() => {});
  $('#createBtn').addEventListener('click', () => create(0));
  $('#demoGo').addEventListener('click', () => { if (!setup.demo) setup.demo = 20; create(setup.demo); });
  $('#nQuick').addEventListener('click', (e) => { const b = e.target.closest('button[data-n]'); if (b) { $('#gN').value = b.dataset.n; updateReco(); } });
  $('#gN').addEventListener('input', updateReco);
  $('#gLen').addEventListener('click', (e) => { const b = e.target.closest('button[data-l]'); if (!b) return; setup.len = b.dataset.l; $$('#gLen button').forEach((x) => x.classList.toggle('on', x === b)); });
  $('#demoQuick').addEventListener('click', (e) => { const b = e.target.closest('button[data-d]'); if (!b) return; setup.demo = +b.dataset.d; $$('#demoQuick button').forEach((x) => x.classList.toggle('on', x === b)); });
  $$('#demoQuick button')[2].classList.add('on'); setup.demo = 20;
  $('#themeGrid').addEventListener('click', (e) => { const b = e.target.closest('[data-theme]'); if (!b) return; setup.themeId = b.dataset.theme; const t = info.themes.concat([CAOS, CUSTOM]).find((x) => x.id === setup.themeId); if (t) MV.applyTheme(t); renderSetupThemes(); });

  // Panel de tema personalizado (en el asistente o en el modal)
  document.addEventListener('input', (e) => {
    if (e.target.id === 'cTopic') custom.topic = e.target.value;
    if (e.target.id === 'cJson') custom.json = e.target.value;
  });
  document.addEventListener('click', async (e) => {
    const mb = e.target.closest('#cMode button');
    if (mb) { custom.mode = mb.dataset.m; if (modalTheme) renderModal(); else renderSetupThemes(); return; }
    const hb = e.target.closest('[data-h="copyPrompt"]');
    if (hb) {
      try {
        const r = await (await fetch('/api/prompt?topic=' + encodeURIComponent(custom.topic || 'mi tema'))).json();
        await navigator.clipboard.writeText(r.prompt);
        MV.toast('Instrucciones copiadas. Pégalas en tu IA favorita.', 'good');
      } catch (err) { MV.toast('No se pudo copiar automáticamente.', 'warn'); }
    }
  });

  // ================================================================ Render general
  function joinBase() {
    const local = /^(localhost|127\.|\[::1\])/.test(location.hostname);
    return info.publicUrl || (local && info.lan && info.lan.length ? info.lan[0] : location.origin);
  }

  function renderAll() {
    if (!v) return;
    $('#hSetup').classList.add('hidden');
    $('#hMain').classList.remove('hidden');
    $('#hBar').classList.remove('hidden');
    document.body.classList.toggle('proj', proj);
    const r = stageOf();
    MV.applyTheme(r && r.theme && ['intro', 'active', 'reveal', 'scoreboard'].includes(v.phase) ? r.theme : v.theme);
    const key = v.phase + ':' + (r ? r.id : '');
    if (key !== lastKey) {
      const first = lastKey === '';
      lastKey = key;
      if (v.phase === 'reveal') showAns = true;
      if (v.phase === 'intro') showAns = false;
      if (!first) {
        if (v.phase === 'active') MV.sfx.play('go');
        if (v.phase === 'reveal') MV.sfx.play('correct');
        if (v.phase === 'finished') { MV.sfx.play('win'); MV.confetti(6000, 240); }
      }
    }
    renderBar();
    if (v.phase === 'lobby') renderLobby();
    else if (v.phase === 'finished') renderFinished();
    else renderConsole();
    tickUI();
  }

  function renderBar() {
    const th = v.theme;
    const html = `<div class="logo" style="font-size:1.1rem;white-space:nowrap">MULTIVERSE</div>
      <b>${esc(v.name)}</b><span class="chip">Código <b>${esc(v.code)}</b></span><span class="chip">${esc(th.emoji)} ${esc(th.name)}</span>
      <span class="chip ${v.playersOnline ? 'ok' : 'warn'}">🟢 ${v.playersOnline}/${v.playersTotal} conectados</span>
      ${v.cfg.demo ? '<span class="chip warn">🧪 DEMO</span>' : ''}${v.paused ? '<span class="chip bad">⏸ EN PAUSA</span>' : ''}${busy ? `<span class="chip warn"><span class="spinner"></span> Generando «${esc(busy)}»…</span>` : ''}
      <span class="sp"></span>
      <button class="btn ghost sm" data-h="proj">📺 ${proj ? 'Volver al panel' : 'Pantalla grande'}</button>
      <button class="btn ghost sm ctrl-only" data-h="openProj">🪟 Abrir proyector</button>
      <button class="iconbtn" data-h="sound">${MV.sfx.on ? '🔊' : '🔇'}</button>
      <button class="btn ghost sm ctrl-only" data-h="exit">🚪 Salir</button>`;
    setHTML($('#hBar'), html);
  }

  // ================================================================ Sala de espera
  function renderLobby() {
    const main = $('#hMain');
    if (!main._lobby) { main._lobby = true; main._con = false; main._fin = false; main.innerHTML = '<div class="console"><div><div class="card glow" id="lbJoin"></div></div><div><div class="card" id="lbTeams"></div></div></div>'; }
    const url = joinBase() + '/?c=' + v.code;
    const lans = (info.lan || []).filter((u) => u !== joinBase());
    setHTML($('#lbJoin'), `<div class="center"><div class="muted title-font">Únete en tu celular</div>
      <div class="code-big title-font" style="color:var(--gold)">${esc(v.code)}</div>
      <div class="row" style="justify-content:center;gap:18px"><div class="qr"><img alt="QR" src="/qr?text=${encodeURIComponent(url)}"></div>
      <div style="text-align:left;max-width:300px"><div class="muted">Entra a:</div><div class="url">${esc(joinBase())}</div><div class="muted" style="margin-top:6px">e ingresa el código <b>${esc(v.code)}</b> o escanea el QR.</div>${lans.length ? `<div class="muted" style="font-size:.8rem;margin-top:6px">Otras direcciones: ${lans.map(esc).join(' · ')}</div>` : ''}</div></div>
      <h2 style="margin-top:16px"><span class="chip ok" style="font-size:1.1rem">👥 ${v.playersOnline} conectados</span> <span class="chip">${v.teams.length} equipos</span></h2>
      <button class="btn xl pulse ctrl-only" data-h="start" style="margin-top:6px" ${v.playersTotal ? '' : 'disabled'}>⚔️ INICIAR AVENTURA</button>
      ${v.playersTotal ? '' : '<div class="muted" style="margin-top:8px">Esperando al primer participante…</div>'}
      <div class="row ctrl-only" style="justify-content:center;margin-top:12px"><button class="btn ghost sm" data-h="themeModal">🌌 Cambiar universo</button>
      <div class="seg" id="lenSeg">${['corta', 'normal', 'larga'].map((l) => `<button data-len="${l}" class="${v.cfg.length === l ? 'on' : ''}">${l}</button>`).join('')}</div></div>
      <div class="row ctrl-only" style="justify-content:center;margin-top:10px"><label class="row" style="gap:6px"><input type="checkbox" data-cfg="auto" ${v.cfg.auto ? 'checked' : ''}> Avance automático</label><label class="row" style="gap:6px"><input type="checkbox" data-cfg="spy" ${v.cfg.spy ? 'checked' : ''}> Observar chats</label></div></div>`);

    const th = v.theme;
    const rows = v.teams.map((t) => `<div class="teamrow"><div>${MV.shield(t.shield, 46)}</div>
      <div class="info"><input type="text" value="${esc(t.name)}" maxlength="28" data-ren="${t.id}" class="ctrl-only-in"><div class="muted" style="font-size:.8rem;margin-top:3px">${t.size} jugador${t.size === 1 ? '' : 'es'} · ${t.online} en línea</div></div>
      <button class="btn ghost sm ctrl-only" data-h="regen" data-t="${t.id}" title="Nuevo escudo">🔄 Escudo</button>
      <div style="flex-basis:100%" class="members">${t.members.map((m) => `<span class="member ${m.online ? '' : 'off'}">${m.bot ? '🤖' : m.online ? '🟢' : '⚪'} ${esc(m.name)}${m.bot ? '' : ` <a href="#" data-h="kick" data-p="${m.id}" class="ctrl-only" style="color:#fca5a5;text-decoration:none" title="Sacar">✖</a>`}</span>`).join('') || '<span class="muted">Sin jugadores</span>'}</div></div>`).join('');
    setHTML($('#lbTeams'), `<div class="row"><h2 class="title-font" style="margin:0">🛡️ Equipos de ${esc(th.emoji)} ${esc(th.name)}</h2><span class="sp"></span>
      <select id="redistN" style="width:auto" class="ctrl-only"><option value="auto">Auto</option>${[2, 3, 4, 5, 6, 7, 8].map((n) => `<option ${v.cfg.teamsWanted === n ? 'selected' : ''}>${n}</option>`).join('')}</select><button class="btn ghost sm ctrl-only" data-h="redist">🔀 Redistribuir</button></div>
      <p class="muted" style="margin:6px 0 10px">Cada equipo tiene nombre, color y escudo propios. Puedes renombrar los equipos o regenerar escudos.</p>${rows}`);
    if (busy) $('#hBar') && 0;
  }

  // ================================================================ Consola de juego
  function renderConsole() {
    const main = $('#hMain');
    if (!main._con) {
      main._con = true; main._lobby = false; main._fin = false;
      main.innerHTML = `<div class="console"><div id="leftCol"><div class="card glow" id="stage"></div><div class="card ctrl-only" id="extra" style="margin-top:12px"></div></div>
        <div><div class="card"><div class="tabs ctrl-only" id="tabs"></div><div id="sideBody"></div></div></div></div>`;
      extraKey = '';
    }
    renderStage();
    renderTabs();
    renderSide();
    renderExtra();
  }

  function primary() {
    const r = stageOf();
    if (!r) return { t: '▶ COMENZAR EL PRIMER RETO', m: 'host:next' };
    if (r.state === 'intro') return { t: '⏩ SALTAR LA CUENTA ATRÁS', m: 'host:next' };
    if (r.state === 'active') return { t: '⏹ TERMINAR RONDA', m: 'host:endRound', cls: 'red' };
    if (r.state === 'reveal') return { t: '🏆 MOSTRAR MARCADOR', m: 'host:next' };
    return v.stageIdx >= v.plan.length - 1 ? { t: '🏁 FINALIZAR AVENTURA', m: 'host:next', cls: 'gold' } : { t: '➡ SIGUIENTE RETO', m: 'host:next' };
  }

  function stageBar(r) {
    const dots = v.plan.map((s) => `<i class="${s.status === 'done' ? 'done' : s.status === 'current' ? 'current' : ''}" title="${esc(s.label)}"></i>`).join('');
    const th = r.theme || v.theme;
    return `<div class="stagebar"><span class="kindtag ${MV.kindClass(r)}">${r.icon} ${esc(r.label)}</span><span class="chip">Reto ${r.idx + 1}/${v.plan.length}</span><span class="chip">${esc(th.emoji)} ${esc(th.name)}</span><span class="sp"></span><div class="dots">${dots}</div></div>`;
  }

  function statusChips(r) {
    return `<div class="row" style="gap:6px;margin-top:10px">${v.teams.map((t) => {
      const st = (r.status || []).find((s) => s.id === t.id) || {};
      let cls = ''; let txt = '⏳ pensando';
      if (st.done) { cls = 'ok'; txt = '🔒 lista'; } else if (st.chosen) { cls = 'warn'; txt = '✍️ eligió'; }
      if (r.kind === 'roulette') { if (st.pending) { cls = 'warn'; txt = '🎓 espera'; } else if (st.spun) { cls = 'ok'; txt = '🎡 giró'; } else txt = '🎡 sin girar'; }
      return `<span class="chip ${cls}" style="padding:4px 10px">${MV.shield(t.shield, 18)} ${esc(t.name)} · ${txt}</span>`;
    }).join('')}</div>`;
  }

  function optionsView(r, pub) {
    const rv = r.state === 'reveal' || r.state === 'scoreboard' ? r.reveal || {} : null;
    const sec = r.secret || {};
    const answerIdx = rv && rv.answer != null ? rv.answer : (showAns && sec.idx != null ? sec.idx : null);
    if (pub.type === 'choice' || pub.type === 'wwyd') {
      return `<div class="opts">${pub.options.map((o, i) => `<div class="opt ${answerIdx === i ? 'right' : ''}"><span class="ltr">${LET[i]}</span><span>${esc(o)}</span>${rv && rv.scores ? `<span class="pts">${rv.scores[i]}</span>` : ''}</div>`).join('')}</div>`;
    }
    if (pub.type === 'tf') {
      const a = rv && rv.answer != null ? rv.answer : (showAns && sec.text ? sec.text === 'Verdadero' : null);
      return `<div class="opts tf"><div class="opt ${a === true ? 'right' : ''}">✅ VERDADERO</div><div class="opt ${a === false ? 'right' : ''}">❌ FALSO</div></div>`;
    }
    if (pub.type === 'order') {
      const ord = (rv && rv.ordered) || (showAns && sec.text ? sec.text.split(' → ') : null);
      return `<div class="order-list">${(ord || pub.items).map((t, i) => `<div class="order-row ${ord ? 'good' : ''}"><span class="num">${i + 1}</span><span>${esc(t)}</span></div>`).join('')}</div>`;
    }
    if (pub.type === 'strategic') return `<div class="opts">${pub.options.map((o, i) => `<div class="opt strat"><span class="ltr">${LET[i]}</span><span>${esc(o.label)}<br><small class="muted">${esc(o.desc)}</small></span></div>`).join('')}</div>`;
    if (pub.type === 'guess') {
      const clues = (rv && rv.clues) || (showAns && sec.clues) || pub.clues || [];
      return `<div class="clues">${clues.map((c, i) => `<div class="clue"><small>PISTA ${i + 1}</small>${esc(c)}</div>`).join('')}</div>`;
    }
    return '';
  }

  function stageHTML() {
    const r = stageOf();
    if (!r) {
      return `<div class="center" style="padding:20px"><div class="muted title-font">${esc(v.theme.emoji)} ${esc(v.theme.name)}</div><h2 class="title-font" style="font-size:2rem">¡Equipos listos!</h2>
        ${v.cfg.auto && v.readyAt ? `<div class="muted">El primer reto empieza en</div><div class="bigtimer-ready" data-cd="${v.readyAt}">…</div>` : '<div class="muted">Pulsa el botón cuando todos estén listos.</div>'}</div>${controlsHTML()}`;
    }
    const pub = r.pub;
    let h = stageBar(r);
    if (r.state === 'active') h += '<div class="timer" id="timer"><div class="t">00:60</div><div class="bar"><i></i></div></div><div id="timeout" class="timeout hidden">⏰ TIEMPO AGOTADO</div>';
    if (r.state === 'intro') h += '<div class="center muted" style="padding:14px"><span class="spinner"></span> Cuenta atrás en las pantallas de los equipos…</div>';
    if (r.kind === 'boss' && pub) h += `<div class="bossbox"><span class="em">🐲</span><div style="flex:1"><b>${esc(pub.boss || 'El Jefe')}</b><div class="hpbar"><i></i></div></div></div>`;
    if (r.kind === 'roulette') {
      h += '<div class="qtext">🎡 Ruleta: cada equipo gira la suya</div>';
      h += '<div class="mini-res">' + v.teams.map((t) => {
        const st = (r.status || []).find((s) => s.id === t.id) || {};
        const seg = st.seg ? MV.hello.segments.find((s) => s.id === st.seg) : null;
        return `<div class="r">${MV.shield(t.shield, 24)}<span>${esc(t.name)}</span><span class="muted" style="font-size:.85rem">${seg ? `${seg.emoji} ${esc(seg.label)} ${esc(seg.sub)} — ${esc(st.text || '')}` : 'sin girar'}</span></div>`;
      }).join('') + '</div>';
    } else if (pub) {
      if (pub.memory) h += pub.memory.lines ? `<div class="memlines"><h4>🧠 ${esc(pub.memory.title)}</h4>${pub.memory.lines.map((l) => `<div>• ${esc(l)}</div>`).join('')}</div>` : '<div class="muted">🧠 La información está oculta para los equipos.</div>';
      if (pub.words) h += `<div class="words">${pub.words.map((w) => `<span>${esc(w)}</span>`).join('')}</div>`;
      if (pub.type === 'guess') h += `<div class="qtext">🕵️ Categoría: ${esc(pub.cat)}</div>`;
      else if (pub.q) h += `<div class="qtext">${esc(pub.q)}</div>`;
      h += optionsView(r, pub);
    }
    if (r.state === 'active' && r.secret && showAns && r.kind !== 'roulette') h += `<div class="secret">🔑 Respuesta: <b>${esc(r.secret.text)}</b>${r.secret.why ? `<br><small>${esc(r.secret.why)}</small>` : ''}</div>`;
    if (r.state === 'reveal' || r.state === 'scoreboard') {
      const rv = r.reveal || {};
      if (rv.answerText && rv.type !== 'roulette') h += `<div class="result ok"><div class="muted">RESPUESTA CORRECTA</div><div class="big">${esc(rv.answerText)}</div></div>`;
      if (rv.why) h += `<div class="why">📖 ${esc(rv.why)}</div>`;
      h += '<div class="mini-res">' + (r.results || []).map((x) => { const t = teamById(x.teamId); return `<div class="r">${MV.shield(t.shield, 24)}<span>${esc(t.name)}</span><span class="muted" style="font-size:.82rem">${esc(x.chosen || '—')} ${x.note ? '· ' + esc(x.note) : ''}</span><b style="color:${x.pts > 0 ? 'var(--ok)' : x.pts < 0 ? '#fca5a5' : 'var(--mut)'}">${x.pts > 0 ? '+' : ''}${x.pts}</b></div>`; }).join('') + '</div>';
      const nxt = r.tNext && v.cfg.auto ? `<div class="center muted" style="margin-top:8px">${r.state === 'reveal' ? 'Marcador' : 'Siguiente reto'} en <b data-cd="${r.tNext}">…</b> s</div>` : '';
      h += nxt;
    }
    if (r.state === 'active' || r.state === 'intro') h += statusChips(r);
    return h + controlsHTML();
  }

  function controlsHTML() {
    const p = primary();
    const r = stageOf();
    return `<div class="ctrl ctrl-only" style="margin-top:14px;border-top:1px solid var(--line);padding-top:12px">
      <button class="btn big ${p.cls || ''}" data-h="primary">${p.t}</button>
      ${v.paused ? '<button class="btn green" data-h="resume">▶ Reanudar</button>' : '<button class="btn ghost" data-h="pause">⏸ Pausar</button>'}
      <button class="btn ghost" data-h="ans">${showAns ? '🙈 Ocultar respuesta' : '👁️ Ver respuesta'}</button>
      ${r && r.state === 'active' ? '' : ''}
    </div>`;
  }

  function renderStage() {
    const st = $('#stage');
    setHTML(st, stageHTML());
  }

  function renderTabs() {
    const names = [['marcador', '🏆 Marcador'], ['equipos', '👥 Equipos'], ['chats', '💬 Chats'], ['ruleta', '🎡 Ruleta'], ['mapa', '🗺️ Mapa'], ['log', '📜 Registro']];
    if (proj) tab = 'marcador';
    setHTML($('#tabs'), names.map((n) => `<button data-tab="${n[0]}" class="${tab === n[0] ? 'on' : ''}">${n[1]}</button>`).join(''));
  }

  function renderSide() {
    const b = $('#sideBody');
    if (!b) return;
    if (b._tab !== tab) { b._tab = tab; b._h = null; b.innerHTML = ''; b._lbInit = false; }
    const r = stageOf();
    if (tab === 'marcador') {
      if (!b._lbInit) { b._lbInit = true; b.innerHTML = '<div id="lbH"></div>'; }
      const anim = !!r && v.phase === 'scoreboard';
      MV.leaderboard($('#lbH'), v.teams, { big: proj, key: anim ? r.id + ':a' : (r ? r.id + ':n' : 'none'), animate: anim, delta: v.phase === 'scoreboard' || v.phase === 'reveal', planLen: v.plan.length });
    } else if (tab === 'equipos') {
      setHTML(b, v.teams.map((t) => {
        const st = r ? (r.status || []).find((s) => s.id === t.id) : null;
        const pw = ['shield', 'double', 'hint', 'time', 'steal'].filter((k) => t.powers[k] > 0).map((k) => `<span class="chip">${MV.hello.powers[k].emoji} ×${t.powers[k]}</span>`).join('');
        return `<div class="teamrow">${MV.shield(t.shield, 40)}<div class="info"><input type="text" value="${esc(t.name)}" maxlength="28" data-ren="${t.id}"><div class="muted st">${t.members.map((m) => (m.online ? '🟢' : '⚪') + esc(m.name)).join(' · ') || 'sin jugadores'}</div>
          ${st && (r.state === 'active' || r.state === 'intro') ? `<div class="st">${st.done ? '🔒 Bloqueada' : '✍️ En discusión'}${st.doubleOn ? ' · ✨ DOBLE' : ''}${showAns && st.chosen ? ` · <b>${esc(st.chosen)}</b>` : ''}</div>` : ''}</div>
          <div style="text-align:right"><b style="font-size:1.4rem">${t.score}</b><div class="row" style="gap:4px;justify-content:flex-end">${pw}</div></div>
          <button class="btn ghost sm" data-h="regen" data-t="${t.id}">🔄</button></div>`;
      }).join(''));
    } else if (tab === 'chats') {
      if (!v.cfg.spy) {
        setHTML(b, '<div class="empty">Los chats de los equipos son privados.<br>Si activas la observación podrás leerlos (los equipos no podrán verte).<br><br><button class="btn" data-h="spyOn">👁️ Observar chats</button></div>');
      } else if (!b._chatInit || b._chatTeams !== v.teams.map((t) => t.id).join()) {
        b._chatInit = true; b._chatTeams = v.teams.map((t) => t.id).join(); b._h = null;
        b.innerHTML = `<div class="chatcols">${v.teams.map((t) => `<div class="chatcol"><div class="row" style="margin-bottom:6px">${MV.shield(t.shield, 20)}<b>${esc(t.name)}</b></div><div class="msgs" data-cb="${t.id}"></div></div>`).join('')}</div>`;
        $$('[data-cb]', b).forEach((el) => {
          chatBoxes[el.dataset.cb] = el;
          (chats[el.dataset.cb] || []).forEach((m) => el.appendChild(MV.chatNode(m, null)));
          el.scrollTop = el.scrollHeight;
        });
      }
    } else if (tab === 'ruleta') {
      renderRoulette(b, r);
    } else if (tab === 'mapa') {
      setHTML(b, MV.mapHTML(v.plan, v.teams, null, v.theme));
    } else {
      setHTML(b, '<div class="log">' + v.log.slice().reverse().map((l) => `<div>${new Date(l.ts).toLocaleTimeString()} · ${esc(l.text)}</div>`).join('') + '</div>');
    }
  }

  function renderRoulette(b, r) {
    if (!r || r.kind !== 'roulette') { setHTML(b, '<div class="empty">La ruleta aparece cuando llega un reto de tipo RULETA.<br>Mientras tanto puedes darles bonus o poderes desde «Acciones del organizador».</div>'); return; }
    const segOpts = '<option value="">Al azar</option>' + MV.hello.segments.map((s) => `<option value="${s.id}">${s.emoji} ${esc(s.label)} ${esc(s.sub)}</option>`).join('');
    const rows = v.teams.map((t) => {
      const st = (r.status || []).find((s) => s.id === t.id) || {};
      const seg = st.seg ? MV.hello.segments.find((s) => s.id === st.seg) : null;
      const rq = (r.rteams || []).find((x) => x.id === t.id);
      return `<div class="teamrow">${MV.shield(t.shield, 34)}<div class="info"><b>${esc(t.name)}</b><div class="st muted">${seg ? `${seg.emoji} ${esc(seg.label)} ${esc(seg.sub)} — ${esc(st.text || '')}` : 'Aún no ha girado'}</div>${rq && rq.q ? `<div class="secret" style="font-size:.85rem">❓ ${esc(rq.q)}<br>🔑 ${esc(rq.answer)}</div>` : ''}</div>
        ${!st.spun && r.state === 'active' ? `<select data-seg="${t.id}" style="width:auto">${segOpts}</select><button class="btn sm" data-h="spinTeam" data-t="${t.id}">🎡 Girar</button>` : ''}
        ${st.pending ? `<input type="number" data-pts="${t.id}" value="100" style="width:90px"><button class="btn gold sm" data-h="decide" data-t="${t.id}">Decidir pts</button>` : ''}</div>`;
    }).join('');
    setHTML(b, `<div class="row" style="margin-bottom:8px"><button class="btn sm" data-h="spinAll" ${r.state === 'active' ? '' : 'disabled'}>🎡 Girar por todos</button><span class="muted" style="font-size:.85rem">Elige un segmento para forzar el resultado (útil en clase).</span></div>${rows}`);
  }

  function renderExtra() {
    const ex = $('#extra');
    if (!ex) return;
    const key = v.teams.map((t) => t.id + t.name).join('|') + (v.cfg.auto ? 'A' : '') + (v.cfg.spy ? 'S' : '') + (v.cfg.fast ? 'F' : '') + (v.cfg.demo ? 'D' : '');
    if (key === extraKey) return;
    const af = document.activeElement;
    if (af && ex.contains(af)) return;
    extraKey = key;
    const tOpts = v.teams.map((t) => `<option value="${t.id}">${esc(t.name)}</option>`).join('');
    const kOpts = Object.keys(MV.hello.kinds).map((k) => `<option value="${k}">${MV.hello.kinds[k].icon} ${esc(MV.hello.kinds[k].label)}</option>`).join('');
    ex.innerHTML = `<details open><summary class="title-font" style="cursor:pointer;font-weight:900;letter-spacing:.06em">🎛️ Acciones del organizador</summary>
      <div class="row" style="margin-top:10px"><label class="row" style="gap:6px"><input type="checkbox" data-cfg="auto" ${v.cfg.auto ? 'checked' : ''}> Avance automático</label>
        <label class="row" style="gap:6px"><input type="checkbox" data-cfg="spy" ${v.cfg.spy ? 'checked' : ''}> Observar chats</label>
        ${v.cfg.demo ? `<label class="row" style="gap:6px"><input type="checkbox" data-cfg="fast" ${v.cfg.fast ? 'checked' : ''}> Demo rápida</label>` : ''}</div>
      <label class="lbl">Elegir el siguiente test / cambiar el reto actual</label>
      <div class="row"><select id="xKind" style="flex:1">${kOpts}</select><select id="xTheme" style="flex:1"><option value="">Mismo universo</option>${info.themes.map((t) => `<option value="${esc(t.id)}">${esc(t.emoji)} ${esc(t.name)}</option>`).join('')}</select><button class="btn sm" data-h="pick">Aplicar</button></div>
      <label class="lbl">Premios</label>
      <div class="row"><select id="xTeam" style="flex:1">${tOpts}</select><button class="btn sm" data-h="bonus">🎁 Bonus +50 y poder</button></div>
      <div class="row" style="margin-top:8px"><select id="xPow" style="flex:1">${Object.keys(MV.hello.powers).map((k) => `<option value="${k}">${MV.hello.powers[k].emoji} ${esc(MV.hello.powers[k].name)}</option>`).join('')}</select><button class="btn sm" data-h="grant">Entregar poder</button>
        <input type="number" id="xPts" value="50" style="width:90px"><button class="btn sm gold" data-h="points">± puntos</button></div>
      <div class="row" style="margin-top:12px"><button class="btn ghost sm" data-h="bonusRound">🎁 Reto BONUS para todos</button><span class="sp"></span><button class="btn red sm" data-h="end">🏁 Terminar partida</button></div></details>`;
  }

  // ================================================================ Final
  function renderFinished() {
    const main = $('#hMain');
    main._lobby = false; main._con = false;
    if (!main._fin) { main._fin = true; main.innerHTML = '<div class="wrap"><div id="finBox"></div><div class="center ctrl-only" style="margin:18px 0 40px"><button class="btn big" data-h="restart">🔁 Jugar otra vez con el mismo grupo</button> <button class="btn ghost big" data-h="exit">🚪 Cerrar partida</button></div></div>'; }
    setHTML($('#finBox'), MV.finalHTML(v, null));
  }

  // ================================================================ Reloj
  function tickUI() {
    if (!v) return;
    const now = MV.now();
    const r = stageOf();
    $$('[data-cd]').forEach((el) => { el.textContent = Math.max(0, Math.ceil((+el.dataset.cd - now) / 1000)); });
    const tm = $('#timer');
    if (tm && r && r.state === 'active') {
      const rem = r.tEnd - now;
      tm.querySelector('.t').textContent = MV.fmtTimer(rem);
      tm.querySelector('.bar i').style.width = Math.max(0, Math.min(100, (rem / (r.dur * 1000)) * 100)) + '%';
      const low = rem <= 10000 && rem > 0;
      tm.classList.toggle('low', low);
      const to = $('#timeout'); if (to) to.classList.toggle('hidden', rem > 0);
      const sec = Math.ceil(rem / 1000);
      if (proj && low && sec !== tickSec && !v.paused) { tickSec = sec; MV.sfx.play('tick'); }
    }
    // cuenta atrás grande en el proyector
    const ov = ensureOverlay();
    if (proj && v.phase === 'intro' && r && !v.paused) {
      const left = Math.max(1, Math.ceil((r.tStart - now) / 1000));
      if (ov.classList.contains('hidden') || ov.dataset.rid !== r.id) {
        ov.dataset.rid = r.id; ovNum = null;
        ov.innerHTML = `<div><div class="ov-sub">Reto ${r.idx + 1} de ${v.plan.length}</div><div class="ov-icon">${r.icon}</div><div class="ov-kind">${esc(r.label)}</div><div class="ov-count" id="ovn">${left}</div></div>`;
        ov.classList.remove('hidden');
      }
      if (left !== ovNum) { ovNum = left; const n = $('#ovn'); if (n) n.textContent = left; MV.sfx.play('count'); }
    } else if (!ov.classList.contains('hidden')) ov.classList.add('hidden');
  }
  function ensureOverlay() {
    let ov = $('#overlay');
    if (!ov) { ov = document.createElement('div'); ov.id = 'overlay'; ov.className = 'hidden'; document.body.appendChild(ov); }
    return ov;
  }
  setInterval(() => { try { tickUI(); } catch (e) { /* noop */ } }, 200);

  // ================================================================ Modal de universo
  function openThemeModal() { modalTheme = v.cfg.chaos ? 'caos' : v.theme.id === 'custom' ? 'custom' : (v.cfg.themeId || 'ia'); renderModal(); }
  function renderModal() {
    const m = $('#hModal');
    m.innerHTML = `<div class="card" style="max-width:980px"><h2 class="title-font">🌌 Cambiar universo</h2><p class="muted">Los equipos recibirán nombres y escudos nuevos acordes al universo.</p>
      <div class="themes">${themeCards(modalTheme)}</div>${modalTheme === 'custom' ? `<div style="margin-top:12px">${customPanel()}</div>` : ''}
      <div class="row" style="margin-top:14px;justify-content:flex-end"><button class="btn ghost" data-h="closeModal">Cancelar</button><button class="btn" data-h="applyTheme">Aplicar</button></div></div>`;
    m.classList.remove('hidden');
  }
  $('#hModal').addEventListener('click', (e) => {
    const b = e.target.closest('[data-theme]');
    if (b) { modalTheme = b.dataset.theme; renderModal(); }
  });

  // ================================================================ Acciones
  const val = (id) => { const e = document.getElementById(id); return e ? e.value : ''; };
  document.addEventListener('click', (e) => {
    const tb = e.target.closest('#tabs button[data-tab]');
    if (tb) { tab = tb.dataset.tab; renderTabs(); renderSide(); return; }
    const lb = e.target.closest('#lenSeg button[data-len]');
    if (lb) { conn.send({ t: 'host:setCfg', length: lb.dataset.len }); return; }
    const b = e.target.closest('[data-h]');
    if (!b || b.closest('#hSetup')) return;
    if (b.tagName === 'A') e.preventDefault();
    MV.sfx.unlock();
    const h = b.dataset.h;
    const send = (o) => conn.send(o);
    switch (h) {
      case 'start': send({ t: 'host:start' }); break;
      case 'primary': send({ t: primary().m }); break;
      case 'pause': send({ t: 'host:pause' }); break;
      case 'resume': send({ t: 'host:resume' }); break;
      case 'ans': showAns = !showAns; if (v) { renderStage(); renderSide(); } break;
      case 'proj': proj = !proj; if (v) renderAll(); break;
      case 'openProj': window.open('/host?proj=1', '_blank'); break;
      case 'sound': MV.sfx.toggle(); renderBar(); break;
      case 'exit':
        if (confirm('¿Cerrar el panel? La partida seguirá en el servidor; podrás volver mientras no cierres el navegador.')) { MV.store.del('mv_host'); location.href = '/host'; }
        break;
      case 'regen': send({ t: 'host:regenShield', teamId: b.dataset.t }); break;
      case 'kick': send({ t: 'host:kick', playerId: b.dataset.p }); break;
      case 'redist': send({ t: 'host:redistribute', teams: val('redistN') }); break;
      case 'themeModal': openThemeModal(); break;
      case 'closeModal': modalTheme = null; $('#hModal').classList.add('hidden'); break;
      case 'applyTheme': applyTheme(); break;
      case 'pick': send({ t: 'host:pick', kind: val('xKind'), themeId: val('xTheme') || undefined }); break;
      case 'bonus': send({ t: 'host:bonus', teamId: val('xTeam') }); break;
      case 'bonusRound': send({ t: 'host:bonus' }); break;
      case 'grant': send({ t: 'host:grant', teamId: val('xTeam'), power: val('xPow') }); break;
      case 'points': send({ t: 'host:points', teamId: val('xTeam'), points: val('xPts') }); break;
      case 'end': if (confirm('¿Terminar la partida ahora y mostrar la ceremonia final?')) send({ t: 'host:endGame' }); break;
      case 'restart': send({ t: 'host:restart' }); lastKey = ''; break;
      case 'spyOn': send({ t: 'host:setCfg', spy: true }); break;
      case 'spinAll': send({ t: 'host:spin' }); break;
      case 'spinTeam': { const sel = document.querySelector(`[data-seg="${b.dataset.t}"]`); send({ t: 'host:spin', teamId: b.dataset.t, segId: sel && sel.value ? sel.value : undefined }); break; }
      case 'decide': { const inp = document.querySelector(`[data-pts="${b.dataset.t}"]`); send({ t: 'host:decide', teamId: b.dataset.t, points: inp ? inp.value : 0 }); break; }
      default: break;
    }
  });
  document.addEventListener('change', (e) => {
    const c = e.target.closest('[data-cfg]');
    if (c) { conn.send({ t: 'host:setCfg', [c.dataset.cfg]: c.checked }); return; }
    const rn = e.target.closest('[data-ren]');
    if (rn) conn.send({ t: 'host:renameTeam', teamId: rn.dataset.ren, name: rn.value });
  });

  function applyTheme() {
    const id = modalTheme;
    if (id === 'caos') conn.send({ t: 'host:setTheme', themeId: 'ia', chaos: true });
    else if (id === 'custom') {
      const topic = custom.topic.trim();
      if (!topic) { MV.toast('Escribe de qué trata tu tema.', 'warn'); return; }
      if (custom.mode === 'ai') conn.send({ t: 'host:genTheme', topic });
      else if (custom.mode === 'json') { if (!custom.json.trim()) { MV.toast('Pega el JSON del tema.', 'warn'); return; } conn.send({ t: 'host:importTheme', topic, json: custom.json }); } else conn.send({ t: 'host:generalTheme', topic });
    } else conn.send({ t: 'host:setTheme', themeId: id, chaos: false });
    modalTheme = null;
    $('#hModal').classList.add('hidden');
  }

  // Aviso de partida guardada en la pantalla de preparación
  if (game && game.code) {
    const rb = $('#resumeBox');
    rb.innerHTML = `<b>Tienes una partida guardada (código ${esc(game.code)}).</b> Reconectando…`;
    rb.classList.remove('hidden');
  }
})();
