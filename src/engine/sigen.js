// generator sigili: sigil to lista ścieżek w układzie [-1,1] (łamane z grubością, kropki, krople), budowana z ziarna i opcji,
// rysowana w jednym z trzech stylów (cyber-piksel, tusz, rycina) i eksportowana jako przezroczysty PNG albo SVG
const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const TAU = Math.PI * 2, PI = Math.PI;
const BAY = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21];
export const bth = (x, y) => (BAY[(y & 7) * 8 + (x & 7)] + .5) / 64;   // próg Bayera (bez core.js, który przy wczytaniu sięga po window)

export const OPTS = {
  frame: ['koło', 'podwójne koło', 'kwadrat', 'romb', 'sześciokąt', 'brak'],
  sym: ['lustro', 'promień 3', 'promień 4', 'promień 5', 'promień 6', 'promień 8', 'brak'],
  glyph: ['cyber', 'linie', 'łuki', 'runy'],
  core: ['oko', 'krzyż', 'półksiężyc', 'gwiazda', 'romb', 'brak'],
  style: ['cyber-piksel', 'tusz', 'rycina'],
  extras: ['oś', 'węzły', 'ciernie', 'krople', 'promienie', 'kropkowany krąg', 'krzyżyki'],
};
export const COLORS = { biel: '#f2efe9', krew: '#c4121d', czerń: '#0a0a0d', cyjan: '#3ff0ff', srebro: '#b9bdd0' };

export function defaults() { return { seed: 1911, frame: 'koło', sym: 'promień 4', glyph: 'cyber', core: 'oko', style: 'cyber-piksel', density: 7, weight: 2, color: 'biel', extras: ['oś', 'węzły', 'ciernie'] }; }
export function randomize(s, all) {
  const r = rng(Date.now() ^ (Math.random() * 1e9)), pick = a => a[Math.floor(r() * a.length)], o = { ...s, seed: Math.floor(r() * 1e6) };
  if (all) { o.frame = pick(OPTS.frame); o.sym = pick(OPTS.sym); o.glyph = pick(OPTS.glyph); o.core = pick(OPTS.core); o.style = pick(OPTS.style); o.density = 4 + Math.floor(r() * 9); o.weight = 1 + Math.floor(r() * 3);
    o.extras = OPTS.extras.filter(() => r() < .45); }
  return o;
}
// stan <-> fragment adresu (#s=...), żeby dało się podzielić sigilem
export function toHash(s) { return '#' + new URLSearchParams({ s: s.seed, f: s.frame, y: s.sym, g: s.glyph, c: s.core, t: s.style, d: s.density, w: s.weight, k: s.color, x: s.extras.join(',') }).toString(); }
export function fromHash(h) { const q = new URLSearchParams((h || '').replace(/^#/, '')), d = defaults(); if (!q.has('s')) return d;
  const one = (k, list, def) => list.includes(q.get(k)) ? q.get(k) : def;
  return { seed: +q.get('s') || d.seed, frame: one('f', OPTS.frame, d.frame), sym: one('y', OPTS.sym, d.sym), glyph: one('g', OPTS.glyph, d.glyph), core: one('c', OPTS.core, d.core),
    style: one('t', OPTS.style, d.style), density: Math.min(14, Math.max(3, +q.get('d') || d.density)), weight: Math.min(4, Math.max(1, +q.get('w') || d.weight)),
    color: COLORS[q.get('k')] ? q.get('k') : d.color, extras: (q.get('x') || '').split(',').filter(e => OPTS.extras.includes(e)) }; }

// --- budowa: łamane P {pts:[[x,y]...], w (mnożnik grubości), dbl (podwójna linia w rycinie)}, kropki D {x,y,r}, krople K {x,y,s}
export function build(s) {
  const R = rng(s.seed), paths = [], dots = [], drops = [], has = e => s.extras.includes(e);
  const N = s.sym.startsWith('promień') ? +s.sym.split(' ')[1] : 1, mirror = s.sym !== 'brak';
  const sector = N > 1 ? TAU / N : PI;            // przy lustrze: połowa płaszczyzny, odbijana w poziomie
  const raw = [], rawDots = [];
  const pol = (r, a) => [Math.sin(a) * r, -Math.cos(a) * r];      // a=0 w górę
  const lim = s.frame === 'brak' ? .95 : .78;
  const ang = () => (mirror ? R() * .5 : R()) * sector;              // kąt w obrębie wycinka (połowa przy odbiciu)
  for (let i = 0; i < s.density; i++) {
    const r0 = .12 + R() * (lim - .12), a0 = ang();
    if (s.glyph === 'cyber') {                                          // ścieżki jak na płytce: odcinki 0/45/90°, końce w węzłach
      let [x, y] = pol(r0, a0); const pts = [[x, y]], n = 2 + Math.floor(R() * 3);
      for (let k = 0; k < n; k++) { const dir = Math.floor(R() * 8) * PI / 4, L = .08 + R() * .2; x += Math.cos(dir) * L; y += Math.sin(dir) * L;
        const rr = Math.hypot(x, y); if (rr > lim) { x *= lim / rr; y *= lim / rr; } pts.push([x, y]); }
      raw.push({ pts, w: 1 }); rawDots.push({ x: pts[0][0], y: pts[0][1], r: .018 }, { x, y, r: .024 });
    } else if (s.glyph === 'linie') {
      const r1 = .12 + R() * (lim - .12), a1 = ang(); raw.push({ pts: [pol(r0, a0), pol(r1, a1)], w: R() < .3 ? 1.6 : 1 });
      if (R() < .4) rawDots.push({ x: pol(r1, a1)[0], y: pol(r1, a1)[1], r: .02 });
    } else if (s.glyph === 'łuki') {
      const span = (.2 + R() * .6) * (mirror ? sector / 2 : sector), pts = [];
      for (let k = 0; k <= 16; k++) pts.push(pol(r0, a0 + span * k / 16)); raw.push({ pts, w: 1, dbl: true });
      if (R() < .5) { const [x, y] = pts[16], [mx, my] = [x * .6, y * .6]; raw.push({ pts: [[x, y], [mx, my]], w: .8 }); }
    } else {                                                            // runy: kreski między węzłami siatki 3×3 w wycinku
      const g = (u, v) => pol(.25 + u * (lim - .25) / 2, (mirror ? .5 : 1) * sector * (.15 + v * .35));
      const u0 = Math.floor(R() * 3), v0 = Math.floor(R() * 3), u1 = Math.floor(R() * 3), v1 = Math.floor(R() * 3);
      if (u0 !== u1 || v0 !== v1) raw.push({ pts: [g(u0, v0), g(u1, v1)], w: 1.2 });
      if (R() < .35) { const p = g(u1, v1); raw.push({ pts: [p, [p[0] * 1.08, p[1] * 1.08]], w: .8 }); }
    }
  }
  // powielenie: odbicie w poziomie wycinka i obrót o kolejne wycinki
  const xf = (p, k, m) => { let [x, y] = p; if (m) x = -x; const a = k * sector, c = Math.cos(a), sn = Math.sin(a); return [x * c - y * sn, x * sn + y * c]; };
  for (let k = 0; k < (N > 1 ? N : 1); k++) for (const m of mirror ? [false, true] : [false]) {
    raw.forEach(p => paths.push({ ...p, pts: p.pts.map(q => xf(q, k, m)) })); if (has('węzły')) rawDots.forEach(d => { const [x, y] = xf([d.x, d.y], k, m); dots.push({ x, y, r: d.r }); }); }
  // rama
  const poly = (n, r, rot = 0) => { const pts = []; for (let k = 0; k <= n; k++) pts.push(pol(r, rot + k * TAU / n)); return pts; };
  const ring = (r, step = 72) => poly(step, r);
  if (s.frame === 'koło') paths.push({ pts: ring(.86), w: 1.2, dbl: true });
  if (s.frame === 'podwójne koło') { paths.push({ pts: ring(.88), w: 1.2 }); paths.push({ pts: ring(.8), w: .8 }); }
  if (s.frame === 'kwadrat') paths.push({ pts: poly(4, .9, PI / 4), w: 1.2, dbl: true });
  if (s.frame === 'romb') paths.push({ pts: poly(4, .92), w: 1.2, dbl: true });
  if (s.frame === 'sześciokąt') paths.push({ pts: poly(6, .9), w: 1.2, dbl: true });
  if (has('kropkowany krąg')) for (let k = 0; k < 48; k++) dots.push({ x: pol(.95, k * TAU / 48)[0], y: pol(.95, k * TAU / 48)[1], r: .009 });
  // oś: pionowa linia przez środek z rozwidleniami (jak w cybersigilach)
  if (has('oś')) { paths.push({ pts: [[0, -lim - .1], [0, lim + .1]], w: 1.4 });
    for (const yy of [-lim * .7, lim * .55]) for (const sx of [-1, 1]) paths.push({ pts: [[0, yy], [sx * .14, yy + (yy < 0 ? .12 : -.12)]], w: 1 }); }
  // ciernie na końcach ramion i osi
  if (has('ciernie')) { const tips = N > 1 ? Array.from({ length: N }, (_, k) => k * sector) : [0, PI];
    tips.forEach(a => { const [x, y] = pol(lim + .1, a), [bx, by] = pol(lim - .02, a), px = Math.cos(a) * .05, py = Math.sin(a) * .05;
      paths.push({ pts: [[bx + px, by + py], [x, y], [bx - px, by - py]], w: 1 }); }); }
  if (has('promienie')) for (let k = 0; k < (N > 1 ? N * 2 : 8); k++) { const a = k * TAU / (N > 1 ? N * 2 : 8) + (N > 1 ? sector / 4 : 0); paths.push({ pts: [pol(.9, a), pol(1.02, a)], w: .6 }); }
  if (has('krzyżyki')) for (let k = 0; k < (N > 1 ? N : 4); k++) { const [x, y] = pol(.86, k * TAU / (N > 1 ? N : 4) + (N > 1 ? sector / 2 : PI / 4)), c = .04;
    paths.push({ pts: [[x, y - c], [x, y + c]], w: .9 }); paths.push({ pts: [[x - c * .7, y - c * .2], [x + c * .7, y - c * .2]], w: .9 }); }
  if (has('krople')) [[-.22, .7], [.22, .7], [0, .82]].forEach(([x, y], i) => { if (i < 2 && N === 1 && !mirror) return; paths.push({ pts: [[x, y - .1], [x, y]], w: .7 }); drops.push({ x, y: y + .04, s: .035 }); });
  // rdzeń w środku
  const c = s.core;
  if (c === 'oko') { const lid = []; for (let k = 0; k <= 20; k++) { const t = -1 + k / 10; lid.push([t * .16, -Math.cos(t * PI / 2) * .07]); } for (let k = 20; k >= 0; k--) { const t = -1 + k / 10; lid.push([t * .16, Math.cos(t * PI / 2) * .07]); }
    paths.push({ pts: lid, w: 1.1 }); dots.push({ x: 0, y: 0, r: .035 }); }
  if (c === 'krzyż') { paths.push({ pts: [[0, -.2], [0, .26]], w: 1.4 }); paths.push({ pts: [[-.13, -.06], [.13, -.06]], w: 1.4 }); }
  if (c === 'półksiężyc') { const o = [], i = []; for (let k = 0; k <= 24; k++) { const a = -PI * .8 + k / 24 * PI * 1.6; o.push([Math.cos(a + PI) * .15, Math.sin(a) * .15]); i.push([Math.cos(a + PI) * .12 + .05, Math.sin(a) * .12]); }
    paths.push({ pts: o, w: 1.1 }); paths.push({ pts: i, w: .8 }); }
  if (c === 'gwiazda') { const pts = []; for (let k = 0; k <= 10; k++) pts.push(pol(k % 2 ? .07 : .18, k * PI / 5)); paths.push({ pts, w: 1 }); }
  if (c === 'romb') { paths.push({ pts: poly(4, .14), w: 1.2 }); dots.push({ x: 0, y: 0, r: .025 }); }
  return { paths, dots, drops };
}

// --- rysowanie na płótnie o boku S (przezroczyste tło)
export function draw(ctx, S, s, model = build(s)) {
  const col = COLORS[s.color] || COLORS.biel, sc = S * .46, X = p => S / 2 + p[0] * sc, Y = p => S / 2 + p[1] * sc, lw = Math.max(1, S / 512 * s.weight * 1.6);
  ctx.clearRect(0, 0, S, S);
  if (s.style === 'cyber-piksel') {
    // rysunek w małej siatce (bok S/k) bez wygładzania, potem powiększenie najbliższym pikselem
    const k = Math.max(2, Math.round(S / 160)), g = Math.ceil(S / k), c = document.createElement('canvas'); c.width = c.height = g; const x = c.getContext('2d');
    const img = x.createImageData(g, g), D = img.data, rgb = [1, 3, 5].map(i => parseInt(col.slice(i, i + 2), 16));
    const plot = (px, py) => { px = Math.round(px); py = Math.round(py); if (px < 0 || py < 0 || px >= g || py >= g) return; const i = (py * g + px) * 4; D[i] = rgb[0]; D[i + 1] = rgb[1]; D[i + 2] = rgb[2]; D[i + 3] = 255; };
    const t = Math.max(1, Math.round(s.weight / 2));
    const seg = (a, b, w) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])) + 1, h = Math.max(0, Math.round(t * w) - 1);
      for (let i = 0; i <= n; i++) { const px = a[0] + (b[0] - a[0]) * i / n, py = a[1] + (b[1] - a[1]) * i / n; for (let dx = 0; dx <= h; dx++) for (let dy = 0; dy <= h; dy++) plot(px + dx, py + dy); } };
    const G = p => [g / 2 + p[0] * g * .46, g / 2 + p[1] * g * .46];
    model.paths.forEach(p => { for (let i = 1; i < p.pts.length; i++) seg(G(p.pts[i - 1]), G(p.pts[i]), p.w); });
    model.dots.forEach(d => { const [cx, cy] = G([d.x, d.y]), r = Math.max(1, d.r * g * .46); for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (Math.abs(xx) + Math.abs(yy) <= r) plot(cx + xx, cy + yy); });
    model.drops.forEach(d => { const [cx, cy] = G([d.x, d.y]), r = Math.max(2, d.s * g * .46); for (let yy = -r; yy <= r * 1.4; yy++) { const w = yy < 0 ? (r + yy) * .5 : Math.sqrt(Math.max(0, r * r - (yy - r * .4) ** 2)); for (let xx = -w; xx <= w; xx++) plot(cx + xx, cy + yy); } });
    x.putImageData(img, 0, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(c, 0, 0, g * k, g * k); return;
  }
  ctx.strokeStyle = ctx.fillStyle = col; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const line = (pts, w) => { ctx.lineWidth = w; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(X(p), Y(p)) : ctx.moveTo(X(p), Y(p))); ctx.stroke(); };
  model.paths.forEach(p => {
    if (s.style === 'tusz') {                                           // tusz: grubość pulsuje wzdłuż kreski jak spod stalówki
      for (let i = 1; i < p.pts.length; i++) { const a = p.pts[i - 1], b = p.pts[i], ang = Math.atan2(b[1] - a[1], b[0] - a[0]); line([a, b], lw * p.w * (.45 + .9 * Math.abs(Math.sin(ang - .7)))); }
    } else { line(p.pts, lw * p.w * .8);                                // rycina: cienka linia, kontury z drugą, cieńszą obok
      if (p.dbl) { ctx.globalAlpha = .55; line(p.pts.map(q => { const r = Math.hypot(q[0], q[1]) || 1; return [q[0] * (1 - .035 / r), q[1] * (1 - .035 / r)]; }), lw * .45); ctx.globalAlpha = 1; } }
  });
  model.dots.forEach(d => { ctx.beginPath(); ctx.arc(X([d.x, d.y]), Y([d.x, d.y]), Math.max(1.5, d.r * sc), 0, TAU); ctx.fill(); });
  model.drops.forEach(d => { const cx = X([d.x, d.y]), cy = Y([d.x, d.y]), r = d.s * sc; ctx.beginPath(); ctx.moveTo(cx, cy - r * 1.6); ctx.quadraticCurveTo(cx + r * 1.1, cy, cx, cy + r); ctx.quadraticCurveTo(cx - r * 1.1, cy, cx, cy - r * 1.6); ctx.fill(); });
}

export function toPNG(s, size) { const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size, s); return new Promise(r => c.toBlob(r, 'image/png')); }

export function toSVG(s, size = 1024) {
  const m = build(s), col = COLORS[s.color] || COLORS.biel, sc = size * .46, f = v => (size / 2 + v * sc).toFixed(1), lw = (size / 512 * s.weight * 1.6);
  const px = s.style === 'cyber-piksel', cap = px ? 'square' : 'round';
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"${px ? ' shape-rendering="crispEdges"' : ''}>`, `<g fill="none" stroke="${col}" stroke-linecap="${cap}" stroke-linejoin="${px ? 'miter' : 'round'}">`];
  m.paths.forEach(p => out.push(`<polyline stroke-width="${(lw * p.w * (s.style === 'tusz' ? 1 : .8)).toFixed(2)}" points="${p.pts.map(q => f(q[0]) + ',' + f(q[1])).join(' ')}"/>`));
  out.push('</g>', `<g fill="${col}">`);
  m.dots.forEach(d => out.push(`<circle cx="${f(d.x)}" cy="${f(d.y)}" r="${Math.max(1.5, d.r * sc).toFixed(1)}"/>`));
  m.drops.forEach(d => { const cx = +f(d.x), cy = +f(d.y), r = d.s * sc; out.push(`<path d="M${cx} ${(cy - r * 1.6).toFixed(1)} Q${(cx + r * 1.1).toFixed(1)} ${cy} ${cx} ${(cy + r).toFixed(1)} Q${(cx - r * 1.1).toFixed(1)} ${cy} ${cx} ${(cy - r * 1.6).toFixed(1)}Z"/>`); });
  out.push('</g></svg>'); return out.join('\n');
}
