// przewijanie sekcjami w retro stylu (tylko mysz/klawiatura na komputerze; dotyk i „reduce motion" przewijają normalnie)
//  · Krzyk, wariant A „taśma": skok do sekcji w 4 klatkach (~8 kl./s) z perforacją po bokach, przesuwającą się linią
//    między klatkami, błyskiem migawki i licznikiem klatek
//  · Krzyk, wariant B „blok": sztywny skok 1 klatka/krok: ekran gaśnie ditherem, podmiana sekcji, dither ustępuje
//  · Maszynologia, wariant C „pager": przewijanie skokami po wierszach jak `more`, pasek stanu na dole
import { RM, bth } from './core';

const fine = () => matchMedia('(pointer:fine)').matches;
const busyUI = () => document.querySelector('.spread:not([hidden]), .hc-ov, #veil canvas');   // karty, kamera, kurtyna
const typing = e => { const a = document.activeElement; return a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable); };
const jump = y => window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: 'instant' });
// czy element pod kursorem sam się przewija w tym kierunku (np. okno terminala)
const ownScroll = (el, dy) => { for (let n = el; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n);
  if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 1) { if (dy > 0 ? n.scrollTop + n.clientHeight < n.scrollHeight - 1 : n.scrollTop > 0) return true; } } return false; };

function overlay() {
  const cv = document.createElement('canvas'); cv.className = 'klatki'; cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:120;pointer-events:none;image-rendering:pixelated';
  document.body.appendChild(cv); const x = cv.getContext('2d');
  const size = () => { cv.width = Math.ceil(innerWidth / 3); cv.height = Math.ceil(innerHeight / 3); x.imageSmoothingEnabled = false; };
  size(); addEventListener('resize', size);
  return { cv, x, kill: () => { removeEventListener('resize', size); cv.remove(); } };
}

// wspólne sterowanie: kółko (z gaszeniem bezwładności gładzika) i klawisze; go(kierunek, rodzaj) zwraca obietnicę końca animacji,
// rodzaj: 'wheel' | 'page' (PgDn/PgUp/spacja) | 'line' (strzałki)
function driver(go, step = 1) {
  let lock = false, acc = 0, quietT = 0, cool = false, lastWheel = 0;
  // po skoku dalsze zdarzenia kółka ignorujemy tylko, jeśli wciąż napływają (bezwładność), a nie przy następnym ruchu ręki
  const fire = (d, kind) => { if (lock) return; lock = true; Promise.resolve(go(d, kind)).finally(() => { lock = false; cool = kind === 'wheel' && performance.now() - lastWheel < 160; }); };
  const wheel = e => {
    if (!fine() || RM || busyUI() || e.ctrlKey || ownScroll(e.target, e.deltaY)) return;
    e.preventDefault(); lastWheel = performance.now();
    clearTimeout(quietT); quietT = setTimeout(() => { cool = false; acc = 0; }, 160);   // bezwładność gładzika: czekaj na ciszę
    if (lock || cool) return;
    acc += e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    if (Math.abs(acc) >= 40 * step) { const d = Math.sign(acc); acc = 0; fire(d, 'wheel'); }
  };
  const key = e => {
    if (!fine() || RM || busyUI() || typing(e) || e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key, d = (k === 'PageDown' || (k === ' ' && !e.shiftKey) || k === 'ArrowDown') ? 1 : (k === 'PageUp' || (k === ' ' && e.shiftKey) || k === 'ArrowUp') ? -1 : 0;
    if (!d) return; e.preventDefault(); fire(d, k.startsWith('Arrow') ? 'line' : 'page');
  };
  addEventListener('wheel', wheel, { passive: false }); addEventListener('keydown', key);
  return () => { removeEventListener('wheel', wheel); removeEventListener('keydown', key); };
}

export function initKlatki(sec, { mode = 'film' } = {}) {
  // przystanki: góra, pole wyborów, podrozdziały, a w sekcji person każda persona osobno (jej część pod sceną z maskami)
  const points = () => { const s = [0]; sec.querySelectorAll('.k-choose, .k-sub, .kp-part').forEach(el => { const r = el.getBoundingClientRect(), y = r.top + scrollY;
      s.push(el.classList.contains('kp-part') ? y - innerHeight * .42 : el.classList.contains('k-sub') ? y - 34 : y); });
    s.sort((a, b) => a - b); const base = s.filter((v, i) => !i || v - s[i - 1] > 40);
    // gdy odstęp między przystankami jest większy niż okno (wysoki kolaż na szerokim ekranie), dokładamy równo rozłożone przystanki pośrednie,
    // żeby jeden skok nie omijał części strony
    const step = innerHeight * .9, out = [];
    base.forEach((v, i) => { out.push(v); const nxt = base[i + 1]; if (nxt === undefined) return; const n = Math.ceil((nxt - v) / step) - 1; for (let k = 1; k <= n; k++) out.push(v + (nxt - v) * k / (n + 1)); });
    return out; };
  const ov = overlay(); const { cv, x } = ov;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const film = async (y0, y1, idx, n) => {
    const W = cv.width, H = cv.height, F = 4, dir = Math.sign(y1 - y0);
    for (let i = 1; i <= F + 1; i++) {
      if (i <= F) jump(y0 + (y1 - y0) * i / F);
      x.clearRect(0, 0, W, H); if (i > F) break;
      const sw = Math.max(10, Math.round(W * .035)), off = (i * 7 * dir) % 14;
      x.fillStyle = '#050405'; x.fillRect(0, 0, sw, H); x.fillRect(W - sw, 0, sw, H);
      x.fillStyle = '#d9cdb0'; for (let y = -14 + off; y < H + 14; y += 14) { x.fillRect(3, y, sw - 6, 7); x.fillRect(W - sw + 3, y, sw - 6, 7); }
      const ly = dir > 0 ? Math.round(H * (1 - i / F)) : Math.round(H * i / F); x.fillStyle = '#050405'; x.fillRect(sw, ly - 5, W - 2 * sw, 10);   // linia między klatkami
      if (i === 2) { x.fillStyle = 'rgba(255,248,230,.28)'; x.fillRect(sw, 0, W - 2 * sw, H); }                                           // migawka
      x.fillStyle = '#050405'; x.fillRect(sw + 4, 4, 92, 14); x.fillStyle = '#e8dcc0'; x.font = '12px "Krzyk DOS", monospace'; x.textBaseline = 'top';
      x.fillText(`KL. ${String(idx + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')} ${dir > 0 ? '▶▶' : '◀◀'}`, sw + 7, 6);
      await sleep(115);
    }
  };
  const block = async (y0, y1) => {
    const W = cv.width, H = cv.height, seq = [.35, .75, 1, 1, .6, .25, 0];
    for (let k = 0; k < seq.length; k++) { if (k === 3) jump(y1);
      const a = seq[k], img = x.createImageData(W, H), D = img.data;
      for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) if (bth(xx, yy) < a) { const i = (yy * W + xx) * 4; D[i] = 4; D[i + 1] = 5; D[i + 2] = 10; D[i + 3] = 255; }
      x.putImageData(img, 0, 0); await sleep(85); }
    x.clearRect(0, 0, W, H);
  };
  const go = d => { const P = points(), y = scrollY; let cur = 0; P.forEach((p, i) => { if (p <= y + 12) cur = i; });
    // w środku wysokiej sekcji: najpierw dojedź do jej końca, potem dalej
    let to = Math.max(0, Math.min(P.length - 1, cur + Math.sign(d)));
    if (d < 0 && y > P[cur] + 12) to = cur;
    const target = to === P.length - 1 && d > 0 ? Math.min(P[to], document.documentElement.scrollHeight - innerHeight) : P[to];
    if (Math.abs(target - y) < 4) { if (d > 0 && to === P.length - 1) return jump(document.documentElement.scrollHeight); return; }
    return mode === 'block' ? block(y, target) : film(y, target, to, P.length);
  };
  const off = driver(go);
  return () => { off(); ov.kill(); };
}

// Maszynologia: pager w stylu `more`: kółko i strzałki przewijają co jedną linię tekstu (położenie zawsze równe wielokrotności
// wysokości linii), PgDn/PgUp/spacja o ekran bez 3 linii; pasek stanu na dole. Bez blokad między krokami i bez filtrów na stronie
export function initPager(root) {
  const bar = document.createElement('div'); bar.className = 'pager dos'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
  let hideT = 0, rest = 0;
  const lh = () => { const pre = root.querySelector('#nfo'); return Math.round(pre ? parseFloat(getComputedStyle(pre).fontSize) || 16 : 16); };
  const show = () => { const max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? Math.round(scrollY / max * 100) : 100;
    bar.textContent = p >= 100 ? '(KONIEC)' : `-- WIĘCEJ -- (${p}%)`; bar.classList.add('on'); clearTimeout(hideT); hideT = setTimeout(() => bar.classList.remove('on'), 1400); };
  const move = lines => { const L = lh(), max = document.documentElement.scrollHeight - innerHeight, to = Math.max(0, Math.min(max, Math.round(scrollY / L) * L + lines * L));
    if (to !== scrollY) { window.scrollTo({ top: to, behavior: 'instant' }); show(); } };
  const wheel = e => {
    if (!fine() || RM || busyUI() || e.ctrlKey || ownScroll(e.target, e.deltaY)) return;
    e.preventDefault();
    // gładzik wysyła wiele drobnych zdarzeń: sumujemy piksele i przesuwamy o tyle pełnych linii, ile się uzbierało
    // ząbek kółka (100 px) = 3 linie, jak w terminalu
    rest += (e.deltaMode === 1 ? e.deltaY * lh() : e.deltaY) * .6; const n = Math.trunc(rest / lh()); if (n) { rest -= n * lh(); move(n); }
  };
  const key = e => {
    if (!fine() || RM || busyUI() || typing(e) || e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key, page = Math.max(4, Math.floor(innerHeight / lh()) - 3);
    const n = k === 'ArrowDown' ? 1 : k === 'ArrowUp' ? -1 : k === 'PageDown' || (k === ' ' && !e.shiftKey) ? page : k === 'PageUp' || (k === ' ' && e.shiftKey) ? -page : 0;
    if (n) { e.preventDefault(); move(n); }
  };
  addEventListener('wheel', wheel, { passive: false }); addEventListener('keydown', key);
  return () => { removeEventListener('wheel', wheel); removeEventListener('keydown', key); bar.remove(); };
}
