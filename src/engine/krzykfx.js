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

// wczytanie kolażu: reszta kolażu stoi od razu, a pięć zdjęć (oko, dwa portrety, kamienica, staw) rozwija się klatkami jak zwinięty papier
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
    const STEP = 1000 / 12, ROLL = 640, GAP = 330;
    const P = meta.pieces.map((p, i) => ({ ...p, im: ims[i], hf: ph && LEFT.has(p.n) ? 'L' : 'R', t0: 300 + i * GAP }));
    const order = meta.stack.map(n => P.find(p => p.n === n)).filter(Boolean);
    const ground = h => { const T = half(h); x.drawImage(gr, T.cx0, 0, T.cx1 - T.cx0, meta.h, T.ox + T.cx0 * T.s, T.oy, (T.cx1 - T.cx0) * T.s, meta.h * T.s); };
    const piece = (p, t) => { if (!p.im) return; const T = half(p.hf), raw = (t - p.t0) / ROLL; if (raw <= 0) return;
      const k = Math.min(1, Math.round(Math.min(1, raw) * 8) / 8);                 // klatkowo: 8 kroków rozwijania
      const X = T.ox + p.x * T.s, Y = T.oy + p.y * T.s, Wd = p.w * T.s, Ht = p.h * T.s, hor = p.dir === 'r', len = (hor ? Wd : Ht) * k;
      x.save(); x.beginPath(); x.rect(T.ox + T.cx0 * T.s, T.oy, (T.cx1 - T.cx0) * T.s, meta.h * T.s); x.clip();
      x.beginPath(); if (hor) x.rect(X, Y, len, Ht); else if (p.dir === 'd') x.rect(X, Y, Wd, len); else x.rect(X, Y + Ht - len, Wd, len); x.clip();
      x.drawImage(p.im, X, Y, Wd, Ht); x.restore();
      if (k < 1) { // zwinięta rolka papieru na krawędzi: jasny wałek z cieniem
        const rw = Math.max(4, 11 * T.s); x.save();
        let g; if (hor) { const ex = X + len; g = x.createLinearGradient(ex, 0, ex + rw, 0); x.translate(0, 0); g.addColorStop(0, '#2a2420'); g.addColorStop(.35, '#e9e1cd'); g.addColorStop(.7, '#b9ad94'); g.addColorStop(1, '#3a332c'); x.fillStyle = g; x.fillRect(ex, Y - rw * .15, rw, Ht + rw * .3);
          x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(ex + rw, Y, rw * .8, Ht); }
        else { const ey = p.dir === 'd' ? Y + len : Y + Ht - len - rw; g = x.createLinearGradient(0, ey, 0, ey + rw); g.addColorStop(0, '#2a2420'); g.addColorStop(.35, '#e9e1cd'); g.addColorStop(.7, '#b9ad94'); g.addColorStop(1, '#3a332c'); x.fillStyle = g; x.fillRect(X - rw * .15, ey, Wd + rw * .3, rw);
          x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(X, p.dir === 'd' ? ey + rw : ey - rw * .8, Wd, rw * .8); }
        x.restore(); } };
    const END = P[P.length - 1].t0 + ROLL + 200; let t0 = null, last = -1;
    const frame = now => { if (t0 === null) t0 = now; const t = now - t0, st = Math.floor(t / STEP);
      if (st !== last) { last = st; x.clearRect(0, 0, cv.width, cv.height);
        if (ph) { ground('L'); order.filter(p => p.hf === 'L').forEach(p => piece(p, t)); ground('R'); order.filter(p => p.hf === 'R').forEach(p => piece(p, t)); }
        else { ground('R'); order.forEach(p => piece(p, t)); }
        cv.classList.add('drawn'); }
      if (t < END) requestAnimationFrame(frame); else { cv.classList.add('done'); setTimeout(() => cv.remove(), 450); done(); } };
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
    for (let i = 0; i < mot.length; i++) await typeOut(mot[i], { seed: 31 + i, delay: i ? 260 : 1500 });
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
