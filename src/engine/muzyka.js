// sekcja muzyki (Krzyk → muzyka): zinowa wyrwa, a za nią ciemny pokój PSX: telewizor z magnetowidem, kaseta na dywanie, pilot, okno z roletami.
// Sterowanie klikiem w obiekt: kaseta wsuwa się do magnetowidu, magnetowid wysuwa kasetę, pilot zmienia klip, ekran telewizora powiększa się na cały kadr (Esc albo kolejny klik cofa).
// Bez migających cząsteczek: kurz i losowe kreski na ekranie wyrzucone, zostają stałe paski światła i spokojny szum tylko na pustym ekranie.
import * as THREE from 'three';
import { RM, loop } from './core';
import { ps1, loadPSX } from './psx';

// dwa układy sceny: komputer (poziomo 16:10) i telefon (pionowo: telewizor u góry, dywan z kasetą i pilotem pod nim, wariant „dwa piętra”)
const PHONE = () => matchMedia('(max-width:700px)').matches;
const LAYOUTS = {
  land: { w: 512, h: 320, pw: 960, ph: 600, fov: 46, cam: [.62, .5, 1.8], look: [.5, .3, 0], tape: [.5, .42, .6], rem: [.8, .66], remUp: [.72, .22, .92], remL: [.78, .38, .95] },
  port: { w: 288, h: 480, pw: 540, ph: 900, fov: 50, cam: [.02, .5, 1.75], look: [.02, .12, 0], tape: [-.12, .66, .3], rem: [.15, .8], remUp: [.08, .26, .95], remL: [.08, .42, 1.0] },
};
const CLIPS = [['KLIP 01', 'NOCNA TAŚMA'], ['KLIP 02', 'PODZIEMIE'], ['KLIP 03', 'POZIOM -1']];
const rng = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
const ease = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// kanciasty obrys wyrwy (znormalizowany 0..1): prawie cała sekcja, zin tylko przy krawędziach
function tear() {
  const r = rng(911), W = 800, H = 500, P = [], L = W * .07, T = H * .09, Rr = W * .93, Bb = H * .9;
  const edge = (ax, ay, bx, by, n, ix, iy) => { for (let i = 0; i < n; i++) { const f = i / n, d = (r() - .35) * 26 + (i % 3 === 1 ? (r() - .5) * 40 : 0); P.push([(ax + (bx - ax) * f + ix * d) / W, (ay + (by - ay) * f + iy * d) / H]); } };
  edge(L, T, Rr, T, 9, 0, 1); edge(Rr, T, Rr, Bb, 6, -1, 0); edge(Rr, Bb, L, Bb, 9, 0, -1); edge(L, Bb, L, T, 6, 1, 0);
  return P;
}
// ozdoby brzegu wyrwy (corporate grunge: raster z ksera, suche pociągnięcia czarnego pędzla, czerwony tusz) na przezroczystej warstwie nad sceną.
// Sama wyrwa to wycięcie sceny (clip-path wg `tear()`), więc dookoła widać prawdziwe tło strony w tym miejscu, a nie własny boks z tłem.
function drawEdge(c) {
  const W = c.width, H = c.height, x = c.getContext('2d'), r = rng(37);
  x.clearRect(0, 0, W, H);
  const pts = tear().map(([u, v]) => [u * W, v * H]);
  // raster z ksera przy brzegu
  for (let k = 0; k < pts.length; k++) { const a = pts[k], b = pts[(k + 1) % pts.length]; for (let j = 0; j < 40; j++) { const f = r(); x.fillStyle = `rgba(0,0,0,${.3 + r() * .4})`; x.beginPath(); x.arc(a[0] + (b[0] - a[0]) * f + (r() - .5) * 30, a[1] + (b[1] - a[1]) * f + (r() - .5) * 30, .8 + r() * 1.8, 0, 7); x.fill(); } }
  // suche pociągnięcia czarnego pędzla wzdłuż brzegu, z przerwami włosia
  for (let k = 0; k < pts.length; k++) { const a = pts[k], b = pts[(k + 1) % pts.length]; if (r() < .25) continue;
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len, off = (r() - .5) * 12;
    for (let h = 0; h < 12; h++) { const hh = (h - 6) * 1.4; x.strokeStyle = `rgba(6,5,8,${.25 + r() * .55})`; x.lineWidth = .6 + r() * 1.5; x.beginPath(); const s0 = r() * .15, s1 = .7 + r() * .3;
      x.moveTo(a[0] + dx * s0 + nx * (off + hh), a[1] + dy * s0 + ny * (off + hh));
      for (let q = 1; q <= 6; q++) { const f = s0 + (s1 - s0) * q / 6; if (r() < .12) { x.stroke(); x.beginPath(); x.moveTo(a[0] + dx * f + nx * (off + hh), a[1] + dy * f + ny * (off + hh)); continue; } x.lineTo(a[0] + dx * f + nx * (off + hh + (r() - .5) * 1.5), a[1] + dy * f + ny * (off + hh + (r() - .5) * 1.5)); }
      x.stroke(); } }
  // czerwony tusz: kilka smug i kropli
  for (let k = 0; k < 5; k++) { const a = pts[(r() * pts.length) | 0]; x.strokeStyle = `rgba(176,14,26,${.55 + r() * .3})`; x.lineWidth = 3 + r() * 5; x.lineCap = 'round'; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(a[0] + (r() - .5) * 70, a[1] + (r() - .5) * 24); x.stroke();
    for (let q = 0; q < 6; q++) { x.fillStyle = 'rgba(176,14,26,.8)'; x.beginPath(); x.arc(a[0] + (r() - .5) * 60, a[1] + (r() - .5) * 40, .8 + r() * 2.2, 0, 7); x.fill(); } }
}

// homografia: płótno 2D (ekran, wyświetlacz VFD) przyklejone do prostokąta w modelu 3D
function solve8(A, b) { const n = 8, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) { if (r === c) continue; const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; } }
  return M.map((r, i) => r[n] / r[i]); }
function quadT(w, h, q) { const src = [[0, 0], [w, 0], [w, h], [0, h]], A = [], b = [];
  for (let i = 0; i < 4; i++) { const [x, y] = src[i], [u, v] = q[i]; A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v); }
  const [a, bb, c, d, e, f, g, hh] = solve8(A, b); return `matrix3d(${a},${d},0,${g},${bb},${e},0,${hh},0,0,1,0,${c},${f},0,1)`; }
const quad = (l, t, r, b, z) => [[l, t], [r, t], [r, b], [l, b]].map(([a, c]) => new THREE.Vector3(a, c, z));
function mkOv(w, h) { const el = document.createElement('div'); el.className = 'mu-ov'; el.style.width = w + 'px'; el.style.height = h + 'px'; const c = document.createElement('canvas'); c.width = w; c.height = h; el.appendChild(c); return { el, c, x: c.getContext('2d') }; }
// usuwa z siatki fragment leżący za progiem z (u magnetowidu to wbudowana, leżąca kaseta)
function stripFront(root, zMin) { root.traverse(m => { if (!m.isMesh) return; const G = m.geometry, P = G.attributes.position, I = G.index ? Array.from(G.index.array) : Array.from({ length: P.count }, (_, i) => i), out = [];
  for (let f = 0; f < I.length; f += 3) { const z = (P.getZ(I[f]) + P.getZ(I[f + 1]) + P.getZ(I[f + 2])) / 3; if (z < zMin) out.push(I[f], I[f + 1], I[f + 2]); } G.setIndex(out); }); }

export function initMuzyka(host, A) {
  host.setAttribute('role', 'group'); host.setAttribute('aria-label', 'Pokój z telewizorem. Kliknij kasetę, magnetowid, pilot albo ekran.');
  const view = document.createElement('div'); view.className = 'mu-view'; view.style.clipPath = 'polygon(' + tear().map(([u, v]) => (u * 100).toFixed(2) + '% ' + (v * 100).toFixed(2) + '%').join(',') + ')';   // wyrwa = wycięcie sceny
  const room = document.createElement('canvas'); room.className = 'mu-room';
  const ovTv = mkOv(192, 144), ovVfd = mkOv(160, 40);
  const paper = document.createElement('canvas'); paper.className = 'mu-edge'; paper.width = LAYOUTS[PHONE() ? 'port' : 'land'].pw; paper.height = LAYOUTS[PHONE() ? 'port' : 'land'].ph; paper.setAttribute('aria-hidden', 'true');
  view.append(room, ovTv.el, ovVfd.el); host.append(view, paper);
  drawEdge(paper);

  let lay = LAYOUTS[PHONE() ? 'port' : 'land'];
  const P = ps1(room, lay.w, lay.h, { clear: 0x020308, fog: [3.2, 9] }), scene = P.scene, cam = P.cam; cam.fov = lay.fov; cam.near = .05; cam.far = 50; cam.updateProjectionMatrix();
  const R = rng(5);
  const tex = (w, h, fn, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = P.tex(c); if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; };
  // tekstury: dywan z plamami, okrągły dywan, tapeta w pasy z zaciekami, drewno, miasto, rolety, paski światła, plakat
  const carpet = tex(64, 64, (x, w, h) => { for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) { const weave = ((i >> 1) + (y >> 1)) % 2 ? 6 : -4, v = 22 + weave + (R() - .5) * 16; x.fillStyle = `rgb(${v * .78 | 0},${v * .74 | 0},${v * 1.18 | 0})`; x.fillRect(i, y, 1, 1); }
    for (let k = 0; k < 7; k++) { x.fillStyle = `rgba(0,0,0,${.15 + R() * .25})`; x.beginPath(); x.ellipse(R() * w, R() * h, 3 + R() * 10, 2 + R() * 7, R() * 3, 0, 7); x.fill(); } }, [6, 6]);
  const rug = tex(64, 64, (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) { const d = Math.hypot(i - 32, y - 32) / 32; if (d > 1) continue; const ring = Math.floor(d * 6), v = (ring % 2 ? 44 : 28) + (R() - .5) * 12 + (((i >> 1) + (y >> 1)) % 2 ? 4 : 0), red = ring === 1 || ring === 4;
      x.fillStyle = `rgb(${(red ? v * 1.9 : v * .8) | 0},${(red ? v * .5 : v * .7) | 0},${(red ? v * .6 : v * 1.1) | 0})`; x.fillRect(i, y, 1, 1); }
    x.strokeStyle = 'rgba(180,150,90,.4)'; for (let a = 0; a < 8; a++) { x.beginPath(); x.moveTo(32, 32); x.lineTo(32 + Math.cos(a * .785) * 26, 32 + Math.sin(a * .785) * 26); x.stroke(); } });
  const wall = tex(64, 64, (x, w, h) => { for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) { const v = 32 + ((i % 16) < 8 ? 3 : -2) + (R() - .5) * 8; x.fillStyle = `rgb(${v * 1.05 | 0},${v * .92 | 0},${v * .86 | 0})`; x.fillRect(i, y, 1, 1); }
    for (let k = 0; k < 9; k++) { x.fillStyle = `rgba(8,6,4,${.15 + R() * .2})`; x.fillRect(R() * w, 0, 1 + R() * 2, h * (.2 + R() * .8)); }
    for (let k = 0; k < 5; k++) { x.fillStyle = 'rgba(40,28,14,.22)'; x.beginPath(); x.arc(R() * w, R() * h, 4 + R() * 9, 0, 7); x.fill(); } x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(0, h - 10, w, 10); }, [5, 1.4]);
  const wood = tex(32, 32, (x, w, h) => { for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) { const v = 22 + Math.sin(y * .9 + Math.sin(i * .3) * 2) * 4 + (R() - .5) * 7; x.fillStyle = `rgb(${v * 1.25 | 0},${v * .85 | 0},${v * .6 | 0})`; x.fillRect(i, y, 1, 1); } });
  const city = tex(64, 64, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0a1230'); g.addColorStop(.55, '#2c2040'); g.addColorStop(1, '#a85a32'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let b = 0; b < 10; b++) { const bx = b * 6 + (R() * 3 | 0), bh = 14 + R() * 34; x.fillStyle = '#05060c'; x.fillRect(bx, h - bh, 6, bh); for (let k = 0; k < 18; k++) if (R() < .5) { x.fillStyle = R() < .65 ? '#ffbc66' : R() < .5 ? '#9fd0ff' : '#ff6a8a'; x.fillRect(bx + 1 + (R() * 4 | 0), h - bh + 2 + (R() * (bh - 4) | 0), 1, 1); } } });
  const blindTex = tex(16, 64, (x, w, h) => { x.clearRect(0, 0, w, h); for (let y = 0; y < h; y += 4) { const br = (y === 28 || y === 32) ? 1 : 0; x.fillStyle = '#4a423c'; x.fillRect(0, y + br, w, 3); x.fillStyle = '#6e655c'; x.fillRect(0, y + br, w, 1); x.fillStyle = '#1c1814'; x.fillRect(0, y + 2 + br, w, 1); } x.fillStyle = '#2a2420'; x.fillRect(0, h - 3, w, 3); });
  const beamTex = tex(8, 64, (x, w, h) => { for (let y = 0; y < h; y++) { x.fillStyle = (y % 8) < 4 ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,0)'; x.fillRect(0, y, w, 1); } });
  const disc = tex(32, 32, (x, w, h) => { const g = x.createRadialGradient(16, 16, 1, 16, 16, 15); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.5, 'rgba(220,235,255,.55)'); g.addColorStop(1, 'rgba(220,235,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const poster = tex(32, 48, (x, w, h) => { x.fillStyle = '#1a1418'; x.fillRect(0, 0, w, h); x.fillStyle = '#5a1018'; x.fillRect(2, 2, w - 4, h - 4); x.fillStyle = '#14090a'; x.beginPath(); x.arc(16, 20, 9, 0, 7); x.fill(); x.fillStyle = '#d9cdb0'; x.fillRect(10, 16, 4, 3); x.fillRect(18, 16, 4, 3); x.fillRect(12, 26, 8, 2); x.fillRect(5, 38, 22, 2); x.fillRect(8, 42, 16, 1); });
  const box = (w, h, d, m, x0, y0, z0) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d, 2, 2, 2), m); b.position.set(x0, y0, z0); scene.add(b); return b; };
  const addBasic = o => new THREE.MeshBasicMaterial(o);

  const FY = 0;
  // podłoga, okrągły dywan, ściany
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 6, 32, 24), P.mat({ map: carpet })); floor.rotation.x = -Math.PI / 2; floor.position.set(.4, FY, -.4); scene.add(floor);
  const rugM = new THREE.Mesh(new THREE.CircleGeometry(.95, 14), P.mat({ map: rug, transparent: true, alphaTest: .05, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })); rugM.rotation.x = -Math.PI / 2; rugM.position.set(.02, .002, .12); scene.add(rugM);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(8, 2.8, 32, 10), P.mat({ map: wall })); back.position.set(.4, FY + 1.4, -1.7); scene.add(back);
  const rightW = new THREE.Mesh(new THREE.PlaneGeometry(6, 2.8, 20, 10), P.mat({ map: wall })); rightW.rotation.y = -Math.PI / 2; rightW.position.set(2.7, FY + 1.4, .6); scene.add(rightW);
  const leftW = new THREE.Mesh(new THREE.PlaneGeometry(6, 2.8, 20, 10), P.mat({ map: wall })); leftW.rotation.y = Math.PI / 2; leftW.position.set(-1.9, FY + 1.4, .6); scene.add(leftW);
  // okno z roletami po prawej, światło miasta
  const WX = 1.3, WY = FY + 1.3, WW = .9, WH = 1.05;
  const cityP = new THREE.Mesh(new THREE.PlaneGeometry(WW, WH), addBasic({ map: city })); cityP.position.set(WX, WY, -1.69); scene.add(cityP);
  const frM = P.mat({ map: wood, color: 0x7a7a7a });
  box(WW + .12, .07, .07, frM, WX, WY + WH / 2 + .03, -1.66); box(WW + .12, .07, .07, frM, WX, WY - WH / 2 - .03, -1.66); box(.07, WH + .1, .07, frM, WX - WW / 2 - .03, WY, -1.66); box(.07, WH + .1, .07, frM, WX + WW / 2 + .03, WY, -1.66); box(WW + .2, .04, .14, frM, WX, WY - WH / 2 - .08, -1.62);
  const blindM = new THREE.Mesh(new THREE.PlaneGeometry(WW, WH * .97), P.mat({ map: blindTex, transparent: true, alphaTest: .1, side: THREE.DoubleSide })); blindM.position.set(WX, WY + WH * .015, -1.65); scene.add(blindM);
  const bMat = o => addBasic({ map: beamTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: o, color: 0xffa868 });
  const fS = new THREE.Mesh(new THREE.PlaneGeometry(.95, 1.5), bMat(.1)); fS.rotation.x = -Math.PI / 2; fS.rotation.z = -.5; fS.position.set(.95, FY + .004, -.55); scene.add(fS);
  const wS = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.2), bMat(.09)); wS.rotation.y = -Math.PI / 2; wS.position.set(2.69, FY + 1.1, -.3); scene.add(wS);
  // plakat i kable do gniazdka
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(.4, .6), P.mat({ map: poster })); pl.position.set(.05, 1.5, -1.68); pl.rotation.z = .04; scene.add(pl);
  box(.07, .1, .02, P.mat({ color: 0x2e2a24 }), -.7, .28, -1.69);
  const cable = (pts, rad, col) => scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 20, rad, 5), P.mat({ color: col })));
  cable([[-.25, .05, -.26], [-.4, .01, -.7], [-.55, .012, -1.2], [-.7, .2, -1.67], [-.7, .28, -1.68]], .009, 0x0c0c10);
  cable([[.15, .05, -.3], [.3, .012, -.8], [-.05, .012, -1.3], [-.68, .3, -1.68]], .007, 0x1a1210);

  // światło: bardzo słabe otoczenie, światło miasta z okna, poświata ekranu
  scene.add(new THREE.AmbientLight(0x2a3158, 1.25));
  const cityL = new THREE.DirectionalLight(0xff9a60, .22); cityL.position.set(2, 1.2, -2); scene.add(cityL);
  const blueL = new THREE.DirectionalLight(0x5a78ff, .3); blueL.position.set(-2, 1.5, 2); scene.add(blueL);
  const winL = new THREE.PointLight(0xffa060, .5, 3.6, 1.5); winL.position.set(WX, WY, -1.2); scene.add(winL);
  const glowL = new THREE.PointLight(0x9fcfff, .5, 3.4, 1.5); glowL.position.set(0, .42, .5); scene.add(glowL);
  const remL = new THREE.PointLight(0x9fb4ff, 1.5, 1.3, 1.4); remL.position.set(.78, .38, .95); scene.add(remL);
  const scrGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.2), addBasic({ map: disc, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .25, color: 0x6f9fff })); scrGlow.position.set(0, .42, .45); scene.add(scrGlow);

  const camBase = new THREE.Vector3(), lookBase = new THREE.Vector3(), camZ = new THREE.Vector3(), lookZ = new THREE.Vector3(0, .425, .229);
  const tvC = quad(-.271, .538, .271, .049, .229), vfC = quad(.07, .112, .21, .077, .233);
  const pin = (el, obj, corners) => { const cw = room.clientWidth, ch = room.clientHeight; if (!cw) return; obj.updateWorldMatrix(true, false); cam.updateMatrixWorld();
    const q = corners.map(v => { const p = v.clone().applyMatrix4(obj.matrixWorld).project(cam); return [(p.x + 1) / 2 * cw, (1 - p.y) / 2 * ch]; }); el.style.transform = quadT(el.offsetWidth, el.offsetHeight, q); el.style.visibility = 'visible'; };

  let alive = true;
  const off = () => { alive = false; try { mq.removeEventListener('change', onMq); } catch (e) {} removeEventListener('keydown', onKey); room.removeEventListener('click', onClick); room.removeEventListener('pointermove', onMove); try { P.r.dispose(); } catch (e) {} };
  const onKey = e => { if (e.key === 'Escape' && zin) zin = false; };
  let zin = false;
  const tv = new THREE.Group(), vcr = new THREE.Group(), cas = new THREE.Group(), rem = new THREE.Group();
  let state = 'idle', st0 = 0, tNow = 0, clip = 0, r0 = -1, zoom = 0;
  let restRy = .6; const restP = new THREE.Vector3(), lift = new THREE.Vector3(-.108, .2, .62), front = new THREE.Vector3(-.108, .076, .3), inside = new THREE.Vector3(-.108, .076, .02);
  const remRest = new THREE.Vector3(), remUp = new THREE.Vector3(), tvAim = new THREE.Vector3(0, .42, .2); let qRest = null;
  const placeTape = k => { const p = new THREE.Vector3(); let ry = 0;
    if (k < .4) { const u = ease(k / .4); p.lerpVectors(restP, lift, u); p.y += Math.sin(u * Math.PI) * .05; ry = restRy * (1 - u); }
    else if (k < .7) { p.lerpVectors(lift, front, ease((k - .4) / .3)); }
    else { p.lerpVectors(front, inside, ease((k - .7) / .3)); }
    cas.position.copy(p); cas.rotation.set(0, ry, 0); };
  const resetCas = () => { cas.visible = true; placeTape(0); };
  const insert = () => { if (state !== 'idle') return; if (RM) { state = 'play'; cas.visible = false; st0 = tNow; return; } state = 'in'; st0 = tNow; };
  const eject = () => { if (state === 'idle' || state === 'out') return; if (state === 'in') { resetCas(); state = 'idle'; return; } if (RM) { state = 'idle'; resetCas(); return; } state = 'out'; st0 = tNow; cas.visible = true; placeTape(1); };
  const next = () => { if (r0 >= 0) return; if (RM) { if (state === 'play') clip = (clip + 1) % CLIPS.length; return; } r0 = tNow; };
  const ray = new THREE.Raycaster(), mv = new THREE.Vector2();
  const pick = e => { const rc = room.getBoundingClientRect(); mv.set(((e.clientX - rc.left) / rc.width) * 2 - 1, -((e.clientY - rc.top) / rc.height) * 2 + 1); ray.setFromCamera(mv, cam);
    const hit = o => ray.intersectObject(o, true).length > 0;
    if (state === 'idle' && cas.visible && hit(cas)) return 'tape'; if (hit(rem)) return 'remote'; if (hit(vcr)) return 'vcr'; if (hit(tv)) return 'tv'; return ''; };
  const onClick = e => { if (zin && zoom > .4) { zin = false; return; } const h = pick(e); if (h === 'tape') insert(); else if (h === 'vcr') eject(); else if (h === 'remote') next(); else if (h === 'tv') { zin = true; if (RM) zoom = 1; } };
  const onMove = e => { room.style.cursor = (zin ? 'zoom-out' : pick(e) ? 'pointer' : 'default'); };
  room.addEventListener('click', onClick); room.addEventListener('pointermove', onMove); addEventListener('keydown', onKey);

  // układ zależny od ekranu: rozmiar płótna, kamera, położenie kasety i pilota, zoom ekranu dopasowany do szerokości, zin w odpowiednich proporcjach
  const applyLayout = () => { lay = LAYOUTS[PHONE() ? 'port' : 'land'];
    P.resize(lay.w, lay.h); cam.fov = lay.fov; cam.updateProjectionMatrix();
    camBase.set(...lay.cam); lookBase.set(...lay.look); restP.set(lay.tape[0], FY + .017, lay.tape[1]); restRy = lay.tape[2];
    remRest.set(lay.rem[0], FY + .016, lay.rem[1]); remUp.set(...lay.remUp); remL.position.set(...lay.remL);
    const tn = Math.tan(lay.fov * Math.PI / 360), asp = lay.w / lay.h, d = Math.max(.82, .54 / (.8 * 2 * tn * asp), .4 / (.92 * tn));   // cały ekran 4:3 mieści się i na szerokość, i na wysokość
    camZ.set(0, .425, .229 + d);
    if (paper.width !== lay.pw || paper.height !== lay.ph) { paper.width = lay.pw; paper.height = lay.ph; drawEdge(paper); }
    if (state === 'idle' && cas.children.length) placeTape(0); if (rem.children.length && r0 < 0) rem.position.copy(remRest); };
  applyLayout(); cam.position.copy(camBase); cam.lookAt(lookBase);
  const mq = matchMedia('(max-width:700px)'), onMq = () => applyLayout(); mq.addEventListener('change', onMq);
  const vfd = s => { const vx = ovVfd.x; vx.fillStyle = '#020a0c'; vx.fillRect(0, 0, 160, 40); if (s) { vx.font = '30px VT323, monospace'; vx.textBaseline = 'middle'; vx.textAlign = 'center'; vx.fillStyle = '#3ff0ff'; vx.shadowColor = '#3ff0ff'; vx.shadowBlur = 6; vx.fillText(s, 80, 21); vx.shadowBlur = 0; } };
  const eq = (sx, e) => { for (let i = 0; i < 16; i++) { const h = 6 + Math.abs(Math.sin(e / 260 + i * .9) * Math.sin(e / 510 + i * .4)) * 48, y = 118 - h; sx.fillStyle = i % 5 === 0 ? '#c4121d' : '#3ff0ff'; sx.fillRect(12 + i * 11, y, 8, h); sx.fillStyle = 'rgba(0,0,0,.35)'; for (let j = 0; j < h; j += 3) sx.fillRect(12 + i * 11, y + j, 8, 1); } };
  const sx = ovTv.x, img = sx.createImageData(192, 144);

  Promise.all([loadPSX(P, A.tv), loadPSX(P, A.vcr), loadPSX(P, A.tape), loadPSX(P, A.remote)]).then(([tvM, vcrM, tapeM, remM]) => {
    if (!alive) return;
    stripFront(vcrM, .28);
    tv.add(tvM); tv.position.y = .132; scene.add(tv); vcr.add(vcrM); scene.add(vcr);
    cas.add(tapeM); const tb = new THREE.Box3().setFromObject(tapeM), ts = .2 / (tb.max.x - tb.min.x); tapeM.scale.setScalar(ts); tapeM.position.sub(tb.getCenter(new THREE.Vector3()).multiplyScalar(ts)); scene.add(cas); resetCas();
    const rb = new THREE.Box3().setFromObject(remM), rs = .17 / (rb.max.y - rb.min.y); remM.scale.setScalar(rs); remM.position.sub(rb.getCenter(new THREE.Vector3()).multiplyScalar(rs));
    const ri = new THREE.Group(); ri.add(remM); ri.rotation.set(Math.PI / 2, 0, 0); rem.add(ri); rem.position.copy(remRest); rem.rotation.set(0, Math.PI + .55, 0); qRest = rem.quaternion.clone();
    const tip = new THREE.Mesh(new THREE.BoxGeometry(.012, .012, .012), P.mat({ color: 0x330000, emissive: 0xff2020, emissiveIntensity: 0 })); tip.position.set(0, 0, .09); rem.add(tip);
    const irL = new THREE.PointLight(0xff3030, 0, .6); irL.position.set(0, 0, .1); rem.add(irL); scene.add(rem);
    const aimQ = () => { const o = new THREE.Object3D(); o.position.copy(remUp); o.lookAt(tvAim); return o.quaternion; };

    loop(host, RM ? 6 : 25, (t, dt) => {
      if (!alive || !host.isConnected) return; tNow = t; const e = t - st0; let scr = .25;
      // powiększenie ekranu: kamera najeżdża, aż ekran wypełni kadr; Esc albo kolejny klik cofa
      zoom += ((zin ? 1 : 0) - zoom) * (1 - Math.exp(-dt / 190)); if (Math.abs((zin ? 1 : 0) - zoom) < .002) zoom = zin ? 1 : 0;
      const ez = ease(zoom); cam.position.lerpVectors(camBase, camZ, ez); cam.lookAt(new THREE.Vector3().lerpVectors(lookBase, lookZ, ez));
      if (state === 'in') { const k = clamp(e / 2000, 0, 1); placeTape(k); if (k >= 1) { cas.visible = false; state = 'boot'; st0 = t; } }
      if (state === 'boot' && e > 700) { state = 'play'; st0 = t; }
      if (state === 'out') { const k = clamp(e / 2000, 0, 1); placeTape(1 - k); if (k >= 1) { state = 'idle'; resetCas(); } }
      const ex = state === 'out' ? e : 1e9;
      if (state === 'out' && ex < 520) { const kq = ex / 520; sx.fillStyle = '#000'; sx.fillRect(0, 0, 192, 144); sx.fillStyle = '#fff';
        if (kq < .5) { const h = Math.max(2, 144 * (1 - kq / .5)); sx.fillRect(0, 72 - h / 2, 192, h); } else { const w = Math.max(2, 192 * (1 - (kq - .5) / .5)); sx.fillRect(96 - w / 2, 71, w, 2); } scr = .1; vfd('EJECT'); }
      else if (state === 'idle' || state === 'in' || state === 'out') {
        // pusty ekran: spokojny szum (tylko tu)
        for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 150; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; } sx.putImageData(img, 0, 0);
        sx.fillStyle = 'rgba(0,0,0,.5)'; sx.fillRect(0, 0, 192, 144); sx.font = '16px VT323, monospace'; sx.textBaseline = 'middle'; sx.textAlign = 'center'; sx.fillStyle = '#fff'; sx.fillText('BRAK SYGNAŁU', 96, 72); vfd(Math.floor(t / 500) % 2 ? '12:00' : ''); scr = .45; }
      else if (state === 'boot') { const kb = e / 700; sx.fillStyle = '#000'; sx.fillRect(0, 0, 192, 144); sx.fillStyle = '#fff';
        if (kb < .45) { const w = 192 * (kb / .45); sx.fillRect(96 - w / 2, 71, w, 2); } else { const h = 144 * ((kb - .45) / .55); sx.fillRect(0, 72 - h / 2, 192, h); } scr = 1.3; vfd('CH ' + (clip + 1)); }
      else {
        const g2 = sx.createLinearGradient(0, 0, 192, 144); g2.addColorStop(0, '#16203a'); g2.addColorStop(1, '#05060c'); sx.fillStyle = g2; sx.fillRect(0, 0, 192, 144); eq(sx, e);
        // jedno spokojne pasmo śledzenia i stałe linie rastra (bez losowych kresek)
        const by = 144 - ((e / 18) % 190); sx.fillStyle = 'rgba(255,255,255,.2)'; sx.fillRect(0, by, 192, 3);
        sx.fillStyle = 'rgba(0,0,0,.22)'; for (let y = 0; y < 144; y += 3) sx.fillRect(0, y, 192, 1);
        sx.font = '16px VT323, monospace'; sx.textAlign = 'left'; sx.textBaseline = 'top'; sx.fillStyle = '#fff'; sx.fillText('PLAY ▶   SP', 8, 6); sx.fillStyle = Math.floor(e / 600) % 2 ? '#ff2a3a' : '#6a1018'; sx.fillText('●', 166, 6);
        sx.fillStyle = '#fff'; sx.fillText(CLIPS[clip][0] + ' · ' + CLIPS[clip][1], 8, 124);
        const s = Math.floor(e / 1000); vfd('►0:' + String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0')); scr = .9 + Math.abs(Math.sin(e / 400)) * .3; }
      glowL.intensity = scr; scrGlow.material.opacity = .12 + scr * .14;
      fS.material.opacity = .1 + Math.sin(t / 1700) * .015; wS.material.opacity = .09 + Math.sin(t / 2300) * .02; winL.intensity = .5 + Math.sin(t / 3100) * .08; beamTex.offset.y = Math.sin(t / 4200) * .03;
      if (r0 >= 0) { const re = t - r0, up = re < 400 ? re / 400 : re < 750 ? 1 : 1 - (re - 750) / 450, u = clamp(up, 0, 1), eu = u * u * (3 - 2 * u);
        rem.position.lerpVectors(remRest, remUp, eu); rem.quaternion.copy(qRest).slerp(aimQ(), eu);
        const ir = re > 420 && re < 700 && (Math.floor(re / 60) % 2); tip.material.emissiveIntensity = ir ? 1 : 0; irL.intensity = ir ? .8 : 0;
        if (re > 480 && state === 'play' && !rem.userData.sw) { rem.userData.sw = 1; clip = (clip + 1) % CLIPS.length; state = 'boot'; st0 = t; }
        if (re > 1200) { r0 = -1; rem.userData.sw = 0; rem.position.copy(remRest); rem.quaternion.copy(qRest); } }
      P.render(); pin(ovTv.el, tv, tvC); pin(ovVfd.el, vcr, vfC);
    });
  }).catch(() => {});
  return off;
}
