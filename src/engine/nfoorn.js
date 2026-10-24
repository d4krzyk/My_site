// boczne ryciny NFO na płótnie w siatce znaków (1 kolumna = 2 px, 1 wiersz = 4 px): łodyga z nakładanych fal, która się nie powtarza,
// zwijające się pędy (woluty), lewa z cierniami i oplatającym pnączem, prawa z liśćmi i kroplą krwi; przy każdym nagłówku
// sekcji węzeł z czerwonym ziarnem. Cieniowanie jak w rycinie: kreskowany cień, ditherowane krawędzie i blik.
const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const BAY = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21].map(v => (v + .5) / 64);
const bth = (x, y) => BAY[(y & 7) * 8 + (x & 7)];
const COL = { dk: [40, 43, 62], md: [95, 101, 130], lt: [150, 156, 184], rd: [196, 18, 29] };
const TAU = Math.PI * 2;

// warstwy rysowane z wygładzaniem, potem progowane ditherem do pikseli
function layers(W, H) {
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.strokeStyle = '#fff'; return x; };
  return { dk: mk(), md: mk(), lt: mk(), rd: mk() };
}

export function buildOrn(W, H, bands, heads) {
  const Ly = layers(W, H);
  const dot = (k, x, y, r) => { if (r <= 0.05) return; const c = Ly[k]; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };
  // rurka o zmiennej grubości: cień przesunięty w prawo-dół, korpus, blik w lewo-górę
  const tube = (pts, rad, o = {}) => {
    for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i], r = rad(i / (pts.length - 1 || 1));
      dot('dk', x + .9, y + .9, r + .5); }
    for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i], r = rad(i / (pts.length - 1 || 1)); dot(o.red ? 'rd' : 'md', x, y, r); }
    if (!o.flat) for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i], r = rad(i / (pts.length - 1 || 1)); if (r > 1.1) dot('lt', x - r * .35, y - r * .35, r * .32); }
  };
  // woluta: krzywizna rośnie liniowo z długością, ok. półtora obrotu
  const curl = (x, y, ang, side, size, r0, turns = 1.6, k0 = .03) => {
    const L = size * 2.5, turn = turns * TAU, c = 2 * (turn - k0 * L) / (L * L), pts = [];
    let a = ang, s = 0; pts.push([x, y]);
    while (s < L) { const ds = .35; a += side * (k0 + c * s) * ds; x += Math.cos(a) * ds; y += Math.sin(a) * ds; s += ds; pts.push([x, y]); }
    tube(pts, t => .5 + r0 * Math.pow(1 - t, .7));
    dot('md', x, y, 1.3); return pts;
  };
  const spike = (x, y, ang, len, r0) => { const pts = []; for (let s = 0; s <= len; s += .4) pts.push([x + Math.cos(ang) * s, y + Math.sin(ang) * s + s * s * .03]); tube(pts, t => r0 * (1 - t) + .15, { flat: true }); };
  const leaf = (x, y, ang, len) => { const pts = []; for (let s = 0; s <= len; s += .4) { const bend = Math.sin(s / len * Math.PI) * .25; pts.push([x + Math.cos(ang + bend) * s, y + Math.sin(ang + bend) * s]); } tube(pts, t => .2 + 2.6 * Math.sin(Math.PI * Math.pow(t, .8))); };
  const ring = (x, y, r) => { for (let a = 0; a < TAU; a += .05) dot('dk', x + Math.cos(a) * r + .8, y + Math.sin(a) * r + .8, 1.2);
    for (let a = 0; a < TAU; a += .05) dot('md', x + Math.cos(a) * r, y + Math.sin(a) * r, .85);
    for (let a = 3.4; a < 5.2; a += .05) dot('lt', x + Math.cos(a) * r, y + Math.sin(a) * r, .45); };

  const tips = {};
  for (const B of bands) {
    const R = rng(B.seed), [x0, x1] = B.x, cx = (x0 + x1) / 2, half = (x1 - x0) / 2;
    const f = [[R() * TAU, 34 + R() * 8, half * .3], [R() * TAU, 15 + R() * 4, half * .06], [R() * TAU, 83 + R() * 20, half * .14]];
    const sx = y => cx + f.reduce((v, [p, l, a]) => v + a * Math.sin(y / l + p), 0);
    const y0 = B.top, y1 = H - B.bot;
    const stem = []; for (let y = y0; y <= y1; y += .5) stem.push([sx(y), y]);
    const sr = y => 2.9 + .6 * Math.sin(y / 23 + B.seed);
    // pnącze oplatające łodygę (lewa): część za łodygą rysujemy przed nią
    const twine = (front) => { if (!B.twine) return; let seg = [];
      const flush = () => { if (seg.length > 2) tube(seg, () => 1.2); seg = []; };
      for (let y = y0 + 20; y <= y1 - 20; y += .4) { const p = y / 11, fr = Math.cos(p) > 0; if (fr !== front) { flush(); continue; } seg.push([sx(y) + (sr(y) + 2.2) * Math.sin(p), y]); }
      flush(); };
    twine(false);
    tube(stem, t => sr(y0 + t * (y1 - y0)) * Math.min(1, (t * (y1 - y0)) / 10 + .35, ((1 - t) * (y1 - y0)) / 14 + .25));
    twine(true);
    // węzły przy nagłówkach
    const nodes = heads.filter(y => y > y0 + 16 && y < y1 - 16);
    nodes.forEach(y => { const x = sx(y); ring(x, y, 6.2); dot('rd', x, y, 2.2); dot('lt', x - .6, y - .6, .45); });
    const nearNode = y => nodes.some(n => Math.abs(n - y) < 11);
    // pędy: miejsce po stronie, w którą łodyga ma więcej luzu; rozmiar zależny od luzu
    let y = y0 + 26 + R() * 10, last = 0;
    while (y < y1 - 30) {
      if (nearNode(y)) { y += 4; continue; }
      const x = sx(y), roomR = x1 - x, roomL = x - x0, side = roomR > roomL + 2 ? 1 : roomL > roomR + 2 ? -1 : -last || 1;
      const room = side > 0 ? roomR : roomL, size = Math.max(5, Math.min(15, room * (.35 + R() * .35) + R() * 2));
      const start = [x + side * sr(y) * .8, y];
      const pts = curl(start[0], start[1], side > 0 ? -.3 - R() * .8 : Math.PI + .3 + R() * .8, side, size, 1.4 + size * .05, 1.15 + R() * .7, R() < .4 ? -.06 - R() * .08 : .03);
      if (size > 9 && R() < .6) { const q = pts[Math.floor(pts.length * .28)]; curl(q[0], q[1], side > 0 ? .9 : Math.PI - .9, -side, size * .4, 1.1); }
      if (B.thorns) { const ty = y + 9 + R() * 6; if (!nearNode(ty) && ty < y1 - 20) { const tx = sx(ty); spike(tx - side * sr(ty) * .7, ty, side > 0 ? Math.PI + .5 : -.5, 5 + R() * 3, 1.7); } }
      if (B.leaves) { const ly = y + 8 + R() * 5; if (!nearNode(ly) && ly < y1 - 20) { const lx = sx(ly); leaf(lx - side * sr(ly) * .6, ly, side > 0 ? Math.PI - .7 : .7, 9 + R() * 3); } }
      last = side; y += 12 + size * .9 + R() * 12;
    }
    // zakończenia
    if (B.cap === 'volute') {
      const xt = sx(y0), xb = sx(y1);
      curl(xt, y0, -Math.PI / 2, xt < cx ? 1 : -1, 15, 2.8);
      curl(xb, y1, Math.PI / 2, xb < cx ? -1 : 1, 14, 2.6);
      spike(xb, y1, Math.PI / 2 + .5, 9, 1.8); spike(xb, y1, Math.PI / 2 - .6, 8, 1.6);
    } else {
      // księżyc u góry, łodyga z niego zwisa; na dole ostrze, z którego kapie krew
      const xt = sx(y0); for (let a = -.9; a < Math.PI + .9; a += .04) { const r = 11, w = 3 * Math.sin((a + .9) / (Math.PI + 1.8) * Math.PI);
        const p = [xt + Math.cos(a) * r, y0 - 3 - Math.sin(a) * r]; dot('dk', p[0] + .8, p[1] + .8, w + .4); }
      for (let a = -.9; a < Math.PI + .9; a += .04) { const r = 11, w = 3 * Math.sin((a + .9) / (Math.PI + 1.8) * Math.PI);
        dot('md', xt + Math.cos(a) * r, y0 - 3 - Math.sin(a) * r, w); if (a > 1.2 && a < 2.6) dot('lt', xt + Math.cos(a) * (r + .6), y0 - 3 - Math.sin(a) * (r + .6), w * .35); }
      const xb = sx(y1); const pts = []; for (let s = 0; s < 14; s += .4) pts.push([xb, y1 + s]); tube(pts, t => 2.6 * (1 - t) + .2);
      tips[B.name] = [Math.round(xb), Math.round(y1 + 14)];
      curl(xb, y1 - 8, Math.PI - .4, -1, 9, 1.6); curl(xb, y1 - 8, -.4, 1, 9, 1.6);
    }
  }
  // progowanie warstw: kreskowany cień, ditherowany brzeg, rzadszy blik
  const A = k => Ly[k].getImageData(0, 0, W, H).data;
  const dk = A('dk'), md = A('md'), lt = A('lt'), rd = A('rd');
  const img = new ImageData(W, H), D = img.data;
  for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
    const i = (yy * W + xx) * 4, th = bth(xx, yy); let c = null;
    if (rd[i + 3] / 255 > .2 + .55 * th) c = COL.rd;
    else if (lt[i + 3] / 255 > .15 + .7 * th) c = COL.lt;
    else if (md[i + 3] / 255 > .2 + .55 * th) c = COL.md;
    else if (dk[i + 3] / 255 > .3 + .4 * th && ((xx + yy) & 1) === 0) c = COL.dk;
    if (c) { D[i] = c[0]; D[i + 1] = c[1]; D[i + 2] = c[2]; D[i + 3] = 255; }
  }
  return { img, tips };
}

// płótno: odsłanianie z góry na dół (jak rozkodowanie tekstu), potem co ~5 s kropla z ostrza prawej ryciny
export function ornCanvas(cv) {
  const x = cv.getContext('2d');
  let base = null, tip = null, rev = null, W = 0, H = 0;
  const frame = new ImageData(1, 1);
  const draw = (now, dropT) => {
    if (!base) return;
    if (rev) {
      const t = now - rev, out = x.createImageData(W, H), S = base.data, O = out.data;
      for (let y = 0; y < H; y++) { const ty = y / H * 900; for (let xx = 0; xx < W; xx++) { const i = (y * W + xx) * 4; if (!S[i + 3]) continue;
        const k = (t - ty - bth(xx, y) * 420) / 150; if (k < 0) continue;
        if (k < 1) { O[i] = O[i + 1] = O[i + 2] = k < .5 ? 60 : 110; O[i + 3] = 255; } else { O[i] = S[i]; O[i + 1] = S[i + 1]; O[i + 2] = S[i + 2]; O[i + 3] = 255; } } }
      x.putImageData(out, 0, 0); if (t > 900 + 420 + 150) rev = null; return;
    }
    x.putImageData(base, 0, 0);
    if (tip && dropT != null) {
      const [tx, ty] = tip, c = COL.rd; x.fillStyle = `rgb(${c})`;
      if (dropT < 900) { const r = Math.round(dropT / 900 * 2); x.fillRect(tx - (r > 1 ? 1 : 0), ty, r > 0 ? (r > 1 ? 3 : 1) : 1, r + 1); }
      else { const s = (dropT - 900) / 1000, fy = ty + 2 + s * s * 260; if (fy < H - 1) x.fillRect(tx, Math.round(fy), 1, 2 + Math.min(2, s * 4 | 0)); }
    }
  };
  return {
    set(b) { base = b.img; W = base.width; H = base.height; cv.width = W; cv.height = H; tip = b.tips.R || null; draw(performance.now()); },
    reveal() { rev = performance.now(); const st = now => { draw(now); if (rev) requestAnimationFrame(st); }; requestAnimationFrame(st); },
    tick(t) { if (rev) return; const cyc = t % 5200; draw(0, cyc > 3000 ? cyc - 3000 : null); },
    get busy() { return !!rev; },
  };
}
