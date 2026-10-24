// kursor strony: pikselowy klucz, a nad klikalnymi elementami oko, które mruga; wciśnięcie rozbłyska cyjanem; wyłączone elementy dostają klucz z zakazem
// (przeniesiony z planszy)
export function initCursor() {
  if (window.__kz) return; window.__kz = 1;
  if (matchMedia('(pointer: coarse)').matches) return;
  const PAL = { k:'#000000', d:'#464852', m:'#8c8f9a', s:'#cdd0d8', w:'#ffffff', c:'#3ff0ff', C:'#0e7c8a', W:'#c8fcff' };
  /* klucz 32x32: grot = hotspot (1,1); trzon = szachownica s|m z ditherowanym rozbłyskiem, pióro = pusty romb z ząbkiem,
     kołnierz, walec (Bayer 2x2 d/m/s), ciemny supeł z błyskiem i asymetryczny pęk pierścieni: tył d/m, przód s/w */
  const KEY = [
    ".kkk............................",
    "kwmwk...........................",
    "kmsmwk..........................",
    ".kmsmwk.........................",
    "..kmsmwk........................",
    ".km.msmwk.......................",
    "kw..smsmwk......................",
    ".km.mkmsmsk.....................",
    "..kmk.kmsmwk....................",
    "...k...kmsmsk...................",
    "........kdsmsk.....kk...........",
    ".........kmsmskk..ksmk..........",
    "..........kdskwskkskkmk.........",
    "...........kkwskksk..kdk........",
    "...........ksmkswkk..kmkkkkk....",
    "...........kmkdmsskkkmkkwwswkk..",
    "............kkdmmmwkmkwwkkkkwsk.",
    "..............kddsmkkkwk....ksk.",
    "...............kmddkksk......ksk",
    "................kkkwsmk......kmk",
    "..................kmdmk......ksk",
    "................kkkdmdk......kmk",
    "...............ksskkkkmk...kkmk.",
    "...............kmk...ksskkkkmmk.",
    "..............kmk.....kkwskmkkmk",
    "..............ksk.....kwkksk.kdk",
    "..............kmk....kwkkkkskkmk",
    "...............kmk...ksk..kskdk.",
    "...............kmmkkkdkskkskkk..",
    "................kkdmdkkkmsk.....",
    "..................kkk...kk......",
    "................................"
  ];
  /* oko 32x32, hotspot (15,15) = źrenica */
  const EYE = { open: [
    "...............k................",
    "..............kwk...............",
    "..............ksk...............",
    "..............kmk...............",
    "..............ksk...............",
    "......k.......kwk.......k.......",
    ".....ksk......ksk......ksk......",
    "......kmk...kkkkkkk...kmk.......",
    ".......kskkkssssssskkksk........",
    "........kssswwwwwwwsssk.........",
    ".......kmwwwkkkkkkkwwwmk........",
    "......kmwkkkskkkkkskkkwmk.......",
    ".....kwwkssskkmdmkkssskwwk......",
    "....kwkksswkkmdmdmkkwsskkwk.....",
    "kkk.kkssswwkmdkkwdmkwwssskk.kkk.",
    "kmskskwswwwkdmkkkmdkwwwswksksmk.",
    "kkk.kmkwwwwkmmkkkmmkwwwwkmk.kkk.",
    ".....kmkkwwkksmsmskkwwkkmk......",
    "......kmmkkkkksmskkkkkmmk.......",
    ".......kkmmmkkkkkkkmmmkk........",
    ".........kkkssssssskkk..........",
    "........k...kkkkkkk...k.........",
    ".......ksk...........ksk........",
    "......kmk......k......kmk.......",
    ".....ksk......ksk......ksk......",
    "......k.......kwk.......k.......",
    "..............ksk...............",
    "..............kmk...............",
    "..............ksk...............",
    "..............kwk...............",
    "...............k................",
    "................................"
  ], half: [
    "...............k................",
    "..............kwk...............",
    "..............ksk...............",
    "..............kmk...............",
    "..............ksk...............",
    "......k.......kwk.......k.......",
    ".....ksk......ksk......ksk......",
    "......kmk......k......kmk.......",
    ".......ksk...........ksk........",
    "........k.............k.........",
    ".........kkkkkkkkkkkkk..........",
    ".......kkssssssssssssskk........",
    "......kmmwwwwwwwwwwwwwmmk.......",
    ".....kwwwkkkkkkkkkkkkkwwwk......",
    "kkk.kwkkksskmdkkwdmksskkkwk.kkk.",
    "kmsksksssswkdmkkkmdkwssssksksmk.",
    "kkk.kmkwswwkmmkkkmmkwwswkmk.kkk.",
    ".....kmkkwwkksmsmskkwwkkmk......",
    "......kmmkkkkksmskkkkkmmk.......",
    ".......kkmmmkkkkkkkmmmkk........",
    ".........kkkssssssskkk..........",
    "........k...kkkkkkk...k.........",
    ".......ksk...........ksk........",
    "......kmk......k......kmk.......",
    ".....ksk......ksk......ksk......",
    "......k.......kwk.......k.......",
    "..............ksk...............",
    "..............kmk...............",
    "..............ksk...............",
    "..............kwk...............",
    "...............k................",
    "................................"
  ], shut: [
    "...............k................",
    "..............kwk...............",
    "..............ksk...............",
    "..............kmk...............",
    "..............ksk...............",
    "......k.......kwk.......k.......",
    ".....ksk......ksk......ksk......",
    "......kmk......k......kmk.......",
    ".......ksk...........ksk........",
    "........k.............k.........",
    "................................",
    "................................",
    "................................",
    "................................",
    "kkk..k.kkk...........kkk.k..kkk.",
    "kmskkskmmskkkkkkkkkkksmmkskksmk.",
    "kkk..ksswwssssssssssswwssk..kkk.",
    "......kkskwwwwwwwwwwwkskk.......",
    "......kmk.kskkkskkksk.kmk.......",
    ".......k.kmk..kmk..kmk.k........",
    "..........k....k....k...........",
    "........k.............k.........",
    ".......ksk...........ksk........",
    "......kmk......k......kmk.......",
    ".....ksk......ksk......ksk......",
    "......k.......kwk.......k.......",
    "..............ksk...............",
    "..............kmk...............",
    "..............ksk...............",
    "..............kwk...............",
    "...............k................",
    "................................"
  ], glow: [
    "..............CkC...............",
    "..............kWk...............",
    "..............kck...............",
    "..............kWk...............",
    "..............kck...............",
    ".....Ck.......kWk.......kC......",
    ".....kWkC.....kck.....CkWk......",
    "......kck..CkkkkkkkC..kck.......",
    "......CkWkkkssssssskkkWkC.......",
    "........kssswwwwwwwsssk.........",
    "......CkmwwwkkkkkkkwwwmkC.......",
    "......kmwkkkcCCCCCckkkwmk.......",
    "....CkwwkcccCCcccCCccckwwkC.....",
    "....kwkkccWCCcccccCCWcckkwk.....",
    "kkk.kkcccWWCcckkwccCWWccckk.kkk.",
    "kWckskWcWWWCcckkkccCWWWcWkskcWk.",
    "kkk.kmkWWWWCcWkkkWcCWWWWkmk.kkk.",
    ".....kmkkWWCCcWcWcCCWWkkmk......",
    "......kmmkkkCCcWcCCkkkmmk.......",
    ".......kkmmmkkkkkkkmmmkk........",
    "........CkkkssssssskkkC.........",
    "........kC..kkkkkkk..Ck.........",
    "......CkWk...........kWkC.......",
    "......kck......k......kck.......",
    ".....kWkC.....kck.....CkWk......",
    ".....Ck.......kWk.......kC......",
    "..............kck...............",
    "..............kWk...............",
    "..............kck...............",
    "..............kWk...............",
    "..............CkC...............",
    "................................"
  ] };
  const HK = [1, 1], HE = [15, 15];
  const root = document.documentElement;
  const RMq = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sprite = (rows, sc = 1) => {
    const c = document.createElement('canvas'); c.width = rows[0].length * sc; c.height = rows.length * sc;
    const x = c.getContext('2d');
    rows.forEach((r, y) => { for (let i = 0; i < r.length; i++) { const col = PAL[r[i]]; if (col) { x.fillStyle = col; x.fillRect(i * sc, y * sc, sc, sc); } } });
    return c;
  };
  const URL1 = new Map(), URL2 = new Map();
  const url1 = rows => URL1.get(rows) || (URL1.set(rows, sprite(rows, 1).toDataURL('image/png')), URL1.get(rows));
  const url2 = rows => URL2.get(rows) || (URL2.set(rows, sprite(rows, 2).toDataURL('image/png')), URL2.get(rows));

  /* image-set daje ostry kursor na ekranach 2x; bez wsparcia zostaje zwykły url() */
  const probe = f => { try { return CSS.supports('cursor', `${f}(url("data:image/png;base64,AA==") 1x) 1 1, auto`); } catch (e) { return false; } };
  const IS = probe('image-set') ? 'image-set' : probe('-webkit-image-set') ? '-webkit-image-set' : '';
  const cur = (rows, [hx, hy], fb) => IS
    ? `${IS}(url("${url1(rows)}") 1x, url("${url2(rows)}") 2x) ${hx} ${hy}, ${fb}`
    : `url("${url1(rows)}") ${hx} ${hy}, ${fb}`;

  const SEL = 'a,button,[role=button],.path,.deck,.scard,.t-link,.k-pick,label,input[type=range],summary,.btn,select,'
    + 'input[type=checkbox],input[type=radio],input[type=submit],input[type=button],input[type=reset],input[type=color],input[type=file],[data-kz-eye]';
  const TXT = 'input:not([type]),input[type=text],input[type=search],input[type=email],input[type=url],input[type=password],input[type=number],input[type=tel],textarea,[contenteditable]:not([contenteditable=false])';
  const OFF = ':is(:disabled,[aria-disabled=true])';
  const st = document.createElement('style'); st.id = 'kz-cursor';
  st.textContent = `
html{cursor:${cur(KEY, HK, 'auto')}}
:root :is(${SEL}){cursor:${cur(EYE.open, HE, 'pointer')}}
:root.kz-half :is(${SEL}){cursor:${cur(EYE.half, HE, 'pointer')}}
:root.kz-shut :is(${SEL}){cursor:${cur(EYE.shut, HE, 'pointer')}}
:root.kz-glow :is(${SEL}){cursor:${cur(EYE.glow, HE, 'pointer')}}
:root [data-kz-eye]:not(${OFF}){cursor:${cur(EYE.open, HE, 'pointer')}!important}
:root.kz-half [data-kz-eye]:not(${OFF}){cursor:${cur(EYE.half, HE, 'pointer')}!important}
:root.kz-shut [data-kz-eye]:not(${OFF}){cursor:${cur(EYE.shut, HE, 'pointer')}!important}
:root.kz-glow [data-kz-eye]:not(${OFF}){cursor:${cur(EYE.glow, HE, 'pointer')}!important}
:root :is(${TXT}){cursor:text}
/* wyłączone: klucz + not-allowed; !important przebija też inline cursor:pointer */
:root:root:root :is(${SEL},input,textarea,[style*=cursor]):is(${OFF}){cursor:${cur(KEY, HK, 'not-allowed')}!important}
@media (max-width:460px){`;
  document.head.appendChild(st);

  /* ---- zachowanie: mruganie tylko gdy kursor stoi nad klikalnym, wciśnięcie = cyjan ---- */
  const r = (a, b) => a + Math.random() * (b - a);
  let hover = null, pressed = false, pressT = 0, tBlink = 0, tRel = 0;
  const frame = f => { root.classList.toggle('kz-half', f === 'half'); root.classList.toggle('kz-shut', f === 'shut'); };
  const target = el => {
    if (!el || el.nodeType !== 1) return null;
    /* element z własnym cursor:pointer (też inline) dostaje oko: znacznik + reguła !important;
       znacznik zdejmujemy przy wyjściu kursora, więc przy następnym najechaniu styl jest sprawdzany od nowa */
    if (!el.hasAttribute('data-kz-eye') && !el.matches(OFF) && getComputedStyle(el).cursor === 'pointer') el.setAttribute('data-kz-eye', '');
    const t = el.closest(SEL);
    return t && !t.matches(OFF) && !t.closest(':disabled') ? t : null;
  };
  const schedule = first => {
    clearTimeout(tBlink);
    if (RMq || !hover || pressed) return;
    tBlink = setTimeout(blink, first ? r(1200, 2200) : r(2500, 4000));
  };
  const blink = () => {
    const seq = Math.random() < .12 ? ['half', 'shut', 'half', 'open', 'half', 'shut', 'half', 'open'] : ['half', 'shut', 'half', 'open'];
    let i = 0;
    (function step() {
      if (!hover || pressed) { frame('open'); return; }
      frame(seq[i++]);
      if (i < seq.length) tBlink = setTimeout(step, r(70, 90)); else schedule(false);
    })();
  };
  document.addEventListener('pointerover', e => {
    if (e.pointerType === 'touch') return;
    const t = target(e.target);
    if (t === hover) return;
    hover = t; frame('open');
    if (hover) schedule(true); else clearTimeout(tBlink);
  }, { passive: true });
  document.addEventListener('pointerout', e => {
    /* zdejmij znacznik oka z elementów, które kursor właśnie opuścił (nie gdy wchodzi w ich dziecko) */
    const to = e.relatedTarget;
    for (let el = e.target; el && el.nodeType === 1; el = el.parentElement)
      if (el.hasAttribute('data-kz-eye') && !(to && el.contains(to))) el.removeAttribute('data-kz-eye');
    if (!e.relatedTarget) { hover = null; clearTimeout(tBlink); frame('open'); }
  }, { passive: true });
  document.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.pointerType === 'touch') return;
    const t = target(e.target); if (!t) return;
    hover = t; pressed = true; pressT = performance.now();
    clearTimeout(tBlink); clearTimeout(tRel); frame('open'); root.classList.add('kz-glow');
  }, { passive: true });
  const release = () => {
    if (!pressed) return; pressed = false;
    /* krótki klik też ma być widoczny: cyjan trzyma się co najmniej ~160 ms */
    tRel = setTimeout(() => { if (!pressed) { root.classList.remove('kz-glow'); schedule(false); } }, Math.max(0, 160 - (performance.now() - pressT)));
  };
  addEventListener('pointerup', release, { passive: true });
  addEventListener('pointercancel', release, { passive: true });
  addEventListener('blur', release);

}
