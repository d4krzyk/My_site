// jeden wspólny kontekst WebGL dla całej strony.
// Przeglądarki (zwłaszcza Android) pozwalają na ok. 8 aktywnych kontekstów, a Krzyk ma ich więcej (cztery płyty wyboru, scena person, trzy napisy person, pokój w muzyce).
// Po przekroczeniu limitu przeglądarka po cichu zabija najstarsze, a takiego kontekstu nie da się odzyskać (znikał telewizor, psuły się persony, scena zostawała pusta).
// Zwalnianie kontekstów poza ekranem nie wystarczało, bo zabijanie następowało już przy starcie. Dlatego każde płótno (`ps1`, napisy person) dostaje tylko
// lekkie „przedstawicielstwo” renderera: scenę rysuje jeden wspólny renderer na ukrytym płótnie i od razu przenosi gotowy obraz na płótno 2D elementu.
// Tekstury, geometrie i materiały three.js są niezależne od renderera, więc reszta kodu się nie zmienia. Dodając nowe płótno WebGL, bierz renderer stąd (`sharedRenderer`).
import * as THREE from 'three';

let S = null;   // { r, cv, w, h }
function shared(w, h) {
  if (!S) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const r = new THREE.WebGLRenderer({ canvas: cv, antialias: false, alpha: true, preserveDrawingBuffer: false });
    r.setPixelRatio(1); r.autoClear = true; r.setScissorTest(true);
    S = { r, cv, w, h };
  }
  if (w > S.w || h > S.h) { S.w = Math.max(S.w, w); S.h = Math.max(S.h, h); S.r.setSize(S.w, S.h, false); }   // rośnie tylko do największego płótna, bez przeładowywania przy każdej klatce
  return S;
}

// renderer-przedstawiciel dla jednego płótna: ten sam interfejs, którego używa kod (setSize, setClearColor, autoClear, clear, render, dispose)
export function sharedRenderer(canvas) {
  const x = canvas.getContext('2d');
  let cc = 0x000000, ca = 0, w = canvas.width || 1, h = canvas.height || 1;
  const api = {
    domElement: canvas, autoClear: true,
    setPixelRatio() {},
    setSize(nw, nh) { w = Math.max(1, Math.round(nw)); h = Math.max(1, Math.round(nh)); canvas.width = w; canvas.height = h; },
    setClearColor(c, a) { cc = c; ca = a == null ? 1 : a; },
    clear() { x.clearRect(0, 0, canvas.width, canvas.height); },
    render(scene, cam) {
      const s = shared(w, h), r = s.r;
      r.setViewport(0, 0, w, h); r.setScissor(0, 0, w, h); r.setClearColor(cc, ca); r.clear(); r.render(scene, cam);
      // autoClear wyłączone = kolejne przejścia sumują się (napisy person z echem): dodajemy obraz addytywnie zamiast go zastępować
      x.save(); x.globalCompositeOperation = api.autoClear ? 'copy' : 'lighter';
      x.drawImage(s.cv, 0, s.cv.height - h, w, h, 0, 0, w, h); x.restore();
    },
    dispose() {},                                        // wspólny renderer żyje do końca strony
    get localClippingEnabled() { return S ? S.r.localClippingEnabled : false; },
    set localClippingEnabled(v) { shared(w, h).r.localClippingEnabled = v; },
  };
  return api;
}
