// nawigacja kartami IV · II · IV: ikonka (piorun, rozsunięcie), rozkład z awersami, szczelina i przejście do działu
import { RM, clamp, loop, bth } from './core';
export function initCards(root, opts){
function slitTo(stage, title, sub, back){
  const nw=document.createElement('div'); nw.className='pgnew';
  nw.innerHTML=`<div class="pgt">${title}</div><div class="pgs dos">${sub}</div>`;
  stage.appendChild(nw);
  const c=document.createElement('canvas'); c.className='slitfx'; c.width=240; c.height=135; stage.appendChild(c); const x=c.getContext('2d');
  const id=x.createImageData(240,135), d=id.data;
  const D=RM?500:1150; let t0=performance.now();
  const ease=k=>k*k*(3-2*k);
  (function f(now){ const k=Math.min(1,(now-t0)/D);
    const kl=ease(Math.min(1,k/.28)), ko=ease(clamp((k-.22)/.78,0,1));          // najpierw linia rozcina ekran, potem szczelina się rozwiera
    const half=ko*52;                                                            // połowa wysokości otwarcia w %
    nw.style.clipPath=`inset(${50-half}% 0 ${50-half}% 0)`;
    const cy=67.5, gap=ko*67.5, wl=kl*120;
    for(let yy=0;yy<135;yy++) for(let xx=0;xx<240;xx++){ const i=(yy*240+xx)*4;
      const dx=Math.abs(xx-120); let v=0;
      if(dx<wl){ const de=Math.min(Math.abs(yy-(cy-gap)),Math.abs(yy-(cy+gap))); const inGap=Math.abs(yy-cy)<gap;
        v=Math.exp(-de/(3+ko*4))*(1-dx/(wl+1)*.6)*(inGap&&de>2? .55:1) * (1-ko*.85); }
      const th=bth(xx,yy);
      if(v>th+.35){ d[i]=200;d[i+1]=255;d[i+2]=255;d[i+3]=255; }
      else if(v>th){ const red=(yy<cy-gap-1||yy>cy+gap+1)&&((xx+yy)&1); d[i]=red?196:63; d[i+1]=red?18:240; d[i+2]=red?29:255; d[i+3]=255; }
      else d[i+3]=0; }
    x.putImageData(id,0,0);
    if(k<1) requestAnimationFrame(f); else { c.remove(); nw.style.clipPath=''; }
  })(t0);
}


/* --- C: ikonka z trzech kart (IV · II · IV) trzymanych w dłoni; sprite'y pixel art obracane w całości, 12 kl/s --- */
{
  const st=root;
  const btn=st.querySelector('.deck'), cv=btn.querySelector('canvas'), x=cv.getContext('2d');
  const CSSW=136, CSSH=84, PXS=2, dpr=Math.min(2,window.devicePixelRatio||1), K=PXS*dpr;      // 1 piksel karty = 2 px CSS
  cv.width=CSSW*dpr; cv.height=CSSH*dpr;
  const ANG=Math.atan(1/3), PIV=28;                                                         // pochylenie 1:3, punkt obrotu 28 px pod kartą
  const srcs=opts.minis, sprites=[];
  let ready=0; srcs.forEach((u,i)=>{ const im=new Image(); im.onload=()=>{ sprites[i]=prep(im); if(++ready===3) start(); }; im.src=u; });
  // sprite -> dane pikseli + bufor powiększony najbliższym sąsiadem (żeby obrót z wygładzaniem dawał przechylone kwadraty)
  function prep(im){ const w=im.width,h=im.height, c=document.createElement('canvas'); c.width=w; c.height=h; const cx=c.getContext('2d'); cx.drawImage(im,0,0);
    const d=cx.getImageData(0,0,w,h); const big=document.createElement('canvas'); big.width=w*K; big.height=h*K;
    const ember=[]; for(let i=0;i<w*h;i++){ const r=d.data[i*4],g=d.data[i*4+1],b=d.data[i*4+2],a=d.data[i*4+3]; if(a&&((r===63&&g===240)||(r===14&&g===124))&&(i%w)>w/2&&((i/w)|0)<h*.6) ember.push(i); }
    return {w,h,c,cx,d,big,ember}; }
  // bufor z marginesem 4 px na poświatę; po kliknięciu w rogach kart rozkwita i gaśnie światło (romb w ditherze, biało-cyjanowy)
  const PAD=4;
  function blit(s,fl){ const bx=s.big.getContext('2d'); bx.imageSmoothingEnabled=false;
    const W=s.w+PAD*2, H=s.h+PAD*2, d=new ImageData(W,H);
    for(let y=0;y<s.h;y++) for(let xx=0;xx<s.w;xx++){ const i=(y*s.w+xx)*4, o=((y+PAD)*W+xx+PAD)*4; for(let k=0;k<4;k++) d.data[o+k]=s.d.data[i+k]; }
    if(fl>0){ const k=fl/10, r=k>.5?(1-k)*2*4.5:k*2*4.5;                                    // rośnie, potem gaśnie
      [[1,1],[s.w-2,1],[1,s.h-2],[s.w-2,s.h-2]].forEach(([cx,cy])=>{ if(!s.d.data[(cy*s.w+cx)*4+3]) return; cx+=PAD; cy+=PAD;   // wypalony róg nie świeci
        for(let y=Math.floor(cy-r);y<=cy+r;y++) for(let xx=Math.floor(cx-r);xx<=cx+r;xx++){ if(xx<0||y<0||xx>=W||y>=H) continue;
          const dd=Math.abs(xx-cx)+Math.abs(y-cy); if(dd>r) continue; const v=1-dd/(r+.01);
          const o=(y*W+xx)*4; if(v>.7){ d.data.set([255,255,255,255],o); } else if(v>bth(xx,y)*.9){ d.data.set(v>.35?[63,240,255,255]:[14,124,138,255],o); } } }); }
    s.cx.canvas.width=W; s.cx.canvas.height=H; s.cx.putImageData(d,0,0);
    s.big.width=W*K; s.big.height=H*K; bx.imageSmoothingEnabled=false; bx.clearRect(0,0,s.big.width,s.big.height); bx.drawImage(s.c,0,0,W*K,H*K); }
  let hover=false, open=0, flash=0, t0=0, bolt=null;
  // piorun przeplata się przez talię: wychodzi zza lewej IV, biegnie po jej wierzchu, nurkuje za środkową II
  // (wyskakuje nad nią i pod nią), wyłania się na prawej IV i znika za jej krawędzią. Jednostka = piksel karty,
  // 0,0 = środek dolnej krawędzi środkowej karty (karta: x −7…7, y −21…0)
  function seg(a,b,out){ let [x0,y0]=a; const [x1,y1]=b; const dx=Math.abs(x1-x0), dy=-Math.abs(y1-y0), sx=x0<x1?1:-1, sy=y0<y1?1:-1; let e=dx+dy;
    for(;;){ out.push([x0,y0]); if(x0===x1&&y0===y1) break; const e2=2*e; if(e2>=dy){ e+=dy; x0+=sx; } if(e2<=dx){ e+=dx; y0+=sy; } } }
  function jag(a,b,depth,out){ if(depth===0||Math.abs(b[0]-a[0])+Math.abs(b[1]-a[1])<4){ seg(a,b,out); out.pop(); return; }
    const m=[Math.round((a[0]+b[0])/2+(Math.random()-.5)*2),Math.round((a[1]+b[1])/2+(Math.random()-.5)*2)]; jag(a,m,depth-1,out); jag(m,b,depth-1,out); }
  function makeBolt(){
    const r=(v,s)=>v+Math.round((Math.random()-.5)*s);
    const C=[[-30,r(-17,4)],[-21,r(-11,3)],[-16,r(-18,3)],[-10,r(-8,3)],[-5,-26],[0,r(-13,4)],[4,4],[9,r(-6,3)],[15,r(-16,3)],[21,r(-8,3)],[30,r(-14,4)]];
    const pts=[]; for(let i=0;i<C.length-1;i++) jag(C[i],C[i+1],1,pts); pts.push(C[C.length-1]);
    const br=[]; [[2,-1],[8,1]].forEach(([ci,dir])=>{ const at=pts.findIndex(p=>p[0]>=C[ci][0]); let [bx,by]=pts[Math.max(0,at)]; const b=[];
      for(let k=0;k<4;k++){ bx+=dir*(Math.random()<.5?1:0)+ (dir<0?-0:1)*(k%2); by+=(ci===2?-1:1); b.push([bx,by]); } br.push({at,pts:b}); });
    return {pts,br,f:0}; }
  // warstwa danego punktu: 0 = za lewą, 1 = przed lewą, 2 = za środkową, 3 = przed prawą, 4 = za prawą
  const layerOf=x=>x<-23?0:x<-8?1:x<=8?2:x<=23?3:4;
  // kliknięcie: piorun i jednorazowe rozsunięcie wachlarza, potem rozkład kart (ikonka wraca, gdy rozkład się zamknie)
  btn.addEventListener('click',()=>{ if(spreadOpen) { closeSpread(); return; } bolt=RM?null:makeBolt(); hover=true; setTimeout(()=>openSpread(),RM?0:420); });
  st.addEventListener('spread-closed',()=>{ hover=false; });
  function start(){
    loop(st,12,(t)=>{
      const tgt=hover?1:0; if(open!==tgt) open=Math.round((open+(tgt>open?1/3:-1/3))*3)/3;     // rozchylenie w 3 równych skokach, bez drgania
      const ang=ANG+open*.07;
      const jolt=0;
      sprites.forEach(s=>blit(s,0));
      x.setTransform(1,0,0,1,0,0); x.clearRect(0,0,cv.width,cv.height); x.imageSmoothingEnabled=true;
      // punkt obrotu leży pod płótnem: dolna krawędź środkowej karty 2 px nad dołem ikonki
      // zapas pod środkową kartą: dolne zewnętrzne rogi bocznych kart po przechyleniu schodzą niżej (ok. 4 px) + poświata (4 px)
      const piv=cv.height-10*K+PIV*K;
      const card=i=>{ const s=sprites[i], a=i===0?-ang:i===2?ang:0; x.save(); x.translate(cv.width/2,piv); x.rotate(a);
        x.drawImage(s.big,-(s.w/2+PAD)*K,-(s.h+PIV+PAD)*K+(i===1?-Math.round(open)*K:0)); x.restore(); };
      // piorun: 3 klatki przelotu od lewej, klatka pełnego błysku, potem gaśnie przez cyjan i morski (12 kl/s)
      let bl=null;
      if(bolt){ const B=bolt, f=B.f++, n=B.pts.length, reach=f<3?Math.ceil(n*(f+1)/3):n;
        const col=f<=3?['#ffffff','#3ff0ff']:f<=5?['#3ff0ff','#0e7c8a']:['#0e7c8a',null];
        const ox=Math.round(cv.width/2/K), oy=Math.round((cv.height-10*K)/K);
        const dot=(px,py,c)=>{ x.fillStyle=c; x.fillRect((ox+px)*K,(oy+py)*K,K,K); };
        bl=(layers)=>{ const dr=(pts,lim)=>{ for(let i=0;i<Math.min(lim,pts.length);i++){ const [px,py]=pts[i]; if(!layers.includes(layerOf(px))) continue;
              if(col[1]) [[0,1]].forEach(([a,b])=>{ if(bth(px+40+a,py+40+b)<.4) dot(px+a,py+b,col[1]); });     // delikatna poświata w ditherze
              dot(px,py,col[0]); if(f===3) dot(px,py-1,'#ffffff'); } };
          dr(B.pts,reach); B.br.forEach(b=>{ if(reach>b.at) dr(b.pts,f<3?Math.max(0,reach-b.at):b.pts.length); }); };
        B._f=f; if(f>=7) bolt=null; }
      if(bl) bl([0,4]);            // odcinki schowane za bocznymi kartami
      card(0); card(2);
      if(bl) bl([1,2,3]);          // po wierzchu bocznych; środkowy odcinek zaraz przykryje karta II (widać tylko to, co wyskakuje nad nią i pod nią)
      card(1);
      if(bl && bolt===null?false:bl && bolt && bolt._f===3){ x.fillStyle='rgba(63,240,255,.10)'; x.fillRect(0,0,cv.width,cv.height); }
    });
  }

  /* --- rozkład: strona gaśnie ditherem, trzy karty wylatują z rogu w łuk i po kolei odwracają się na awersy --- */
  let L=opts.text[opts.lang()], NAMES=L.names, ROADS=L.roads;
  let here=opts.current, spreadOpen=false, busy=false;
  const sp=document.createElement('div'); sp.className='spread'; sp.setAttribute('role','dialog'); sp.setAttribute('aria-label',L.dialog); sp.hidden=true;
  const dim=document.createElement('canvas'); dim.className='sdim'; sp.appendChild(dim);
  const cards=[0,1,2].map(i=>{ const b=document.createElement('button'); b.type='button'; b.className='scard'; b.innerHTML=`<img alt="" src="${opts.backs[i]}"><span class="sn"></span><span class="sr dos"></span>`; sp.appendChild(b); return b; });
  // język zmienia wspólny przełącznik w rogu (LangKeys); karty tylko przepisują podpisy
  const syncLang=()=>{ L=opts.text[opts.lang()]; NAMES=L.names; ROADS=L.roads; sp.setAttribute('aria-label',L.dialog); btn.setAttribute('aria-label',L.dialog); label(); };
  const onLang=()=>{ if(!st.isConnected){ removeEventListener('krzyk-lang',onLang); return; } syncLang(); }; addEventListener('krzyk-lang',onLang);
  st.appendChild(sp);
  // żar i iskierki nad spalonym rogiem trzeciej karty (Maszynologia), widoczne tylko gdy karta leży awersem do góry
  import('./gatecards').then(({emberCorner})=>emberCorner(cards[2],opts.faces[2],()=>!sp.hidden&&cards[2].classList.contains('face')&&cards[2].style.opacity!=='0'));
  const sleep=ms=>new Promise(r=>setTimeout(r,RM?0:ms)); const FR=1000/12;
  // pozycje w łuku (środek sceny), start w rogu przy ikonce
  // desktop: łuk; telefon: pionowy, lekko przesunięty stos (karty po lewej, podpisy z prawej)
  const ARC_D=[[-112,14,-7],[0,0,0],[112,14,7]], ARC_P=[[-52,-146,-3],[-34,0,0],[-52,146,3]];
  const phone=()=>matchMedia('(max-width:700px)').matches;
  let ARC=ARC_D;
  const place=(b,x,y,r,s,sx=1)=>{ b.style.transform=`translate(-50%,-50%) translate(${x}px,${y}px) rotate(${r}deg) scale(${s*sx},${s})`; };
  function drawDim(k){ const w=dim.width=Math.ceil(st.clientWidth/3), h=dim.height=Math.ceil(st.clientHeight/3), c=dim.getContext('2d'), d=c.createImageData(w,h);
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){ if(bth(x,y)<k){ d.data[(y*w+x)*4+3]=235; } } c.putImageData(d,0,0); }
  function label(){ cards.forEach((b,i)=>{ b.querySelector('.sn').textContent=NAMES[i]; b.querySelector('.sr').textContent=i===here?L.here:ROADS[i]; b.classList.toggle('cur',i===here); b.disabled=i===here; }); }
  async function flip(b,i,toFace){ const img=b.querySelector('img'); const [x,y,r]=ARC[i];
    for(const s of [.66,.33,.06]){ place(b,x,y,r,1,s); await sleep(FR); }
    img.src=toFace?opts.faces[i]:opts.backs[i]; b.classList.toggle('face',toFace);
    for(const s of [.33,.66,1]){ place(b,x,y,r,1,s); await sleep(FR); } }
  async function openSpread(){ if(busy) return; busy=true; spreadOpen=true; sp.classList.toggle('stack',phone()); label(); sp.hidden=false;
    { const sc=cards[0].offsetWidth/88||1; ARC=(phone()?ARC_P:ARC_D).map(([x,y,r])=>[x*sc,y*sc,r]); }   // odstępy rosną razem z kartami
    st.classList.add('spreading');
    const W=st.clientWidth, H=st.clientHeight, sx=W/2-60, sy=-H/2+40;
    cards.forEach((b,i)=>{ b.querySelector('img').src=opts.backs[i]; b.classList.remove('face'); place(b,sx,sy,0,.3); b.style.opacity=0; });
    for(const k of [.3,.6,.85,1]){ drawDim(k); await sleep(FR); }                 // strona gaśnie w 4 skokach
    for(let f=1;f<=5;f++){ const e=f/5; cards.forEach((b,i)=>{ const [x,y,r]=ARC[i]; b.style.opacity=1; place(b,sx+(x-sx)*e,sy+(y-sy)*e-Math.sin(e*Math.PI)*18,r*e,.3+.7*e); }); await sleep(FR); }
    await Promise.all(cards.map((b,i)=>sleep(i*80*1.2).then(()=>flip(b,i,true))));
    sp.querySelectorAll('.sr,.sn').forEach(e=>e.style.visibility='visible'); busy=false; cards[here===0?1:0].focus({preventScroll:true}); }
  async function closeSpread(){ if(busy||!spreadOpen) return; busy=true;
    const W=st.clientWidth, H=st.clientHeight, sx=W/2-60, sy=-H/2+40;
    sp.querySelectorAll('.sr,.sn').forEach(e=>e.style.visibility='hidden');
    await Promise.all(cards.map((b,i)=>sleep((2-i)*60).then(()=>flip(b,i,false))));
    for(let f=4;f>=0;f--){ const e=f/5; cards.forEach((b,i)=>{ const [x,y,r]=ARC[i]; place(b,sx+(x-sx)*e,sy+(y-sy)*e,r*e,.3+.7*e); b.style.opacity=f?1:0; }); await sleep(FR); }
    for(const k of [.75,.5,.25,0]){ drawDim(k); await sleep(FR); }
    sp.hidden=true; st.classList.remove('spreading'); spreadOpen=false; busy=false; st.dispatchEvent(new Event('spread-closed')); btn.focus({preventScroll:true}); }
  // wybór karty: pozostałe spadają i migoczą, wybrana rośnie skokami, potem szczelina otwiera dział
  cards.forEach((b,i)=>b.addEventListener('click',async e=>{ e.stopPropagation(); if(busy||i===here) return; busy=true;
    sp.querySelectorAll('.sr,.sn').forEach(el=>el.style.visibility='hidden');
    for(let f=1;f<=6;f++){ cards.forEach((c,j)=>{ const [x,y,r]=ARC[j]; if(j===i) place(c,x*(1-f/6),y*(1-f/6),r*(1-f/6),1+f*.12); else { place(c,x,y+f*f*5,r+(j<i?-1:1)*f*4,1-f*.08); c.style.opacity=f>3&&(f%2)?0:1; } }); await sleep(FR); }
    cards.forEach((c,j)=>{ if(j!==i) c.style.opacity=0; });
    slitTo(st,NAMES[i],ROADS[i],null); await sleep(RM?200:1200); opts.onGo&&opts.onGo(i); return;
    sp.hidden=true; st.classList.remove('spreading'); spreadOpen=false; busy=false; drawDim(0); st.dispatchEvent(new Event('spread-closed')); label(); }));
  syncLang();
  dim.addEventListener('click',closeSpread);
  st.addEventListener('keydown',e=>{ if(e.key==='Escape') closeSpread(); });
}
}
