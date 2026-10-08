# Prueba de interfaz con Playwright: organizador (escritorio) + jugador humano (móvil) + DEMO.
import sys, time, json
from playwright.sync_api import sync_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:3100'
errs = []
def hook(page, name):
    page.on('console', lambda m: errs.append(f'[{name}] console.{m.type}: {m.text}') if m.type in ('error',) else None)
    page.on('pageerror', lambda e: errs.append(f'[{name}] pageerror: {e}'))
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome' if False else None)
    host = b.new_context(viewport={'width': 1400, 'height': 900}).new_page(); hook(host, 'host')
    host.goto(BASE + '/host'); host.wait_for_selector('#themeGrid .thcard')
    host.screenshot(path='test/shots/01-setup.png', full_page=True)
    host.click('#themeGrid [data-theme="harry"]')
    host.click('#demoQuick [data-d="15"]')
    host.click('#demoGo')
    host.wait_for_selector('.code-big'); code = host.inner_text('.code-big').strip()
    print('codigo', code)
    time.sleep(1.2)
    host.screenshot(path='test/shots/02-lobby.png', full_page=True)
    pl = b.new_context(viewport={'width': 390, 'height': 800}, device_scale_factor=2).new_page(); hook(pl, 'player')
    pl.goto(BASE + '/?c=' + code); pl.wait_for_selector('#jname')
    pl.fill('#jname', 'Alex'); pl.screenshot(path='test/shots/03-join.png')
    pl.click('#joinForm button[type=submit]')
    pl.wait_for_selector('#top .tname'); time.sleep(0.8)
    pl.screenshot(path='test/shots/04-player-lobby.png', full_page=True)
    pl.fill('#chatIn', 'Hola equipo!'); pl.press('#chatIn', 'Enter'); time.sleep(0.4)
    host.click('[data-h=start]')
    seen = set(); t0 = time.time()
    while time.time() - t0 < 200:
        ph = pl.evaluate("document.querySelector('#overlay') && !document.querySelector('#overlay').classList.contains('hidden') ? 'intro' : (document.querySelector('#timer') ? 'active' : (document.querySelector('.result') ? 'reveal' : (document.querySelector('#view-final:not(.hidden) .podium') ? 'final' : 'other')))")
        kind = pl.evaluate("(document.querySelector('.kindtag')||{}).textContent||''").strip()
        key = ph + kind
        if ph in ('intro', 'active', 'reveal', 'final') and key not in seen and len(seen) < 40:
            seen.add(key); time.sleep(0.7 if ph != 'intro' else 0.3)
            tag = kind.replace(' ', '').replace('/', '')[:14]
            pl.screenshot(path=f'test/shots/p-{len(seen):02d}-{ph}-{tag}.png', full_page=True)
            if ph == 'active' and len(seen) % 3 == 0: host.screenshot(path=f'test/shots/h-{len(seen):02d}-{tag}.png')
        if ph == 'final': break
        time.sleep(0.5)
    time.sleep(1.5)
    host.screenshot(path='test/shots/99-host-final.png', full_page=True)
    pl.screenshot(path='test/shots/99-player-final.png', full_page=True)
    print('estados vistos:', len(seen), sorted(seen)[:40])
    b.close()
print('ERRORES:', len(errs)); print('\n'.join(errs[:20]))
