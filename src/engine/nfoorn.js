// boczne ryciny NFO na płótnie w siatce znaków (1 kolumna = 4 px, 1 wiersz = 8 px): cienka, kaligraficzna filigrana w duchu
// barokowych ozdobników. Łodyga z łuków S o grubości zależnej od kierunku (jak stalówka), z niej zawijasy rozgałęziające się
// na coraz mniejsze; skupiska gęstnieją przy krzyżach i co kawałek, między nimi rzadkie, oddychające odcinki. Do tego wisiorki
// na kreskowanych nitkach, gwiazdki, przerywane łuki, wykropkowane zakończenia; przy nagłówkach sekcji koralik w kolorze akcentu.
const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const BAY = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21].map(v => (v + .5) / 64);
const bth = (x, y) => BAY[(y & 7) * 8 + (x & 7)];
// palety: linie jasne (a), nitki i łuki przygaszone (b), akcent (r), obwódka oddzielająca od tła (sh)
const TONES = {
  white: { a: [232, 230, 238], b: [112, 112, 134], r: [196, 18, 29], sh: [3, 3, 9] },
  red: { a: [206, 26, 38], b: [104, 12, 22], r: [236, 232, 238], sh: [3, 3, 9] },
};
const TAU = Math.PI * 2, PI = Math.PI;
const clampv = (v, a, b) => Math.max(a, Math.min(b, v));

export function buildOrn(W, H, bands, heads, tone = 'white') {
  const COL = TONES[tone] || TONES.white;
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.fillStyle = '#fff'; return x; };
  const Ly = { a: mk(), b: mk(), r: mk(), sh: mk() };
  const dot = (k, x, y, r) => { if (r <= .05) return; for (const L of [Ly[k], Ly.sh]) { L.beginPath(); L.arc(x, y, L === Ly.sh ? r + 1 : r, 0, TAU); L.fill(); } };
  const stroke = (k, pts, wf) => { const n = pts.length - 1 || 1; pts.forEach((p, i) => dot(k, p[0], p[1], wf(i / n, p[2]))); };
  const nib = a => .35 + .65 * Math.abs(Math.sin(a - .75));          // stalówka pod kątem: grubiej w dół, włoskowo w poprzek
  // ścieżka zawijasa: krzywizna rośnie z długością (k0 < 0 daje wygięcie w S przed zwojem)
  const curlPath = (x, y, a, side, size, turns, k0) => {
    const L = size * 3, c = 3 * (turns * TAU - k0 * L) / (L * L * L), pts = [[x, y, a]], ds = .3;
    for (let s = 0; s < L; s += ds) { a += side * (k0 + c * s * s) * ds; x += Math.cos(a) * ds; y += Math.sin(a) * ds; pts.push([x, y, a]); }
    return pts;
  };
  const bez = (p0, p1, p2, p3, out) => { for (let t = 0; t <= 1; t += .003) { const u = 1 - t;
    const x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
    const l = out[out.length - 1]; if (l && Math.hypot(x - l[0], y - l[1]) < .3) continue; out.push([x, y, l ? Math.atan2(y - l[1], x - l[0]) : PI / 2]); } return out; };
  const dashed = (k, pts, on, off, r = .45) => { let s = 0; for (let i = 1; i < pts.length; i++) { s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (s % (on + off) < on) dot(k, pts[i][0], pts[i][1], r); } };
  const line = (x0, y0, x1, y1) => { const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / .3)), a = Math.atan2(y1 - y0, x1 - x0), p = []; for (let i = 0; i <= n; i++) p.push([x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, a]); return p; };
  const sparkle = (x, y, s, k = 'a') => { stroke(k, line(x, y - s, x, y + s), t => .6 * (1 - Math.abs(t * 2 - 1)) + .12); stroke(k, line(x - s * .55, y, x + s * .55, y), t => .5 * (1 - Math.abs(t * 2 - 1)) + .1); };

  for (const B of bands) {
    const R = rng(B.seed), [x0, x1] = B.x, bw = x1 - x0, cx = (x0 + x1) / 2;
    for (const L of Object.values(Ly)) { L.save(); L.beginPath(); L.rect(x0 - 2, 0, bw + 4, H); L.clip(); }
    const y0 = B.top, y1 = H - B.bot, len = y1 - y0;
    const clusters = B.clusters.map(f => y0 + f * len), crossY = B.crosses.map(f => y0 + f * len);
    const dens = y => Math.min(1, clusters.concat(crossY).reduce((v, c) => v + Math.exp(-(((y - c) / 60) ** 2)), 0));
    const nearHead = y => heads.some(h => Math.abs(h - y) < 12);

    // zawijas z odgałęzieniami (akant): od nasady do zwoju coraz cieńszy, koniec z kroplą
    const scroll = (x, y, a, side, size, depth) => {
      if (size < 3) return;
      const pts = curlPath(x, y, a, side, size, 1 + R() * .5, R() < .3 ? -.05 - R() * .04 : .05 + R() * .04), base = clampv(size * .05, .45, 1);
      stroke('a', pts, (t, aa) => Math.max(.4, base * nib(aa) * Math.pow(1 - t, .5) + .1));
      const e = pts[pts.length - 1]; dot('a', e[0], e[1], base * .55 + .3);
      if (depth > 0) { const n = 1 + (depth > 1 && R() < .35 ? 1 : 0);
        for (let i = 0; i < n; i++) { const p = pts[Math.floor(pts.length * (.18 + R() * .38))];
          scroll(p[0], p[1], p[2] - side * (.55 + R() * .6), R() < .7 ? -side : side, size * (.32 + R() * .2), depth - 1); } }
      // drobne haczyki jak kolce
      const sp = R() < .5 ? 1 : 0; for (let i = 0; i < sp; i++) { const p = pts[Math.floor(pts.length * (.1 + R() * .5))];
        stroke('a', curlPath(p[0], p[1], p[2] - side * (.9 + R() * .5), -side, 2.4 + R() * 2.6, .35, .1), t => .45 * (1 - t) + .15); }
      return pts;
    };
    const pendant = (x, y, l) => { dashed('b', line(x, y, x, y + l), 3, 2.4); const yy = y + l;
      dot('a', x, yy + 2, .9); const d = [[x, yy + 4], [x + 3.4, yy + 10], [x, yy + 16], [x - 3.4, yy + 10], [x, yy + 4]];
      for (let i = 0; i < 4; i++) stroke('a', line(d[i][0], d[i][1], d[i + 1][0], d[i + 1][1]), () => .45); dot('r', x, yy + 10, .8); dashed('b', line(x, yy + 17, x, yy + 24), 1.5, 2); dot('a', x, yy + 26, .6); };
    const arc = (x, y, r, a0, a1) => { const p = []; for (let a = a0; a < a1; a += .3 / r) p.push([x + Math.cos(a) * r, y + Math.sin(a) * r, a]); dashed('b', p, 4, 3.2); };
    // gotycki krzyż: ramiona zwężane, zakończenia jak lilie, pierścień z akcentem w środku, wokół zawijasy
    const cross = (x, y, s) => {
      for (const [dx, dy, l] of [[0, -1, s * .85], [0, 1, s * 1.6], [-1, 0, s * .8], [1, 0, s * .8]]) {
        const ex = x + dx * l, ey = y + dy * l; stroke('a', line(x, y, ex, ey), t => 1.15 - t * .55);
        stroke('a', line(ex, ey, ex + dx * 3.2, ey + dy * 5), t => .9 * (1 - t) + .1); dot('a', ex - dy * 2.4 + dx, ey + dx * 2.4 + dy, .8); dot('a', ex + dy * 2.4 + dx, ey - dx * 2.4 + dy, .8);
        const a = Math.atan2(dy, dx); scroll(ex - dx * 3, ey - dy * 3, a + 2.2, 1, 5.5, 0); scroll(ex - dx * 3, ey - dy * 3, a - 2.2, -1, 5.5, 0);
      }
      const ring = []; for (let a = 0; a < TAU; a += .1) ring.push([x + Math.cos(a) * 5, y + Math.sin(a) * 5, a]); stroke('a', ring, () => .45);
      dot('r', x, y, 1.8);
      for (const q of [-1, 1]) scroll(x + q * 2, y + s * .5, PI / 2 + q * .9, -q, s * .55, 1);
      dashed('b', line(x, y - s * .85 - 7, x, y - s * .85 - 7 - s * .9), 2.4, 3); sparkle(x, y - s * 1.85 - 12, 4.5);
    };

    // łodyga: łańcuch łuków Béziera naprzemiennie w lewo i w prawo od osi pasa
    const anc = []; let yy = y0, sd = R() < .5 ? -1 : 1;
    while (yy < y1 - 30) { anc.push([cx + sd * bw * (.08 + R() * .2), yy]); sd = -sd; yy += 70 + R() * 80; }
    anc.push([cx + sd * bw * .1, y1]);
    const spine = [];
    for (let i = 0; i < anc.length - 1; i++) { const p0 = anc[i], p3 = anc[i + 1], h = (p3[1] - p0[1]) * (.38 + R() * .2); bez(p0, [p0[0], p0[1] + h], [p3[0], p3[1] - h], p3, spine); }
    stroke('a', spine, (t, a) => Math.max(.42, 1 * nib(a) * Math.min(1, t * len / 30 + .2, (1 - t) * len / 40 + .2)));
    // druga, przygaszona nitka obok łodygi na części łuków
    for (const p of spine) { if (Math.floor(p[1] / 70) % 3 !== (B.seed & 1)) continue; dot('b', p[0] - Math.sin(p[2]) * 2.6, p[1] + Math.cos(p[2]) * 2.6, .42); }
    const sxI = y => { let b = 0; for (let i = 1; i < spine.length; i++) if (Math.abs(spine[i][1] - y) < Math.abs(spine[b][1] - y)) b = i; return b; }, sx = y => spine[sxI(y)];

    // zawijasy wzdłuż łodygi: gęsto w skupiskach, rzadko pomiędzy
    let acc = 14, lastSide = 1; const branches = [];
    for (let i = 1; i < spine.length; i++) {
      const p = spine[i]; acc -= Math.hypot(p[0] - spine[i - 1][0], p[1] - spine[i - 1][1]); if (acc > 0) continue;
      const d = dens(p[1]); acc = 54 - 18 * d + R() * 16;
      if (p[1] < y0 + 14 || p[1] > y1 - 18 || nearHead(p[1]) || crossY.some(c => Math.abs(c - p[1]) < 40)) { acc = 8; continue; }
      const side = R() < .78 ? -lastSide : lastSide; lastSide = side;
      const room = side > 0 ? x1 - p[0] : p[0] - x0, size = Math.min(room * .75, (11 + 11 * d) * (.7 + R() * .6));
      const sc = scroll(p[0], p[1], p[2] - side * (.75 + R() * .45), side, size, d > .7 ? 2 : 1); if (sc && size > 10) branches.push({ at: i, pts: sc });
      if (d > .75 && R() < .25) { const r2 = side > 0 ? p[0] - x0 : x1 - p[0]; scroll(p[0], p[1], p[2] + side * (.8 + R() * .4), -side, Math.min(r2 * .45, size * .6), 0); }
    }
    // duże zwoje na przegięciach łodygi, zwinięte do środka pasa
    anc.slice(1, -1).forEach(([ax, ay]) => { if (nearHead(ay) || crossY.some(c => Math.abs(c - ay) < 40)) return;
      const i = sxI(ay), p = spine[i], side = ax < cx ? 1 : -1; const sc = scroll(p[0], p[1], p[2] + side * (PI / 2 + .3), side, Math.min(bw * .34, 16 + R() * 8), 1); if (sc) branches.push({ at: i, pts: sc }); });
    // krzyże, przerywane łuki, gwiazdki
    crossY.forEach(y => { const p = sx(y); cross(clampv(p[0], x0 + 28, x1 - 28), y, 25 + R() * 4); arc(cx, y + 10, bw * .44, -PI * .15, PI * .55 + R() * .3); });
    clusters.forEach(y => { const p = sx(y); arc(p[0] + (R() - .5) * 18, y, 20 + R() * 12, R() * PI, R() * PI + PI * (.6 + R() * .5)); });
    for (let y = y0 + 30 + R() * 40; y < y1 - 20; y += 70 + R() * 90) { const p = sx(y), side = p[0] < cx ? 1 : -1;
      sparkle(clampv(p[0] + side * (18 + R() * 22), x0 + 6, x1 - 6), y + (R() - .5) * 20, 2.5 + R() * 3); }
    // koraliki przy nagłówkach sekcji
    heads.filter(h => h > y0 + 8 && h < y1 - 8).forEach(h => { const p = sx(h);
      for (let k = 0; k < 5; k++) { const w = 2.6 - Math.abs(k - 2) * 1.1; Ly.sh.fillRect(Math.round(p[0] - 2), Math.round(h - 3 + k), 4, 2); Ly.r.fillRect(Math.round(p[0] - w / 2), Math.round(h - 2 + k), Math.max(1, Math.round(w)), 1); } });

    // zakończenia
    const top = spine[0], end = spine[spine.length - 1];
    if (B.cap === 'volute') {
      scroll(top[0], top[1] + 2, -PI / 2 - .2, top[0] < cx ? 1 : -1, 26, 2);
      dashed('b', line(top[0], top[1] - 2, top[0], 2), 1.4, 2.2);
      // dół: zwój odbija od łodygi, dalej wykropkowana nitka z koralikami i małym sigilem, jak u góry
      const side = end[0] < cx ? 1 : -1; scroll(end[0], end[1] - 16, PI / 2 - side * .9, -side, 15, 1);
      dashed('b', line(end[0], end[1] + 2, end[0], end[1] + 30), 3, 2.6, .5); dot('a', end[0], end[1] + 12, .8); dot('r', end[0], end[1] + 22, .7);
      const sy = end[1] + 36; stroke('a', line(end[0], sy - 5, end[0], sy + 5), t => .6 * (1 - Math.abs(t * 2 - 1)) + .15); stroke('a', line(end[0] - 3, sy - 1, end[0] + 3, sy - 1), () => .4);
      dot('a', end[0], sy + 8, .6); B.route = spine.concat(line(end[0], end[1] + 2, end[0], end[1] + 31));
    } else {
      // góra: gałąź w poprzek z wisiorkami
      const br = []; bez([x0 + 6, y0 - 10], [x0 + bw * .3, y0 - 28], [top[0] - 10, y0 - 14], top, br);
      stroke('a', br, (t, a) => Math.max(.42, .9 * nib(a) * Math.min(1, t * 4 + .25)));
      scroll(x0 + 7, y0 - 10, PI + .9, 1, 11, 1);
      [.35, .62].forEach((f, i) => { const p = br[Math.floor(br.length * f)]; pendant(p[0], p[1] + 1, 16 + i * 16); });
      // dół: wykropkowana nitka, z której kapie krew
      dashed('b', line(end[0], end[1], end[0], end[1] + 28), 3, 2.6, .5); dot('a', end[0], end[1] + 31, .9);
      B.route = spine.concat(line(end[0], end[1], end[0], end[1] + 33));
    }
    B.branches = branches;
    for (const L of Object.values(Ly)) L.restore();
  }
  // progowanie: linie ostre, przygaszone nitki ditherowane, czarna obwódka oddziela rycinę od tła
  const A = k => Ly[k].getImageData(0, 0, W, H).data;
  const a = A('a'), b = A('b'), r = A('r'), sh = A('sh');
  const img = new ImageData(W, H), D = img.data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, th = bth(x, y); let c = null;
    if (r[i + 3] / 255 > .34) c = COL.r;
    else if (a[i + 3] / 255 > .34) c = COL.a;
    else if (b[i + 3] / 255 > .2 + .4 * th) c = COL.b;
    else if (sh[i + 3] / 255 > .4) c = COL.sh;
    if (c) { D[i] = c[0]; D[i + 1] = c[1]; D[i + 2] = c[2]; D[i + 3] = c === COL.sh ? 190 : 255; }
  }
  // trasy spływu krwi: łodyga z nitką na końcu i odgałęzienia (duże zawijasy) przypięte do punktu łodygi
  const px = pts => { const o = []; for (const p of pts) { const x = Math.round(p[0]), y = Math.round(p[1]), l = o[o.length - 1]; if (l && l[0] === x && l[1] === y) continue; o.push([x, y, p[2]]); } return o; };
  const routes = bands.map(B => { const main = px(B.route), idx = i => { const p = B.route[i]; let b = 0; for (let k = 1; k < main.length; k++) if (Math.abs(main[k][1] - p[1]) + Math.abs(main[k][0] - p[0]) < Math.abs(main[b][1] - p[1]) + Math.abs(main[b][0] - p[0])) b = k; return b; };
    return { main, branches: B.branches.map(b => ({ at: idx(b.at), pts: px(b.pts) })) }; });
  return { img, routes, blood: tone === 'red' ? COL.a : COL.r };
}

// płótno: odsłanianie z góry na dół (jak rozkodowanie tekstu), potem krew: krople spadają z góry, wsiąkają w rycinę i spływają
// jej trasą (szybciej na stromych odcinkach, wolniej na zakrętach), czasem skręcają w zawijas, zostawiają zasychający ślad
// i skapują z końca
export function ornCanvas(cv) {
  const x = cv.getContext('2d');
  let base = null, rev = null, W = 0, H = 0, routes = [], col = [196, 18, 29];
  const flows = [], drops = [];
  let trails = [], prev = 0, wait = [];
  const spawn = (ri) => {
    const r = routes[ri], m = r.main, top = Math.random() < .45 ? 0 : Math.floor(Math.random() * m.length * .7);
    drops.push({ x: m[top][0], y: -4, v: 0, ri, to: top, ty: m[top][1] });
  };
  const run = (path, trail, from, ri) => flows.push({ path, trail, i: from, ri });
  const step = (now) => {
    const dt = Math.min(.1, (now - prev) / 1000); prev = now;
    routes.forEach((r, ri) => { wait[ri] -= dt; if (wait[ri] <= 0) { spawn(ri); wait[ri] = 5 + Math.random() * 6; } });
    for (let k = drops.length - 1; k >= 0; k--) { const d = drops[k]; d.v += 260 * dt; d.y += d.v * dt;
      if (d.ri != null && d.y >= d.ty) { const r = routes[d.ri]; run(r.main, trails[d.ri].main, d.to, d.ri); drops.splice(k, 1); continue; }
      if (d.y > H) drops.splice(k, 1); }
    for (let k = flows.length - 1; k >= 0; k--) { const f = flows[k], P = f.path;
      const p = P[Math.min(P.length - 1, f.i | 0)], v = 10 + 46 * Math.abs(Math.sin(p[2]));   // grawitacja: pion szybko, poziom wolno
      const i0 = f.i | 0; f.i += v * dt;
      for (let i = i0; i <= Math.min(P.length - 1, f.i | 0); i++) { f.trail[i] = 1;
        if (f.ri != null) { const br = routes[f.ri].branches.find(b => b.at === i); if (br && Math.random() < .3) run(br.pts, trails[f.ri].br[routes[f.ri].branches.indexOf(br)], 0, null); } }
      if (f.i >= P.length - 1) { const e = P[P.length - 1]; drops.push({ x: e[0], y: e[1] + 1, v: 0 }); flows.splice(k, 1); } }
    const decay = Math.exp(-dt / 4.5);
    trails.forEach(t => { for (const a of [t.main, ...t.br]) for (let i = 0; i < a.length; i++) if (a[i]) a[i] = a[i] < .04 ? 0 : a[i] * decay; });
  };
  const paint = () => {
    x.putImageData(base, 0, 0);
    const put = (pts, tr) => { for (let i = 0; i < pts.length; i++) { const v = tr[i]; if (!v) continue;
      const k = .3 + .7 * v; x.fillStyle = `rgb(${col[0] * k | 0},${col[1] * k | 0},${col[2] * k | 0})`; x.fillRect(pts[i][0], pts[i][1], v > .8 ? 2 : 1, 1); } };
    routes.forEach((r, ri) => { put(r.main, trails[ri].main); r.branches.forEach((b, j) => put(b.pts, trails[ri].br[j])); });
    x.fillStyle = `rgb(${Math.min(255, col[0] + 50)},${col[1] + 20},${col[2] + 20})`;
    flows.forEach(f => { const p = f.path[Math.min(f.path.length - 1, f.i | 0)]; x.fillRect(p[0], p[1], 2, 2); });
    drops.forEach(d => x.fillRect(Math.round(d.x), Math.round(d.y), 2, 2 + Math.min(2, d.v / 120 | 0)));
  };
  const draw = (now) => {
    if (!base) return;
    if (rev) {
      const t = now - rev, out = x.createImageData(W, H), S = base.data, O = out.data;
      for (let y = 0; y < H; y++) { const ty = y / H * 900; for (let xx = 0; xx < W; xx++) { const i = (y * W + xx) * 4; if (!S[i + 3]) continue;
        const k = (t - ty - bth(xx, y) * 420) / 150; if (k < 0) continue;
        if (k < 1 && S[i + 3] === 255) { O[i] = O[i + 1] = O[i + 2] = k < .5 ? 60 : 110; O[i + 3] = 255; } else { O[i] = S[i]; O[i + 1] = S[i + 1]; O[i + 2] = S[i + 2]; O[i + 3] = S[i + 3]; } } }
      x.putImageData(out, 0, 0); if (t > 900 + 420 + 150) { rev = null; prev = now; } return;
    }
    paint();
  };
  return {
    set(b) { base = b.img; W = base.width; H = base.height; cv.width = W; cv.height = H; routes = b.routes; col = b.blood;
      trails = routes.map(r => ({ main: new Float32Array(r.main.length), br: r.branches.map(q => new Float32Array(q.pts.length)) }));
      wait = routes.map((_, i) => 1 + i * 2.2); flows.length = drops.length = 0; draw(performance.now()); },
    reveal() { rev = performance.now(); const st = now => { draw(now); if (rev) requestAnimationFrame(st); }; requestAnimationFrame(st); },
    tick(now) { if (rev || !base) return; if (!prev) prev = now; step(now); paint(); },
  };
}
