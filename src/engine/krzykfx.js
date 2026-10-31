// działu Krzyk: pismo jak ze starej maszyny (hasło kolażu, wersy w tle, podpisy), stempel KRZYK wywoływany jak odbitka w ciemni
import { RM } from './core';

const BONE = '#e3d6b4', ICE = '#9dbee2';
const LYR = ['serce jest w klatce, a umysł wciąż wolny', 'chciałem spokojnie, ale nie dacie żyć', 'Moje życie to sen, proszę obudź mnie',
  'ale żyjemy nocą, więc gramy w tę grę', 'zapętlony  zapętlony  zapętlony', 'polarny świt', 'good night world'];
// wersy jak warstwa ergo kolażu: rozmiar (px kolażu 1280), krycie, rozmycie, kolor
const STY = [[56, .12, 0, BONE], [34, .09, 1.2, BONE], [50, .11, 0, ICE], [30, .10, 0, BONE], [34, .11, 0, ICE], [88, .07, 2.4, BONE], [64, .08, 1.4, BONE]];

function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

// rozbija tekst na litery: każda z lekkim przesunięciem linii i nierównym tuszem, jak z wysłużonej maszyny
function prep(el, seed) {
  if (el.dataset.prep) return [...el.querySelectorAll('.tw')];
  const r = rng(seed), txt = el.textContent; el.textContent = ''; el.dataset.prep = 1;
  el.setAttribute('aria-label', txt);
  return [...txt].map(ch => { const s = document.createElement('span'); s.className = 'tw'; s.textContent = ch; s.setAttribute('aria-hidden', 'true');
    s.style.setProperty('--dy', ((r() - .5) * .09).toFixed(3) + 'em'); s.style.setProperty('--ink', (.72 + r() * .28).toFixed(2));
    if (r() < .06) s.style.setProperty('--dx', ((r() - .5) * .06).toFixed(3) + 'em'); el.appendChild(s); return s; });
}
// pisze litera po literze: nierówne tempo, dłuższe pauzy po spacji i przecinku
export function typeOut(el, { seed = 7, speed = 1, delay = 0 } = {}) {
  const sp = prep(el, seed); if (RM) { sp.forEach(s => s.classList.add('on')); return Promise.resolve(); }
  const r = rng(seed + 3);
  return new Promise(res => { let i = 0;
    const step = () => { if (i >= sp.length) return res(); const s = sp[i++]; s.classList.add('on', 'hit'); setTimeout(() => s.classList.remove('hit'), 90);
      const ch = s.textContent; setTimeout(step, ((ch === ' ' ? 110 : /[,.]/.test(ch) ? 230 : 38) + r() * 70) / speed); };
    setTimeout(step, delay); });
}

// ponowne złożenie liter z nowego tekstu (zmiana języka): bez animacji (instant) albo z cofnięciem starego i napisaniem nowego
export function reprep(el, text, seed = 7, instant = false) { delete el.dataset.prep; el.textContent = text; const sp = prep(el, seed); if (instant || RM) sp.forEach(s => s.classList.add('on')); return sp; }
export async function retype(el, text, { seed = 7, speed = 1.6, delay = 0 } = {}) {
  const old = [...el.querySelectorAll('.tw.on')].reverse(), step = Math.min(14, 240 / Math.max(1, old.length)), id = el._rt = (el._rt || 0) + 1;
  if (RM) { reprep(el, text, seed, true); return; }
  old.forEach((s, i) => setTimeout(() => s.classList.remove('on'), delay + i * step));
  await new Promise(r => setTimeout(r, delay + old.length * step + 50));
  if (el._rt !== id) return;                               // nowsza zmiana języka wyprzedziła tę
  reprep(el, text, seed); return typeOut(el, { seed, speed });
}

// wczytanie kolażu: tło kolażu stoi od razu (bez zdjęć i ich cieni); zdjęcia wypełniają się wstecz, jakby ktoś je podgryzał do tyłu w czasie:
// oko od prawego górnego rogu do lewego dolnego, kamienica od prawej, portret od lewej, staw przykleja się jak naklejka, drugi portret zwija się z góry rulonem
const hash = (x, y) => { let n = Math.imul(x * 374761393 + y * 668265263, 1274126177); n ^= n >>> 13; n = Math.imul(n, 1103515245); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
function thresholds(w, h, frm) {
  // T[i] = moment (0..1), w którym piksel „wraca”: kierunek + poszarpane, okrągłe ugryzienia (worley) + drobne strzępy
  const T = new Float32Array(w * h), CS = Math.max(14, Math.round(Math.min(w, h) / 9));
  const gx = Math.ceil(w / CS) + 2, gy = Math.ceil(h / CS) + 2, px = new Float32Array(gx * gy), py = new Float32Array(gx * gy);
  for (let j = 0; j < gy; j++) for (let i = 0; i < gx; i++) { px[j * gx + i] = (i + hash(i, j * 7 + 1)) * CS; py[j * gx + i] = (j + hash(i * 5 + 3, j)) * CS; }
  const proj = (u, v) => frm === 'tr' ? ((1 - u) * w + v * h) / (w + h) : frm === 'r' ? 1 - u : frm === 'l' ? (u * .8 + v * .2) : v;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ci = Math.floor(x / CS) + 1, cj = Math.floor(y / CS) + 1; let d = 1e9;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const k = (cj + dj) * gx + ci + di, dx = px[k] - CS - x, dy = py[k] - CS - y; const dd = dx * dx + dy * dy; if (dd < d) d = dd; }
    const wo = Math.min(1, Math.sqrt(d) / CS), p = proj(x / w, y / h);
    T[y * w + x] = p * .78 + wo * .13 + hash(x >> 1, y >> 1) * .035 + hash(x, y) * .02 + .02;
  }
  return T;
}
function assemble(sec, url) {
  const cv = sec.querySelector('.k-asm'); if (!cv) return Promise.resolve();
  if (RM) { cv.remove(); return Promise.resolve(); }
  const load = n => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = url(n); });
  return fetch(url('pieces.json')).then(r => r.json()).then(meta => Promise.all([load('ground.webp'), ...meta.pieces.map(p => load(p.n + '.webp'))]).then(([gr, ...ims]) => new Promise(done => {
    if (!gr) { cv.remove(); return done(); }
    const ph = sec.clientWidth <= 700, x = cv.getContext('2d');
    const r0 = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(r0.width * dpr); cv.height = Math.round(r0.height * dpr);
    const LEFT = new Set(['portrait', 'house']);
    // komputer: cały kolaż; telefon: prawa połówka (x ≥ 455) u góry, lewa (x < 526) niżej, jak na tle
    const half = h => { const cw = cv.width; if (!ph) return { s: cw / 1280, ox: 0, oy: 0, cx0: 0, cx1: 1280 };
      return h === 'L' ? { s: cw / 526, ox: 0, oy: 700 / 720 * cw, cx0: 0, cx1: 526 } : { s: cw / 825, ox: -455 * cw / 825, oy: 0, cx0: 455, cx1: 1280 }; };
    // piksele sprite'ów i mapy progów (liczone raz)
    const P = meta.pieces.map((p, i) => {
      const o = { ...p, im: ims[i], hf: ph && LEFT.has(p.n) ? 'L' : 'R' }; if (!o.im) return o;
      const c = document.createElement('canvas'); c.width = p.w; c.height = p.h; const cx = c.getContext('2d', { willReadFrequently: true }); cx.drawImage(o.im, 0, 0);
      o.src = cx.getImageData(0, 0, p.w, p.h); o.out = cx.createImageData(p.w, p.h); o.cv = c; o.cx = cx;
      if (p.mode === 'bite') o.T = thresholds(p.w, p.h, p.frm); return o; });
    const STEP = 1000 / 15, STEPS = 14;
    const ground = h => { const T = half(h); x.drawImage(gr, T.cx0, 0, T.cx1 - T.cx0, meta.h, T.ox + T.cx0 * T.s, T.oy, (T.cx1 - T.cx0) * T.s, meta.h * T.s); };
    const shadow = (T, on, k) => { if (!on) { x.shadowColor = 'transparent'; return; } x.shadowColor = 'rgba(0,0,0,.65)'; x.shadowBlur = 14 * T.s * dpr; x.shadowOffsetX = 6 * T.s; x.shadowOffsetY = 9 * T.s * (1 + (1 - k) * 1.2); };
    const piece = (p, t) => { if (!p.im || !p.src) return; const T = half(p.hf), raw = (t - p.t0) / p.dur; if (raw < 0 && !(p.k0 > 0)) return;
      const kq = Math.min(1, Math.max(0, Math.floor(Math.max(0, raw) * STEPS) / STEPS)), k = p.k0 + (1 - p.k0) * kq;
      const X = T.ox + p.x * T.s, Y = T.oy + p.y * T.s, Wd = p.w * T.s, Ht = p.h * T.s;
      x.save(); x.beginPath(); x.rect(T.ox + T.cx0 * T.s, T.oy, (T.cx1 - T.cx0) * T.s, meta.h * T.s); x.clip();
      if (p.mode === 'bite') {
        const s = p.src.data, d = p.out.data, TT = p.T, n = p.w * p.h, lim = k * 1.05, rim = lim - .045;
        for (let i = 0, j = 0; i < n; i++, j += 4) { const th = TT[i];
          if (th > lim || s[j + 3] === 0) { d[j + 3] = 0; continue; }
          if (th > rim) { d[j] = s[j] * .35 + 214 * .65; d[j + 1] = s[j + 1] * .35 + 206 * .65; d[j + 2] = s[j + 2] * .35 + 184 * .65; d[j + 3] = s[j + 3]; }   // świeżo odgryziony brzeg: biel kartki
          else { d[j] = s[j]; d[j + 1] = s[j + 1]; d[j + 2] = s[j + 2]; d[j + 3] = s[j + 3]; } }
        p.cx.putImageData(p.out, 0, 0); shadow(T, true, k); x.drawImage(p.cv, X, Y, Wd, Ht);
      } else if (p.mode === 'sticker') {
        if (raw < 0) { x.restore(); return; }
        const e = Math.min(1, raw), step = Math.floor(e * 4) / 4, sc = 1.22 - .22 * step, rot = (-.1 + .1 * step), pop = step >= 1 ? 1 : .55 + .45 * step;
        x.translate(X + Wd / 2, Y + Ht / 2); x.rotate(rot); x.scale(sc, sc); x.globalAlpha = pop; shadow(T, true, step);
        x.drawImage(p.im, -Wd / 2, -Ht / 2, Wd, Ht);
      } else { // roll: zwija się z góry, rulon na brzegu natarcia
        if (raw < 0) { x.restore(); return; }
        const len = Ht * Math.min(1, Math.floor(Math.min(1, raw) * 10) / 10);
        x.save(); x.beginPath(); x.rect(X, Y, Wd, len); x.clip(); shadow(T, true, 1); x.drawImage(p.im, X, Y, Wd, Ht); x.restore();
        if (len < Ht) { const rw = Math.max(4, 11 * T.s), g = x.createLinearGradient(0, Y + len, 0, Y + len + rw);
          g.addColorStop(0, '#2a2420'); g.addColorStop(.35, '#e9e1cd'); g.addColorStop(.7, '#b9ad94'); g.addColorStop(1, '#3a332c'); x.fillStyle = g; x.fillRect(X - rw * .15, Y + len - rw * .5, Wd + rw * .3, rw); }
      }
      x.restore(); };
    const ENDT = Math.max(...P.map(p => p.t0 + p.dur)) + 120; let t0 = null, last = -1, signalled = false;
    const frame = now => { if (t0 === null) t0 = now; const t = now - t0, st = Math.floor(t / STEP);
      if (st !== last) { last = st; x.clearRect(0, 0, cv.width, cv.height);
        if (ph) { ground('L'); P.filter(p => p.hf === 'L').forEach(p => piece(p, t)); ground('R'); P.filter(p => p.hf === 'R').forEach(p => piece(p, t)); }
        else { ground('R'); P.forEach(p => piece(p, t)); }
        cv.classList.add('drawn'); }
      if (!signalled && t > ENDT * .72) { signalled = true; done(); }           // stempel startuje, zanim ostatnie zdjęcie dojedzie
      if (t < ENDT) requestAnimationFrame(frame); else { cv.classList.add('done'); setTimeout(() => cv.remove(), 380); } };
    requestAnimationFrame(frame);
  }))).catch(() => { cv.remove(); });
}

export function initKrzykFx(sec, opts = {}) {
  const offs = [];
  // najpierw kolaż składa się z wycinków, potem stempel KRZYK wywołuje się z ciemności, a hasło pisze się maszyną
  const st = sec.querySelector('.k-stamp');
  const mot = [...sec.querySelectorAll('.k-motto [data-t]')];
  mot.forEach((m, i) => prep(m, 31 + i));
  (async () => {
    if (opts.pieces) await assemble(sec, opts.pieces);
    if (st) await new Promise(r => { if (st.complete) r(); else st.addEventListener('load', r, { once: true }); });
    sec.classList.add('dev');
    await (document.fonts ? document.fonts.load('34px "Special Elite K"').catch(() => {}) : 0);
    for (let i = 0; i < mot.length; i++) await typeOut(mot[i], { seed: 31 + i, delay: i ? 200 : 900 });
  })();
  // podpisy i nagłówki pisane, gdy wjadą w kadr
  const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; io.unobserve(e.target);
    typeOut(e.target, { seed: +(e.target.dataset.seed || 5), speed: +(e.target.dataset.speed || 1) }); }), { threshold: .6 });
  const watch = () => sec.querySelectorAll('[data-type]:not([data-prep])').forEach((el, i) => { prep(el, 50 + i); io.observe(el); });
  // wersy w tle: poziome, wchodzą z lewej albo z prawej krawędzi, w skupiskach jak w kolażu
  const box = sec.querySelector('.k-lines');
  const build = () => {
    if (!box) return; box.textContent = '';
    const W = sec.clientWidth, H = sec.scrollHeight, cq = W / 100, ph = W <= 700, k = ph ? 1.45 : 1, r = rng(1404);
    let y = 80 * cq, side = r() < .5, n = 0;
    while (y < H - 46 * cq) {
      const lines = 1 + Math.floor(r() * 3); let dy = 0;
      for (let j = 0; j < lines; j++) {
        const [sz, op, bl, col] = STY[Math.floor(r() * STY.length)], fs = sz / 12.8 * k * cq;
        const el = document.createElement('div'); el.className = 'k-line ' + (side ? 'l' : 'r'); el.textContent = LYR[Math.floor(r() * LYR.length)];
        el.style.cssText = `top:${(y + dy).toFixed(0)}px;font-size:${fs.toFixed(1)}px;color:${col};opacity:${op};--shift:${(4 + r() * 26).toFixed(1)}%;${bl ? `filter:blur(${(bl * k * cq / 12.8).toFixed(2)}px);` : ''}`;
        el.dataset.seed = 100 + n++; el.dataset.speed = 1.6; box.appendChild(el); dy += fs * (.75 + r() * .5);
      }
      y += dy + (ph ? 230 : 330) + r() * (ph ? 260 : 380); if (r() < .8) side = !side;
    }
    box.querySelectorAll('.k-line').forEach(el => { prep(el, +el.dataset.seed); io.observe(el); });
  };
  let tm; const re = () => { clearTimeout(tm); tm = setTimeout(build, 200); };
  build(); watch();
  const ro = new ResizeObserver(re); ro.observe(sec); offs.push(() => ro.disconnect());
  return () => { offs.forEach(f => f()); io.disconnect(); };
}
