// pole wyborów działu Krzyk: modele 3D w potoku PS1 (niska rozdzielczość, drganie wierzchołków, najbliższy piksel)
// walkman → muzyka, trzy główki → persony, kaseta miniDV (zapada się pod ziemię, potem kamera HC90E) → obraz, telefon → kontakt
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RM, loop, clamp } from './core';

const ease = k => k * k * (3 - 2 * k), easeOut = k => 1 - Math.pow(1 - k, 3);

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
  return { r, scene, cam, mat, tex, render: () => r.render(scene, cam) };
}

const GL = new GLTFLoader();
export function loadPSX(P, url) {
  return new Promise((res, rej) => GL.load(url, g => {
    g.scene.traverse(m => { if (!m.isMesh) return;
      const mats = (Array.isArray(m.material) ? m.material : [m.material]).map(o => { const map = o.map || null;
        if (map) { map.magFilter = THREE.NearestFilter; map.minFilter = THREE.NearestFilter; map.generateMipmaps = false; map.encoding = THREE.LinearEncoding; map.needsUpdate = true; }
        const mt = P.mat({ map, color: o.color ? o.color.clone().convertLinearToSRGB() : 0xffffff, side: THREE.DoubleSide });
        if (/white plastic/i.test(o.name || '')) { mt.polygonOffset = true; mt.polygonOffsetFactor = -2; mt.polygonOffsetUnits = -8; } return mt; });
      m.material = mats.length > 1 ? mats : mats[0]; });
    res(g.scene); }, undefined, rej));
}
// skaluje obiekt do największego wymiaru `size` i ustawia jego środek w (0,0,0)
function fit(obj, size) {
  const g = new THREE.Group(); const b = new THREE.Box3().setFromObject(obj), d = b.getSize(new THREE.Vector3());
  const s = size / Math.max(d.x, d.y, d.z); obj.scale.setScalar(s); obj.position.sub(b.getCenter(new THREE.Vector3()).multiplyScalar(s)); g.add(obj); return g;
}
function lights(P, rim = 0x3ff0ff, rim2 = 0xc4121d) {
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

/* ---------- trzy główki PS1: każda w innym nastroju ---------- */
function headTex(mood, seed) {
  const W = 256, H = 128, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const skin = { cisza: '#c9bfa6', krzyk: '#c4a690', pustka: '#9fb2b6' }[mood];
  x.fillStyle = skin; x.fillRect(0, 0, W, H);
  // ziarno i plamy jak na teksturze PS1 (dither)
  for (let i = 0; i < 2600; i++) { x.fillStyle = r() < .5 ? 'rgba(0,0,0,.10)' : 'rgba(255,255,255,.06)'; x.fillRect(Math.floor(r() * W), Math.floor(r() * H), 2, 1); }
  // cień pod oczami i policzki (twarz w środku u=.25, czyli x=64)
  x.fillStyle = 'rgba(40,20,20,.18)'; x.fillRect(44, 60, 16, 10); x.fillRect(68, 60, 16, 10);
  // włosy: ciemne, postrzępione, z tyłu i na czubku
  x.fillStyle = '#120d0f';
  for (let px = 0; px < W; px++) { const front = Math.abs(((px - 64 + 128) % 256) - 128) < 34; const hgt = front ? 30 + (mood === 'krzyk' ? 6 : 2) * Math.sin(px * 1.7) + r() * 8 : 70 + r() * 10; x.fillRect(px, 0, 1, hgt); }
  const eye = (cx, cy) => {
    if (mood === 'cisza') { x.fillStyle = '#2a2018'; x.fillRect(cx - 6, cy, 12, 2); x.fillRect(cx - 7, cy - 1, 2, 2); x.fillRect(cx + 5, cy - 1, 2, 2); }
    if (mood === 'krzyk') { x.fillStyle = '#000'; x.fillRect(cx - 6, cy - 5, 12, 10); x.fillStyle = '#e8e2d0'; x.fillRect(cx - 1, cy - 1, 2, 2); x.fillStyle = '#2a1410'; x.fillRect(cx - 8, cy - 9, 16, 2); }
    if (mood === 'pustka') { x.fillStyle = '#050608'; x.fillRect(cx - 6, cy - 5, 12, 11); for (let k = 0; k < 3; k++) x.fillRect(cx - 4 + k * 3, cy + 6, 2, 6 + Math.floor(r() * 18)); }
  };
  eye(52, 56); eye(76, 56);
  x.fillStyle = '#3a2a22'; x.fillRect(62, 62, 4, 8);
  if (mood === 'cisza') { x.fillStyle = '#4a2a24'; x.fillRect(58, 80, 12, 2); }
  if (mood === 'krzyk') { x.fillStyle = '#000'; x.beginPath(); x.ellipse(64, 84, 8, 11, 0, 0, 7); x.fill(); x.fillStyle = '#6a0b12'; x.fillRect(60, 88, 8, 4); }
  if (mood === 'pustka') { x.fillStyle = '#1a1214'; x.fillRect(57, 84, 14, 2); x.fillRect(55, 86, 3, 2); x.fillRect(70, 86, 3, 2); }
  return c;
}
function makeHead(P, mood, seed) {
  const g = new THREE.SphereGeometry(1, 12, 9), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let X = p.getX(i), Y = p.getY(i), Z = p.getZ(i);
    if (Y < 0) { const f = 1 - .3 * Math.pow(-Y, 1.4); X *= f; Z *= f; }
    if (Y < -.75) Z += .08;
    if (Z > .7 && Math.abs(X) < .2 && Y > -.3 && Y < .12) Z += .16;           // nos
    if (Z > .55 && Math.abs(X) > .16 && Math.abs(X) < .5 && Y > .02 && Y < .32) Z -= .07;   // oczodoły
    p.setXYZ(i, X * .8, Y, Z * .88);
  }
  const gf = g.toNonIndexed(); gf.computeVertexNormals();                                   // płaskie cieniowanie ścianek jak na PS1
  const m = P.mat({ map: P.tex(headTex(mood, seed)) });
  const ng = new THREE.CylinderGeometry(.28, .34, .5, 6).toNonIndexed(); ng.computeVertexNormals();
  const h = new THREE.Mesh(gf, m); const neck = new THREE.Mesh(ng, P.mat({ color: 0x1a1416 }));
  neck.position.y = -1.05; const grp = new THREE.Group(); grp.add(h); grp.add(neck); return grp;
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
        let spin = 0;
        click = () => { st.busy = true; st.t0 = st.now; spin = 1; setTimeout(() => { st.busy = false; go(kind); }, RM ? 0 : 520); };
        tick = (t) => { const k = spin ? clamp((t - st.t0) / 520, 0, 1) : 0; if (k >= 1) spin = 0;
          o.rotation.y = .5 + Math.sin(t / 1600) * (st.hot ? .55 : .3) + easeOut(k) * Math.PI * 2;
          o.position.y = Math.sin(t / 900) * .03 + (st.hot ? .06 : 0); o.rotation.z = .1 + Math.sin(t / 2100) * .05; };
      }).catch(() => {});
    }
    if (kind === 'heads') {
      const moods = ['cisza', 'krzyk', 'pustka'], hs = moods.map((md, i) => { const h = makeHead(P, md, 11 + i * 7); h.scale.setScalar(.3); h.position.x = (i - 1) * .62; P.scene.add(h); return h; });
      P.cam.position.set(0, .05, 2.9); P.cam.lookAt(0, -.02, 0);
      tick = (t) => hs.forEach((h, i) => { const ph = i * 2.1;
        h.position.y = Math.sin(t / 1100 + ph) * .07 + (st.hot ? .05 : 0);
        h.rotation.y = st.hot ? Math.sin(t / 90 + ph) * .04 : Math.sin(t / 1900 + ph) * .55;
        h.rotation.z = Math.sin(t / 1500 + ph) * .08; h.rotation.x = Math.sin(t / 2300 + ph) * .1; });
      click = () => { st.busy = true; setTimeout(() => { st.busy = false; go(kind); }, RM ? 0 : 380); };
    }
    if (kind === 'minidv') {
      const fc = grime(96, 96, [14, 12, 11], 18, 5), fx = fc.getContext('2d'), fd = fx.getImageData(0, 0, 96, 96);
      for (let yy = 0; yy < 96; yy++) for (let xx = 0; xx < 96; xx++) { const d = Math.hypot((xx - 48) / 48, (yy - 48) / 40); fd.data[(yy * 96 + xx) * 4 + 3] = 255 * Math.max(0, Math.min(1, (1.05 - d) * 2.2)); }
      fx.putImageData(fd, 0, 0);
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.2, 6, 4), P.mat({ map: P.tex(fc), transparent: true, alphaTest: .02 })); ground.rotation.x = -Math.PI / 2; P.scene.add(ground);
      const hole = new THREE.Mesh(new THREE.CircleGeometry(.42, 10), P.mat({ color: 0x000000 })); hole.rotation.x = -Math.PI / 2; hole.position.y = .003; hole.scale.setScalar(.001); P.scene.add(hole);
      const crumbs = []; const cg = new THREE.BoxGeometry(.03, .03, .03);
      for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(cg, P.mat({ color: i % 3 ? 0x2a2420 : 0x5a5048 })); m.visible = false; P.scene.add(m); crumbs.push({ m, v: new THREE.Vector3(), t: 0 }); }
      loadPSX(P, assets.minidv).then(m => { const o = fit(m, 1.05), tp = new THREE.Group(); tp.add(o); P.scene.add(tp);
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
      loadPSX(P, assets.phone).then(m => { const d = new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3());
        if (d.x >= d.y && d.x >= d.z) m.rotation.z = Math.PI / 2; else if (d.z >= d.y) m.rotation.x = Math.PI / 2;
        const o = fit(m, 1.1); P.scene.add(o); P.cam.position.set(0, 0, 1.75); P.cam.lookAt(0, 0, 0);
        let ring = 0;
        click = () => { st.busy = true; ring = 1; st.t0 = st.now; setTimeout(() => { st.busy = false; ring = 0; go(kind); }, RM ? 0 : 600); };
        tick = (t) => { const r = ring ? Math.sin((t - st.t0) / 18) * .12 : 0;
          o.rotation.set(.15 + Math.sin(t / 2000) * .08, Math.sin(t / 1500) * (st.hot ? .9 : .5) + r, -.25 + r * .5 + (st.hot ? Math.sin(t / 60) * .03 : 0));
          o.position.y = Math.sin(t / 1000) * .02; };
      }).catch(() => {});
    }
    loop(cv, RM ? 4 : 20, (t) => { st.now = t; tick(t); P.render(); });
  });
  return () => stop.forEach(f => f());
}

/* ---------- przejście miniDV → HC90E: ciemność, kamera wjeżdża, najazd na LCD w NightShot, ekran nabiera koloru i odsłania dział ---------- */
let hcBusy = false;
function hc90e(assets, arrive, done) {
  if (hcBusy) return; hcBusy = true;
  const ov = document.createElement('div'); ov.className = 'hc-ov'; ov.innerHTML = '<canvas></canvas><span class="hc-skip dos">[ Esc ] pomiń</span>'; document.body.appendChild(ov);
  const cv = ov.querySelector('canvas'); const P = ps1(cv, 384, 216, { clear: 0x000000, alpha: 1 });
  const lcdC = document.createElement('canvas'); lcdC.width = 256; lcdC.height = 144; const x = lcdC.getContext('2d'); x.imageSmoothingEnabled = false;
  const img = new Image(); img.src = assets.lcd;
  const tc = ms => { const s = Math.floor(ms / 1000), f = Math.floor(ms / 40) % 25; return `0:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(f).padStart(2, '0')}`; };
  const txt = (s, px, py, col) => { x.font = '16px "Krzyk DOS"'; x.textBaseline = 'top'; x.fillStyle = '#000'; x.fillText(s, px + 1, py + 1); x.fillStyle = col; x.fillText(s, px, py); };
  const lcd = (re, ns) => { x.fillStyle = '#000'; x.fillRect(0, 0, 256, 144); if (img.complete) x.drawImage(img, 0, 0, 256, 144);
    if (ns > 0) { const id = x.getImageData(0, 0, 256, 144), d = id.data;
      for (let i = 0; i < d.length; i += 4) { const L = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255, v = clamp(L * 1.8 + (Math.random() - .5) * .3, 0, 1);
        d[i] = d[i] * (1 - ns) + v * 40 * ns; d[i + 1] = d[i + 1] * (1 - ns) + (30 + v * 225) * ns; d[i + 2] = d[i + 2] * (1 - ns) + v * 80 * ns; }
      x.putImageData(id, 0, 0); }
    x.globalAlpha = Math.max(ns, .25); txt('● REC', 6, 4, Math.floor(re / 500) % 2 ? '#ff3030' : '#7a1010'); txt(tc(re), 150, 4, '#d8ffe0');
    x.globalAlpha = ns; if (Math.floor(re / 350) % 2) txt('NIGHTSHOT', 6, 124, '#b6ffc8'); x.globalAlpha = 1; screenT.needsUpdate = true; };
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
