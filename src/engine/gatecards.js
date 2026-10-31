// wybór drogi w bramie na kartach (te same awersy co w nawigacji kartami): po zejściu karty wyłaniają się z cienia (komputer: od spodu, telefon: z boków),
// a po wyborze wybrana karta się spala: ogień idzie od dołu ku górze, piksele żarzą się biało, żółto i czerwono, zwęglają się i odlatują jako popiół;
// druga karta gaśnie w cieniu. Po spaleniu wołamy dalej (kurtyna sigili, veil.js).
import { RM, bth } from './core';

const hh = (a, b, c = 0) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

/* ---------- wyłanianie: cień z ditheru odpływa, karty wjeżdżają na miejsce skokami (CSS), potem odsłaniają podpisy ---------- */
export function riseCards(gate) {
  const paths = gate.querySelector('.paths'), cards = [...gate.querySelectorAll('.path')]; if (!paths) return;
  const ready = () => { paths.classList.add('ready'); };
  if (RM) { cards.forEach(c => c.classList.add('in')); ready(); return; }
  const phone = matchMedia('(max-width:700px)').matches; paths.classList.add(phone ? 'side' : 'below');
  setTimeout(() => { cards.forEach(c => c.classList.add('in')); }, 450);       // najpierw rozszyfrowuje się tytuł, potem karty
  setTimeout(() => { const b = cards[1], im = b && b.querySelector('.pcard img'); if (im && b.isConnected) emberCorner(b.querySelector('.pcard'), im.src, () => !b.classList.contains('dim') && !b.classList.contains('burning')); }, 450 + 1400);   // żar nad spalonym rogiem karty Maszynologii
  setTimeout(ready, 450 + 1700);
  // cień: czarny dither przykrywa okolice kart i odpływa (komputer: w dół, telefon: na boki)
  const PX = 3, c = document.createElement('canvas'); c.className = 'pshade'; paths.appendChild(c);
  const r = paths.getBoundingClientRect(), W = Math.ceil((r.width + 80) / PX), H = Math.ceil((r.height + 140) / PX); c.width = W; c.height = H;
  c.style.cssText = `position:absolute;left:-40px;top:-40px;width:${W * PX}px;height:${H * PX}px;image-rendering:pixelated;pointer-events:none;z-index:3`;
  const x = c.getContext('2d'), img = x.createImageData(W, H), D = img.data; let t0 = 0, last = 0;
  (function f(now) { if (!c.isConnected) return; if (!t0) t0 = now; const t = now - t0 - 300, k = Math.max(0, Math.min(1, t / 1500)); if (now - last < 40) { requestAnimationFrame(f); return; } last = now;
    for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
      // wartość „ile cienia": 1 przy źródle cienia, maleje, gdy front odpływa
      const u = phone ? Math.abs(xx - W / 2) / (W / 2) : yy / H;                    // komputer: cień z góry odpływa w dół, telefon: ze środka na boki
      const v = 1 - Math.max(0, (k * 1.35 - (phone ? 1 - u : u))) * 3;               // przed frontem 1, za frontem schodzi do 0
      const a = v > bth(xx, yy) ? 255 : 0, i = (yy * W + xx) * 4; D[i] = 3; D[i + 1] = 2; D[i + 2] = 6; D[i + 3] = a; }
    x.putImageData(img, 0, 0); if (k < 1) requestAnimationFrame(f); else c.remove(); })(performance.now());
}

/* ---------- spalenie karty ---------- */
export function burnCard(btn, onDone) {
  const pc = btn.querySelector('.pcard'), im = btn.querySelector('.pcard img'); if (!pc || !im || RM) { onDone(); return; }
  const SW = 44, SH = 66, M = 12, UP = 40, CW = SW + M * 2, CH = SH + UP + M, sc = im.offsetWidth / SW || 3;
  const src = document.createElement('canvas'); src.width = SW; src.height = SH; const sx = src.getContext('2d', { willReadFrequently: true }); sx.drawImage(im, 0, 0, SW, SH);
  const sd = sx.getImageData(0, 0, SW, SH).data, bt = new Float32Array(SW * SH).fill(9), opaque = [];
  for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) { const i = y * SW + x; if (!sd[i * 4 + 3]) continue; opaque.push(i);
    // czas zapłonu: od dołu ku górze, z poszarpaniem i wcześniejszym paleniem brzegów (ogień chwyta krawędzie)
    const edge = Math.min(x, SW - 1 - x, y, SH - 1 - y) / 22, n = hh(x >> 1, y >> 1) * .6 + hh(x, y) * .4;
    bt[i] = ((SH - y) / SH) * .62 + n * .24 + edge * .06 + Math.sin(x * .55 + 1.3) * .035; }
  const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; cv.className = 'pburn';
  cv.style.cssText = `position:absolute;left:${-M * sc}px;top:${-UP * sc}px;width:${CW * sc}px;height:${CH * sc}px;image-rendering:pixelated;pointer-events:none;z-index:2`;
  btn.querySelectorAll('.pember').forEach(e => e.remove());
  pc.appendChild(cv); im.style.visibility = 'hidden'; btn.classList.add('burning');
  const x = cv.getContext('2d'), out = x.createImageData(CW, CH), O = out.data, spawned = new Uint8Array(SW * SH), parts = [];
  let t0 = 0, last = 0, called = false;
  const put = (px, py, r, g, b) => { px |= 0; py |= 0; if (px < 0 || py < 0 || px >= CW || py >= CH) return; const o = (py * CW + px) * 4; O[o] = r; O[o + 1] = g; O[o + 2] = b; O[o + 3] = 255; };
  (function f(now) { if (!cv.isConnected) return; requestAnimationFrame(f); if (!t0) t0 = now; if (now - last < 41) return; last = now;
    const t = now - t0, P = t / 1050, fr = (t / 41) | 0; O.fill(0);
    const front = new Int16Array(SW).fill(-1);                                          // najwyżej położony płonący piksel w kolumnie
    for (const i of opaque) { const x0 = i % SW, y0 = (i / SW) | 0, d = P - bt[i];
      if (d < 0) { put(x0 + M, y0 + UP, sd[i * 4], sd[i * 4 + 1], sd[i * 4 + 2]); continue; }
      if (d < .06) put(x0 + M, y0 + UP, 255, 252, 230); else if (d < .13) put(x0 + M, y0 + UP, 255, 190, 64); else if (d < .2) put(x0 + M, y0 + UP, 238, 92, 24);
      else if (d < .3) { const e = hh(x0, y0, fr >> 1) < .12; put(x0 + M, y0 + UP, e ? 196 : 40, e ? 40 : 20, e ? 24 : 18); } else continue;
      if (d < .2 && (front[x0] < 0 || y0 < front[x0])) front[x0] = y0;
      if (!spawned[i] && d > .1 && d < .22 && hh(x0, y0, 5) < .5 && parts.length < 260) { spawned[i] = 1; parts.push({ x: x0 + M, y: y0 + UP, vx: (Math.random() - .5) * .5, vy: -(.35 + Math.random() * .9), life: 22 + Math.random() * 30, age: 0 }); } }
    // płomienie nad frontem: kilka migoczących pikseli nad każdą płonącą kolumną
    for (let xx = 0; xx < SW; xx++) { const fy = front[xx]; if (fy < 0) continue; const h = 1 + ((hh(xx, fr, 9) * 4) | 0);
      for (let k = 1; k <= h; k++) put(xx + M, fy + UP - k, k < 2 ? 255 : 255, k < 2 ? 200 : 120, k < 2 ? 80 : 30); }
    // iskry i popiół: lecą w górę, żar → popiół → znikają
    for (let k = parts.length - 1; k >= 0; k--) { const p = parts[k]; p.age++; p.x += p.vx + Math.sin(p.age * .4 + k) * .12; p.y += p.vy; p.vy *= .985;
      if (p.age > p.life) { parts.splice(k, 1); continue; } const a = p.age / p.life; if (a < .35) put(p.x, p.y, 255, 170, 60); else if (a < .7) put(p.x, p.y, 200, 70, 30); else if (hh(k, p.age) < .7) put(p.x, p.y, 90, 88, 98); }
    x.putImageData(out, 0, 0);
    if (!called && P > 1.02) { called = true; onDone(); }                                  // karta w większości spalona: przejście do działu
    if (P > 1.35 && !parts.length) cv.remove(); })(performance.now());
}

/* ---------- żar i iskierki nad spalonym rogiem karty (Maszynologia): krawędź przypalenia pulsuje żarem, a z niej unoszą się drobne iskry ---------- */
// host: element karty (pozycjonowany; płótno jest jego dzieckiem i obraca się razem z kartą), src: awers z wypalonym rogiem, on(): czy karta jest teraz widoczna
export function emberCorner(host, src, on = () => true) {
  if (RM || !host) return () => {};
  const SW = 44, SH = 66, M = 10, UP = 34, CW = SW + M * 2, CH = SH + UP + M;
  const cv = document.createElement('canvas'); cv.className = 'pember'; cv.width = CW; cv.height = CH; cv.setAttribute('aria-hidden', 'true');
  // rozmiar w procentach karty, więc działa przy każdej skali (komputer, telefon, rozkład kart)
  cv.style.cssText = `position:absolute;left:${-M / SW * 100}%;top:${-UP / SH * 100}%;width:${CW / SW * 100}%;height:${CH / SH * 100}%;image-rendering:pixelated;pointer-events:none;z-index:2`;
  const img = new Image(); let edge = [], cut = [], alive = true, appended = false, parts = [], last = 0;
  img.onload = () => { const c = document.createElement('canvas'); c.width = SW; c.height = SH; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, SW, SH); const d = g.getImageData(0, 0, SW, SH).data;
    const a = (x, y) => (x < 0 || y < 0 || x >= SW || y >= SH) ? 255 : d[(y * SW + x) * 4 + 3];                          // poza kartą liczymy jak pełną krawędź (to nie ubytek)
    for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) { const i = (y * SW + x) * 4;
      if (!d[i + 3]) { if ((x > 0 && d[i - 4 + 3]) || (x < SW - 1 && d[i + 4 + 3]) || (y < SH - 1 && d[i + SW * 4 + 3]) || (y > 0 && d[i - SW * 4 + 3])) cut.push([x, y]); continue; }
      if (!a(x - 1, y) || !a(x + 1, y) || !a(x, y - 1) || !a(x, y + 1)) edge.push([x, y]); }                        // krawędź przypalenia: piksel karty sąsiadujący z ubytkiem
    host.appendChild(cv); appended = true; };
  img.src = src;
  const x = cv.getContext('2d'), out = x.createImageData(CW, CH), O = out.data;
  const put = (px, py, r, g, b, al = 255) => { px |= 0; py |= 0; if (px < 0 || py < 0 || px >= CW || py >= CH) return; const o = (py * CW + px) * 4; O[o] = r; O[o + 1] = g; O[o + 2] = b; O[o + 3] = al; };
  (function f(now) { if (!alive || (appended && !cv.isConnected)) { alive = false; return; } requestAnimationFrame(f);
    if (now - last < 70) return; last = now; if (!edge.length) return;                                              // ok. 14 kl./s, w rytmie pikseli
    O.fill(0); if (!on()) { x.putImageData(out, 0, 0); return; }
    const fr = (now / 70) | 0;
    // żar: część pikseli krawędzi pulsuje na pomarańczowo, od czasu do czasu biało-gorący; w ubytku obok słaby czerwony poblask (dither)
    for (const [px, py] of edge) { const v = .5 + .5 * Math.sin(now / 340 + hh(px, py) * 6.28);
      if (v > .78) put(px + M, py + UP, 255, 214, 130); else if (v > .55) put(px + M, py + UP, 245, 120, 36); else if (v > .38 && hh(px, py, 3) < .5) put(px + M, py + UP, 196, 60, 30); }
    for (const [px, py] of cut) { const v = .5 + .5 * Math.sin(now / 420 + hh(px, py, 7) * 6.28); if (v > .6 && bth(px, py) < (v - .5) * 1.2) put(px + M, py + UP, 150, 40, 26, 255); }
    // iskry: z losowych punktów krawędzi lecą w górę z lekkim kołysaniem, żar → pomarańcz → czerwień → popiół
    if (parts.length < 14 && Math.random() < .5) { const [px, py] = edge[(Math.random() * edge.length) | 0]; parts.push({ x: px + M + .5, y: py + UP, vx: (Math.random() - .5) * .18, vy: -(.22 + Math.random() * .4), life: 16 + Math.random() * 26, age: 0, ph: Math.random() * 6 }); }
    for (let k = parts.length - 1; k >= 0; k--) { const p = parts[k]; p.age++; p.x += p.vx + Math.sin(p.age * .45 + p.ph) * .16; p.y += p.vy; if (p.age > p.life || p.y < 1) { parts.splice(k, 1); continue; }
      const a = p.age / p.life; if (a < .3) put(p.x, p.y, 255, 226, 150); else if (a < .6) put(p.x, p.y, 255, 140, 44); else if (a < .85) put(p.x, p.y, 200, 62, 28); else if ((p.age + k) % 2) put(p.x, p.y, 96, 90, 100); }
    x.putImageData(out, 0, 0); })(performance.now());
  return () => { alive = false; cv.remove(); };
}
