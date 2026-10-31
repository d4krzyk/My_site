// pole wyborów działu Krzyk: modele 3D w potoku PS1 (niska rozdzielczość, drganie wierzchołków, najbliższy piksel)
// walkman → muzyka, trzy maski → persony, kaseta miniDV (zapada się pod ziemię, potem kamera HC90E) → obraz, telefon → kontakt
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RM, loop, clamp, makeGlyph, drawGlyph } from './core';
import { drawLCD, bay, hash, T_NOISE } from './nokia';

const ease = k => k * k * (3 - 2 * k), easeOut = k => 1 - Math.pow(1 - k, 3);
const TAU = Math.PI * 2;

/* ---------- wspólny potok PS1 (jak na planszy) ---------- */
export function ps1(canvas, lowW, lowH, { clear = 0x000000, alpha = 0, fog = null } = {}) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  r.setPixelRatio(1); r.setSize(lowW, lowH, false); r.setClearColor(clear, alpha);
  const scene = new THREE.Scene(); if (fog) scene.fog = new THREE.Fog(clear, fog[0], fog[1]);
  const cam = new THREE.PerspectiveCamera(35, lowW / lowH, .05, 60);
  const snap = new THREE.Vector2(lowW / 2.5, lowH / 2.5);
  const mat = o => { const m = new THREE.MeshLambertMaterial(o); m.onBeforeCompile = sh => { sh.uniforms.uSnap = { value: snap };
    sh.vertexShader = 'uniform vec2 uSnap;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n vec4 sp=gl_Position; sp.xy=floor(sp.xy/sp.w*uSnap)/uSnap*sp.w; gl_Position=sp;'); }; return m; };
  const tex = c => { const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; };
  const resize = (w, h) => { r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); snap.set(w / 2.5, h / 2.5); };
  return { r, scene, cam, mat, tex, resize, render: () => r.render(scene, cam) };
}

const GL = new GLTFLoader();
export function loadPSX(P, url) {
  return new Promise((res, rej) => GL.load(url, g => {
    g.scene.traverse(m => { if (!m.isMesh) return;
      const mats = (Array.isArray(m.material) ? m.material : [m.material]).map(o => { const map = o.map || null;
        if (map) { map.magFilter = THREE.NearestFilter; map.minFilter = THREE.NearestFilter; map.generateMipmaps = false; map.encoding = THREE.LinearEncoding; map.needsUpdate = true; }
        const mt = P.mat({ map, color: o.color ? o.color.clone().convertLinearToSRGB() : 0xffffff, side: THREE.DoubleSide }); mt.name = o.name || '';
        if (/white plastic/i.test(o.name || '')) { mt.polygonOffset = true; mt.polygonOffsetFactor = -2; mt.polygonOffsetUnits = -8; } return mt; });
      m.material = mats.length > 1 ? mats : mats[0]; });
    res(g.scene); }, undefined, rej));
}
// skaluje obiekt do największego wymiaru `size` i ustawia jego środek w (0,0,0)
export function fit(obj, size) {
  const g = new THREE.Group(); const b = new THREE.Box3().setFromObject(obj), d = b.getSize(new THREE.Vector3());
  const s = size / Math.max(d.x, d.y, d.z); obj.scale.setScalar(s); obj.position.sub(b.getCenter(new THREE.Vector3()).multiplyScalar(s)); g.add(obj); return g;
}
export function lights(P, rim = 0x3ff0ff, rim2 = 0xc4121d) {
  P.scene.add(new THREE.AmbientLight(0x7a7f98, .85));
  const k = new THREE.DirectionalLight(0xfff2dc, .9); k.position.set(1.5, 2, 3); P.scene.add(k);
  const a = new THREE.DirectionalLight(rim, .5); a.position.set(-3, 1, -1); P.scene.add(a);
  const b = new THREE.DirectionalLight(rim2, .45); b.position.set(3, -1, -2); P.scene.add(b);
}
// chropowata, ciemna podłoga (grudki, rysy) jako tekstura
function grime(w, h, base, v, seed = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), id = x.createImageData(w, h); let s = seed;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h; i++) { const n = (r() - .5) * v + (r() < .03 ? 40 : 0); id.data[i * 4] = base[0] + n; id.data[i * 4 + 1] = base[1] + n; id.data[i * 4 + 2] = base[2] + n; id.data[i * 4 + 3] = 255; }
  x.putImageData(id, 0, 0); return c;
}

/* ---------- persony: teatralne maski PS1 (1 lękowa / haunted, 2 wyluzowana / indie sleeze, 3 poważna / gotycka sakralna) ---------- */
function maskTex(kind, seed) {
  const W = 128, H = 160, c = document.createElement('canvas'), hi = kind === 'sacral' ? 2 : 1; c.width = W * hi; c.height = H * hi; const x = c.getContext('2d');
  let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const base = { haunt: '#dfe4e2', sleaze: '#f4e9f0', sacral: '#e6e2e4', void: '#120607' }[kind];
  x.fillStyle = base; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 1600; i++) { x.fillStyle = r() < .5 ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.07)'; x.fillRect(Math.floor(r() * W), Math.floor(r() * H), 2, 1); }
  const hole = (f) => { x.save(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.beginPath(); f(); x.fill(); x.restore(); };
  const E = [42, 86], EY = 68;
  if (kind === 'haunt') {
    // porcelana z pęknięciami, szeroko otwarte, przerażone oczy, rozmazany cień spływający w dół, małe „o”
    x.strokeStyle = 'rgba(40,60,70,.55)'; x.lineWidth = 1;
    for (let k = 0; k < 7; k++) { x.beginPath(); let px = r() * W, py = r() * 50; x.moveTo(px, py); for (let n = 0; n < 6; n++) { px += (r() - .5) * 14; py += 4 + r() * 8; x.lineTo(px, py); } x.stroke(); }
    E.forEach(ex => { x.fillStyle = 'rgba(30,40,55,.55)'; x.fillRect(ex - 13, EY - 13, 26, 26);
      for (let k = 0; k < 4; k++) x.fillRect(ex - 9 + k * 6, EY + 10, 2, 14 + Math.floor(r() * 28)); });
    x.strokeStyle = '#3a4a52'; x.lineWidth = 2; x.beginPath(); x.moveTo(30, 44); x.lineTo(52, 50); x.moveTo(98, 44); x.lineTo(76, 50); x.stroke();
    E.forEach(ex => hole(() => x.ellipse(ex, EY, 9, 11, 0, 0, 7))); hole(() => x.ellipse(64, 120, 5, 7, 0, 0, 7));
  }
  if (kind === 'sleaze') {
    // błyszcząca, różowo-cyjanowa, mrugnięcie i gwiazdka zamiast oka, wielki uśmiech, brokat i naklejki (2000s)
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#ffd2ec'); g.addColorStop(.55, '#f4e9f0'); g.addColorStop(1, '#b9f3ff'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 160; i++) { x.fillStyle = ['#ff3fb4', '#3ff0ff', '#fff36a', '#ffffff', '#9b5cff'][Math.floor(r() * 5)]; x.fillRect(Math.floor(r() * W), Math.floor(r() * H), 1, 1); }
    x.fillStyle = 'rgba(255,80,170,.45)'; x.fillRect(22, 88, 20, 10); x.fillRect(86, 88, 20, 10);
    x.fillStyle = '#2a0d24'; x.fillRect(34, EY, 18, 3); x.fillRect(32, EY - 2, 3, 3);                     // mrugnięcie
    hole(() => { for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 - Math.PI / 2, rr = k % 2 ? 5 : 12; x.lineTo(E[1] + Math.cos(a) * rr, EY + Math.sin(a) * rr); } x.closePath(); });
    hole(() => { x.moveTo(36, 110); x.quadraticCurveTo(64, 146, 92, 110); x.quadraticCurveTo(64, 126, 36, 110); });
    x.fillStyle = '#ff3fb4'; x.fillRect(100, 30, 8, 8); x.fillStyle = '#fff36a'; x.fillRect(102, 32, 4, 4);   // naklejka
  }
  if (kind === 'sacral') {
    // biała twarz, męski gotycki makijaż: płaskie, przydymione cienie i zmrużone oczy z ostrą, krótką kreską, ciężkie proste brwi ściągnięte w dół,
    // wąskie, proste czarne usta, dwie drobne gwiazdki; mina poważna
    x.save(); x.scale(2, 2);
    x.fillStyle = '#ebe8e6'; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 900; i++) { x.fillStyle = r() < .5 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.06)'; x.fillRect(r() * W, r() * H, 1, .5); }
    const shade = (x0, y0, x1, y1, w, a) => { x.strokeStyle = `rgba(55,50,58,${a})`; x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke(); };
    E.forEach((ex, i) => { const d = i ? 1 : -1;
      x.save(); x.translate(ex, EY); x.scale(1, .7); const g = x.createRadialGradient(0, 0, 4, 0, 0, 19); g.addColorStop(0, 'rgba(20,16,22,.9)'); g.addColorStop(1, 'rgba(20,16,22,0)');
      x.fillStyle = g; x.beginPath(); x.arc(0, 0, 19, 0, 7); x.fill(); x.restore();                   // płaski, przydymiony cień wzdłuż oka
      x.fillStyle = '#0b080b'; x.beginPath();                                                           // ostra, krótka kreska
      x.moveTo(ex - d * 14, EY + 1); x.quadraticCurveTo(ex, EY - 13, ex + d * 13, EY - 2); x.lineTo(ex + d * 20, EY - 4); x.lineTo(ex + d * 13, EY + 2); x.quadraticCurveTo(ex, EY + 11, ex - d * 14, EY + 1); x.fill();
      x.beginPath(); x.moveTo(ex - d * 17, EY - 9); x.lineTo(ex + d * 16, EY - 14); x.lineTo(ex + d * 17, EY - 10); x.lineTo(ex - d * 15, EY - 5.5); x.fill();   // ciężka brew nisko nad okiem, opada do środka
    });
    shade(60, 56, 58, 88, 2, .4); shade(68, 56, 70, 88, 2, .4); shade(57, 94, 71, 94, 3, .35);           // kontur nosa
    x.fillStyle = '#0b080b'; x.beginPath(); x.moveTo(48, 119); x.lineTo(80, 119); x.lineTo(76, 124); x.lineTo(52, 124); x.closePath(); x.fill();   // wąskie, proste usta
    const star = (cx, cy, rr) => { x.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, q = k % 2 ? rr * .3 : rr; x.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } x.closePath(); x.fill(); };
    x.fillStyle = '#1a141e'; star(98, 50, 3.6); star(30, 108, 2.8);                                      // dwie drobne gwiazdki
    x.fillStyle = '#0b080b';                                                                            // pionowa kreska tylko przez jedno oko, zwężona na końcach (jak na wzorze)
    [E[1]].forEach(ex => { x.beginPath(); x.moveTo(ex - .5, EY - 34); x.quadraticCurveTo(ex + 4, EY, ex + .8, EY + 38); x.lineTo(ex - .8, EY + 38); x.quadraticCurveTo(ex - 4, EY, ex + .5, EY - 34); x.fill(); });
    E.forEach(ex => hole(() => { x.moveTo(ex - 10, EY + .5); x.quadraticCurveTo(ex, EY - 9.5, ex + 10, EY); x.quadraticCurveTo(ex, EY + 8.5, ex - 10, EY + .5); }));   // oczy otwarte, lekko przymrużone
    x.restore();
  }
  if (kind === 'void') {
    x.fillStyle = '#4a0006'; for (let k = 0; k < 9; k++) x.fillRect(10 + r() * 108, 90 + r() * 20, 2, 20 + r() * 50);
    E.forEach(ex => hole(() => { x.moveTo(ex - 14, EY + 4); x.lineTo(ex + 12, EY - 6); x.lineTo(ex + 10, EY); x.closePath(); }));
    hole(() => { x.moveTo(26, 106); for (let k = 0; k <= 12; k++) x.lineTo(26 + k * 6.3, 106 + (k % 2 ? 14 : 4) + Math.sin(k / 12 * Math.PI) * 14); x.lineTo(102, 106); x.quadraticCurveTo(64, 116, 26, 106); });
  }
  return c;
}
export function makeMask(P, kind, seed) {
  const g = new THREE.SphereGeometry(1, 14, 12, Math.PI / 2 - 1.15, 2.3, .3, 2.45), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let X = p.getX(i), Y = p.getY(i), Z = p.getZ(i);
    if (Y < 0) { const f = 1 - .32 * Math.pow(-Y, 1.3); X *= f; Z *= f; }
    if (Z > .7 && Math.abs(X) < .16 && Y > -.28 && Y < .12) Z += .14;            // nos
    if (Z > .55 && Math.abs(X) > .18 && Math.abs(X) < .52 && Y > 0 && Y < .34) Z -= .06;  // oczodoły
    p.setXYZ(i, X * .78, Y * 1.05, Z * .7);
  }
  const gf = g.toNonIndexed(); gf.computeVertexNormals();
  const m = P.mat({ map: P.tex(maskTex(kind, seed)), alphaTest: .5, side: THREE.DoubleSide });
  const grp = new THREE.Group(); grp.add(new THREE.Mesh(gf, m));
  return grp;
}

/* ---------- pole wyborów ---------- */
export function initRooms(root, { assets, go }) {
  const stop = [];
  const items = [...root.querySelectorAll('[data-room]')];
  items.forEach(btn => {
    const kind = btn.dataset.room, cv = btn.querySelector('canvas');
    const wide = kind === 'phone', P = ps1(cv, wide ? 144 : 176, wide ? 120 : 176);
    lights(P);
    const st = { hot: false, busy: false, t0: 0, now: 0 };
    btn.addEventListener('pointerenter', () => { st.hot = true; }); btn.addEventListener('pointerleave', () => { st.hot = false; });
    btn.addEventListener('focus', () => { st.hot = true; }); btn.addEventListener('blur', () => { st.hot = false; });
    let tick = () => {}, click = () => go(kind);
    btn.addEventListener('click', () => { if (st.busy) return; click(); });

    if (kind === 'walkman') {
      loadPSX(P, assets.walkman).then(m => { const o = fit(m, 1.1); o.rotation.set(-.15, .5, .1); P.scene.add(o);
        P.cam.position.set(0, .15, 2.3); P.cam.lookAt(0, 0, 0);
        const phones = []; o.traverse(c => { if (c.isMesh && /^headphone|^headJack/i.test(c.material.name || '')) phones.push(c); });
        // klik: słuchawki zeskakują z walkmana i zakładają się na ekran (nakładka na cały ekran), potem sekcja muzyki
        click = () => { if (RM) return go(kind); st.busy = true; phones.forEach(c => { c.visible = false; });
          headphonesOn(assets, cv, o, () => go(kind, true), () => { phones.forEach(c => { c.visible = true; }); st.busy = false; }); };
        tick = (t) => { o.rotation.y = .5 + Math.sin(t / 1600) * (st.hot ? .55 : .3);
          o.position.y = Math.sin(t / 900) * .03 + (st.hot ? .06 : 0); o.rotation.z = .1 + Math.sin(t / 2100) * .05; };
      }).catch(() => {});
    }
    if (kind === 'heads') {
      // trzy maski obok siebie, każda rusza się po swojemu
      const ks = ['haunt', 'sleaze', 'sacral'], ms = ks.map((k, i) => { const m = makeMask(P, k, 11 + i * 7); m.scale.setScalar(.31); m.position.x = (i - 1) * .6; P.scene.add(m); return m; });
      const cold = new THREE.PointLight(0x7fe8ff, .8, 1.6); cold.position.set(-.64, .1, .6); P.scene.add(cold);
      const pink = new THREE.PointLight(0xff3fb4, .7, .7); pink.position.set(0, -.2, .6); P.scene.add(pink);
      const gold = new THREE.PointLight(0xffd27a, .8, 1.6); gold.position.set(.64, .4, .6); P.scene.add(gold);
      P.cam.position.set(0, .05, 2.9); P.cam.lookAt(0, 0, 0);
      tick = (t) => {
        const [a1, a2, a3] = ms, hot = st.hot;
        // 1: lękowa, drży i nerwowo się rozgląda
        a1.position.set(-.6 + (Math.random() - .5) * (hot ? .02 : .008), Math.sin(t / 700) * .03 + (Math.random() - .5) * .006, 0);
        a1.rotation.set(Math.sin(t / 900) * .06, hot ? Math.sin(t / 60) * .05 : (Math.floor(t / 1300) % 3 - 1) * .35, Math.sin(t / 333) * .03);
        // 2: wyluzowana, podskakuje i kiwa się na boki, czasem kręci się dla zabawy
        const sp = (t % 6000) < 700 ? (t % 6000) / 700 * Math.PI * 2 : 0;
        a2.position.set(0, Math.abs(Math.sin(t / 380)) * (hot ? .12 : .07) - .02, 0); a2.rotation.set(0, sp + Math.sin(t / 1400) * .2, Math.sin(t / 520) * .22);
        // 3: poważna, broda w górze; obraca się szarpnięciami jak manekin (skok, bezruch, skok)
        const st3 = Math.floor(t / (hot ? 700 : 1500)), ph3 = (t % (hot ? 700 : 1500)) / 90;
        const pose = k => [[-.28, .06], [0, 0], [.24, -.05], [0, .03]][((k % 4) + 4) % 4];
        const p0 = pose(st3 - 1), p1 = pose(st3), k3 = Math.min(1, ph3);
        a3.position.set(.6, .03 + (ph3 < 1 ? .012 : 0), 0);
        a3.rotation.set(-.18, p0[0] + (p1[0] - p0[0]) * k3, p0[1] + (p1[1] - p0[1]) * k3);
      };
      // klik: maski wylatują z karty, krążą w kręgu i otwierają heksagonalny portal, za którym jest sekcja person
      click = () => { if (RM) return go(kind); st.busy = true; ms.forEach(m => { m.visible = false; });
        personaPortal(cv, ms.map(m => m.position.x), () => go(kind, true), () => { ms.forEach(m => { m.visible = true; }); st.busy = false; }); };
    }
    if (kind === 'minidv') {
      const fc = grime(96, 96, [14, 12, 11], 18, 5), fx = fc.getContext('2d'), fd = fx.getImageData(0, 0, 96, 96);
      for (let yy = 0; yy < 96; yy++) for (let xx = 0; xx < 96; xx++) { const d = Math.hypot((xx - 48) / 48, (yy - 48) / 40); fd.data[(yy * 96 + xx) * 4 + 3] = 255 * Math.max(0, Math.min(1, (1.05 - d) * 2.2)); }
      fx.putImageData(fd, 0, 0);
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.2, 6, 4), P.mat({ map: P.tex(fc), transparent: true, alphaTest: .02 })); ground.rotation.x = -Math.PI / 2; P.scene.add(ground);
      const hole = new THREE.Mesh(new THREE.CircleGeometry(.42, 10), P.mat({ color: 0x000000 })); hole.rotation.x = -Math.PI / 2; hole.position.y = .003; hole.scale.setScalar(.001); P.scene.add(hole);
      const crumbs = []; const cg = new THREE.BoxGeometry(.03, .03, .03);
      for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(cg, P.mat({ color: i % 3 ? 0x2a2420 : 0x5a5048 })); m.visible = false; P.scene.add(m); crumbs.push({ m, v: new THREE.Vector3(), t: 0 }); }
      // wszystko poniżej poziomu podłoża jest odcinane: kaseta naprawdę znika w otworze, zamiast przenikać przez teksturę
      P.r.localClippingEnabled = true; const under = [new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)];
      crumbs.forEach(c => { c.m.material.clippingPlanes = under; });
      loadPSX(P, assets.minidv).then(m => { const o = fit(m, 1.05), tp = new THREE.Group(); tp.add(o); P.scene.add(tp);
        o.traverse(n => { if (n.isMesh) (Array.isArray(n.material) ? n.material : [n.material]).forEach(mt => { mt.clippingPlanes = under; }); });
        const lift = -new THREE.Box3().setFromObject(o).min.y; o.position.y += lift;
        P.cam.position.set(0, .62, 2.25); P.cam.lookAt(0, .32, 0);
        let sink = false;
        click = () => { st.busy = true; sink = true; st.t0 = st.now; };
        tick = (t) => {
          if (!sink) { tp.rotation.set(0, Math.sin(t / 1700) * (st.hot ? .6 : .35), Math.sin(t / 2300) * .04); tp.position.set(0, Math.sin(t / 900) * .02 + (st.hot ? .05 : 0), 0); hole.scale.setScalar(.001); return; }
          const e = t - st.t0, k = clamp(e / (RM ? 1 : 1500), 0, 1), dn = k < .18 ? k / .18 * .05 : .05 + Math.pow((k - .18) / .82, 1.7) * 1.1;
          const sh = (1 - k) * .03 * Math.sin(e / 23) + (Math.random() - .5) * .015 * (1 - k * .6);
          tp.position.set(sh, -dn, 0); tp.rotation.z = Math.sin(e / 70) * .12 * (1 - k * .5) + k * .2;
          hole.scale.setScalar(Math.min(1, k * 2.2) * .9 + .05);
          if (!RM && k < .85) for (let n = 0; n < 2; n++) { const c = crumbs.find(c => !c.m.visible); if (!c) break;
            c.m.visible = true; c.m.position.set((Math.random() - .5) * .7, .02, (Math.random() - .5) * .2); c.v.set((Math.random() - .5) * .02, .015 + Math.random() * .025, (Math.random() - .2) * .012); c.t = 0; }
          if (k >= 1) { sink = false; hc90e(assets, () => go(kind), () => { st.busy = false; tp.position.set(0, 0, 0); tp.rotation.set(0, 0, 0); }); }
        };
        const base = tick; tick = t => { base(t); crumbs.forEach(c => { if (!c.m.visible) return; c.t++; c.m.position.add(c.v); c.v.y -= .0025; c.m.rotation.x += .3; if (c.m.position.y < -.05 || c.t > 40) c.m.visible = false; }); };
      }).catch(() => {});
    }
    if (kind === 'phone') {
      loadPSX(P, assets.phone).then(m => {
        // w pliku ekran patrzy w +Y, a telefon leży wzdłuż X górą (słuchawka, antena) ku −X: najpierw ekran do kamery, potem góra do góry
        m.rotation.set(Math.PI / 2, 0, -Math.PI / 2, 'ZYX');
        const o = fit(m, 1.1); P.scene.add(o); P.cam.position.set(0, 0, 1.75); P.cam.lookAt(0, 0, 0);
        let ring = 0;
        // klik: telefon dzwoni, wylatuje z karty, kamera najeżdża na ekranik; krzyk na LCD, zielony szum przenosi do kontaktu
        // nakładka startuje od razu; telefon w karcie chowa się dopiero po pierwszej narysowanej klatce nakładki (bez przerwy, w której go nie widać)
        click = () => { if (RM) return go(kind); st.busy = true; ring = 0;
          phoneCall(assets, cv, () => go(kind, true), () => { cv.style.visibility = ''; st.busy = false; }, () => { cv.style.visibility = 'hidden'; }); };
        tick = (t) => { const r = ring ? Math.sin((t - st.t0) / 18) * .12 : 0;
          o.rotation.set(.1 + Math.sin(t / 2000) * .06, Math.sin(t / 1500) * (st.hot ? .8 : .45) + r, -.06 + r * .5 + (st.hot ? Math.sin(t / 60) * .03 : 0));
          o.position.y = Math.sin(t / 1000) * .02; };
      }).catch(() => {});
    }
    loop(cv, RM ? 4 : 20, (t) => { st.now = t; tick(t); P.render(); });
  });
  return () => stop.forEach(f => f());
}

/* ---------- persony: przejście jak krąg czarownic. Maski krążą, kredą rysuje się podwójny krąg z runami i pentakl,
   maski stają na wierzchołkach, zapalają się świece; potem znak zajmuje się ogniem od środka (żar → krew → węgiel),
   pękają szczeliny i wylewa się ciemność; po skoku do sekcji ciemność rozpada się na odłamki z płonącymi brzegami ---------- */
let ppBusy = false;
function personaPortal(pickCv, xs, arrive, done) {
  if (ppBusy) return; ppBusy = true;
  const ov = document.createElement('div'); ov.className = 'pp-ov'; ov.innerHTML = '<canvas class="pp-hex"></canvas><canvas class="pp-3d"></canvas>'; document.body.appendChild(ov);
  const [pc, cv] = ov.querySelectorAll('canvas'), W = Math.ceil(innerWidth / 3), H = Math.ceil(innerHeight / 3), CX = W / 2, CY = H / 2;
  const P = ps1(cv, W, H, { alpha: 0 }); lights(P); P.cam.position.set(0, 0, 3); P.cam.lookAt(0, 0, 0);
  pc.width = W; pc.height = H; const x = pc.getContext('2d'); x.imageSmoothingEnabled = false;
  const ms = ['haunt', 'sleaze', 'sacral'].map((k, i) => { const m = makeMask(P, k, 11 + i * 7); P.scene.add(m); return m; });
  const HW = 3 * Math.tan(17.5 * Math.PI / 180), toW = (px, py) => [(px - CX) / (H / 2) * HW, -(py - CY) / (H / 2) * HW];
  const r = pickCv.getBoundingClientRect(), s0 = (r.height / (2 * 2.9 * Math.tan(17.5 * Math.PI / 180))) / (innerHeight / (2 * HW));
  const c0 = [(r.left + r.width / 2) / innerWidth * W, (r.top + r.height / 2) / innerHeight * H], pxPerW = (H / 2) / HW;
  const START = xs.map(xw => [c0[0] + xw * s0 * pxPerW, c0[1]]), R = Math.min(W, H) * .34, MS = Math.min(.12, R / pxPerW * .18);
  const hsh = (a, b) => { const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); };
  const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5], bt = (a, b) => (B4[(b & 3) * 4 + (a & 3)] + .5) / 16, seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const px = (a, b, c) => { x.fillStyle = c; x.fillRect(Math.round(a), Math.round(b), 1, 1); };
  const CH = '#e9e2cf', CH2 = '#8f897a';
  let br = -1;                                                           // promień ognia (od środka); punkt w jego zasięgu płonie zamiast kredy
  const ink = (xx, yy, h) => { if (br >= 0) { const d = Math.hypot(xx - CX, yy - CY); if (d < br) { const age = (br - d) / R * 1000;
      return age < 110 ? '#fff1c1' : age < 280 ? '#ff7a1a' : age < 620 ? '#a8161f' : (hsh(Math.round(xx), Math.floor(performance.now() / 80)) < .1 ? '#ff5a1a' : '#3a1210'); } }
    return h < .3 ? CH2 : CH; };
  const chalk = (x0, y0, x1, y1, frac, sd) => { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2); for (let i = 0; i <= n * frac; i++) { const t = i / n, h = hsh(i + sd, sd * 3.1); if (h < .1) continue;
    const xx = x0 + (x1 - x0) * t + (hsh(i, sd) - .5) * .7, yy = y0 + (y1 - y0) * t + (hsh(sd, i) - .5) * .7, c = ink(xx, yy, h); px(xx, yy, c); if (c === '#fff1c1' || c === '#ff7a1a') px(xx, yy + 1, '#5a1206'); } };
  const circ = (rr, frac, rot, sd) => { const n = Math.ceil(TAU * rr * 2); for (let i = 0; i <= n * frac; i++) { const a = rot + i / n * TAU, h = hsh(i + sd, 7); if (h < .1) continue;
    const xx = CX + Math.cos(a) * (rr + (h - .5) * .6), yy = CY + Math.sin(a) * (rr + (h - .5) * .6); px(xx, yy, ink(xx, yy, h)); } };
  const vert = (rr, k, rot = 0) => { const a = -Math.PI / 2 + k * TAU / 5 + rot; return [CX + Math.cos(a) * rr, CY + Math.sin(a) * rr]; };
  const glyphs = Array.from({ length: 24 }, () => { let g; do g = makeGlyph(); while (g.st.length < 2); const c = document.createElement('canvas'); c.width = c.height = 7; const gx = c.getContext('2d'); gx.strokeStyle = CH; gx.lineWidth = 1; drawGlyph(g, gx, .5, .5, 6); return c; });
  const black = f => { const img = x.getImageData(0, 0, W, H), D = img.data; for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) { const v = f(xx, yy); if (v <= 0) continue;
    if (v >= 1 || bt(xx, yy) < v) { const i = (yy * W + xx) * 4; D[i] = 2; D[i + 1] = 1; D[i + 2] = 4; D[i + 3] = 255; } } x.putImageData(img, 0, 0); };
  const cracks = Array.from({ length: 9 }, (_, k) => { const pts = []; let a = hsh(k, 9) * TAU, xx = CX, yy = CY; for (let q = 0; q < Math.hypot(W, H); q++) { a += (hsh(k, q) - .5) * .5; xx += Math.cos(a); yy += Math.sin(a); pts.push([xx, yy]); } return pts; });
  // odłamki: pierścienie trójkątów pokrywające cały ekran, od środka na zewnątrz
  const maxD = Math.hypot(W, H) / 2 + 10, RW = Math.max(18, H / 5), shards = [];
  for (let ring = 0; ring * RW < maxD; ring++) { const n = 6 + ring * 6; for (let k = 0; k < n; k++) { const a0 = k / n * TAU, a1 = (k + 1) / n * TAU, r0 = ring * RW, r1 = (ring + 1) * RW, q = [[a0, r0], [a1, r0], [a1, r1], [a0, r1]].map(([a, rr]) => [CX + Math.cos(a) * rr, CY + Math.sin(a) * rr]);
    for (const tri of [[0, 1, 2], [0, 2, 3]]) { const pts = tri.map(j => q[j]), mx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3, my = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
      shards.push({ pts: pts.map(([a, b]) => [a - mx, b - my]), mx, my, del: ring * .07 + hsh(k, ring) * .12, rot: (hsh(k, ring + 7) - .5) * 3, ox: (hsh(ring, k) - .5) * 50 }); } } }
  const wrapA = d => Math.atan2(Math.sin(d), Math.cos(d)), SH = 2380;
  let goal = null, frags = null;
  // pęknięcie maski na ok. 28 kawałków (po kilka sąsiednich trójkątów siatki), każdy z własnym środkiem
  const shatter = m => { const mesh = m.children[0], gm = mesh.geometry, pos = gm.attributes.position, nor = gm.attributes.normal, uv = gm.attributes.uv, tri = pos.count / 3, per = Math.ceil(tri / 28);
    const G = new THREE.Group(); G.position.copy(m.position); G.rotation.copy(m.rotation); G.scale.copy(m.scale); P.scene.add(G); G.updateMatrixWorld(true);
    const target = G.worldToLocal(new THREE.Vector3(0, 0, -.6)), parts = [];
    for (let t = 0; t < tri; t += per) { const n = Math.min(per, tri - t) * 3, P3 = new Float32Array(n * 3), N3 = new Float32Array(n * 3), U2 = new Float32Array(n * 2), c = new THREE.Vector3();
      for (let j = 0; j < n; j++) c.add(new THREE.Vector3(pos.getX(t * 3 + j), pos.getY(t * 3 + j), pos.getZ(t * 3 + j))); c.divideScalar(n);
      for (let j = 0; j < n; j++) { const v = t * 3 + j; P3.set([pos.getX(v) - c.x, pos.getY(v) - c.y, pos.getZ(v) - c.z], j * 3); N3.set([nor.getX(v), nor.getY(v), nor.getZ(v)], j * 3); U2.set([uv.getX(v), uv.getY(v)], j * 2); }
      const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(P3, 3)); bg.setAttribute('normal', new THREE.BufferAttribute(N3, 3)); bg.setAttribute('uv', new THREE.BufferAttribute(U2, 2));
      const fm = new THREE.Mesh(bg, mesh.material); fm.position.copy(c); G.add(fm);
      parts.push({ m: fm, p0: c.clone(), del: Math.random() * 220, sw: .25 + Math.random() * .5, side: new THREE.Vector3(-c.y, c.x, 0).normalize(), r0: new THREE.Euler(),
        spin: new THREE.Vector3((Math.random() - .5) * 9, (Math.random() - .5) * 9, (Math.random() - .5) * 9) }); }
    return { G, target, parts }; };
  let finished = false, jumped = false, t0 = null;
  const end = () => { if (finished) return; finished = true; ov.remove(); P.r.dispose(); ppBusy = false; done(); };
  loop(cv, 30, t => { if (finished) return; if (t0 === null) t0 = t; const e = t - t0;
    x.clearRect(0, 0, W, H);
    const g = ease(seg(e, 0, 700)), toV = ease(seg(e, 1500, 1900)), burnt = seg(e, 2150, 2500), rot = e / 4000;
    // krąg: maski krążą do 1,5 s, potem każda idzie do najbliższego wolnego wierzchołka pentaklu najkrótszym łukiem
    if (e >= 1500 && !goal) { goal = []; const used = new Set(), a0 = ms.map((_, i) => 1.4 * 1.5 + i * TAU / 3 - Math.PI / 2);
      ms.forEach((_, i) => { let best = -1, bd = 9; for (let k = 0; k < 5; k++) { if (used.has(k)) continue; const d = Math.abs(wrapA(-Math.PI / 2 + k * TAU / 5 - a0[i])); if (d < bd) { bd = d; best = k; } } used.add(best); goal.push(best); }); }
    ms.forEach((m, i) => { if (e > SH) { m.visible = false; return; } m.visible = true;
      let a = 1.4 * Math.min(e, 1500) / 1000 + i * TAU / 3 - Math.PI / 2, rr = 1;
      if (goal) { const ta = -Math.PI / 2 + goal[i] * TAU / 5 + rot * .3; a += wrapA(ta - a) * toV; rr = 1 - (1 - .8 / 1.1) * toV; }
      const ex = CX + Math.cos(a) * R * 1.1 * rr, ey = CY + Math.sin(a) * R * 1.1 * rr;
      const [wx, wy] = toW(START[i][0] + (ex - START[i][0]) * g, START[i][1] + (ey - START[i][1]) * g);
      m.position.set(wx, wy, 0); m.scale.setScalar(.31 * s0 + (MS - .31 * s0) * g); m.rotation.set(0, Math.sin(e / 500 + i) * .2, Math.sin(e / 700 + i * 2) * .06);
      const ember = burnt * (.75 + .25 * Math.sin(e / 45 + i)); m.children[0].material.color.setRGB(1 - ember * .55, 1 - ember * .85, 1 - ember * .92); });   // zwęglają się, żar pulsuje
    // rozpad: maska pęka na wielokąty, które wirując wpadają do środka znaku i gasną
    if (e > SH && !frags) frags = ms.map(shatter);
    if (frags) frags.forEach(F => F.parts.forEach(q => { const k = clamp((e - SH - q.del) / 520, 0, 1), kk = k * k;
      q.m.position.lerpVectors(q.p0, F.target, kk).addScaledVector(q.side, Math.sin(k * Math.PI) * q.sw);
      q.m.rotation.set(q.r0.x + q.spin.x * k, q.r0.y + q.spin.y * k, q.r0.z + q.spin.z * k); q.m.scale.setScalar(Math.max(.001, 1 - kk)); q.m.visible = k < 1; }));
    P.render();
    if (e < 3250) {
      br = e > 2000 ? seg(e, 2000, 2700) * R * 1.25 : -1;
      if (e > 400) { circ(R, seg(e, 400, 1000), -Math.PI / 2, 1); circ(R * .82, seg(e, 700, 1200), Math.PI / 2, 2); }
      const nr = Math.floor(24 * seg(e, 900, 1600)); for (let k = 0; k < nr; k++) { const a = rot + k * TAU / 24, rr = R * .91, gx = CX + Math.cos(a) * rr, gy = CY + Math.sin(a) * rr;
        if (br >= 0 && Math.hypot(gx - CX, gy - CY) < br) continue;          // runy spłonęły
        x.globalAlpha = .55 + .45 * hsh(k, Math.floor(e / 120)); x.drawImage(glyphs[k], Math.round(gx - 3), Math.round(gy - 3)); } x.globalAlpha = 1;
      const pf = seg(e, 1300, 1900); for (let k = 0; k < 5; k++) { const [a0, b0] = vert(R * .8, k * 2, rot * .3), [a1, b1] = vert(R * .8, k * 2 + 2, rot * .3); chalk(a0, b0, a1, b1, clamp(pf * 5 - k, 0, 1), k * 9); }
      if (e > 1700 && e < 2600) for (let k = 0; k < 5; k++) { const [vx, vy] = vert(R * .8, k, rot * .3); if (!seg(e, 1700 + k * 50, 1800 + k * 50)) continue;
        for (let yy = 0; yy < 4; yy++) { px(vx, vy + 1 + yy, '#cfc6b0'); px(vx + 1, vy + 1 + yy, '#9d9480'); }
        const fl = 1 + Math.floor(hsh(k, Math.floor(e / 70)) * 3) + (e > 2100 ? 2 : 0); for (let yy = 0; yy < fl; yy++) px(vx + (yy && hsh(k, e) > .5 ? 1 : 0), vy - yy, yy ? '#ffb347' : '#ff6a1a');
        for (let d = 0; d < 10; d++) { const a = hsh(d, k) * TAU, rr = 2 + hsh(k, d) * 4; if (hsh(d, Math.floor(e / 90) + k) < .3) px(vx + Math.cos(a) * rr, vy - 2 + Math.sin(a) * rr, '#8a0b16'); } }
      const cr = seg(e, 2450, 2950); if (cr > 0) cracks.forEach((c, k) => { const L = Math.floor(cr * c.length * (.4 + hsh(k, 3) * .6)); for (let q = 0; q < L; q++) { px(c[q][0], c[q][1], q > L - 6 ? '#ff5a1a' : '#1a0505'); if (q & 1) px(c[q][0] + 1, c[q][1], '#5a0a0a'); } });
      const fl = seg(e, 2700, 3200) * maxD * 1.3; if (fl > 0) black((xx, yy) => { const d = Math.hypot(xx - CX, yy - CY) + hsh(xx >> 2, yy >> 2) * 30; return d < fl - 10 ? 1 : d < fl + 10 ? .5 : 0; });
    } else {
      if (!jumped) { jumped = true; arrive(); }
      // czarne odłamki opadają z płonącymi brzegami, w szczelinach żar
      const k0 = seg(e, 3250, 4150), flick = Math.floor(e / 70);
      shards.forEach((sh, j) => { const f = Math.max(0, (k0 - sh.del) / .55), dy = f * f * H * 1.5; if (dy > H * 1.4) return;
        x.save(); x.translate(sh.mx + sh.ox * f, sh.my + dy); x.rotate(sh.rot * f); x.beginPath(); sh.pts.forEach(([a, b], q) => q ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath();
        x.fillStyle = '#040306'; x.fill(); x.strokeStyle = f > 0 ? (hsh(j, flick) < .5 ? '#ff6a1a' : '#c4121d') : '#2a0a08'; x.lineWidth = 1; x.stroke(); x.restore();
        if (f > 0 && hsh(j, flick + 3) < .25) px(sh.mx + sh.ox * f + (hsh(j, 1) - .5) * 6, sh.my + dy - 4 - hsh(j, flick) * 8, '#ffb347'); });
      if (e > 4200) end();
    } });
}

/* ---------- sekcja person: trzy maski lewitują u góry; przy części danej persony ona wychyla się na wprost,
   a pozostałe cofają się w cień jak nieodblokowane postacie ---------- */
let ACTIVE = -1;   // aktywna persona (z initPersonaStage), czytana przez nagłówki i głosy
export const personaActive = () => ACTIVE;
export function initPersonaStage(cv, parts) {
  // niska rozdzielczość w proporcjach płótna (minimum 120 px szerokości bez zmiany proporcji, inaczej maski się rozciągają)
  const dims = () => { const w = cv.clientWidth / 4 || 120, h = cv.clientHeight / 4 || 60, k = Math.max(1, 120 / w); return [Math.round(w * k), Math.max(30, Math.round(h * k))]; };
  let [W, Hh] = dims();
  const P = ps1(cv, W, Hh); lights(P); P.cam.position.set(0, .02, 3); P.cam.lookAt(0, 0, 0);
  const ms = ['haunt', 'sleaze', 'sacral'].map((k, i) => { const m = makeMask(P, k, 11 + i * 7); P.scene.add(m); return m; });
  let span = Math.min(1.25, 1.4 * W / Hh / 4.2);
  // płótno mierzone przed ułożeniem strony miało złe proporcje (rozciągnięte maski na telefonie): przeliczamy przy każdej zmianie rozmiaru
  const ro = new ResizeObserver(() => { const [w, h] = dims(); if (w === W && h === Hh) return; W = w; Hh = h; P.resize(W, Hh); span = Math.min(1.25, 1.4 * W / Hh / 4.2); }); ro.observe(cv);
  const cur = ms.map(() => ({ z: 0, s: .4, c: .75, y: 0 }));
  let active = -1;
  // aktywna persona = część najbliższa linii pod sceną (62% wysokości okna), liczona z położenia w każdej klatce, więc nie zależy od kolejności
  // ani kierunku przewijania (zdarzenia przecięcia gubiły stan przy powrocie na górę); gdy żadna część nie jest blisko okna: -1 (wszystkie neutralne)
  const pick = () => { const line = innerHeight * .62; let best = -1, bd = 1e9;
    parts.forEach((el, i) => { const r = el.getBoundingClientRect(), d = Math.abs((r.top + r.bottom) / 2 - line); if (d < bd) { bd = d; best = i; } });
    return bd < innerHeight * .75 ? best : -1; };
  loop(cv, RM ? 4 : 24, t => {
    active = pick(); ACTIVE = active;
    ms.forEach((m, i) => {
      const on = active === i, off = active >= 0 && !on, tg = { z: on ? .7 : off ? -1 : 0, s: on ? .48 : off ? .33 : .4, c: on ? 1 : off ? .14 : .75, y: off ? .14 : 0 }, c = cur[i];
      for (const k in tg) c[k] += (tg[k] - c[k]) * .12;
      let x = (i - 1) * span, y = c.y + Math.sin(t / 900 + i * 2) * .05, rx = 0, ry = 0, rz = 0;
      if (i === 0) { x += (Math.random() - .5) * .01; ry = (Math.floor(t / 1300) % 3 - 1) * .3; rz = Math.sin(t / 333) * .03; }          // lękowa: drży, rozgląda się nerwowo
      if (i === 1) { y += Math.abs(Math.sin(t / 380)) * .06; rz = Math.sin(t / 520) * .2; ry = Math.sin(t / 1400) * .2; }                  // wyluzowana: podskakuje, kiwa się
      if (i === 2) { const st = Math.floor(t / 1500), pose = k => [[-.28, .06], [0, 0], [.24, -.05], [0, .03]][((k % 4) + 4) % 4], k3 = Math.min(1, (t % 1500) / 90);
        const p0 = pose(st - 1), p1 = pose(st); rx = -.18; ry = p0[0] + (p1[0] - p0[0]) * k3; rz = p0[1] + (p1[1] - p0[1]) * k3; }     // poważna: szarpnięcia manekina
      if (on) rx -= .12;                                                                                                                 // wychyla się ku widzowi
      // wąski ekran: mniejsze maski, żeby się nie nakładały
      m.position.set(x, y, c.z); m.scale.setScalar(c.s * Math.min(1, Math.max(.55, W / Hh / 2.4))); m.rotation.set(rx, ry, rz); m.children[0].material.color.setScalar(c.c);
    });
    P.render();
  });
  return () => { ro.disconnect(); };
}

/* ---------- walkman → muzyka: słuchawki wylatują z karty, obracają się wokół osi nauszników (pałąk idzie do tyłu, jakby
   zakładały się na głowę), nauszniki dochodzą do brzegów ekranu, ekran gaśnie ditherem i odsłania sekcję ---------- */
let hpBusy = false;
function headphonesOn(assets, pickCv, pickObj, arrive, done) {
  if (hpBusy) return; hpBusy = true;
  const ov = document.createElement('div'); ov.className = 'hp-ov'; ov.innerHTML = '<canvas></canvas><canvas class="hp-dim"></canvas>'; document.body.appendChild(ov);
  const [cv, dimC] = ov.querySelectorAll('canvas'), lw = Math.ceil(innerWidth / 3), lh = Math.ceil(innerHeight / 3);
  const P = ps1(cv, lw, lh, { alpha: 0 }); lights(P); P.cam.position.set(0, 0, 3); P.cam.lookAt(0, 0, 0);
  dimC.width = Math.ceil(lw / 2); dimC.height = Math.ceil(lh / 2); const dx = dimC.getContext('2d');
  let finished = false;
  const end = () => { if (finished) return; finished = true; ov.classList.add('out'); setTimeout(() => { ov.remove(); P.r.dispose(); hpBusy = false; done(); }, 380); };
  loadPSX(P, assets.walkman).then(m => {
    const o = fit(m, 1.1); o.traverse(c => { if (c.isMesh && !/^headphone|^headJack/i.test(c.material.name || '')) c.visible = false; });
    // oś obrotu: przez środki nauszników (przy zerowym obrocie, w układzie walkmana)
    o.updateMatrixWorld(true); const cups = new THREE.Box3(); o.traverse(c => { if (c.isMesh && /^headphoneOrange/i.test(c.material.name || '')) cups.expandByObject(c); });
    const pc = cups.getCenter(new THREE.Vector3()), piv = new THREE.Group(); piv.position.copy(pc); o.add(piv);
    [...o.children].forEach(c => { if (c !== piv) piv.attach(c); });
    const T = new THREE.Group(); T.add(o); o.position.sub(pc); T.position.copy(pc); P.scene.add(T);   // T obraca się wokół osi nauszników
    // start dokładnie tam, gdzie słuchawki były w karcie: pozycja na ekranie i skala z rozmiaru płótna karty
    const r = pickCv.getBoundingClientRect(), H = 3 * Math.tan(17.5 * Math.PI / 180), Wd = H * innerWidth / innerHeight;
    const sx = ((r.left + r.width / 2) / innerWidth * 2 - 1) * Wd, sy = -((r.top + r.height / 2) / innerHeight * 2 - 1) * H;
    const s0 = (r.height / (2 * 2.3 * Math.tan(17.5 * Math.PI / 180))) / (innerHeight / (2 * H));
    const R0 = pickObj.rotation.clone(), start = new THREE.Vector3(sx, sy, 0).add(pc.clone().multiplyScalar(s0)), s1 = 2.6 * Math.min(1, innerWidth / innerHeight);
    let t0 = null;
    loop(cv, 30, t => { if (finished) return; if (t0 === null) t0 = t; const e = t - t0;
      const up = easeOut(clamp(e / 450, 0, 1)), put = ease(clamp((e - 380) / 1150, 0, 1));
      T.scale.setScalar(s0 + (s1 - s0) * put);
      T.position.set(start.x * (1 - put), start.y * (1 - put) + up * .5 * s0 * (1 - put) - .06 * put, put * 1.7);
      T.rotation.set(R0.x * (1 - put), R0.y * (1 - put), R0.z * (1 - put));
      piv.rotation.x = 1.3 * ease(clamp((e - 520) / 1000, 0, 1));                   // pałąk przechodzi nad głową widza (ku kamerze i w górę), nauszniki na boki
      P.render();
      const d = clamp((e - 1250) / 380, 0, 1); dx.clearRect(0, 0, dimC.width, dimC.height);
      if (d > 0) { const img = dx.createImageData(dimC.width, dimC.height), D = img.data; for (let yy = 0; yy < dimC.height; yy++) for (let xx = 0; xx < dimC.width; xx++) if (bthC(xx, yy) < d) D[(yy * dimC.width + xx) * 4 + 3] = 255; dx.putImageData(img, 0, 0); }
      if (e > 1680) { arrive(); end(); } });
  }).catch(() => { arrive(); end(); });
}
const BAYC = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5], bthC = (x, y) => (BAYC[(y & 3) * 4 + (x & 3)] + .5) / 16;

/* ---------- przejście miniDV → HC90E: ciemność, kamera wjeżdża, najazd na LCD w NightShot, ekran nabiera koloru i odsłania dział ---------- */
let hcBusy = false;
function hc90e(assets, arrive, done) {
  if (hcBusy) return; hcBusy = true;
  const ov = document.createElement('div'); ov.className = 'hc-ov'; ov.innerHTML = '<canvas></canvas><span class="hc-skip dos">[ Esc ] pomiń</span>'; document.body.appendChild(ov);
  // pionowy ekran (telefon): cały widok obrócony o 90°, kamera trzymana pionowo, obraz na LCD w formacie 9:16
  const portrait = innerHeight > innerWidth;
  const cv = ov.querySelector('canvas'); const P = ps1(cv, portrait ? 216 : 384, portrait ? 384 : 216, { clear: 0x000000, alpha: 1 });
  const lcdC = document.createElement('canvas'); lcdC.width = 256; lcdC.height = 144; const x = lcdC.getContext('2d'); x.imageSmoothingEnabled = false;
  const LW = portrait ? 144 : 256, LH = portrait ? 256 : 144;   // logiczny układ ekranu LCD (po obrocie)
  const img = new Image(); img.src = assets.lcd;
  const tc = ms => { const s = Math.floor(ms / 1000), f = Math.floor(ms / 40) % 25; return `0:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(f).padStart(2, '0')}`; };
  const txt = (s, px, py, col) => { x.font = '16px "Krzyk DOS"'; x.textBaseline = 'top'; x.fillStyle = '#000'; x.fillText(s, px + 1, py + 1); x.fillStyle = col; x.fillText(s, px, py); };
  const lcd = (re, ns) => { x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = '#000'; x.fillRect(0, 0, 256, 144);
    if (portrait) x.setTransform(0, 1, -1, 0, 256, 0);           // rysujemy pionowo; obrót kamery stawia obraz z powrotem prosto
    if (img.complete) { if (portrait) { const sw = img.naturalHeight * 9 / 16, sx = (img.naturalWidth - sw) / 2; x.drawImage(img, sx, 0, sw, img.naturalHeight, 0, 0, LW, LH); } else x.drawImage(img, 0, 0, 256, 144); }
    if (ns > 0) { const id = x.getImageData(0, 0, 256, 144), d = id.data;
      for (let i = 0; i < d.length; i += 4) { const L = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255, v = clamp(L * 1.8 + (Math.random() - .5) * .3, 0, 1);
        d[i] = d[i] * (1 - ns) + v * 40 * ns; d[i + 1] = d[i + 1] * (1 - ns) + (30 + v * 225) * ns; d[i + 2] = d[i + 2] * (1 - ns) + v * 80 * ns; }
      x.putImageData(id, 0, 0); }
    x.globalAlpha = Math.max(ns, .25); txt('● REC', 6, 4, Math.floor(re / 500) % 2 ? '#ff3030' : '#7a1010'); txt(tc(re), LW - 106, portrait ? 22 : 4, '#d8ffe0');
    x.globalAlpha = ns; if (Math.floor(re / 350) % 2) txt('NIGHTSHOT', 6, LH - 20, '#b6ffc8'); x.globalAlpha = 1; screenT.needsUpdate = true; };
  const screenT = P.tex(lcdC);
  let finished = false;
  const end = () => { if (finished) return; finished = true; arrive(); ov.classList.add('out'); setTimeout(() => { ov.remove(); P.r.dispose(); hcBusy = false; done(); }, 450); window.removeEventListener('keydown', key); };
  const key = e => { if (e.key === 'Escape') end(); }; window.addEventListener('keydown', key); ov.addEventListener('click', end);
  if (RM) { setTimeout(end, 50); return; }
  loadPSX(P, assets.hc90e).then(cam => {
    const g = new THREE.Group(), inner = new THREE.Group(); inner.add(cam); inner.rotation.y = Math.PI; g.add(inner); P.scene.add(g);
    // ekran LCD jako płaszczyzna w miejscu wyświetlacza modelu
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(.403, .216), new THREE.MeshBasicMaterial({ map: screenT, side: THREE.DoubleSide }));
    scr.position.set(.1925, -.127, .2045); scr.rotation.y = Math.PI; inner.add(scr);
    const glow = new THREE.PointLight(0x5dff8a, 0, 1.4); P.scene.add(glow); P.scene.add(new THREE.AmbientLight(0x6a7088, .05));
    const lcdW = new THREE.Vector3(-.19, -.127, -.203), camA = new THREE.Vector3(.05, .02, 1.9), camB = new THREE.Vector3(-.19, -.127, .14), camC = new THREE.Vector3(-.19, -.127, -.03);
    const OFF = 2.15; let t0 = null;
    if (portrait) P.cam.up.set(1, 0, 0);                               // kamera obrócona o 90°: dłuższy bok LCD idzie w pionie
    loop(cv, 24, (t) => { if (finished) return; if (t0 === null) t0 = t; const e = t - t0;
      const k1 = easeOut(clamp((e - 300) / 1300, 0, 1)), r = 1 - k1;
      g.position.set(r * OFF, -r * .05, 0); g.rotation.set(0, -r * .5, r * .05);
      const k2 = ease(clamp((e - 800) / 2900, 0, 1)), k3 = ease(clamp((e - 3700) / 1300, 0, 1));
      P.cam.position.lerpVectors(camA, camB, k2); if (k3 > 0) P.cam.position.lerpVectors(camB, camC, k3); P.cam.lookAt(lcdW);
      glow.intensity = .9 * Math.min(1, k1 * 1.4); glow.position.set(-.19 + r * OFF, -.12, .1);
      lcd(e, 1 - clamp((e - 3700) / 900, 0, 1));
      P.render();
      if (e > 5000) end();
    });
  }).catch(end);
}

/* ---------- telefon → kontakt: telefon wylatuje z karty, kamera najeżdża na ekran modelu, aż LCD wypełni okno (na telefonie: szerokość);
   na ekranie „HALO? / CZY TO...?" i fala krzyku z wyciętym KRZYK; LCD rozsypuje się w zielony szum, który zalewa stronę i odsłania kontakt ---------- */
let phBusy = false;
function phoneCall(assets, pickCv, arrive, done, shown) {
  if (phBusy) return; phBusy = true;
  const ov = document.createElement('div'); ov.className = 'ph-ov'; ov.innerHTML = '<canvas></canvas><canvas></canvas><span class="hc-skip dos">[ Esc ] pomiń</span>'; document.body.appendChild(ov);
  const [cv, c2] = ov.querySelectorAll('canvas'), W = innerWidth, H = innerHeight;
  const dv = W < 700 ? 2 : 3, P = ps1(cv, Math.ceil(W / dv), Math.ceil(H / dv), { alpha: 0 }); lights(P); P.cam.position.set(0, 0, 3); P.cam.lookAt(0, 0, 0);
  c2.width = W; c2.height = H; const x = c2.getContext('2d');
  const tc = document.createElement('canvas'); tc.width = 168; tc.height = 96; const tx = tc.getContext('2d'), T = P.tex(tc);
  const keys = new THREE.PointLight(0x9dff7a, 0, 1.2); P.scene.add(keys);
  const HW = 3 * Math.tan(17.5 * Math.PI / 180), r0 = pickCv.getBoundingClientRect();
  const s0 = r0.height / H * 3 / 1.75, p0 = new THREE.Vector3((r0.left + r0.width / 2 - W / 2) / (H / 2) * HW, -(r0.top + r0.height / 2 - H / 2) / (H / 2) * HW, 0);
  let finished = false, jumped = false, shownCb = false, t0 = null, o = null, scr = null;
  const end = () => { if (finished) return; finished = true; if (!jumped) arrive(); ov.remove(); P.r.dispose(); removeEventListener('keydown', key); phBusy = false; done(); };
  const key = e => { if (e.key === 'Escape') end(); }; addEventListener('keydown', key); ov.addEventListener('click', end);
  const camT = new THREE.Vector3(), camN = new THREE.Vector3(), corner = new THREE.Vector3(), camA = new THREE.Vector3(0, 0, 3);
  // prostokąt ekranu na stronie (rzut rogów płaszczyzny LCD)
  const rectOf = () => { let a = [1e9, 1e9, -1e9, -1e9]; for (const [u, v] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { corner.set(u * 1.43, v * .91, 0); scr.localToWorld(corner); corner.project(P.cam);
    const X = (corner.x + 1) / 2 * W, Y = (1 - corner.y) / 2 * H; a = [Math.min(a[0], X), Math.min(a[1], Y), Math.max(a[2], X), Math.max(a[3], Y)]; } return a; };
  loadPSX(P, assets.phone).then(m => {
    m.rotation.set(Math.PI / 2, 0, -Math.PI / 2, 'ZYX');
    // ekran w pliku: x od −2,35 do −0,53 (góra telefonu ku −X), z od −1,42 do 1,44, tuż nad przednią ścianką (y = 1)
    scr = new THREE.Mesh(new THREE.PlaneGeometry(2.86, 1.82), new THREE.MeshBasicMaterial({ map: T }));
    scr.position.set(-1.44, 1.015, .01); scr.rotation.set(-Math.PI / 2, Math.PI / 2, 0, 'YXZ'); m.add(scr);
    o = fit(m, 1.1); P.scene.add(o);
  }).catch(end);
  loop(cv, 30, t => { if (finished || !o) return; if (t0 === null) t0 = t; const e = t - t0, lt = e - 500;
    const k1 = ease(clamp(e / 1000, 0, 1)), ring = e < 900 ? Math.sin(e / 18) * .1 * (1 - e / 900) : 0;
    o.position.lerpVectors(p0, new THREE.Vector3(0, 0, 0), k1); o.scale.setScalar(s0 + (1 - s0) * k1); o.rotation.set(.1 * (1 - k1), (1 - k1) * .45 + ring, ring * .5);
    keys.intensity = e < 1400 ? (.6 + .4 * Math.sin(e / 50)) * 1.2 : 0; keys.position.set(o.position.x, o.position.y - .25, .5);
    // kamera: z (0,0,3) na oś ekranu, w takiej odległości, żeby LCD zmieścił się w oknie (94%)
    o.updateMatrixWorld(true); scr.getWorldPosition(camT); camN.set(0, 0, 1).applyQuaternion(scr.getWorldQuaternion(new THREE.Quaternion()));
    const sw = 2.86 * scr.getWorldScale(corner).x, sh = 1.82 * corner.y, tn = Math.tan(17.5 * Math.PI / 180), d = Math.max(sh / (2 * tn * .94), sw / (2 * tn * (W / H) * .94));
    const k2 = ease(clamp((e - 900) / 1700, 0, 1)); P.cam.position.lerpVectors(camA, camT.clone().addScaledVector(camN, d), k2); P.cam.lookAt(new THREE.Vector3().lerpVectors(new THREE.Vector3(), camT, k2));
    const st = drawLCD(tx, lt, 0, 0, 168, 96); T.needsUpdate = true;
    const sx = (Math.random() - .5) * st.shake * 6, sy = (Math.random() - .5) * st.shake * 6; cv.style.transform = c2.style.transform = `translate(${sx | 0}px,${sy | 0}px)`;
    P.render(); if (!shownCb) { shownCb = true; shown(); } x.clearRect(0, 0, W, H);
    // od 2 s nad modelem ostry obraz LCD w pełnej rozdzielczości, dokładnie w rzucie ekranu
    const a2 = clamp((e - 2000) / 400, 0, 1); if (a2 > 0) { const [rx, ry, rx1, ry1] = rectOf(); x.fillStyle = `rgba(4,6,10,${.55 * a2})`; x.fillRect(0, 0, W, ry); x.fillRect(0, ry1, W, H - ry1); x.fillRect(0, ry, rx, ry1 - ry); x.fillRect(rx1, ry, W - rx1, ry1 - ry);   // obudowa przygasa, uwaga na ekranie
      x.globalAlpha = a2; drawLCD(x, lt, rx, ry, rx1 - rx, ry1 - ry); x.globalAlpha = 1;
      // szum wylewa się z ekranu na całą stronę (kratka jak piksele LCD), przy pełnym zalaniu skok do kontaktu, potem szum rzednie
      const z = (lt - T_NOISE) / 1000, cs = Math.max(4, Math.round((rx1 - rx) / 84)), cx0 = (rx + rx1) / 2, cy0 = (ry + ry1) / 2, R = Math.hypot(W, H) * .7;
      if (z > 0) { const out = z > 1.25 ? (z - 1.25) / .7 : 0, f = Math.floor(t / 70);
        for (let yy = 0; yy < H; yy += cs) for (let xx = 0; xx < W; xx += cs) { const dd = Math.hypot(xx - cx0, (yy - cy0) * 1.3) / R, gx = xx / cs | 0, gy = yy / cs | 0;
          if (bay(gx, gy) > z * 1.5 - dd || bay(gx + 1, gy + 2) < out * 1.2) continue; const v = hash(gx, gy, f); x.fillStyle = v < .45 ? '#16201a' : v < .8 ? '#6f9a5e' : '#a8cc8c'; x.fillRect(xx, yy, cs - 1, cs - 1); }
        if (z > 1.1 && !jumped) { jumped = true; cv.style.visibility = 'hidden'; arrive(); }
        if (out >= 1) end(); } }
  });
}

/* ---------- nagłówki person: nazwa to niskorozdzielcza, miękka tekstura (mapowanie afiniczne, przyciąganie wierzchołków do pikseli) na wstążce
   z 8 wielokątów; przez wstążkę biegnie fala i skręt, a z tyłu ciągnie się smuga ruchu. Fala żyje bez przerwy, dopóki persona jest aktywna;
   przy wejściu słowo wynurza się z ciemności jako pognieciona kreska i prostuje się, przy wyjściu znowu zwija się i gaśnie. ---------- */
const TITLE_COL = [[200, 240, 255], [255, 200, 235], [255, 235, 190]];
export function initPersonaTitles(parts) {
  if (RM) return () => {};
  const PW = 6.4, PH = PW * 28 / 128 * 1.1, NX = 6, tri = a => 2 / Math.PI * Math.asin(Math.sin(a)), Q = ms => Math.floor(ms / 90) * 90, ss = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }, L = new THREE.Vector3(-.4, .5, 1).normalize();
  const stops = [];
  parts.forEach((el, i) => {
    const name = el.dataset.name, h = el.querySelector('h3'); if (!name || !h) return;
    const cv = document.createElement('canvas'); cv.className = 'kp-title'; cv.setAttribute('aria-hidden', 'true'); el.insertBefore(cv, h); h.classList.add('kp-gl');
    const r = new THREE.WebGLRenderer({ canvas: cv, antialias: false, alpha: true }); r.setPixelRatio(1); r.setClearColor(0x000000, 0); r.autoClear = false;
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 3, .1, 50); cam.position.set(0, 0, 7); cam.lookAt(0, 0, 0);
    const res = new THREE.Vector2(1, 1), tint = new THREE.Vector3(...TITLE_COL[i % 3].map(v => v / 255)), gain = { value: 0 };
    const geo = new THREE.PlaneGeometry(1, 1, NX, 1); geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 3), 3));
    const base = geo.attributes.position.array.slice();
    const mat = new THREE.ShaderMaterial({ uniforms: { map: { value: null }, tint: { value: tint }, gain, res: { value: res } }, side: THREE.DoubleSide, transparent: true, depthTest: false, depthWrite: false, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor,
      vertexShader: `uniform vec2 res; varying vec3 vUW; varying vec3 vCol; attribute vec3 color;
        void main(){ vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); vec2 n = p.xy / p.w; n = floor(n * res * .5 + .5) / (res * .5); gl_Position = vec4(n * p.w, p.z, p.w); vUW = vec3(uv * p.w, p.w); vCol = color; }`,
      fragmentShader: `uniform sampler2D map; uniform vec3 tint; uniform float gain; varying vec3 vUW; varying vec3 vCol;
        void main(){ vec2 uv = vUW.xy / vUW.z; vec4 t = texture2D(map, uv); vec3 c = min(vec3(1.0), t.rgb * t.a * tint * vCol * gain); gl_FragColor = vec4(c, max(c.r, max(c.g, c.b))); }` });   // addytywnie, alfa = jasność (premultiplied), tło strony prześwituje
    scene.add(new THREE.Mesh(geo, mat));
    const paint = () => { const c = document.createElement('canvas'); c.width = 128; c.height = 28; const x = c.getContext('2d'); x.textAlign = 'center'; x.textBaseline = 'middle';
      let fs = 22; x.font = fs + 'px "Special Elite K"'; const mw = x.measureText(name).width; if (mw > 118) { fs = Math.floor(fs * 118 / mw); x.font = fs + 'px "Special Elite K"'; }
      x.lineJoin = 'round'; x.fillStyle = '#fff'; x.fillText(name, 64, 15); x.strokeStyle = '#fff'; x.lineWidth = 1.2; x.strokeText(name, 64, 15);
      const t = new THREE.CanvasTexture(c); t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; mat.uniforms.map.value = t; };
    (document.fonts && document.fonts.load ? document.fonts.load('22px "Special Elite K"') : Promise.resolve()).then(paint, paint);
    // rozdzielczość: ~1/3 rozmiaru na ekranie, kamera tak, by wstążka wypełniała szerokość
    const size = () => { const w = Math.max(60, Math.round(cv.clientWidth / 3)), hh = Math.max(20, Math.round(cv.clientHeight / 3)); r.setSize(w, hh, false); res.set(w, hh); cam.aspect = w / hh;
      cam.fov = 2 * Math.atan(PW * 1.12 / cam.aspect / 2 / 7) * 180 / Math.PI; cam.updateProjectionMatrix(); };
    size(); const ro = new ResizeObserver(size); ro.observe(cv);
    const shape = (t, am) => { const pos = geo.attributes.position, col = geo.attributes.color, tt = t / 1000, k = i;
      const sp = [1.25, .95, .75][k], amp = [.8, 1.1, .9][k];                       // lękowa: nerwowa i szybka, wyluzowana: szeroka, poważna: ciężka
      for (let v = 0; v < pos.count; v++) { const X = (base[v * 3] + 0) * PW, Y = base[v * 3 + 1] * PH;
        // fala trójkątna (ostre załamania między wielokątami) zamiast sinusoidy
        const tw = tri(X * 1.9 - tt * 1.5 * sp) * 1.5 * am * amp, yy = tri(X * 2.1 - tt * 1.9 * sp) * .62 * am * amp, zz = tri(X * 1.3 - tt * 1.3 * sp + 1.6) * 1.2 * am * amp + X * .3;
        pos.setXYZ(v, X, yy + Y * Math.cos(tw), zz + Y * Math.sin(tw)); }
      geo.computeVertexNormals(); const n = geo.attributes.normal;
      for (let v = 0; v < pos.count; v++) { let nx = n.getX(v), ny = n.getY(v), nz = n.getZ(v); if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; } const b = Math.min(1, .35 + Math.max(0, nx * L.x + ny * L.y + nz * L.z) * .75); col.setXYZ(v, b, b, b); }
      pos.needsUpdate = true; col.needsUpdate = true; };
    let life = 0, cleared = true;
    loop(cv, 24, (t, d) => {
      const on = ACTIVE === i; life = clamp(life + (on ? 1 : -1) * d / 900, 0, 1);
      if (life <= 0.002 || !mat.uniforms.map.value) { if (!cleared) { r.clear(); cleared = true; } return; }
      cleared = false; r.clear(); const cr = 1 + 1.6 * (1 - ss(life)), g = ss(life);
      cam.position.x = Math.sin(t / 2600) * .35; cam.position.y = Math.sin(t / 3300) * .15; cam.lookAt(0, 0, 0);
      for (const [dt, a] of [[450, .06], [360, .1], [270, .16], [180, .25], [90, .42], [0, 1]]) { shape(Q(Math.max(0, t - dt)), .62 * cr); gain.value = g * a * (a < 1 ? 1.4 : .95); r.render(scene, cam); }   // ruch skokowy (~11 kl./s) i wielokrotne echo: sześć kopii w czasie, coraz słabszych
    });
    stops.push(() => { ro.disconnect(); r.dispose(); cv.remove(); h.classList.remove('kp-gl'); });
  });
  return () => stops.forEach(f => f());
}
