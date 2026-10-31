// ekranik 84x48 w stylu Nokii 3310 do przejścia telefon → kontakt: „HALO? / CZY TO...?", fala krzyku rośnie jak na oscyloskopie,
// aż wypełni ekran i wytnie z siebie słowo KRZYK; na końcu LCD rozsypuje się w zielony szum
export const LW = 84, LH = 48;
const F = { H: '10001100011000111111100011000110001', A: '01110100011000111111100011000110001', L: '10000100001000010000100001000011111',
  O: '01110100011000110001100011000101110', '?': '01110100010000100010001000000000100', C: '01110100011000010000100001000101110',
  Z: '11111000010001000100010001000011111', Y: '10001100010101000100001000010000100', T: '11111001000010000100001000010000100',
  '.': '00000000000000000000000000110001100', ' ': '00000000000000000000000000000000000' };
// grube litery KRZYK z mapy 7x10, skalowane 2x4: zajmują 82x40 ekranu
const BIG = { K: ['1100011', '1100110', '1101100', '1111000', '1110000', '1111000', '1101100', '1100110', '1100011', '1100011'],
  R: ['1111110', '1111111', '1100011', '1100011', '1111111', '1111110', '1101100', '1100110', '1100011', '1100011'],
  Z: ['1111111', '1111111', '0000011', '0000110', '0001100', '0011000', '0110000', '1100000', '1111111', '1111111'],
  Y: ['1100011', '1100011', '0110110', '0111110', '0011100', '0011100', '0011100', '0011100', '0011100', '0011100'] };
export const hash = (a, b, c = 0) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export const bay = (x, y) => (B4[(y & 3) * 4 + (x & 3)] + .5) / 16;
const px = (b, x, y, v = 1) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < LW && y < LH) b[y * LW + x] = v; };
const rect = (b, x, y, w, h, v = 1) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(b, x + i, y + j, v); };
const txt = (b, s, x, y, k = 1, n = 99) => [...s].slice(0, n).forEach((ch, i) => { const g = F[ch] || F[' ']; for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) if (g[r * 5 + c] === '1') rect(b, x + (i * 6 + c) * k, y + r * k, k, k); });
const seg = (b, ax, ay, bx, by, th) => { const n = Math.ceil(Math.hypot(bx - ax, by - ay) * 2) + 1, r = th / 2;
  for (let i = 0; i <= n; i++) { const X = ax + (bx - ax) * i / n, Y = ay + (by - ay) * i / n; for (let j = Math.floor(Y - r); j <= Math.ceil(Y + r); j++) for (let k = Math.floor(X - r); k <= Math.ceil(X + r); k++) if ((k + .5 - X) ** 2 + (j + .5 - Y) ** 2 <= r * r + .25) px(b, k, j); } };
const bigWord = (b, v) => [...'KRZYK'].forEach((c, i) => BIG[c].forEach((row, r) => [...row].forEach((on, q) => { if (on === '1') rect(b, 1 + i * 17 + q * 2, 4 + r * 4, 2, 4, v); })));
const QA = [250, 360, 470, 580, 700], QB = 'CZY TO...?', QBt = [1000, 1080, 1160, 1260, 1340, 1420, 1600, 1760, 1920, 2080];
export const T_SCREAM = 2300, T_NOISE = 5000, T_END = 6400;
// stan ekranu w chwili t (ms): b = atrament 0..1 na piksel, m = drgania i szum
export function lcdFrame(t) {
  const b = new Float32Array(LW * LH), m = { shake: 0, noise: 0 };
  if (t < T_SCREAM) {
    txt(b, 'HALO?', 12, 6, 2, QA.filter(q => t >= q).length); const n = QBt.filter(q => t >= q).length; txt(b, QB, 12, 30, 1, n);
    const a = QA.filter(q => t >= q).length; if (t > 250 && Math.floor(t / 280) % 2 === 0) rect(b, n ? 12 + n * 6 : 12 + a * 12, n ? 36 : 18, 4, 1);
    if (t > 2100) m.shake = 1; return { b, m };
  }
  const u = t - T_SCREAM, A = Math.min(30, 1.5 * Math.exp(u / 330)), ph = u * .02;
  const y = x => 24 + A * (Math.sin(x * .3 + ph) * .6 + Math.sin(x * .83 - ph * 1.7) * .3 + (hash(x, u / 70 | 0) - .5) * .7);
  if (u < 1300) { for (let x = 6; x < 78; x++) seg(b, x - 1, y(x - 1), x, y(x), u > 800 ? 2 : 1); m.shake = A / 30 * 1.5; return { b, m }; }
  for (let x = 0; x < LW; x++) { const e = Math.min(26, Math.abs(y(x) - 24) + (u - 1300) * .03); for (let j = 0; j < LH; j++) if (Math.abs(j - 24) <= e) px(b, x, j); }
  bigWord(b, 0);
  if (u > 2300) for (let j = 0; j < LH; j += 3) for (let x = 0; x < LW; x++) if (!b[j * LW + x] && hash(x, j, u / 140 | 0) < .2) px(b, x, j);
  m.shake = .8;
  const z = (t - T_NOISE + 300) / 900; if (z > 0) { m.noise = z; m.shake = 0; for (let i = 0; i < LW * LH; i++) if (hash(i, u / 70 | 0, 3) < Math.min(1, z * 1.4)) b[i] = hash(i, u / 70 | 0, 9) < .5 ? 1 : 0; }
  return { b, m };
}
// rysuje ekran (z poświatą LCD, siatką pikseli i smużeniem ciekłego kryształu) w prostokącie (x0, y0, w, h)
export function drawLCD(x, t, x0, y0, w, h, on = 1) {
  const f0 = lcdFrame(t), f1 = lcdFrame(t - 70), f2 = lcdFrame(t - 140), pw = w / LW, ph = h / LH, gap = pw >= 4 ? 1 : 0;
  const g = x.createRadialGradient(x0 + w / 2, y0 + h / 2, w * .1, x0 + w / 2, y0 + h / 2, w * .7);
  g.addColorStop(0, `rgb(${168 * on | 0},${204 * on | 0},${140 * on | 0})`); g.addColorStop(1, `rgb(${110 * on | 0},${148 * on | 0},${92 * on | 0})`); x.fillStyle = g; x.fillRect(x0, y0, w, h);
  for (let j = 0; j < LH; j++) for (let i = 0; i < LW; i++) { const k = j * LW + i, v = Math.max(f0.b[k], f1.b[k] * .45, f2.b[k] * .2); if (v < .02) continue;
    const X = x0 + i * pw, Y = y0 + j * ph; if (gap) { x.fillStyle = `rgba(40,58,38,${.16 * v})`; x.fillRect(X + 2, Y + 2, pw - gap, ph - gap); }
    x.fillStyle = `rgba(22,32,22,${v})`; x.fillRect(X, Y, pw - gap, ph - gap); }
  return f0.m;
}
