// boczne ornamenty NFO liczone proceduralnie: łańcuch esowatych wiązek pasm (zwężają się do ostrza na przegięciach,
// rozchodzą się na przecięciach), kolce na zakrętach i akcenty (kręgi, krzyże, półksiężyce, iglice) w zmiennych odstępach.
// Faza jest ciągła, więc nie ma szwów; warianty (okres, amplituda, rozstaw) płynnie się zmieniają. Pół-bloki ▀▄█ w siatce 2x.
const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

const ACC = {
  ring: [' ▄▄▄▄▄ ', '▐▀   ▀▌', '▐ ▄█▄ ▌', '▐▄ ▀ ▄▌', ' ▀▀▀▀▀ '],
  cross: ['   ▓   ', '   █   ', ' ▄▄█▄▄ ', ' ▀▀█▀▀ ', '   █   ', '   █   ', '   ▒   '],
  crescent: ['  ▄▄▄  ', ' ▄▀ ▀▀▄', '▐▌     ', '▐▌     ', ' ▀▄  ▄▀', '  ▀▀▀  '],
  spire: ['   ▄   ', '  ▐█▌  ', '  ▐█▌  ', ' ▄▐█▌▄ ', '▐█▀█▀█▌', '  ▐█▌  ', '   ▀   '],
};
const AW = 7;

export function genSide(rows, cols, seed, o) {
  const R = rng(seed), H = rows * 2, mid = (cols - 1) / 2, TAU = Math.PI * 2;
  const g = Array.from({ length: H }, () => new Uint8Array(cols));
  const set = (x, y, v) => { x = Math.round(x); if (x < 0 || x >= cols || y < 0 || y >= H) return; if (!g[y][x] || v < g[y][x]) g[y][x] = v; };
  // segmenty z własnymi parametrami; wartości interpolowane między środkami segmentów
  const seg = []; let y0 = 0;
  while (y0 < H + 60) { const len = 30 + (R() * 22 | 0); seg.push({ c: y0 + len / 2, P: o.P[0] + R() * (o.P[1] - o.P[0]), A: o.A[0] + R() * (o.A[1] - o.A[0]), gap: o.gap[0] + R() * (o.gap[1] - o.gap[0]) }); y0 += len; }
  const par = (y, key) => { let i = 0; while (i < seg.length - 2 && seg[i + 1].c < y) i++; const a = seg[i], b = seg[i + 1], t = Math.max(0, Math.min(1, (y - a.c) / (b.c - a.c))); return a[key] + (b[key] - a[key]) * t; };
  const k = o.k, prev = new Array(k).fill(null), acc = [];
  let ph = R() * TAU, cross = 0, nAcc = 0;
  const ACCH = n => ACC[n].length;
  for (let y = 0; y < H; y++) {
    const p0 = ph; ph += TAU / par(y, 'P');
    const cx = mid + par(y, 'A') * Math.sin(ph), cs = Math.abs(Math.cos(ph)), spread = par(y, 'gap') * (.3 + .7 * cs);
    for (let i = 0; i < k; i++) {
      const xi = cx + (i - (k - 1) / 2) * spread, v = Math.abs(i - (k - 1) / 2) < .75 ? 1 : 2;
      const a = prev[i] === null ? xi : prev[i];
      for (let x = Math.round(Math.min(a, xi)); x <= Math.round(Math.max(a, xi)); x++) set(x, y, v);
      prev[i] = xi;
    }
    // zakręt (ekstremum sinusa): kolec na zewnątrz i w dół
    if (Math.floor((ph - Math.PI / 2) / Math.PI) !== Math.floor((p0 - Math.PI / 2) / Math.PI) && o.thorn && y > 6) {
      const dir = Math.sin(ph) > 0 ? 1 : -1, bx = cx + dir * ((k - 1) / 2 * spread + 1), len = 3 + (R() * 3 | 0);
      for (let j = 0; j < len; j++) set(bx + dir * j * .9, y + j, 2);
    }
    // przecięcie (środek esa): kandydat na akcent
    if (Math.floor(ph / Math.PI) !== Math.floor(p0 / Math.PI)) {
      cross++;
      const r = Math.round(y / 2), last = acc.length ? acc[acc.length - 1].r : -99;
      if (cross % o.every === o.off && r > 9 && r < rows - 11 && r - last > 9) acc.push({ r: r - 3, name: o.acc[nAcc++ % o.acc.length] });
    }
  }
  const ch = Array.from({ length: rows }, () => new Array(cols).fill(' ')), cl = Array.from({ length: rows }, () => new Array(cols).fill(' '));
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const t = g[2 * r][c], b = g[2 * r + 1][c];
    if (!t && !b) continue;
    const v = Math.min(t || 9, b || 9);
    ch[r][c] = t && b ? (v === 2 && R() < .3 ? '▒' : '█') : t ? '▀' : '▄'; cl[r][c] = v === 1 ? 'o' : 'q';
  }
  acc.unshift({ r: 1, name: o.start }); acc.push({ r: rows - 1 - ACCH(o.end), name: o.end });
  for (const a of acc) {
    const A = ACC[a.name], c0 = Math.round(mid - AW / 2);
    for (let i = 0; i < A.length; i++) { const r = a.r + i; if (r < 0 || r >= rows) continue;
      for (let c = Math.max(0, c0 - 1); c <= Math.min(cols - 1, c0 + AW); c++) { ch[r][c] = ' '; cl[r][c] = ' '; }
      for (let j = 0; j < AW; j++) { const x = c0 + j; if (x < 0 || x >= cols || A[i][j] === ' ') continue; ch[r][x] = A[i][j]; cl[r][x] = '░▒▓'.includes(A[i][j]) ? 'q' : 'o'; } }
  }
  return { ch: ch.map(r => r.join('')), cl: cl.map(r => r.join('')) };
}
