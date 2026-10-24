// odkodowanie obrazka z pikseli: piksele zapalają się w rozproszonej kolejności (Bayer) wzdłuż kierunku wzrostu,
// świeże migoczą czerwienią i szarością jak rozkodowywany sygnał, po chwili przyjmują swój kolor
import { bth, RM } from './core';

export function pixelDecode(cv, src, { dir = 'up', dur = 1500 } = {}) {
  const x = cv.getContext('2d'); let img = null, data = null, W = 0, H = 0, pending = null;
  const im = new Image(); im.decoding = 'async';
  im.onload = () => { W = im.naturalWidth; H = im.naturalHeight; cv.width = W; cv.height = H;
    const t = document.createElement('canvas').getContext('2d', { willReadFrequently: true }); t.canvas.width = W; t.canvas.height = H; t.drawImage(im, 0, 0);
    data = t.getImageData(0, 0, W, H); img = im; if (pending != null) run(pending); };
  im.src = src;
  const run = delay => {
    if (RM) { x.putImageData(data, 0, 0); return; }
    const S = data.data, out = x.createImageData(W, H), O = out.data, t0 = performance.now() + delay;
    // czas zapalenia każdego piksela: postęp wzdłuż kierunku + rozproszenie Bayera (bloki 2x2, jak w rycinach)
    const T = new Float32Array(W * H);
    for (let y = 0; y < H; y++) { const f = dir === 'up' ? 1 - y / H : y / H; for (let xx = 0; xx < W; xx++) T[y * W + xx] = f * .62 + bth(xx >> 1, y >> 1) * .3; }
    let last = 0;
    const step = now => {
      if (now < t0) { requestAnimationFrame(step); return; }
      if (now - last < 1000 / 24) { requestAnimationFrame(step); return; } last = now;
      const k = (now - t0) / dur, flick = (now / 70) | 0;
      for (let i = 0, p = 0; p < W * H; p++, i += 4) { if (!S[i + 3]) continue; const d = k - T[p];
        if (d < 0) { O[i + 3] = 0; continue; }
        if (d < .08) { const r = ((p * 7 + flick * 13) & 3); if (r === 0) { O[i] = 196; O[i + 1] = 18; O[i + 2] = 29; } else { O[i] = O[i + 1] = O[i + 2] = r === 1 ? 70 : 140; } O[i + 3] = 255; }
        else { O[i] = S[i]; O[i + 1] = S[i + 1]; O[i + 2] = S[i + 2]; O[i + 3] = S[i + 3]; } }
      x.putImageData(out, 0, 0);
      if (k < 1.05) requestAnimationFrame(step); else x.putImageData(data, 0, 0);
    };
    requestAnimationFrame(step);
  };
  return { start(delay = 0) { if (data) run(delay); else pending = delay; } };
}
