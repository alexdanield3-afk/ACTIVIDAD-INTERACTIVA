/* MULTIVERSE CHALLENGE — cliente del participante */
(function () {
  'use strict';
  const { $, $$, esc } = MV;
  const LET = 'ABCD';
  let conn = null;
  let session = MV.store.get('mv_session');
  let v = null;
  let chat = [];
  let tab = 'reto';
  let lastKey = '';
  let lastPhase = null;
  let ovNum = null;
  let chatTeam = null;
  let tickSec = -1;
  const wheel = { rid: null, built: false, spunKey: null, angle: 0 };
  const params = new URLSearchParams(location.search);

  // ---------------------------------------------------------------- Conexión
  function showJoin(msg) {
    $('#game').classList.add('hidden');
    $('#join').classList.remove('hidden');
    $('#overlay').classList.add('hidden');
    const e = $('#jerr');
    if (msg) { e.textContent = msg; e.classList.remove('hidden'); } else e.classList.add('hidden');
  }

  conn = MV.connect({
    open() {
      $('#conn').classList.add('hidden');
      if (session && session.code) conn.send({ t: 'rejoin', code: session.code, pid: session.pid, token: session.token });
      else showJoin();
    },
    close() { $('#conn').classList.remove('hidden'); },
    msg: onMsg,
  });

  function onMsg(m) {
    switch (m.t) {
      case 'joined':
        session = { code: m.code, pid: m.pid, token: m.token, name: m.name };
        MV.store.set('mv_session', session);
        $('#join').classList.add('hidden');
        $('#game').classList.remove('hidden');
        break;
      case 'joinFail': showJoin(m.msg); break;
      case 'rejoinFail':
        session = null; MV.store.del('mv_session');
        showJoin('La partida anterior ya no existe. Entra de nuevo con un código.');
        break;
      case 'kicked':
        session = null; MV.store.del('mv_session');
        showJoin('El organizador te sacó de la partida.');
        break;
      case 'err': MV.toast(m.msg, 'bad'); break;
      case 'toast': MV.toast(m.text, m.kind === 'warn' ? 'warn' : ''); break;
      case 'chatHistory':
        if (!m.all) { chat = m.msgs || []; chatTeam = m.teamId; renderChatAll(); }
        break;
      case 'chat':
        if (m.msg && m.msg.tid === (myTeam() && myTeam().id)) addChat(m.msg);
        break;
      case 'snap':
        v = m.v;
        if (!v.me) { session = null; MV.store.del('mv_session'); showJoin(); break; }
        render();
        break;
      default: break;
    }
  }

  // ---------------------------------------------------------------- Utilidades
  const myTeam = () => (v && v.me ? v.teams.find((t) => t.id === v.me.teamId) : null);
  const rnd = () => (v ? v.round : null);
  const curPub = (r) => {
    if (!r) return null;
    if (r.kind === 'roulette') return r.mine && r.mine.rq ? r.mine.rq : null;
    return r.pub || null;
  };
  const timeUp = (r) => !!(r && r.mine && MV.now() >= r.mine.deadline);
  const paused = () => !!(v && v.paused);

  function setHTML(el, html) {
    if (el._h === html) return;
    el._h = html;
    el.innerHTML = html;
  }

  // ---------------------------------------------------------------- Render principal
  function render() {
    const team = myTeam();
    if (!team) return;
    $('#join').classList.add('hidden');
    $('#game').classList.remove('hidden');
    const r = rnd();
    MV.applyTheme(r && r.theme && v.phase !== 'lobby' && v.phase !== 'finished' ? r.theme : v.theme);
    document.documentElement.style.setProperty('--tc', team.color);
    $('#pauseBanner').classList.toggle('hidden', !v.paused);

    // transiciones (sonidos, cambio de pestaña)
    const key = v.phase + ':' + (r ? r.id : '');
    if (key !== lastKey) {
      const first = lastKey === '';
      lastKey = key;
      onTransition(first);
    }
    lastPhase = v.phase;

    if (chatTeam && chatTeam !== team.id) { chatTeam = team.id; chat = []; renderChatAll(); }
    if (!chatTeam) chatTeam = team.id;
    renderTop(team);
    renderPowers(team);
    $('#chatConn').textContent = `Equipo conectado: ${team.online}/${team.size}`;
    renderQuick();

    const fin = v.phase === 'finished';
    $('#bottomNav').classList.toggle('hidden', fin);
    ['reto', 'marcador', 'mapa', 'equipo', 'final'].forEach((n) => $('#view-' + n).classList.toggle('hidden', n !== (fin ? 'final' : tab)));
    $$('#bottomNav button').forEach((b) => b.classList.toggle('act', b.dataset.tab === tab));
    if (fin) renderFinal();
    else if (tab === 'reto') renderReto(team);
    else if (tab === 'marcador') renderMarcador(team);
    else if (tab === 'mapa') renderMapa(team);
    else renderEquipo(team);
    tickUI();
  }

  function onTransition(first) {
    const r = rnd();
    if (v.phase === 'intro' || v.phase === 'active' || v.phase === 'reveal') tab = 'reto';
    if (v.phase === 'scoreboard') tab = 'marcador';
    if (v.phase === 'lobby' || v.phase === 'ready') tab = 'reto';
    if (first) return;
    if (v.phase === 'active') MV.sfx.play('go');
    if (v.phase === 'reveal' && r && r.results) {
      const res = r.results.find((x) => x.teamId === v.me.teamId);
      if (res && res.correct) { MV.sfx.play('correct'); MV.confetti(1800, 70); } else if (res && res.pts < 0) MV.sfx.play('wrong');
      else if (res && !res.passed) MV.sfx.play('wrong');
      else MV.sfx.play('power');
    }
    if (v.phase === 'finished') { MV.sfx.play('win'); MV.confetti(5000, 220); }
  }

  function renderTop(team) {
    const html = `${MV.shield(team.shield, 34)}
      <div class="tname">${esc(team.name)}<small>${esc(v.me.name)} · ${esc(v.name)}</small></div>
      <span class="sp"></span>
      <span class="rankpill" title="Posición del equipo">#${team.rank}</span>
      <div class="scorebox"><b>${team.score}</b><small>PUNTOS</small></div>
      <button class="iconbtn" id="sndBtn" title="Sonido">${MV.sfx.on ? '🔊' : '🔇'}</button>`;
    setHTML($('#top'), html);
  }

  // ---------------------------------------------------------------- Poderes
  function canUse(p, team, r) {
    if (p === 'shield') return false;
    if ((team.powers[p] || 0) <= 0) return false;
    if (paused()) return false;
    if (p === 'steal') return !!(r && ['active', 'reveal', 'scoreboard'].includes(r.state) && r.mine && !r.mine.stealUsed && v.teams.length > 1);
    if (!r || r.state !== 'active' || !r.mine || r.mine.locked || timeUp(r)) return false;
    const pub = curPub(r);
    if (!pub) return false;
    if (p === 'double') return !r.mine.doubleOn;
    if (p === 'time') return !r.mine.timeUsed;
    if (p === 'hint') return !r.mine.hintUsed && pub.type !== 'tf' && pub.type !== 'strategic';
    return false;
  }

  function renderPowers(team) {
    const r = rnd();
    const P = MV.hello ? MV.hello.powers : {};
    const html = ['shield', 'double', 'hint', 'time', 'steal'].map((k) => {
      const n = team.powers[k] || 0;
      const can = canUse(k, team, r);
      const on = k === 'double' && r && r.mine && r.mine.doubleOn && r.state === 'active';
      const used = (k === 'hint' && r && r.mine && r.mine.hintUsed && r.state === 'active') || (k === 'time' && r && r.mine && r.mine.timeUsed && r.state === 'active');
      const p = P[k] || { emoji: '?', name: k, desc: '' };
      return `<div class="pw ${n ? '' : 'zero'} ${can ? 'can' : ''} ${on ? 'on' : ''} ${k === 'shield' ? 'auto' : ''}" data-pw="${k}" title="${esc(p.name)}: ${esc(p.desc)}">${p.emoji} <span>${esc(p.name)}</span><span class="n">${on ? 'ON' : used ? '✓' : '×' + n}</span></div>`;
    }).join('');
    setHTML($('#powers'), html);
  }

  // ---------------------------------------------------------------- Vista RETO
  function stageBar(r) {
    const dots = v.plan.map((s) => `<i class="${s.status === 'done' ? 'done' : s.status === 'current' ? 'current' : ''}" title="${esc(s.label)}"></i>`).join('');
    const th = r.theme || v.theme;
    return `<div class="stagebar"><span class="kindtag ${MV.kindClass(r)}">${r.icon} ${esc(r.label)}</span><span class="chip">Reto ${r.idx + 1}/${v.plan.length}</span><span class="chip">${esc(th.emoji)} ${esc(th.name)}</span><span class="sp"></span><div class="dots">${dots}</div></div>`;
  }

  function renderReto(team) {
    const a = $('#acard');
    const r = rnd();
    const ph = v.phase;
    $('#chatCard').classList.remove('hidden');
    $('#wheelHost').classList.add('hidden');
    if (ph === 'lobby' || ph === 'ready' || !r) {
      a.classList.add('hidden');
      setHTML($('#qTop'), lobbyHTML(team));
      setHTML($('#qBot'), '');
      return;
    }
    a.classList.remove('hidden');
    const pub = curPub(r);
    const rev = ph === 'reveal' || ph === 'scoreboard';
    let h = stageBar(r);
    if (r.kind === 'boss' && r.pub) h += `<div class="bossbox"><span class="em">🐲</span><div style="flex:1"><b>${esc(r.pub.boss || 'El Jefe')}</b><div class="hpbar"><i></i></div></div></div>`;
    if (r.state === 'active') {
      h += `<div class="timer" id="timer"><div class="t">00:60</div><div class="bar"><i></i></div></div><div id="timeout" class="timeout hidden">⏰ TIEMPO AGOTADO</div>`;
    } else if (r.state === 'intro') {
      h += '<div class="center muted" style="padding:20px"><span class="spinner"></span> Preparando el reto…</div>';
    }
    let bottom = '';
    if (r.kind === 'roulette') {
      const rq = rouletteQ(r, pub, rev);
      h += rq.top; bottom = rq.bottom;
      if (r.state !== 'intro') ensureWheel(r);
    } else h += questionBody(r, pub, rev);
    setHTML($('#qTop'), h);
    setHTML($('#qBot'), bottom);
    renderAnswers(r, pub, team, rev);
  }

  function lobbyHTML(team) {
    const mem = team.members.map((m) => `<span class="member ${m.online ? '' : 'off'} ${m.id === v.me.pid ? 'me' : ''}">${m.online ? '🟢' : '⚪'} ${esc(m.name)}${m.id === v.me.pid ? ' (tú)' : ''}</span>`).join('');
    const others = v.teams.map((t) => `<div class="teamcell ${t.id === team.id ? 'mine' : ''}">${MV.shield(t.shield, 52)}<b>${esc(t.name)}</b><small class="muted">${t.size} jugador${t.size === 1 ? '' : 'es'}</small></div>`).join('');
    let status;
    if (v.phase === 'ready') {
      status = v.cfg.auto && v.readyAt ? `<div class="center"><div class="muted">LA AVENTURA COMIENZA EN</div><div class="bigtimer-ready" data-cd="${v.readyAt}">…</div></div>` : '<div class="center title-font" style="font-size:1.3rem;padding:10px">⚔️ ¡Prepárense! El organizador lanzará el primer reto…</div>';
    } else {
      status = `<div class="center muted" style="padding:6px"><span class="spinner"></span> Esperando a que el organizador inicie la aventura…<br><b>${v.playersOnline}</b> participantes conectados · Código <b>${esc(v.code)}</b></div>`;
    }
    return `<div class="center muted title-font">${esc(v.theme.emoji)} ${esc(v.theme.name)}</div>
      <div class="teamhero" style="--tc:${esc(team.color)}"><div class="shield">${MV.shield(team.shield, 150)}</div><div class="muted" style="letter-spacing:.2em;font-weight:800">TU EQUIPO</div><h2>${esc(team.name)}</h2>
      <div class="members">${mem}</div></div>${status}
      <label class="lbl">Equipos de la aventura</label><div class="teamsgrid">${others}</div>`;
  }

  function questionBody(r, pub, rev) {
    if (!pub) return '';
    let h = '';
    if (pub.type === 'guess') {
      h += `<div class="qtext">🕵️ Categoría: ${esc(pub.cat)}</div><div class="qsub">Cada pocos segundos aparece una pista nueva. ¡Cuantas menos pistas necesiten, más puntos!</div>`;
      const clues = (rev && r.reveal && r.reveal.clues) ? r.reveal.clues : (r.mine && r.mine.clues) || pub.clues || [];
      h += `<div class="clues">${clues.map((c, i) => `<div class="clue"><small>PISTA ${i + 1}</small>${esc(c)}</div>`).join('')}</div>`;
      return h;
    }
    if (pub.memory) {
      const memorizing = r.state === 'active' && MV.now() < r.memShowUntil;
      if (pub.memory.lines || rev) {
        h += `<div class="memlines"><h4>🧠 ${esc(pub.memory.title)} ${memorizing ? `— se oculta en <span data-cd="${r.memShowUntil}">…</span> s` : ''}</h4>${(pub.memory.lines || []).map((l) => `<div>• ${esc(l)}</div>`).join('')}</div>`;
      } else if (r.state === 'intro') h += '<div class="qtext">🧠 ¡Prepárense para memorizar!</div>';
    }
    if (pub.words) h += `<div class="words">${pub.words.map((w) => `<span>${esc(w)}</span>`).join('')}</div>`;
    if (pub.q) h += `<div class="qtext">${esc(pub.q)}</div>`;
    else if (pub.memory && !rev && r.state === 'active' && MV.now() >= r.memShowUntil) h += '<div class="qtext">…</div>';
    if (pub.type === 'tf') h += '<div class="qsub">Verdadero o falso: discutan en el chat y elijan juntos.</div>';
    if (pub.type === 'order') h += `<div class="qsub">Ordenen los elementos con las flechas ▲ ▼.${r.mine && r.mine.hintText ? `<br><b>💡 ${esc(r.mine.hintText)}</b>` : ''}</div>`;
    if (pub.type === 'wwyd') h += '<div class="qsub">No hay una sola respuesta perfecta: elijan la mejor decisión.</div>';
    if (pub.type === 'strategic') h += '<div class="qsub">Decidan como equipo qué camino tomar. ¿Seguro, arriesgado o aliados?</div>';
    if (rev && r.reveal && r.reveal.answerText && pub.type !== 'choice' && pub.type !== 'tf' && pub.type !== 'wwyd') {
      h += `<div class="result ok"><div class="muted">RESPUESTA</div><div class="big">${esc(r.reveal.answerText)}</div></div>`;
    }
    if (rev && r.reveal && r.reveal.why) h += `<div class="why">📖 ${esc(r.reveal.why)}</div>`;
    return h;
  }

  // ---------------------------------------------------------------- Ruleta
  function rouletteQ(r, pub, rev) {
    const rl = r.mine && r.mine.rl;
    let top = '<div class="qtext">🎡 ¡La ruleta del Multiverse!</div>';
    if (r.state === 'intro') return { top: top + '<div class="qsub">Cada equipo gira su propia ruleta. Pueden ganar puntos, poderes… ¡o perderlos!</div>', bottom: '' };
    if (r.state === 'active' && !rl) top += '<div class="qsub">Cualquier miembro del equipo puede girar. ¡Si nadie gira, lo haremos por ustedes!</div>';
    let bottom = '';
    if (rl) {
      const done = MV.now() >= rl.spunAt + 5200 || rev;
      const seg = MV.hello.segments[rl.segIdx];
      bottom += done ? `<div class="wheelres">${seg.emoji} ${esc(seg.label)} ${esc(seg.sub)}<br><small>${esc(rl.text)}</small></div>` : '<div class="wheelres">🎡 Girando…</div>';
      if (done && pub && pub.q) bottom += `<div class="qtext">${esc(pub.q)}</div>`;
    }
    return { top, bottom };
  }

  function ensureWheel(r) {
    const host = $('#wheelHost');
    if (!host._built) {
      host._built = true;
      host.innerHTML = `<div class="wheelbox">${MV.wheelSVG(MV.hello.segments).replace('<svg class="wheel"', '<svg class="wheel" id="wheelSvg"')}<div class="ptr">🔻</div></div>`;
    }
    host.classList.remove('hidden');
    const svg = $('#wheelSvg');
    if (wheel.rid !== r.id) {
      wheel.rid = r.id; wheel.spunKey = null;
      svg.style.transition = 'none'; svg.style.transform = 'rotate(0deg)';
    }
    const rl = r.mine && r.mine.rl;
    if (rl && wheel.spunKey !== rl.spunAt) {
      wheel.spunKey = rl.spunAt;
      const target = MV.wheelAngle(rl.segIdx, MV.hello.segments.length, 6);
      const age = MV.now() - rl.spunAt;
      if (age < 2500) {
        svg.style.transition = 'none'; svg.style.transform = 'rotate(0deg)'; void svg.getBoundingClientRect();
        svg.style.transition = 'transform 5s cubic-bezier(.1,.75,.12,1)'; svg.style.transform = `rotate(${target}deg)`;
        MV.sfx.play('spin');
        setTimeout(() => { if (v) render(); }, 5300);
      } else { svg.style.transition = 'none'; svg.style.transform = `rotate(${target % 360}deg)`; }
    }
  }

  // ---------------------------------------------------------------- Respuestas
  function renderAnswers(r, pub, team, rev) {
    const a = $('#aDyn');
    const gb = $('#guessBox');
    let h = '';
    gb.classList.add('hidden');
    const m = r.mine || {};
    const rlk = r.kind === 'roulette';
    if (r.state === 'intro') { setHTML(a, '<div class="center muted">Las opciones aparecerán cuando empiece el tiempo.</div>'); return; }
    const spinDone = rlk && m.rl ? MV.now() >= m.rl.spunAt + 5200 : false;
    if (r.state === 'active') {
      if (rlk && !m.rl) {
        h = `<button class="btn xl pulse" style="width:100%" data-act="spin" ${paused() ? 'disabled' : ''}>🎡 GIRAR RULETA</button><div class="center muted" style="margin-top:8px">Giro automático en <b data-cd="${m.autoSpinAt}">…</b> s</div>`;
        setHTML(a, h); return;
      }
      if (rlk && m.rl && !spinDone) { setHTML(a, '<div class="center muted"><span class="spinner"></span> La ruleta está girando…</div>'); return; }
      if (rlk && m.rl && m.rl.pending) { setHTML(a, '<div class="locked-note">🎓 El organizador decidirá su premio…</div>'); return; }
      if (rlk && m.rl && !pub) { setHTML(a, '<div class="locked-note">✅ ¡Listo! Esperando a los demás equipos…</div>'); return; }
      if (!pub) { setHTML(a, ''); return; }
      const canAct = !m.locked && !paused() && !timeUp(r) && !(r.kind === 'memory' && MV.now() < r.memShowUntil);
      if (r.kind === 'memory' && MV.now() < r.memShowUntil) { setHTML(a, '<div class="center muted">🧠 Memoricen: las opciones aparecen cuando se oculte la información.</div>'); return; }
      h += answerControls(pub, m, canAct, r);
      if (pub.type === 'guess') {
        const live = !m.locked && m.attempts > 0 && !paused() && !timeUp(r);
        gb.classList.toggle('hidden', !live);
        h = guessInfo(m, pub) + (m.locked ? lockedNote(m, pub) : '');
        if (live) { /* input persistente */ }
      } else if (m.locked) h += lockedNote(m, pub);
      else h += lockRow(m, canAct);
      setHTML(a, h);
      return;
    }
    // reveal / scoreboard
    setHTML(a, revealHTML(r, pub, team));
  }

  function optBtn(i, label, cls, extra, dis, strat) {
    const text = strat ? `<span style="display:flex;flex-direction:column"><span>${esc(label.label)}</span><small class="muted">${esc(label.desc)}</small></span>` : `<span>${esc(label)}</span>`;
    return `<button class="opt ${cls}" data-act="opt" data-i="${i}" ${dis ? 'disabled' : ''}><span class="ltr">${LET[i]}</span>${text}${extra || ''}</button>`;
  }

  function answerControls(pub, m, canAct, r) {
    const dis = !canAct;
    const by = (sel) => (sel && m.draftBy ? `<span class="by">✋ ${esc(m.draftBy)}</span>` : '');
    if (pub.type === 'choice' || pub.type === 'wwyd') {
      return `<div class="opts">${pub.options.map((o, i) => optBtn(i, o, `${m.draft === i ? 'sel' : ''} ${m.hidden && m.hidden.includes(i) ? 'hid' : ''}`, by(m.draft === i), dis)).join('')}</div>`;
    }
    if (pub.type === 'strategic') {
      return `<div class="opts">${pub.options.map((o, i) => optBtn(i, o, `strat ${m.draft === i ? 'sel' : ''}`, by(m.draft === i), dis, true)).join('')}</div>`;
    }
    if (pub.type === 'tf') {
      return `<div class="opts tf"><button class="opt ${m.draft === true ? 'sel' : ''}" data-act="tf" data-v="1" ${dis ? 'disabled' : ''}>✅ VERDADERO</button><button class="opt ${m.draft === false ? 'sel' : ''}" data-act="tf" data-v="0" ${dis ? 'disabled' : ''}>❌ FALSO</button></div>${m.draftBy && m.draft != null ? `<div class="qsub center">✋ ${esc(m.draftBy)} eligió</div>` : ''}`;
    }
    if (pub.type === 'order') {
      const d = Array.isArray(m.draft) ? m.draft : pub.items.map((_, i) => i);
      const n = d.length;
      return `<div class="order-list">${d.map((di, pos) => `<div class="order-row"><span class="num">${pos + 1}</span><span>${esc(pub.items[di])}</span><span class="mv"><button data-act="up" data-i="${pos}" ${dis || pos === 0 ? 'disabled' : ''}>▲</button><button data-act="down" data-i="${pos}" ${dis || pos === n - 1 ? 'disabled' : ''}>▼</button></span></div>`).join('')}</div>`;
    }
    return '';
  }

  function guessInfo(m, pub) {
    let h = `<div class="row"><span class="chip ${m.attempts > 1 ? '' : 'warn'}">🎯 Intentos: ${m.attempts}</span>${m.hintText ? '' : ''}</div>`;
    if (m.guesses && m.guesses.length) h += `<div class="guesslist">${m.guesses.map((g) => `<span class="chip ${m.correctNow && g === m.guesses[m.guesses.length - 1] ? 'ok' : 'bad'}">${esc(g)}</span>`).join('')}</div>`;
    return h;
  }

  function lockedNote(m, pub) {
    if (pub.type === 'guess') return m.correctNow ? '<div class="locked-note">✅ ¡Lo adivinaron! Esperando a los demás equipos…</div>' : '<div class="locked-note" style="background:rgba(239,68,68,.18);border-color:rgba(239,68,68,.5)">😵 Se acabaron los intentos. Esperando el resultado…</div>';
    return '<div class="locked-note">🔒 Respuesta bloqueada. Esperando a los demás equipos…</div>';
  }

  function lockRow(m, canAct) {
    const has = m.draft != null && m.draft !== '';
    return `<div class="lockrow"><button class="btn green big" data-act="lock" ${canAct && has ? '' : 'disabled'}>🔒 BLOQUEAR RESPUESTA</button></div><div class="qsub center" style="margin-top:6px">Cualquiera puede elegir y bloquear: ¡pónganse de acuerdo en el chat antes!</div>`;
  }

  function revealHTML(r, pub, team) {
    const res = (r.results || []).find((x) => x.teamId === team.id);
    const rv = r.reveal || {};
    const m = r.mine || {};
    let h = '';
    if (res) {
      const ok = res.correct || (res.passed && res.pts >= 0);
      h += `<div class="result ${ok ? 'ok' : 'bad'}"><div class="row"><div class="big">${res.correct ? '¡CORRECTO! 🎉' : res.passed ? '¡Superado!' : res.pts < 0 ? 'Mala suerte…' : 'Esta vez no…'}</div><span class="sp"></span><div class="pts" style="color:${res.pts > 0 ? 'var(--ok)' : res.pts < 0 ? '#fca5a5' : 'var(--mut)'}">${res.pts > 0 ? '+' : ''}${res.pts}</div></div>`
        + `<div class="muted" style="margin-top:4px">${res.chosen ? 'Su respuesta: <b>' + esc(res.chosen) + '</b>' : 'No eligieron respuesta'}</div>`
        + `<div class="row" style="margin-top:6px">${res.speed ? `<span class="chip ok">⚡ +${res.speed} por rapidez</span>` : ''}${res.mult > 1 ? '<span class="chip">✨ DOBLE ×2</span>' : ''}${res.fastest ? '<span class="chip warn">🏎️ ¡Los más rápidos!</span>' : ''}${res.note ? `<span class="chip">${esc(res.note)}</span>` : ''}</div></div>`;
    }
    // opciones con marcas
    if (pub && (pub.type === 'choice' || pub.type === 'wwyd') && rv.answer != null) {
      h += `<div class="opts">${pub.options.map((o, i) => {
        const cls = i === rv.answer ? 'right' : (m.draft === i ? 'wrong' : '');
        const pts = rv.scores ? `<span class="pts">${rv.scores[i]}</span>` : '';
        return optBtn(i, o, cls, (m.draft === i ? '<span class="by">← su elección</span>' : '') + pts, true);
      }).join('')}</div>`;
    } else if (pub && pub.type === 'tf') {
      h += `<div class="opts tf"><button class="opt ${rv.answer === true ? 'right' : m.draft === true ? 'wrong' : ''}" disabled>✅ VERDADERO</button><button class="opt ${rv.answer === false ? 'right' : m.draft === false ? 'wrong' : ''}" disabled>❌ FALSO</button></div>`;
    } else if (pub && pub.type === 'order' && rv.ordered) {
      const d = Array.isArray(m.draft) ? m.draft : [];
      h += '<label class="lbl">Orden correcto</label><div class="order-list">' + rv.ordered.map((t, i) => `<div class="order-row ${pub.items[d[i]] === t ? 'good' : 'bad'}"><span class="num">${i + 1}</span><span>${esc(t)}</span><span class="mv">${pub.items[d[i]] === t ? '✅' : '❌'}</span></div>`).join('') + '</div>';
    } else if (pub && pub.type === 'strategic') {
      h += `<div class="opts">${pub.options.map((o, i) => optBtn(i, o, `strat ${m.draft === i ? 'sel' : ''}`, '', true, true)).join('')}</div>`;
    }
    // resultados de los demás equipos
    const byId = {}; v.teams.forEach((t) => { byId[t.id] = t; });
    h += `<label class="lbl">Resultados del reto</label><div class="mini-res">${(r.results || []).map((x) => `<div class="r">${MV.shield(byId[x.teamId].shield, 24)}<span>${esc(byId[x.teamId].name)}</span><span class="muted" style="font-size:.8rem">${esc(x.note || '')}</span><b style="color:${x.pts > 0 ? 'var(--ok)' : x.pts < 0 ? '#fca5a5' : 'var(--mut)'}">${x.pts > 0 ? '+' : ''}${x.pts}</b></div>`).join('')}</div>`;
    if (v.phase === 'reveal') h += `<div class="center muted" style="margin-top:10px">${v.cfg.auto && r.tNext ? `Marcador en <b data-cd="${r.tNext}">…</b> s` : 'El organizador mostrará el marcador…'}</div>`;
    return h;
  }

  // ---------------------------------------------------------------- Otras vistas
  function renderMarcador(team) {
    const box = $('#view-marcador');
    if (!box._init) {
      box._init = true;
      box.innerHTML = '<div class="card"><div class="row"><h2 class="title-font" style="margin:0">🏆 Marcador</h2><span class="sp"></span><span class="muted" id="nextCd"></span></div><div id="lbBox" style="margin-top:12px"></div></div><div class="card" style="margin-top:12px" id="lbMap"></div>';
    }
    const r = rnd();
    const anim = !!r && v.phase === 'scoreboard';
    const key = anim ? r.id + ':a' : (r ? r.id + ':n' : 'none');
    MV.leaderboard($('#lbBox'), v.teams, { myId: team.id, key, animate: anim, delta: v.phase === 'scoreboard' || v.phase === 'reveal', planLen: v.plan.length });
    setHTML($('#lbMap'), '<h3>🗺️ Camino de la aventura</h3>' + MV.mapHTML(v.plan, v.teams, team.id, v.theme));
    const nx = $('#nextCd');
    nx.innerHTML = v.phase === 'scoreboard' ? (v.cfg.auto && r.tNext ? `Siguiente reto en <b data-cd="${r.tNext}">…</b> s` : 'Esperando al organizador…') : '';
  }

  function renderMapa(team) {
    const box = $('#view-mapa');
    setHTML(box, `<div class="card"><h2 class="title-font">🗺️ Mapa de la aventura</h2>${MV.mapHTML(v.plan, v.teams, team.id, v.theme)}</div>`);
  }

  function renderEquipo(team) {
    const box = $('#view-equipo');
    const P = MV.hello.powers;
    const mem = team.members.map((m) => `<span class="member ${m.online ? '' : 'off'} ${m.id === v.me.pid ? 'me' : ''}">${m.online ? '🟢' : '⚪'} ${esc(m.name)}</span>`).join('');
    const st = team.stats || {};
    const html = `<div class="card"><div class="teamhero" style="--tc:${esc(team.color)}"><div class="shield">${MV.shield(team.shield, 130)}</div><h2>${esc(team.name)}</h2><div class="muted">Posición #${team.rank} · ${team.score} puntos · ${team.progress}/${v.plan.length || '—'} retos superados</div><div class="members">${mem}</div><div class="badges">${MV.badgeList(team)}</div></div></div>
      <div class="card" style="margin-top:12px"><h3>⚡ Poderes</h3>${Object.keys(P).map((k) => `<div class="row" style="padding:6px 0;border-bottom:1px solid var(--line)"><b>${P[k].emoji} ${esc(P[k].name)}</b><span class="chip">×${team.powers[k] || 0}</span><span class="muted" style="flex:1;min-width:200px;font-size:.88rem">${esc(P[k].desc)}</span></div>`).join('')}</div>
      <div class="card" style="margin-top:12px"><h3>📊 Estadísticas</h3><div class="row"><span class="chip">Retos superados: ${st.passed || 0}</span><span class="chip">Mejor racha: ${st.bestStreak || 0}</span><span class="chip">Mensajes: ${st.chat || 0}</span></div></div>
      <div class="card" style="margin-top:12px"><h3>🧭 Todos los equipos</h3><div class="teamsgrid">${v.teams.map((t) => `<div class="teamcell ${t.id === team.id ? 'mine' : ''}">${MV.shield(t.shield, 52)}<b>${esc(t.name)}</b><small class="muted">${t.score} pts</small></div>`).join('')}</div></div>
      <div class="center" style="margin-top:14px"><button class="btn ghost sm" data-act="leave">Salir de la partida</button></div>`;
    setHTML(box, html);
  }

  function renderFinal() {
    const box = $('#view-final');
    if (!box._done) { box._done = true; }
    setHTML(box, MV.finalHTML(v, v.me.teamId));
  }

  // ---------------------------------------------------------------- Chat
  function renderChatAll() {
    const box = $('#msgs');
    box.innerHTML = '';
    chat.forEach((m) => box.appendChild(MV.chatNode(m, v && v.me ? v.me.pid : session && session.pid)));
    box.scrollTop = box.scrollHeight;
  }
  function addChat(m) {
    if (chat.some((x) => x.id === m.id)) return;
    chat.push(m);
    if (chat.length > 150) chat.shift();
    const box = $('#msgs');
    const near = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    box.appendChild(MV.chatNode(m, v && v.me ? v.me.pid : session && session.pid));
    if (near || (m.pid && v && v.me && m.pid === v.me.pid)) box.scrollTop = box.scrollHeight;
    if (m.pid && v && v.me && m.pid !== v.me.pid) MV.sfx.play('msg');
  }
  const QUICK = ['🤔 Yo creo que es…', '✅ Votemos', '🔒 ¿Bloqueamos?', '🙋 No estoy seguro', '⏱️ Rápido, que falta poco'];
  function renderQuick() {
    const q = $('#quick');
    if (q._ok) return;
    q._ok = true;
    q.innerHTML = QUICK.map((t) => `<button type="button" data-q="${esc(t)}">${esc(t)}</button>`).join('');
  }

  // ---------------------------------------------------------------- Reloj de la interfaz
  function tickUI() {
    if (!v || !v.me) return;
    const now = MV.now();
    const r = rnd();
    // cuentas regresivas genéricas
    $$('[data-cd]').forEach((el) => { el.textContent = Math.max(0, Math.ceil((+el.dataset.cd - now) / 1000)); });
    // overlay de intro
    const ov = $('#overlay');
    if (v.phase === 'intro' && r && !v.paused) {
      const left = Math.max(1, Math.ceil((r.tStart - now) / 1000));
      if (ov.classList.contains('hidden') || ov.dataset.rid !== r.id) {
        ov.dataset.rid = r.id; ovNum = null;
        const th = r.theme || v.theme;
        const sub = r.kind === 'roulette' ? '¡Cada equipo gira su ruleta!' : r.kind === 'memory' ? '¡Memoricen bien!' : r.kind === 'boss' ? '¡El jefe final aparece!' : r.semi ? '¡Gran semifinal!' : `${th.emoji} ${th.name}`;
        ov.innerHTML = `<div><div class="ov-sub">Reto ${r.idx + 1} de ${v.plan.length}</div><div class="ov-icon">${r.icon}</div><div class="ov-kind">${esc(r.label)}</div><div class="ov-sub" style="margin-top:6px">${esc(sub)}</div><div class="ov-count" id="ovn">${left}</div></div>`;
        ov.classList.remove('hidden');
      }
      if (left !== ovNum) { ovNum = left; const n = $('#ovn'); if (n) { n.textContent = left; n.style.animation = 'none'; void n.offsetHeight; n.style.animation = ''; } MV.sfx.play('count'); }
    } else if (!ov.classList.contains('hidden')) ov.classList.add('hidden');
    // temporizador del reto
    const tm = $('#timer');
    if (tm && r && r.state === 'active' && r.mine) {
      const dl = r.mine.deadline;
      const rem = dl - now;
      const total = Math.max(1000, dl - r.tStart);
      tm.querySelector('.t').textContent = MV.fmtTimer(rem);
      tm.querySelector('.bar i').style.width = Math.max(0, Math.min(100, (rem / total) * 100)) + '%';
      const low = rem <= 10000 && rem > 0;
      tm.classList.toggle('low', low);
      tm.classList.toggle('out', rem <= 0);
      const sec = Math.ceil(rem / 1000);
      if (low && sec !== tickSec && !v.paused) { tickSec = sec; MV.sfx.play(sec <= 3 ? 'warn' : 'tick'); }
      const out = rem <= 0;
      const to = $('#timeout');
      if (to) to.classList.toggle('hidden', !out);
      if (out) $$('#acard .opt, #acard [data-act="lock"], #acard [data-act="up"], #acard [data-act="down"]').forEach((b) => { b.disabled = true; });
    } else if (r && r.state !== 'active') tickSec = -1;
  }
  setInterval(() => { try { tickUI(); } catch (e) { /* noop */ } }, 200);

  // ---------------------------------------------------------------- Eventos
  $('#joinForm').addEventListener('submit', (e) => {
    e.preventDefault();
    MV.sfx.unlock();
    const name = $('#jname').value.trim();
    const code = $('#jcode').value.trim().toUpperCase();
    if (!name || !code) return;
    MV.store.set('mv_lastname', name);
    if (!conn.send({ t: 'join', name, code })) showJoin('Sin conexión con el servidor. Reintentando…');
  });
  $('#jcode').addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
  $('#jname').value = MV.store.get('mv_lastname') || '';
  if (params.get('c')) $('#jcode').value = params.get('c').toUpperCase().slice(0, 5);

  $('#chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const i = $('#chatIn');
    const text = i.value.trim();
    if (!text) return;
    conn.send({ t: 'chat', text });
    i.value = '';
  });
  $('#quick').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-q]');
    if (!b) return;
    const i = $('#chatIn');
    i.value = (i.value ? i.value + ' ' : '') + b.dataset.q;
    i.focus();
  });
  $('#guessForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const i = $('#gin');
    const text = i.value.trim();
    if (!text) return;
    conn.send({ t: 'guess', text });
    i.value = '';
  });
  $('#bottomNav').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-tab]');
    if (!b) return;
    tab = b.dataset.tab;
    render();
  });
  $('#top').addEventListener('click', (e) => {
    if (e.target.closest('#sndBtn')) { MV.sfx.toggle(); render(); }
  });
  $('#powers').addEventListener('click', (e) => {
    const el = e.target.closest('.pw');
    if (!el) return;
    const p = el.dataset.pw;
    const team = myTeam();
    if (p === 'shield') { MV.toast('🛡️ El escudo se activa solo cuando el equipo está a punto de perder puntos.'); return; }
    if (!canUse(p, team, rnd())) {
      const why = (team.powers[p] || 0) <= 0 ? 'Todavía no tienen ese poder. ¡Consíganlo en la ruleta o en bonus!' : 'Ese poder no se puede usar ahora.';
      MV.toast(why, 'warn');
      return;
    }
    if (p === 'steal') { openSteal(); return; }
    conn.send({ t: 'power', power: p });
    MV.sfx.play('power');
  });

  function openSteal() {
    const mt = myTeam();
    const list = v.teams.filter((t) => t.id !== mt.id).sort((a, b) => b.score - a.score);
    const m = $('#stealModal');
    m.innerHTML = `<div class="card"><h2>🦝 ¿A quién le roban 40 puntos?</h2><p class="muted">Si el equipo elegido tiene escudo, el robo se bloquea (y el escudo se gasta).</p><div class="teamsgrid">${list.map((t) => `<button class="teamcell" data-t="${t.id}" style="color:inherit">${MV.shield(t.shield, 52)}<b>${esc(t.name)}</b><small class="muted">${t.score} pts ${t.powers.shield ? '· 🛡️' : ''}</small></button>`).join('')}</div><div class="center" style="margin-top:12px"><button class="btn ghost" data-close="1">Cancelar</button></div></div>`;
    m.classList.remove('hidden');
  }
  $('#stealModal').addEventListener('click', (e) => {
    const b = e.target.closest('[data-t]');
    if (b) { conn.send({ t: 'power', power: 'steal', target: b.dataset.t }); MV.sfx.play('steal'); $('#stealModal').classList.add('hidden'); return; }
    if (e.target.closest('[data-close]') || e.target === $('#stealModal')) $('#stealModal').classList.add('hidden');
  });

  // Delegación de acciones del área de respuestas y del equipo
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    const r = rnd();
    const m = r && r.mine;
    switch (b.dataset.act) {
      case 'opt': conn.send({ t: 'draft', value: +b.dataset.i }); MV.sfx.play('tick'); break;
      case 'tf': conn.send({ t: 'draft', value: b.dataset.v === '1' }); MV.sfx.play('tick'); break;
      case 'lock': conn.send({ t: 'lock' }); MV.sfx.play('lock'); break;
      case 'spin': conn.send({ t: 'spin' }); break;
      case 'up': case 'down': {
        const pub = curPub(r);
        if (!pub || pub.type !== 'order') break;
        const d = (Array.isArray(m.draft) ? m.draft : pub.items.map((_, i) => i)).slice();
        const i = +b.dataset.i; const j = b.dataset.act === 'up' ? i - 1 : i + 1;
        if (j < 0 || j >= d.length) break;
        [d[i], d[j]] = [d[j], d[i]];
        conn.send({ t: 'draft', value: d });
        break;
      }
      case 'leave':
        if (confirm('¿Seguro que quieres salir de la partida?')) { MV.store.del('mv_session'); session = null; location.reload(); }
        break;
      default: break;
    }
  });
})();
