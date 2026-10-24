// pole wyborów działu Krzyk: modele 3D w potoku PS1 (niska rozdzielczość, drganie wierzchołków, najbliższy piksel)
// walkman → muzyka, trzy maski → persony, kaseta miniDV (zapada się pod ziemię, potem kamera HC90E) → obraz, telefon → kontakt
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
    // (ukryta) czerń i krew: szparki oczu, poszarpany uśmiech z zębami, zacieki
    x.fillStyle = '#4a0006'; for (let k = 0; k < 9; k++) x.fillRect(10 + r() * 108, 90 + r() * 20, 2, 20 + r() * 50);
    E.forEach(ex => hole(() => { x.moveTo(ex - 14, EY + 4); x.lineTo(ex + 12, EY - 6); x.lineTo(ex + 10, EY); x.closePath(); }));
    hole(() => { x.moveTo(26, 106); for (let k = 0; k <= 12; k++) x.lineTo(26 + k * 6.3, 106 + (k % 2 ? 14 : 4) + Math.sin(k / 12 * Math.PI) * 14); x.lineTo(102, 106); x.quadraticCurveTo(64, 116, 26, 106); });
  }
  return c;
}
function makeMask(P, kind, seed) {
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
        let spin = 0;
        click = () => { st.busy = true; st.t0 = st.now; spin = 1; setTimeout(() => { st.busy = false; go(kind); }, RM ? 0 : 520); };
        tick = (t) => { const k = spin ? clamp((t - st.t0) / 520, 0, 1) : 0; if (k >= 1) spin = 0;
          o.rotation.y = .5 + Math.sin(t / 1600) * (st.hot ? .55 : .3) + easeOut(k) * Math.PI * 2;
          o.position.y = Math.sin(t / 900) * .03 + (st.hot ? .06 : 0); o.rotation.z = .1 + Math.sin(t / 2100) * .05; };
      }).catch(() => {});
    }
    if (kind === 'heads') {
      // trzy maski obok siebie, każda rusza się po swojemu; czwarta, ukryta, siedzi w środku i prawie nigdy się nie pokazuje
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
        click = () => { st.busy = true; ring = 1; st.t0 = st.now; setTimeout(() => { st.busy = false; ring = 0; go(kind); }, RM ? 0 : 600); };
        tick = (t) => { const r = ring ? Math.sin((t - st.t0) / 18) * .12 : 0;
          o.rotation.set(.1 + Math.sin(t / 2000) * .06, Math.sin(t / 1500) * (st.hot ? .8 : .45) + r, -.06 + r * .5 + (st.hot ? Math.sin(t / 60) * .03 : 0));
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
