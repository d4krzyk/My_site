// kurtyna przejścia między działami: z góry spada kod sigili w kolorze celu i zasłania ekran, strona się podmienia,
// potem sigile ściekają w dół i odsłaniają nową podstronę. Płótno żyje w <body>, więc przetrwa nawigację po stronie.
import { RM, bth, makeGlyph, drawGlyph } from './core';

const PAL = { krzyk: ['#3ff0ff', '#0e7c8a', '#062f36'], maszynologia: ['#ff3a3a', '#a8161f', '#3c070b'], brama: ['#dfe2e8', '#6e717d', '#1c1d24'], sigen: ['#ffffff', '#c4121d', '#3c070b'] };
const PX = 3, CW = 9;            // piksel płótna (px ekranu), szerokość kolumny sigili (px płótna)
let busy = false, phaseNow = null;
export const veilPhase = () => phaseNow;             // 'in' | 'hold' | 'out' | null — czytane przez ready.js

function sprites(cols) {
  const out = [];
  while (out.length < 18) { const g = makeGlyph(); if (g.st.length < 2) continue;
    const c = document.createElement('canvas'); c.width = c.height = 9; const x = c.getContext('2d'); x.lineWidth = 1;
    x.strokeStyle = x.fillStyle = cols; drawGlyph(g, x, 1, 1, 7); out.push(c); }
  return out;
}

export function veilGo(href, kind, navigate) {
  if (busy) return; busy = true;
  const [hi, mid, deep] = PAL[kind] || PAL.brama;
  if (RM) { navigate(href); busy = false; return; }
  const cv = document.createElement('canvas'); cv.className = 'veil';
  cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100svh;z-index:200;image-rendering:pixelated;pointer-events:none';
  (document.getElementById('veil') || document.body).appendChild(cv);      // #veil z layoutu: React go nie przebudowuje przy zmianie strony
  const W = Math.ceil(innerWidth / PX), H = Math.ceil(innerHeight / PX); cv.width = W; cv.height = H;
  const x = cv.getContext('2d'); x.imageSmoothingEnabled = false;
  const SH = sprites(hi), SM = sprites(mid);
  const NC = Math.ceil(W / CW), col = Array.from({ length: NC }, (_, i) => ({ d: Math.random() * 260 + Math.abs(i - NC / 2) / NC * 120, v: .55 + Math.random() * .5, g: Array.from({ length: Math.ceil(H / 10) + 4 }, () => Math.floor(Math.random() * 18)) }));
  const shade = x.createImageData(W, H), S = shade.data;
  const [dr, dg, db] = [5, 4, 8];
  let phase = 'in', t0 = performance.now(), from = location.pathname, arrived = 0, last = 0;
  phaseNow = 'in';
  const open = () => { phase = 'out'; phaseNow = 'out'; dispatchEvent(new Event('veil-open')); };   // podstrona może ruszać ze swoimi animacjami
  const DIN = 760, DOUT = 900;
  const frame = now => {
    if (now - last < 1000 / 30) { requestAnimationFrame(frame); return; } last = now;
    const t = now - t0;
    // granica zasłonięcia dla każdej kolumny: przy wejściu rośnie z góry, przy wyjściu z góry ubywa
    const edge = col.map(c => phase === 'in' ? (t - c.d) * c.v * H / (DIN * .55) : phase === 'hold' ? -40 : (t - c.d) * c.v * H / (DOUT * .55));   // w czasie podmiany strony ekran zasłonięty
    for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {
      const e = edge[Math.min(NC - 1, (xx / CW) | 0)], i = (y * W + xx) * 4; let a;
      if (phase === 'in') { const dd = e - y; a = dd <= 0 ? 0 : dd > 24 ? 1 : dd / 24 > bth(xx, y) ? 1 : 0; }
      else { const dd = y - e; a = dd <= 0 ? 0 : dd > 24 ? 1 : dd / 24 > bth(xx, y) ? 1 : 0; }
      S[i] = dr; S[i + 1] = dg; S[i + 2] = db; S[i + 3] = a ? 255 : 0;
    }
    x.putImageData(shade, 0, 0);
    // sigile: jasne przy czole (wejście) albo przy ogonie (wyjście), dalej przygaszone
    col.forEach((c, k) => { const e = edge[k], cx = k * CW;
      for (let j = 0; j < c.g.length; j++) {
        const gy = phase === 'in' ? e - 10 - j * 10 : e + 4 + j * 10; if (gy < -10 || gy > H) continue;
        if (phase === 'in' && gy > e) continue;
        const near = j < 2, spr = (near ? SH : SM)[(c.g[j] + ((t / 120) | 0) * (j === 0 ? 1 : 0)) % 18];
        if (!near && (j + k + ((t / 90) | 0)) % 3 === 0) continue;
        x.globalAlpha = near ? 1 : Math.max(.15, .8 - j * .05); x.drawImage(spr, cx, Math.round(gy)); }
      x.globalAlpha = 1; });
    if (phase === 'in' && edge.every(e => e > H + 30)) {
      phase = 'hold'; phaseNow = 'hold'; navigate(href);
    }
    if (phase === 'hold') {
      if (location.pathname !== from && !arrived) arrived = now;
      if (arrived && now - arrived > 280) { open(); t0 = now; col.forEach(c => { c.d = Math.random() * 220; c.v = .5 + Math.random() * .55; }); }
      if (!arrived && t > 6000) { open(); t0 = now; }
    }
    if (phase === 'out' && edge.every(e => e > H + 30)) { cv.remove(); busy = false; phaseNow = null; return; }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
