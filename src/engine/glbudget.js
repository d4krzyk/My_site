// budżet kontekstów WebGL: przeglądarki (zwłaszcza na Androidzie) pozwalają na ok. 8 aktywnych kontekstów, a strona Krzyk ma ich więcej
// (cztery płyty wyboru, scena person, trzy napisy person, pokój w muzyce). Po przekroczeniu limitu przeglądarka po cichu zabija najstarsze,
// więc znikały modele (telewizor, persony). Dlatego kontekst płótna, które od dłuższej chwili jest poza ekranem, jest zwalniany,
// a po powrocie do widoku odtwarzany (three.js sam wczytuje wszystko od nowa po `webglcontextrestored`).
const items = new Map();
let io = null;
const leave = it => { if (it.lost || !it.cv.isConnected) return; it.lost = true; try { it.r.forceContextLoss(); } catch (e) {} };
const back = it => { if (!it.lost) return; it.lost = false; try { it.r.forceContextRestore(); } catch (e) {} };
export function watchGL(cv, r, { delay = 2500 } = {}) {
  if (typeof IntersectionObserver === 'undefined' || !r.forceContextLoss) return () => {};
  if (!io) io = new IntersectionObserver(es => es.forEach(e => { const it = items.get(e.target); if (!it) return; clearTimeout(it.t);
    if (e.isIntersecting) back(it); else it.t = setTimeout(() => leave(it), it.delay); }), { rootMargin: '300px 0px' });
  const it = { cv, r, delay, lost: false, t: 0 }; items.set(cv, it); io.observe(cv);
  return () => { clearTimeout(it.t); items.delete(cv); io.unobserve(cv); };
}
