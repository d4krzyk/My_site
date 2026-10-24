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

export function initKrzykFx(sec) {
  const offs = [];
  // stempel KRZYK: wywoływany z ciemności, potem nabiera czerwieni
  const st = sec.querySelector('.k-stamp');
  if (st) { const go = () => sec.classList.add('dev'); if (st.complete) requestAnimationFrame(go); else st.addEventListener('load', go, { once: true }); }
  // hasło kolażu pisane maszyną, po pierwszym naświetleniu stempla
  const mot = [...sec.querySelectorAll('.k-motto [data-t]')];
  mot.forEach((m, i) => prep(m, 31 + i));
  (async () => { await (document.fonts ? document.fonts.load('34px "Special Elite K"').catch(() => {}) : 0);
    for (let i = 0; i < mot.length; i++) await typeOut(mot[i], { seed: 31 + i, delay: i ? 260 : 1500 }); })();
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
