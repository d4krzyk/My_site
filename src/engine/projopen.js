// przejście przy otwieraniu projektu z Maszynologii (kliknięcie nazwy w Release info albo `open <projekt>` w terminalu).
// Każdy projekt ma własną animację w kolorze projektu, w niskiej rozdzielczości 320x180 (piksel x3, dither Bayera, bitmapowa czcionka), jak dema z Amigi i PS1:
//   VE Visual Echoes: sonar, echa odszyfrowują bębny · WR WikiRooms: pokój po pokoju, na końcu drzwi · RM Remuz.io: korektor LED, potem analizator na cały ekran
//   MC MusicClubApp: winyl 3D (PS1) nad szachownicą Amigi, napis wokół płyty rozświetla się jak kula disco · SD ShadowDetection: lampa okrąża siatkę i rzuca cienie
//   GJ GameInJava: automat, bębny stają po kolei, jackpot, komórki spadają
// Na pionowym ekranie (telefon) sceny mają osobny układ pionowy (nie obrót poziomego): siatka większa, efekty na całą wysokość.
// Po animacji otwiera się repozytorium na GitHubie (w przyszłości: podstrona projektu). Gdy przeglądarka zablokuje wyskakujące okno (animacja trwa kilka sekund),
// na ekranie zostaje klikalny odnośnik.
import { RM } from './core';

export const PROJECT_KEYS = { A: 'VE', B: 'WR', C: 'RM', D: 'MC', E: 'SD', F: 'GJ' };
const END = { VE: 3750, WR: 3750, RM: 3800, MC: 5850, SD: 5350, GJ: 3750 };
// układ poziomy 320x180 albo pionowy (telefon): szerokość 180, wysokość z proporcji ekranu; sceny skalują się do W i H
function scene(V, cv, W, H, portrait) {
const PR = { VE: { cmd: 'OPEN VISUAL-ECHOES', rows: ['VISUAL', 'ECHOES 2.0'], col: [63, 240, 255] }, WR: { cmd: 'OPEN WIKIROOMS', rows: ['WIKI', 'ROOMS'], offs: [1, 4], col: [124, 255, 107] },
    RM: { cmd: 'OPEN REMUZ.IO', rows: ['REMUZ.IO'], col: [255, 179, 71] }, MC: { cmd: 'OPEN MUSICCLUBAPP', rows: ['MUSIC', 'CLUB', 'APP'], col: [255, 79, 216] },
    SD: { cmd: 'OPEN SHADOWDETECTION', rows: ['SHADOW', 'DETECTION'], col: [180, 140, 255] }, GJ: { cmd: 'OPEN GAMEINJAVA', rows: ['GAME', 'IN', 'JAVA'], col: [255, 210, 63] } }[V];
  const FT = `A 0111010001100011111110001100011000110001|B 1111010001100011111010001100011000111110|C 0111010001100001000010000100001000101110|D 1111010001100011000110001100011000111110|E 1111110000100001111010000100001000011111|F 1111110000100001111010000100001000010000|G 0111010001100001011110001100011000101111|H 1000110001100011111110001100011000110001|I 0111000100001000010000100001000010001110|J 0011100010000100001000010100101001001100|K 1000110010101001100011000101001001010001|L 1000010000100001000010000100001000011111|M 1000111011101011010110001100011000110001|N 1000111001101011001110001100011000110001|O 0111010001100011000110001100011000101110|P 1111010001100011111010000100001000010000|Q 0111010001100011000110001101011001001101|R 1111010001100011111010100100101000110001|S 0111110000100000111000001000010000111110|T 1111100100001000010000100001000010000100|U 1000110001100011000110001100011000101110|V 1000110001100011000110001100010101000100|W 1000110001100011000110101101011010101010|X 1000110001010100010001010100011000110001|Y 1000110001010100010000100001000010000100|Z 1111100001000100010001000100001000011111|0 0111010001100111010111001100011000101110|1 0010001100001000010000100001000010001110|2 0111010001000010001000100010001000011111|. 0000000000000000000000000000000110001100|: 0000001100011000000000000011000110000000|- 0000000000000001111100000000000000000000|# 0101001010111110101011111010100101000000|$ 0010001111101000111000101111100010000000|% 1100011001000100010001000100110001100000|& 0110010010101000100010101100101001001101|@ 0111010001101111010110111100001000001110|< 0001000100010001000000010000010000010000|> 0100000100000100000100010001000100000000|/ 0000100010000100010001000010001000010000|= 0000000000111110000011111000000000000000|+ 0000000100001001111100100001000000000000|* 0000000100101010111010101001000000000000|~ 0000000000010001010100010000000000000000|? 0111010001000010001000100001000000000100|_ 0000000000000000000000000000000000011111`;
  const FONT = {}; FT.split('|').forEach(e => { FONT[e[0]] = e.slice(2); });
  const SCR = '#$%&@01<>/=+*?X';
  const hsh = (a, b, c = 0) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5], bay = (x, y) => (B4[((y & 3) << 2) | (x & 3)] + .5) / 16;
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), seg = (t, a, b) => cl((t - a) / (b - a)), ease = k => k * k * (3 - 2 * k);
  const cx = cv.getContext('2d'), low = document.createElement('canvas'); low.width = W; low.height = H;
  const lx = low.getContext('2d'), img = lx.createImageData(W, H), D = new Uint32Array(img.data.buffer);
  const pack = (r, g, b) => (255 << 24) | (Math.min(255, b) << 16) | (Math.min(255, g) << 8) | Math.min(255, r);
  // rampa koloru projektu: 0 czerń … 1 kolor … 1.6 prawie biel
  const RAMP = Array.from({ length: 9 }, (_, i) => { const k = i / 5; const c = PR.col.map(v => k <= 1 ? v * k : v + (255 - v) * (k - 1) / .8); return pack(...c.map(Math.round)); });
  const GREY = [pack(10, 10, 14), pack(34, 36, 46), pack(64, 67, 82), pack(110, 114, 130), pack(220, 222, 230)];
  const ramp = (k, x, y) => { const f = cl(k, 0, 1.6) * 5, i = Math.floor(f); return RAMP[Math.min(8, i + (f - i > bay(x, y) ? 1 : 0))]; };
  const ps = (x, y, c) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < W && y < H) D[y * W + x] = c; };
  const fill = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) ps(x + i, y + j, c); };
  const glyph = (ch, x, y, c, s = 1, clip = null, a = 1) => { const g = FONT[ch]; if (!g) return; for (let r = 0; r < 8; r++) for (let q = 0; q < 5; q++) if (g[r * 5 + q] === '1')
    for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) { const X = x + q * s + i, Y = y + r * s + j; if (clip && (Y < clip[0] || Y >= clip[1])) continue; if (a < 1 && bay(X, Y) > a) continue; ps(X, Y, c); } };
  const text = (s, x, y, c, k = 1) => [...s].forEach((ch, i) => glyph(ch, x + i * 6 * k, y, c, k));
  // siatka 10x10: komórki 14x16, znaki 5x7 w skali 2
  const N = 10, CW = portrait ? 16 : 14, CH = portrait ? 20 : 16, GX = (W - N * CW) / 2, GY = portrait ? Math.round((H - N * CH) / 2) + 8 : 18, CX = W / 2, CY = GY + N * CH / 2, SX = W / 320, SY = H / 180, RMAX = Math.hypot(W / 2, H / 2) * 1.05 + 10;
  const target = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, q) => { const k = r - Math.floor((N - PR.rows.length) / 2), row = PR.rows[k];
    if (row !== undefined) { const off = PR.offs ? PR.offs[k] : Math.floor((N - row.length) / 2), ch = row[q - off]; if (ch && ch !== ' ') return { ch, name: true }; }
    const v = (Math.sin(q * .7 + r * .4) + Math.sin((q - r) * .5)) / 4 + .5; return { ch: null, v, name: false }; }));
  const cxy = (r, q) => [GX + q * CW + 2, GY + r * CH + 1];
  // komórka gotowa: nazwa jasno na ciemnym polu, reszta to ditherowane kafle w kolorze projektu
  function done(r, q, fl = false, k = 1) { const [x, y] = cxy(r, q), T = target[r][q];
    if (T.name) { fill(x - 2, y - 1, CW, CH, ramp(.18 * k, 0, 0)); glyph(T.ch, x, y - 1, fl ? RAMP[8] : ramp(1.15 * k, x, y), 2); }
    else for (let j = 0; j < CH - 2; j++) for (let i = 0; i < CW - 2; i++) ps(x - 1 + i, y + j, fl ? RAMP[7] : ramp((.12 + T.v * .4) * k * (1 - j / 40), x + i, y + j)); }
  // bęben: znaki przewijają się w pionie wewnątrz komórki, po zatrzymaniu odbicie o piksel
  function drum(r, q, t, stop, sp = .02, col = GREY[2]) { const [x, y] = cxy(r, q), clip = [y - 1, y - 1 + CH];
    if (t < stop) { const p = t * sp + hsh(r, q) * 9, i = Math.floor(p), f = p - i; for (const k of [0, 1]) glyph(SCR[Math.floor(hsh(r * 10 + q, i + k) * SCR.length)], x, y - 1 + Math.round((f - k) * CH), col, 2, clip); return; }
    const u = t - stop, b = u < 240 ? Math.round(Math.sin(u / 40) * Math.exp(-u / 80) * 3) : 0; const T = target[r][q];
    if (T.name) { fill(x - 2, y - 1, CW, CH, ramp(.18, 0, 0)); glyph(T.ch, x, y - 1 + b, u < 90 ? RAMP[8] : ramp(1.15, x, y), 2, clip); } else done(r, q, u < 90); }
  const all = f => { for (let r = 0; r < N; r++) for (let q = 0; q < N; q++) f(r, q, target[r][q]); };
  const frame = a => { if (a <= 0) return; const c = ramp(.55 * a, 0, 0), c2 = ramp(.22 * a, 0, 0); for (let i = -4; i < N * CW + 4; i++) { ps(GX + i, GY - 4, c); ps(GX + i, GY + N * CH + 3, c); if (i % 2 === 0) { ps(GX + i, GY - 6, c2); ps(GX + i, GY + N * CH + 5, c2); } }
    for (let j = -4; j < N * CH + 4; j++) { ps(GX - 4, GY + j, c); ps(GX + N * CW + 3, GY + j, c); if (j % 2 === 0) { ps(GX - 6, GY + j, c2); ps(GX + N * CW + 5, GY + j, c2); } } };
  const term = t => { text('GOSC@MASZYNOLOGIA:~/PROJEKTY$', 4, 3, pack(255, 58, 58)); const s = PR.cmd, n = Math.floor(seg(t, 0, 420) * s.length), tx = portrait ? 4 : 184, ty = portrait ? 14 : 3; text(s.slice(0, n), tx, ty, GREY[4]); if ((t / 250 | 0) % 2) fill(tx + n * 6, ty, 5, 7, GREY[4]); };
  // strona projektu: rozpuszcza się progiem Bayera
  const page = a => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (bay(x, y) < a * 1.05) D[y * W + x] = ramp(.1 + .05 * Math.sin(y / 3), x, y);
    if (a > .5) { const lines = portrait ? PR.rows : [PR.rows.join(' ')], mx = Math.max(...lines.map(l => l.length)), k = portrait ? Math.max(1, Math.min(3, Math.floor((W - 8) / (mx * 6)))) : mx > 13 ? 2 : 3, lh = 8 * k + 5, y0 = Math.round(H / 2 - lines.length * lh / 2 - (portrait ? 8 : 0));
      lines.forEach((l, i) => text(l, (W - l.length * 6 * k) / 2, y0 + i * lh, ramp(1.2, 0, 0), k)); text('> GITHUB', (W - 8 * 6) / 2, y0 + lines.length * lh + 8, GREY[3]); } };
  const P = {
    // sonar: pikselowe, ditherowane pierścienie echa; komórka zatrzymuje się, gdy przejdzie przez nią pierwsza fala
    VE(t) { const pings = [650, 1250, 1850], sp = .1;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const d = Math.hypot(x - CX, (y - CY) * 1.1); let I = 0; for (const p of pings) { const R = (t - p) * sp; if (R > 0 && R < RMAX) I = Math.max(I, (1 - Math.abs(d - R) / 9) * (1 - R / RMAX)); }
        if (I > 0) D[y * W + x] = ramp(I * .55, x, y); }
      frame(seg(t, 400, 600)); all((r, q) => { if (t < 420) return; const [x, y] = cxy(r, q), d = Math.hypot(x + 5 - CX, (y + 7 - CY) * 1.1); let near = 0;
        for (const p of pings) near = Math.max(near, 1 - Math.abs((t - p) * sp - d) / 10); drum(r, q, t, 650 + d / sp, .018, near > 0 ? ramp(.4 + near * .9, x, y) : GREY[1]); });
      if (t > 2250 && t < 3000) { const e = seg(t, 2250, 3000); for (const s of [-1, 1]) for (let k = 1; k <= 3; k++) all((r, q, T) => { if (!T.name) return; const [x, y] = cxy(r, q); glyph(T.ch, x + s * k * e * 14, y - 1, ramp(.9 - k * .2, x, y), 2, null, (1 - e) * (1 - k * .22)); }); }
      const ex = seg(t, 2900, 3500); if (ex > 0) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const d = Math.hypot(x - CX, (y - CY) * 1.1), R = ex * RMAX * 1.4; if (d < R) D[y * W + x] = ramp(.1 + .35 * (Math.floor((R - d) / 8) % 2), x, y); }
      if (t > 3300) page(seg(t, 3300, 3700)); },
    // pokoje: ściany kreślone piksel po pikselu, podłoga w kratkę, na końcu drzwi i snop światła
    WR(t) { frame(seg(t, 400, 600)); const rooms = [[0, 3, 3, 4], [0, 0, 4, 3], [4, 0, 3, 3], [3, 3, 4, 4], [7, 0, 3, 5], [7, 5, 3, 2], [5, 7, 5, 3], [0, 7, 5, 3]];
      rooms.forEach(([rx, ry, rw, rh], i) => { const t0 = 650 + i * 220;
        for (let r = ry; r < ry + rh; r++) for (let q = rx; q < rx + rw; q++) { if (t < 420) continue; if (t > t0 + 150) { const [x, y] = cxy(r, q); for (let j = 0; j < CH; j++) for (let k = 0; k < CW; k++) if (((x + k >> 2) + (y + j >> 2)) % 2) ps(x - 2 + k, y - 1 + j, ramp(.07, 0, 0)); }
          drum(r, q, t, t0 + 150 + (q - rx) * 30, .02, t > t0 ? ramp(.45, 0, 0) : GREY[1]); }
        const k = seg(t, t0, t0 + 160); if (k > 0) { const X0 = GX + rx * CW, Y0 = GY + ry * CH, w = rw * CW - 1, h = rh * CH - 1, per = 2 * (w + h), n = per * k;
          for (let p = 0; p < n; p++) { const [x, y] = p < w ? [X0 + p, Y0] : p < w + h ? [X0 + w, Y0 + p - w] : p < 2 * w + h ? [X0 + w - (p - w - h), Y0 + h] : [X0, Y0 + h - (p - 2 * w - h)]; ps(x, y, ramp(k < 1 ? 1.3 : .7, x, y)); } } });
      const o = ease(seg(t, 2650, 3150)); if (o > 0) { const dw = 30, dh = 52, dx = CX - dw / 2, dy = CY - dh / 2 + 6;
        for (let y = dy - 3; y < dy + dh; y++) for (let x = dx - 3; x < dx + dw + 3; x++) ps(x, y, ramp(.25, x, y));
        for (let y = dy; y < dy + dh; y++) for (let x = dx; x < dx + dw; x++) { const open = Math.abs(x - CX) < o * dw / 2; ps(x, y, open ? RAMP[7] : ramp(.45 + ((x - dx) % 6 === 0 ? -.15 : 0), x, y)); }
        for (let y = dy + dh; y < H; y++) { const sp = (y - dy - dh) * (.4 + o); for (let x = CX - o * dw / 2 - sp; x < CX + o * dw / 2 + sp; x++) { const f = 1 - (y - dy - dh) / 70; if (bay(x, y) < f * o) ps(x, y, ramp(1.1, x, y)); } } }
      const z = seg(t, 3100, 3450); if (z > 0) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (Math.abs(x - CX) < z * W * .56 * (1 - bay(x, y) * .3) && Math.abs(y - CY) < z * H * .67) D[y * W + x] = ramp(1.2, x, y);
      if (t > 3350) page(seg(t, 3350, 3700)); },
    // korektor: kolumny LED skaczą w rytm i po kolei blokują się w nazwę; potem analizator rozchodzi się od siatki na cały ekran i rośnie do pełna
    RM(t) { frame(seg(t, 400, 600)); const sp = seg(t, 2500, 3500);
      const nb = 40, bw = W / nb; if (sp > 0) for (let i = 0; i < nb; i++) { const xc = i * bw, dc = Math.abs(xc + bw / 2 - CX) / CX, on = cl(sp * 2.2 - dc * 1.2); if (on <= 0) continue;
        const lvl = cl(Math.abs(Math.sin(t / 130 + i * .7)) * .55 + sp * .9) * (H - 16) * on; for (let y = H - 2; y > H - 2 - lvl; y -= 3) for (let x = xc + 1; x < xc + bw - 1; x++) ps(x, y, ramp(.25 + (H - y) / H * 1.0, x, y)); }
      all((r, q) => { if (t < 420) return; const lock = 1000 + q * 120, [x, y] = cxy(r, q);
        if (t >= lock) { fill(x - 2, y - 1, CW, CH, GREY[0]); return drum(r, q, t, lock); }
        const lvl = Math.abs(Math.sin(t / 150 + q * .9)) * N; fill(x - 2, y - 1, CW, CH, GREY[0]);
        if (N - 1 - r < lvl) { const k = 1 - r / N; for (let j = 0; j < CH - 3; j += 3) fill(x - 1, y + j, CW - 2, 2, ramp(.35 + k * .9, x, y + j)); }
        else glyph(SCR[Math.floor(hsh(r * 10 + q, t / 45 | 0) * SCR.length)], x, y - 1, GREY[1], 2); });
      frame(seg(t, 400, 600)); if (t > 3400) page(seg(t, 3400, 3800)); },
    // płyta winylowa 3D (płaskie cieniowanie jak na PlayStation) nad szachownicą Amigi: wiruje i tańczy, powoli zwalnia;
    // napis biegnie wokół płyty, rozsypane litery zjeżdżają się na miejsce i rozświetlają po kolei jak kula disco; na końcu najazd
    MC(t) { const spin = 420, stop = 3300, sk = seg(t, spin, stop), th = Math.PI * 2 * 5 * (1 - (1 - sk) ** 2), live = 1 - ease(seg(t, 2400, stop));
      const tilt = .9 + Math.sin(t / 520) * .18 * live - .5 * ease(seg(t, 2600, 3600)), wob = Math.sin(t / 380) * .14 * live;
      const zoom = 1 + Math.pow(seg(t, 4700, 5600), 2.2) * 9, R = (portrait ? 78 : 66) * zoom, HZ = CY - 2;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (y < HZ) { const b = Math.floor((y + t / 60) / 8) % 5; D[y * W + x] = ramp(.04 + b * .025, x, y); continue; }
        const z = 50 / (y - HZ + .5), u = (x - CX) * z / 34, v = z * 1.45 + t / 900, fog = cl(1 - z / 14);
        D[y * W + x] = ((Math.floor(u) + Math.floor(v)) & 1) ? ramp(.42 * fog, x, y) : ramp(.05 * fog, x, y); }
      const join = ease(seg(t, 2800, 3700)), TXT = 'MUSIC*CLUB*APP*MUSIC*CLUB*APP*', n = TXT.length, CIRC = n * 6;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const sx = (x - CX) / R, sy0 = (y - CY + 8) / R, ct = Math.cos(tilt) || .01, sy = (sy0 - sx * wob) / ct;
        const per = 1 + sy * Math.sin(tilt) * .25, u = sx / per, v = sy / per, rr = Math.hypot(u, v); if (rr > 1) continue;
        const a = ((Math.atan2(v, u) - th) % (2 * Math.PI) + 4 * Math.PI) % (2 * Math.PI);
        if (rr < .3) { D[y * W + x] = rr < .035 ? GREY[0] : ramp(rr > .26 ? .3 : .75 - rr + (Math.floor(rr * 30) % 3 ? 0 : .12), x, y); continue; }
        // pierścień z napisem (r .58–.82): wiersz glifu z promienia, kolumna z kąta
        if (rr > .58 && rr < .82) { const gy = Math.floor((.82 - rr) / .24 * 8), sPos = a / (2 * Math.PI) * CIRC; let on = false, lit = 0;
          for (let i = 0; i < n; i++) { const c0 = i * 6 + (1 - join) * (hsh(i, 5) - .5) * 40; let gx = Math.floor(sPos - c0); if (gx < -CIRC / 2) gx += CIRC; if (gx < 0 || gx >= 5) continue;
            const ch = TXT[i] === '*' ? '*' : join > hsh(i, 2) * .8 + .15 ? TXT[i] : SCR[Math.floor(hsh(i, t / 90 | 0) * SCR.length)], g = FONT[ch], dy = Math.round((1 - join) * (hsh(i, 8) - .5) * 6);
            if (g && gy - dy >= 0 && gy - dy < 8 && g[(gy - dy) * 5 + gx] === '1') { on = true; lit = cl((t - 3700 - (i % 15) * 70) / 120); } }
          if (on) { D[y * W + x] = lit > 0 ? (hsh(x, y, t / 80 | 0) < .12 * lit ? pack(255, 255, 255) : ramp(.7 + lit * .8, x, y)) : ramp(.35 + join * .2, x, y); continue; } }
        const groove = (Math.floor(rr * 46) % 2) * .05, spec = Math.max(0, Math.cos((Math.atan2(v, u) - .8) * 2)) ** 8 * .5;
        D[y * W + x] = spec > .08 ? ramp(spec * 1.2, x, y) : rr > .97 ? GREY[2] : pack(14 + groove * 300, 12 + groove * 200, 20 + groove * 300); }
      // kula disco: po rozświetleniu po tle krążą jasne plamki
      const dl = seg(t, 3900, 4300); if (dl > 0) for (let k = 0; k < 26; k++) { const a = hsh(k, 1) * 6.28 + t / 1100 * (k % 2 ? 1 : -1), rr = 60 + hsh(k, 2) * 120, X = CX + Math.cos(a) * rr * 1.4 * SX, Y = CY + Math.sin(a) * rr * .6 * SY;
        if (Math.hypot((X - CX) / R, (Y - CY) / R) < 1) continue; fill(X - 1, Y, 3, 1, ramp(1.2 * dl, 0, 0)); fill(X, Y - 1, 1, 3, ramp(1.2 * dl, 0, 0)); }
      if (t > 5400) page(seg(t, 5400, 5800)); term(t); },
    // cienie: lampa powoli okrąża siatkę zgodnie z ruchem wskazówek zegara; każdy znak rzuca długi pikselowy cień, a komórki, nad którymi
    // przejdzie światło, odszyfrowują się; po pełnym okrążeniu lampa schodzi na środek, rozświetla się i zalewa ekran (przejście)
    SD(t) { const orb = seg(t, 500, 3700), a = -Math.PI / 2 + orb * Math.PI * 2, mid = ease(seg(t, 3800, 4400)), fl = seg(t, 4400, 5000);
      const Lx = CX + Math.cos(a) * W * .369 * (1 - mid), Ly = CY + Math.sin(a) * H * (portrait ? .44 : .511) * (1 - mid), occ = new Uint8Array(W * H); D.fill(0);
      all((r, q, T) => { if (t < 420) return; const [x, y] = cxy(r, q), ca = Math.atan2(y + 7 - CY, x + 5 - CX); let da = ((ca - (-Math.PI / 2)) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        T.lk = T.lk || (t > 500 && (orb * 2 * Math.PI > da + .25 || orb >= 1) ? t : 0);
        if (T.lk) { if (T.name) glyph(T.ch, x, y - 1, 1, 2); else if (T.v > .62) fill(x + 2, y + 3, 6, 8, 1); } else glyph(SCR[Math.floor(hsh(r * 10 + q, t / 50 | 0) * SCR.length)], x, y - 1, 1, 2); });
      for (let i = 0; i < W * H; i++) occ[i] = D[i] ? 1 : 0;
      const I0 = 1 + mid * .4 + fl * 2, RAD = 200 + fl * 300;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x, dx = Lx - x, dy = Ly - y, d = Math.hypot(dx, dy) || 1; let I = I0 * Math.max(0, 1 - d / RAD);
        if (!occ[i] && I > 0 && fl < .6) { const n = Math.min(90, d | 0); for (let s = 3; s < n; s += 2) { const X = x + dx * s / d | 0, Y = y + dy * s / d | 0; if (occ[Y * W + X]) { I *= .16 + fl; break; } } }
        D[i] = occ[i] ? ramp(.45 + I * 1.1, x, y) : ramp(I * .55, x, y); }
      all((r, q, T) => { if (T.lk && t - T.lk < 90 && T.name) { const [x, y] = cxy(r, q); glyph(T.ch, x, y - 1, RAMP[8], 2); } });
      const ls = 2 + Math.round(mid * 2 + fl * 6); fill(Lx - ls, Ly - ls, ls * 2 + 1, ls * 2 + 1, RAMP[8]); fill(Lx - ls - 3, Ly, ls * 2 + 7, 1, RAMP[6]); fill(Lx, Ly - ls - 3, 1, ls * 2 + 7, RAMP[6]);
      frame(seg(t, 400, 600)); term(t); if (t > 4900) page(seg(t, 4900, 5300)); if (t < 400) target.forEach(r => r.forEach(T => T.lk = 0)); },
    GJ(t) { frame(seg(t, 400, 600));
      all((r, q, T) => { if (t < 420) return; const stop = 900 + q * 150; if (t < stop) { const [x, y] = cxy(r, q); for (const k of [2, 1]) { const tt = t - k * 18; drum(r, q, tt, stop, .06, k === 2 ? GREY[1] : GREY[2]); } }
        const fall = t > 2950 ? Math.pow((t - 2950 - (9 - r) * 25 - hsh(r, q) * 80) / 1000, 2) * 300 : 0; if (fall > 0) { const [x, y] = cxy(r, q); if (y + fall < H) { const T2 = target[r][q]; if (T2.name) glyph(T2.ch, x, y - 1 + fall, ramp(1.1, x, y), 2); else fill(x, y + fall, 10, 12, ramp(.2 + T2.v * .3, x, y)); } return; }
        drum(r, q, t, stop, .06, GREY[3]); });
      if (t > 2450 && t < 2950) { const on = (t / 100 | 0) % 2; if (on) all((r, q, T) => { if (T.name) { const [x, y] = cxy(r, q); fill(x - 2, y - 1, CW, CH, RAMP[5]); glyph(T.ch, x, y - 1, GREY[0], 2); } });
        for (let k = 0; k < 40; k++) { const a = hsh(k, 1) * 6.28, u = (t - 2450) / 1000, X = CX + Math.cos(a) * u * (60 + hsh(k, 2) * 140) * SX, Y = CY + (Math.sin(a) * u * 80 + u * u * 160) * SY; fill(X - 1, Y - 1, 3, 3, RAMP[5]); ps(X, Y, RAMP[8]); } }
      const fl = seg(t, 3050, 3450); if (fl > 0) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (bay(x, y) < fl * 1.4 - y / H * .4) D[y * W + x] = ramp(.25 + .1 * ((y >> 3) % 2), x, y);
      if (t > 3350) page(seg(t, 3350, 3700)); },
  };
  return t => { D.fill(GREY[0]); if (V !== 'MC' && V !== 'SD') term(t); P[V](t); lx.putImageData(img, 0, 0); cx.imageSmoothingEnabled = false; cx.drawImage(low, 0, 0, cv.width, cv.height); };
}

let busy = false;
export function openProject(key, url) {
  const open = () => { const w = window.open(url, '_blank'); if (w) { try { w.opener = null; } catch (e) {} } return !!w; };
  if (RM || !END[key] || busy) { if (!busy) open(); return; }
  busy = true;
  const portrait = innerHeight > innerWidth, W = portrait ? 180 : 320, H = portrait ? Math.max(240, Math.min(420, Math.round(180 * innerHeight / innerWidth))) : 180;
  const ov = document.createElement('div'); ov.className = 'pj-ov'; ov.innerHTML = `<canvas width="${W}" height="${H}"></canvas>`; document.body.appendChild(ov);
  const cv = ov.firstChild, render = scene(key, cv, W, H, portrait); let t0 = 0, last = -1e9, done = false, raf = 0;
  const close = () => { cancelAnimationFrame(raf); removeEventListener('keydown', onKey); ov.classList.add('out'); setTimeout(() => { ov.remove(); busy = false; }, 380); };
  const finish = () => { if (done) return; done = true; cancelAnimationFrame(raf); render(END[key]);
    if (open()) close();
    else { ov.style.cursor = 'default'; const a = document.createElement('a'); a.className = 'pj-link dos'; a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'github ›'; a.addEventListener('click', () => setTimeout(close, 50)); ov.append(a); a.focus(); } };
  const onKey = e => { if (e.key === 'Escape') finish(); }; addEventListener('keydown', onKey); ov.addEventListener('click', e => { if (!e.target.closest('a')) finish(); });
  const step = now => { raf = requestAnimationFrame(step); if (!t0) t0 = now; const t = now - t0; if (t - last < 30) return; last = t; if (t >= END[key]) { finish(); return; } render(t); };
  raf = requestAnimationFrame(step);
}
