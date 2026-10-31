// brama (tunel, sztandary słońca i księżyca z paleniem i popiołem w sigile, okno z ramkami, pęknięcie okna)
import { RM, rnd, clamp, FONTS, loop, N, bth, makeGlyph, drawGlyph } from './core';
export function initGate(root, opts){
  const $ = id => root.querySelector('#'+id);
  const ASSETS = opts.assets;
/* zakładki: słońce i księżyc na wysokich czarnych pasach z ozdobami rycinowymi;
   w spoczynku tlą się u góry i u dołu, po wejściu spalają się całe (od krawędzi i dziurami od środka),
   a popiół leci na boki i składa się w pionowe pasma sigili */
const GP=matchMedia('(max-width:700px)').matches, GW=GP?270:480, GH=GP?480:270;   // telefon: brama pionowa 9:16, pasy poziomo

const ASH={parts:[], cols:[], t0:-1, on:false, calm:false};
function tornTab(img, canvas, host, seed, art, side){
  const w=img.naturalWidth, h=img.naturalHeight; canvas.width=w; canvas.height=h;
  const x=canvas.getContext('2d'); const tmp=document.createElement('canvas'); tmp.width=w; tmp.height=h;
  const tx=tmp.getContext('2d',{willReadFrequently:true}); tx.drawImage(img,0,0); const base=tx.getImageData(0,0,w,h).data;
  const out=x.createImageData(w,h), d=out.data;
  const BURN=36;
  const maxTop=art[0]-14-BURN, maxBot=h-(art[0]+art[1])-14-BURN;
  const prof=(xx,o)=> 30 + 26*N(xx*.018+o,.31) + 12*N(xx*.07+o,1.7) + 7*Math.sin(xx*.045+o);
  const topP=new Float32Array(w), botP=new Float32Array(w); for(let i=0;i<w;i++){ topP[i]=prof(i,seed); botP[i]=prof(i,seed+37); }
  const tpA=new Float32Array(w), bpA=new Float32Array(w), bwT=new Float32Array(w), bwB=new Float32Array(w), glT=new Float32Array(w), glB=new Float32Array(w);
  const CORE=[214,254,255], CY=[63,240,255], DEEP=[8,120,142], EMB=[255,170,120];
  const J=new Float32Array(w*h); for(let i=0;i<w*h;i++){ const xx=i%w, yy=(i/w)|0; J[i]=N(xx*.45+seed*7,yy*.45)*4+N(xx*1.3,yy*1.3+seed)*1.5; }
  // pole spalania: 0 = pali się najpierw. Krawędzie góra/dół plus „dziury” w środku, które zapalają się same
  const BV=new Float32Array(w*h);
  for(let i=0;i<w*h;i++){ const xx=i%w, yy=(i/w)|0; const ed=Math.min(yy,h-1-yy)/(h/2);
    const hole=.5+.5*clamp(N(xx*.045+seed*3,yy*.045)*1.7+N(xx*.13,yy*.13+seed)*.5,-1,1);
    BV[i]=clamp(ed*.6+(1-hole)*.42+J[i]*.006,0,1); }
  const gone=new Uint8Array(w*h);
  const sparks=[];
  const put=(k,c)=>{ d[k]=c[0]; d[k+1]=c[1]; d[k+2]=c[2]; d[k+3]=255; };
  const burnPx=(k,xx,yy,e,bw,g)=>{
    const th=bth(xx,yy);
    if(e<0){ const hw=3+bw*.9; if(-e<hw){ const v=g*(1+e/hw)*.8; if(v>th){ put(k, v>.42?CY:DEEP); return true; } } d[k+3]=0; return true; }
    if(e<bw){ const v=g*(1-e/bw); const lv=Math.floor(clamp(v*3+th-.5,0,3));
      if(lv>=3){ put(k,CORE); return true; } if(lv===2){ put(k,CY); return true; } if(lv===1){ put(k,DEEP); return true; }
      put(k,[base[k]*.25,base[k+1]*.3,base[k+2]*.34]); return true; }
    if(e<bw+9){ const f=.25+.75*((e-bw)/9); put(k,[base[k]*f,base[k+1]*f,base[k+2]*(f*1.05)]); return true; }
    return false;
  };
  // przelicznik: piksel zakładki -> piksel nakładki popiołu (480x270 na całą bramę)
  const toAsh=()=>{ const g=host.getBoundingClientRect(), r=canvas.getBoundingClientRect();
    if(!GP) return {ox:(r.left-g.left)/g.width*GW, oy:(r.top-g.top)/g.height*GH, s:r.width/w*GW/g.width, pt:(xx,yy,m)=>[m.ox+xx*m.s, m.oy+yy*m.s]};
    // pas jest obrócony o -90° wokół środka: (dx,dy) -> (dy,-dx)
    const s=canvas.offsetWidth/w*GW/g.width, cx0=((r.left+r.right)/2-g.left)/g.width*GW, cy0=((r.top+r.bottom)/2-g.top)/g.height*GH;
    return {cx0,cy0,s,pt:(xx,yy,m)=>[m.cx0+(yy-h/2)*m.s, m.cy0-(xx-w/2)*m.s]}; };
  let burn=null;
  host.addEventListener('descend',e=>{ burn={t0:-1, dur:e.detail.calm?1150:1750, calm:e.detail.calm, map:toAsh()}; });
  host.addEventListener('reset',()=>{ burn=null; gone.fill(0); canvas.style.visibility='visible'; });
  const draw=(t)=>{
    if(burn && burn.t0<0) burn.t0=t;
    const P = burn ? (t-burn.t0)/burn.dur*1.12 : -1;           // czoło ognia w polu BV
    if(burn && P>1.25){ canvas.style.visibility='hidden'; return; }
    const p = RM ? .25 : .22+.1*Math.sin(t/1400+seed)+.05*Math.sin(t/430+seed*2);
    for(let xx=0;xx<w;xx++){
      const live=(10+26*p)*(.5+.5*N(xx*.04+seed, t/850)), liveB=(10+26*p)*(.5+.5*N(xx*.04+seed+9, t/850+3));
      tpA[xx]=Math.min(maxTop,topP[xx]+live); bpA[xx]=Math.min(maxBot,botP[xx]+liveB);
      const flareT=Math.max(0,N(xx*.03+seed,t/1500)-.25)*16, flareB=Math.max(0,N(xx*.03+seed+5,t/1500+7)-.25)*16;
      bwT[xx]=4+12*Math.pow(.5+.5*N(xx*.07+seed,t/700),1.5)+flareT*1.6; bwB[xx]=4+12*Math.pow(.5+.5*N(xx*.07+seed+3,t/700+2),1.5)+flareB*1.6;
      glT[xx]=(RM?.8:.7+.5*(.5+.5*N(xx*.11+seed*3,t/260)))*(.85+p); glB[xx]=(RM?.8:.7+.5*(.5+.5*N(xx*.11+seed*3+4,t/260+1)))*(.85+p);
    }
    const BAND=.055, CHAR=.05; let spawn=0;
    const M=burn&&burn.map;
    for(let xx=0;xx<w;xx++){
      const tp=tpA[xx], bp=bpA[xx];
      for(let yy=0;yy<h;yy++){ const i=yy*w+xx, k=i*4;
        if(base[k+3]===0){ d[k+3]=0; continue; }
        if(burn){ const v=BV[i];
          if(v<P){ if(!gone[i]){ gone[i]=1;
              // popiół i iskry z przepalonego miejsca
              if(Math.random()<(burn.calm?.006:.014) && ASH.parts.length<2600){ const [ax,ay]=M.pt(xx,yy,M);
                ASH.parts.push({x:ax,y:ay,vx:(Math.random()-.5)*.6,vy:-(.3+Math.random()*.9),age:0,side,hot:1}); }
              if(!burn.calm && Math.random()<.004) sparks.push({x:xx+.5,y:yy+.5,vx:(Math.random()-.5)*1.6,vy:-(.6+Math.random()*2),life:6+Math.floor(Math.random()*8),age:0}); }
            d[k+3]=0; continue; }
          if(v<P+BAND){ const g=1-(v-P)/BAND, th=bth(xx,yy); const lv=Math.floor(clamp(g*3.2+th-.6,0,3));
            put(k, lv>=3?CORE: lv===2?CY: lv===1?(Math.random()<.15?EMB:DEEP) : [base[k]*.2,base[k+1]*.22,base[k+2]*.26]); continue; }
          if(v<P+BAND+CHAR){ const f=.18+.82*((v-P-BAND)/CHAR); put(k,[base[k]*f*.9,base[k+1]*f*.85,base[k+2]*f]); continue; }
        }
        const jj=J[i]; const eT=yy-tp+jj, eB=(h-1-yy)-bp+jj;
        const edge=Math.min(eT,eB)/9;
        if(eT<bwT[xx]+9 && eT<eB){ if(edge<=bth(xx,yy)-.15 && eT>=0){ burnPx(k,xx,yy,-0.5,bwT[xx],glT[xx]); continue; } if(burnPx(k,xx,yy,eT,bwT[xx],glT[xx])) continue; }
        else if(eB<bwB[xx]+9){ if(edge<=bth(xx,yy)-.15 && eB>=0){ burnPx(k,xx,yy,-0.5,bwB[xx],glB[xx]); continue; } if(burnPx(k,xx,yy,eB,bwB[xx],glB[xx])) continue; }
        put(k,[base[k],base[k+1],base[k+2]]);
      } }
    if(!RM){
      if(!burn) for(let n=0;n<3;n++){ if(Math.random()<.55){ const xx=Math.floor(Math.random()*w), top=Math.random()<.5;
        sparks.push({x:xx+.5, y: top? tpA[xx]-1 : h-1-bpA[xx]+1, vx:(Math.random()-.5)*.8, vy: top? -(.6+Math.random()*1.6) : (.6+Math.random()*1.6), life:6+Math.floor(Math.random()*10), age:0}); } }
      for(let i=sparks.length-1;i>=0;i--){ const s=sparks[i]; s.age++; s.x+=s.vx; s.y+=s.vy; s.vx+=(Math.random()-.5)*.3;
        if(s.age>s.life||s.x<0||s.x>=w||s.y<0||s.y>=h){ sparks.splice(i,1); continue; }
        const k=(Math.floor(s.y)*w+Math.floor(s.x))*4; put(k, s.age<s.life*.4?CORE:(s.age<s.life*.75?CY:DEEP)); }
    }
    x.putImageData(out,0,0); };
  draw(0); loop(host,20,draw);
}

/* popiół i pasma sigili na całej bramie (nakładka 480x270) */
function ashLayer(gate){
  const c=document.createElement('canvas'); c.className='ashc'; c.width=GW; c.height=GH; c.setAttribute('aria-hidden','true');
  gate.insertBefore(c, gate.querySelector('.layer')); const x=c.getContext('2d');
  const g=document.createElement('canvas'); g.width=GW; g.height=GH; const gx=g.getContext('2d',{willReadFrequently:true});
  const a=document.createElement('canvas'); a.width=GW; a.height=GH; const ax=a.getContext('2d',{willReadFrequently:true});
  // kolumny: po trzy z każdej strony, w miejscu zakładek
  // kolumny (pion, sigile spływają w dół) albo, na telefonie, wiersze (poziom, sigile płyną w bok); x = oś poprzeczna, slot(gi) = środek znaku
  const LEN=GP?GW:GH;
  const mk=(cx,s,side)=>{ const n=Math.ceil(LEN/(s+5))+2; return {x:cx,s,side,v:rnd(.12,.3),off:rnd(s+5),gl:[...Array(n)].map(()=>({g:makeGlyph(),b:rnd(.4,.9),q:0,lit:0}))}; };
  const slot=(col,gi)=>{ const u=-col.s+gi*(col.s+5)+col.off+col.s/2; return GP?[u,col.x]:[col.x,u]; };
  const place=()=>{ const G=gate.getBoundingClientRect(); const pos=id=>{ const r=$(id).getBoundingClientRect(); return GP?[(r.top-G.top)/G.height*GH,(r.bottom-G.top)/G.height*GH]:[(r.left-G.left)/G.width*GW,(r.right-G.left)/G.width*GW]; };
    const [l0,l1]=pos('sunT'), [r0,r1]=pos('moonT'); const lc=(l0+l1)/2, rc=(r0+r1)/2;
    return [mk(lc-18,9,0),mk(lc,12,0),mk(lc+18,9,0),mk(rc-16,9,1),mk(rc,12,1),mk(rc+16,9,1)]; };
  let cols=null, t0=-1, calm=false, active=false;
  gate.addEventListener('descend',e=>{ calm=e.detail.calm; cols=place(); t0=-1; active=true; ASH.parts.length=0; });
  gate.addEventListener('reset',()=>{ active=false; ASH.parts.length=0; x.clearRect(0,0,GW,GH); });
  loop(gate,20,(t,dt)=>{
    if(!active){ return; }
    if(t0<0) t0=t; const T=t-t0;
    // pasma pojawiają się dopiero, gdy czerwony tunel prawie zgaśnie (gaśnie od 70% do 100% czasu wejścia)
    const tEnd=calm?2600:4200, appear=clamp((T-tEnd*.92)/1100,0,1);
    gx.clearRect(0,0,GW,GH); ax.clearRect(0,0,GW,GH); gx.lineWidth=1; ax.lineWidth=1;
    // popiół: najpierw unosi się, potem szuka wolnego miejsca w swoim pasie i „zastyga” jako znak
    const P=ASH.parts;
    for(let i=P.length-1;i>=0;i--){ const p=P[i]; p.age+=dt;
      if(!p.tg){ const sideCols=cols.filter(c=>c.side===p.side); const col=sideCols[Math.floor(Math.random()*sideCols.length)]; const gi=Math.floor(Math.random()*col.gl.length); p.tg=[col,gi]; }
      const [col,gi]=p.tg; const [txx,ty]=slot(col,gi);
      if(p.age<380){ p.vy-=.006*dt; p.vx+=(Math.random()-.5)*.05; }
      else { const k=Math.min(1,(p.age-380)/700)*.12; p.vx+=(txx-p.x)*k*.08; p.vy+=(ty-p.y)*k*.08; p.vx*=.86; p.vy*=.86; }
      p.x+=p.vx*dt/16; p.y+=p.vy*dt/16; p.hot*=.97;
      if(p.age>380 && Math.abs(p.x-txx)<2.5 && Math.abs(p.y-ty)<3){ col.gl[gi].q=Math.min(1,col.gl[gi].q+.34); col.gl[gi].lit=Math.max(col.gl[gi].lit,.8); P.splice(i,1); continue; }
      if(p.age>3200){ P.splice(i,1); continue; }
      const xi=p.x|0, yi=p.y|0; if(xi<0||xi>=GW||yi<0||yi>=GH) continue;
      (p.hot>.35?ax:gx).fillStyle=`rgba(255,255,255,${p.hot>.35?1:.55+.4*Math.random()})`; (p.hot>.35?ax:gx).fillRect(xi,yi,1,1);
    }
    cols.forEach(col=>{ col.off+=col.v*dt/16*(RM||calm?.25:1)*appear;
      // ciągła pętla: po przesunięciu o jeden slot znak przesuwa się w tablicy, a na górze wchodzi nowy (bez cofnięcia)
      while(col.off>=col.s+5){ col.off-=col.s+5; col.gl.unshift({g:makeGlyph(),b:rnd(.4,.9),q:1,lit:0}); col.gl.pop(); }
      if(appear>=1 && !calm && Math.random()<.012){ col.gl[Math.floor(Math.random()*col.gl.length)].lit=1; }
      col.gl.forEach((gg,i)=>{ const uu=-col.s+i*(col.s+5)+col.off, yy=uu; gg.lit*=Math.pow(.9,dt/16);
        gg.q=Math.min(1,gg.q+appear*dt/2600);                                   // dopełnienie, gdyby popiołu było za mało
        const fade=Math.min(1,uu/24,(LEN-uu)/24); const v=clamp(gg.b*fade*gg.q*appear,0,1); if(v<=0) return;
        gx.strokeStyle=`rgba(255,255,255,${v})`; gx.fillStyle=gx.strokeStyle; drawGlyph(gg.g,gx,GP?uu:col.x-col.s/2,GP?col.x-col.s/2:uu,col.s);
        if(gg.lit>.08){ ax.strokeStyle=`rgba(255,255,255,${gg.lit*gg.q*appear})`; ax.fillStyle=ax.strokeStyle; drawGlyph(gg.g,ax,GP?uu:col.x-col.s/2,GP?col.x-col.s/2:uu,col.s); } }); });
    const gd=gx.getImageData(0,0,GW,GH).data, ad=ax.getImageData(0,0,GW,GH).data, out=x.createImageData(GW,GH), o=out.data;
    for(let yy=0;yy<GH;yy++) for(let xx=0;xx<GW;xx++){ const k=(yy*GW+xx)*4; const th=bth(xx,yy); const v=gd[k+3]/255, ac=ad[k+3]/255;
      if(ac>th){ o[k]=63;o[k+1]=240;o[k+2]=255;o[k+3]=255; } else if(v>th){ if(v>.62){o[k]=223;o[k+1]=226;o[k+2]=232;} else {o[k]=58;o[k+1]=66;o[k+2]=120;} o[k+3]=255; } }
    x.putImageData(out,0,0);
  });
}
{
  const gate=$('gate');
  [['sunT',GP?ASSETS.sun3p:ASSETS.sun3,1.3,ASSETS.sunArt,0],['moonT',GP?ASSETS.moon3p:ASSETS.moon3,7.9,GP?ASSETS.moonArtP:ASSETS.moonArt,1]].forEach(([id,src,seed,art,side])=>{ const cv=$(id); const im=new Image(); im.onload=()=>tornTab(im,cv,gate,seed,art,side); im.src=src; });
  ashLayer(gate);
}
/* --- brama: ramka C6.3c (déco-sigil: cyjanowe klamry z morską kreską, srebrna linia, gwiazda u góry, ostrza z boków) buduje się piksel po pikselu --- */
(() => {
  const gate=$('gate'); if(!gate) return;
  const PX=2;                                                // 1 piksel ramki = 2 px CSS
  const PAL={ hov:{'#':'#cdd0d8',s:'#969aa4',d:'#6e717d',D:'#3a3c46',w:'#ffffff',c:'#3ff0ff',t:'#0e7c8a',T:'#07444c',k:'#000000',sp:'#ffffff'},
              on:{'#':'#eaffff',s:'#3ff0ff',d:'#3ff0ff',D:'#0e7c8a',w:'#ffffff',c:'#ffffff',t:'#3ff0ff',T:'#0e7c8a',k:'#000000',sp:'#ffffff'} };
  const host=el=>el.classList.contains('path')?el.querySelector('.nm'):el;

  // piksele ćwiartki lewej-górnej, potem lustrzane odbicia; o = kolejność pojawiania się (0..1):
  // gwiazda i ostrza -> linie od środków boków ku rogom -> morskie końcówki -> klamry od końca ramienia do białego rogu
  function geom(W,H,big,box){
    const cx=(W-1)/2, cy=(H-1)/2, M=new Map();
    const put=(x,y,c,o)=>{ if(x>cx||y>cy||x<0||y<0) return; const k=x+','+y, p=M.get(k); if(!p||p.o>o) M.set(k,{x,y,c,o}); };
    const del=(x,y)=>M.delete(x+','+y);
    const L=box.l, T=box.t, sx=cx-L, sy=cy-T;
    const oX=x=>.08+(cx-x)/sx*.48, oY=y=>.08+(cy-y)/sy*.48;
    const aX=big?7:5, aY=Math.max(2,Math.min(big?6:4,sy-6));
    const arm=n=>'w'+'c'.repeat(n-2)+'t';
    // klamra zewnętrzna: ramiona rosną od końca do rogu, biały piksel na końcu
    [...arm(aX)].forEach((c,i)=>put(L+1+i,T,c,.64+(aX-1-i)/aX*.24));
    [...arm(aY)].forEach((c,i)=>put(L,T+1+i,c,.64+(aY-1-i)/aY*.24));
    // srebrna linia z przygaszeniem ku rogowi
    put(L+aX+2,T,'T',.6);
    for(let x=L+aX+4;x<=cx;x++){ const i=x-(L+aX+4); put(x,T,i===0?'D':i===1?'d':i===2?'s':'#',oX(x)); }
    put(L,T+aY+1,'T',.6);
    for(let y=T+aY+2;y<=cy;y++){ const i=y-(T+aY+2), long=sy>=aY+9; put(L,y,!long?'D':i===0?'D':i===1?'d':i===2?'s':'#',oY(y)); }
    // pas wewnętrzny: przedłużenie morskiej kreski, gaśnie w szary; róg ścięty jak klamra, ząbek w rogu
    for(let x=L+3;x<=cx;x++){ const c=x<L+aX?'t':x<L+aX+2?'T':x<L+aX+3?'D':'d'; put(x,T+2,c,Math.max(oX(x)+.04,c==='t'?.56:0)); }
    for(let y=T+3;y<=cy;y++){ const c=y<T+aY+1?'t':y<T+aY+2?'T':'D'; put(L+2,y,c,Math.max(oY(y)+.04,c==='t'?.56:0)); }
    put(L+3,T+3,'T',.6);
    // gwiazda u góry (pas pod nią przerwany) i ostrze z boku (pas za nim przerwany)
    const stamp=(rows,ox,oy,o0)=>rows.forEach((r,j)=>[...r].forEach((c,i)=>{ const x=ox+i,y=oy+j; if(c==='x') del(x,y); else if(c!=='.') put(x,y,c,o0+Math.abs(x-cx)*.01); }));
    if(big){
      for(let x=cx-4;x<=cx;x++) del(x,T+2); put(cx-5,T+2,'D',.1);
      stamp(['.......s.......','.......w.......','DDdd..#c#..ddDD','xxx.#scwcs#.xxx','......#t#......'],cx-7,T-3,0);
    } else {
      for(let x=cx-2;x<=cx;x++) del(x,T+2);
      stamp(['....s....','...#c#...','xx#swc#xx','....t....'].map(r=>r.replace('swc','sws').replace('sws','scs')),cx-4,T-2,0);
      put(cx,T,'w',0);
    }
    for(let y=cy-1;y<=cy;y++) del(L+2,y);
    stamp(['..s','.#x','#cx','.#x','..s'],L-2,cy-2,0);
    // lustrzane odbicia na 4 ćwiartki
    const out=new Map(), add=(x,y,p)=>{ const k=x+','+y, q=out.get(k); if(!q||q.o>p.o) out.set(k,{x,y,c:p.c,o:p.o}); };
    for(const p of M.values()) for(const [mx,my] of [[0,0],[1,0],[0,1],[1,1]]) add(mx?W-1-p.x:p.x, my?H-1-p.y:p.y, p);
    const px=[...out.values()];
    // czarny obrys, żeby ramka przerywała linie ramki ASCII pod spodem (bez czernienia wnętrza przycisku)
    const occ=new Set(px.map(p=>p.x+','+p.y)), extra=[];
    const inside=(x,y)=>x>L+2&&x<W-1-L-2&&y>T+2&&y<H-1-T-2;
    for(const p of px) for(const [i,j] of [[1,0],[-1,0],[0,1],[0,-1]]){ const x=p.x+i,y=p.y+j, k=x+','+y;
      if(x<0||y<0||x>=W||y>=H||occ.has(k)||inside(x,y)) continue; occ.add(k); extra.push({x,y,c:'k',o:p.o}); }
    return extra.concat(px);
  }
  const st=new WeakMap();
  function draw(s,now){
    const {x,W,H,px}=s, pal=PAL[s.on?'on':'hov']; x.clearRect(0,0,W,H);
    const k=s.k*1.08;
    if(s.k<=0) return;
    for(const p of px){ if(p.o>k) continue; x.fillStyle=(s.dir>0 && p.c!=='k' && k-p.o<.06)?pal.sp:pal[p.c]; x.fillRect(p.x,p.y,1,1); }
    if(s.k>=1 && !s.on && !RM){                              // krótkie błyski w białych punktach
      for(const [gx,gy,ph] of s.gl){ const f=Math.floor(now/110+ph), r=[0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0][f%18]; if(!r) continue;
        x.fillStyle=pal.sp; for(let i=1;i<=r;i++){ x.fillRect(gx-i,gy,1,1); x.fillRect(gx+i,gy,1,1); x.fillRect(gx,gy-i,1,1); x.fillRect(gx,gy+i,1,1); }
        x.fillStyle='#fff'; x.fillRect(gx,gy,1,1); } }
  }
  function ensure(el){
    let s=st.get(el); const h=host(el), w=h.offsetWidth, hgt=h.offsetHeight, big=hgt>=34;
    const G=big?[4,3]:[4,2], PADX=G[0]+4, PADY=G[1]+(big?5:4);
    let W=Math.ceil(w/PX)+PADX*2, H=Math.ceil(hgt/PX)+PADY*2; W+=1-W%2; H+=1-H%2;   // nieparzyste: piksel środka dla symetrii
    if(s && s.c.isConnected && s.W===W && s.H===H) return s;
    if(s) s.c.remove();
    const c=document.createElement('canvas'); c.className='gfr'; c.width=W; c.height=H;
    const ox=(W*PX-w)/2, oy=(H*PX-hgt)/2;
    c.style.cssText=`left:${-ox}px;top:${-oy}px;width:${W*PX}px;height:${H*PX}px`;
    h.appendChild(c);
    const box={l:PADX-G[0], t:PADY-G[1]};
    const gl=[[box.l+1,box.t,0],[W-2-box.l,H-1-box.t,6],[(W-1)/2,box.t-(big?2:1),10]];          // błyski: białe rogi i szczyt gwiazdy
    s={c,x:c.getContext('2d'),W,H,px:geom(W,H,big,box),gl,k:0,dir:0,on:false,raf:0};
    st.set(el,s); return s;
  }
  function run(s){
    if(s.raf) return; let last=performance.now(), acc=0;
    const step=now=>{ acc+=Math.min(100,now-last); last=now;
      if(acc>=1000/30){                                      // 30 kl/s, żeby było widać skoki pikseli
        const dur=s.dir>0?750:300; s.k=Math.max(0,Math.min(1,s.k+s.dir*acc/dur)); acc=0; draw(s,now); }
      const twinkle=s.dir>0&&s.k>=1&&!RM;
      if((s.dir>0&&s.k<1)||(s.dir<0&&s.k>0)||twinkle){ s.raf=requestAnimationFrame(step); } else { s.raf=0; draw(s,now); }
    };
    s.raf=requestAnimationFrame(step);
  }
  function show(el){ const s=ensure(el); s.dir=1; if(RM){ s.k=1; draw(s,0); } else run(s); }
  function hide(el){ const s=st.get(el); if(!s) return; s.dir=-1; s.on=false; if(RM){ s.k=0; draw(s,0); } else run(s); }
  const T='.enter,.calm,.path';
  gate.addEventListener('mouseover',e=>{ const el=e.target.closest(T); if(el && !el.contains(e.relatedTarget)) show(el); });
  gate.addEventListener('mouseout',e=>{ const el=e.target.closest(T); if(el && !el.contains(e.relatedTarget) && document.activeElement!==el) hide(el); });
  gate.addEventListener('focusin',e=>{ const el=e.target.closest(T); if(el) show(el); });
  gate.addEventListener('focusout',e=>{ const el=e.target.closest(T); if(el && !el.matches(':hover')) hide(el); });
  // kliknięcie: ramka dobudowuje się do końca i rozbłyska cyjanem
  gate.addEventListener('pointerdown',e=>{ const el=e.target.closest(T); if(!el) return; const s=ensure(el); s.on=true; s.k=1; s.dir=1; draw(s,performance.now());
    setTimeout(()=>{ s.on=false; draw(s,performance.now()); },420); });
})();

/* --- brama: zewnętrzna oprawa: tylko dwa narożniki na ukos (z zawijasem), u góry cieniowany romb ze skrzydłami, na dole krzyżyk ♱ w pnączach --- */
function gateOuter(pre){
  if(!pre) return;
  const PX=2, COL={'#':'#cdd0d8',s:'#969aa4',d:'#6e717d',D:'#3a3c46',w:'#ffffff',c:'#3ff0ff',t:'#0e7c8a',T:'#07444c'};
  const old=pre.querySelector('canvas.gout'); if(old) old.remove();
  const cv=document.createElement('canvas'); cv.className='gout'; pre.prepend(cv);
  function draw(){
    const r=pre.getBoundingClientRect(); if(!r.width) return;
    // nieparzysta szerokość (piksel środka) i płótno wyśrodkowane na oknie co do pół piksela, żeby ozdoby były symetryczne względem tekstu
    let W=Math.floor(r.width/PX); if(!(W%2)) W--; const H=Math.floor(r.height/PX);
    cv.width=W; cv.height=H; cv.style.width=W*PX+'px'; cv.style.height=H*PX+'px'; cv.style.left=(r.width-W*PX)/2+'px'; cv.style.top='0px';
    const x=cv.getContext('2d'), cx=(W-1)/2, M=new Map(), offX=(r.width-W*PX)/2;
    const put=(px,py,c)=>{ px=Math.round(px); py=Math.round(py); if(px>=0&&py>=0&&px<W&&py<H) M.set(px+','+py,c); };
    const fade=(i,n)=>{ const k=i/n; return k<.55?'#':k<.72?'s':k<.86?'d':'D'; };     // od jasnego przy ozdobie do ciemnego na końcu
    // --- narożnik: ramiona gasnące ku końcom, pogrubienie przy rogu, zawijas i dwa listki w środku kąta
    const corner=(ox,oy,sx,sy)=>{ const P=(a,b,c)=>put(ox+sx*a,oy+sy*b,c);
      const LX=Math.min(34,Math.round(W*.16)), LY=Math.min(20,Math.round(H*.28));
      for(let i=0;i<=LX;i++) P(i,0,fade(i,LX)); for(let i=0;i<=LY;i++) P(0,i,fade(i,LY));
      for(let i=1;i<7;i++){ P(i,1,i<4?'w':'s'); P(1,i,i<4?'w':'s'); } P(2,2,'#'); P(3,2,'d'); P(2,3,'d');
      // zawijas: spirala w kącie
      for(let k=0;k<=40;k++){ const t=k/40, ang=Math.PI*1.25+t*Math.PI*2.4, rr=3.6*(1-t*.75); P(7+Math.cos(ang)*rr,7+Math.sin(ang)*rr,t<.5?'#':'s'); }
      P(7,7,'c');
      // listki wychodzące z zawijasa wzdłuż ramion
      [[10,4],[11,4],[12,3],[13,3],[14,3],[15,4]].forEach(([a,b],i)=>P(a,b,i<3?'s':'d'));
      [[4,10],[4,11],[3,12],[3,13],[3,14],[4,15]].forEach(([a,b],i)=>P(a,b,i<3?'s':'d'));
      P(16,5,'D'); P(5,16,'D'); };
    corner(2,2,1,1); corner(W-3,H-3,-1,-1);
    // --- u góry: cieniowany romb ze skrzydłami z trzech kresek (środkowa najdłuższa, z grotem), końce lekko uniesione
    const ty=6, X=Math.round(cx);
    const dia=(rr)=>{ for(let i=-rr;i<=rr;i++){ const j=rr-Math.abs(i); put(X+i,ty-j,i<=0?'w':'#'); put(X+i,ty+j,i<0?'s':'d'); } };
    for(let i=-3;i<=3;i++) for(let j=-(3-Math.abs(i));j<=3-Math.abs(i);j++) put(X+i,ty+j,(i+j)<0?'d':'D');   // cieniowane wnętrze: jaśniej z lewej góry
    dia(4); dia(1); put(X,ty,'c'); put(X-1,ty,'t'); put(X+1,ty,'t'); put(X,ty-1,'t'); put(X,ty+1,'T');
    for(const sx of [-1,1]){
      const wing=(dy,n,from,tip)=>{ for(let i=0;i<=n;i++){ const xx=X+sx*(from+i); const lift=i>n-5?Math.round((i-(n-5))*.5):0; put(xx,ty+dy-(dy<0?lift:0)+(dy>0?lift:0),fade(i,n)); }
        if(tip){ const e=X+sx*(from+n+1); put(e,ty+dy,'s'); put(e-sx,ty+dy-1,'d'); put(e-sx,ty+dy+1,'d'); put(e+sx,ty+dy,'D'); } };
      wing(-2,Math.round(W*.09),7,false); wing(0,Math.round(W*.15),7,true); wing(2,Math.round(W*.07),7,false); }
    // --- na dole: krzyżyk ♱ między inicjałami a rokiem, a od jego stopy delikatne pnącza pod napisem
    const gx=pre.querySelector('.gx'), gb=pre.querySelector('.gb');
    if(gx&&gb){ const rg=gx.getBoundingClientRect(), rb=gb.getBoundingClientRect();
      const ccx=Math.round(cx), ccy=Math.round(((rg.top+rg.bottom)/2-r.top)/PX)+1;   // krzyżyk dokładnie na osi okna (piksel środka), piksel niżej
      // krzyż: górna poprzeczka mała, główna szersza, podstawa rozwidlona
      [[0,-6],[-1,-5],[1,-5],[0,-5],[0,-4],[0,-3],[-2,-2],[-1,-2],[0,-2],[1,-2],[2,-2],[0,-1],[0,0],[0,1],[0,2],[0,3],[-1,4],[1,4]].forEach(([a,b])=>put(ccx+a,ccy+b,b<-1?'w':b<2?'#':'s'));
      put(ccx,ccy-2,'c');
      // pnącza: od stopy krzyża w obie strony, pod tekstem, z dwoma zawijasami i listkami, gasnące
      const half=Math.round((rb.right-rb.left)/PX/2)+4, vy=ccy+5;
      for(const sx of [-1,1]){ for(let i=2;i<=half;i++){ const yy=vy+Math.round(Math.sin(i/half*Math.PI*2)*1.3); put(ccx+sx*i,yy,fade(i,half)); }
        for(const [f,up] of [[.22,1],[.48,-1],[.74,1]]){ const ex=Math.round(ccx+sx*half*f), ey=vy+Math.round(Math.sin(f*Math.PI*2)*1.3);   // listki na przemian w górę i w dół
          [[0,-up],[sx,-2*up],[2*sx,-2*up],[sx,-up]].forEach(([a,b],k)=>put(ex+a,ey+b,k<2?'s':'d')); }
        const ex=ccx+sx*half, ey=vy; put(ex+sx,ey-1,'d'); put(ex+sx,ey-2,'D'); put(ex,ey-3,'D');            // zakończenie: mały haczyk
      } }
    // tło okna: czarna płyta z fakturą jak na sztandarach (plamy i włókna w ditherze, granat na czerni), brzegi rozpadają się w dither
    const hsh=(a,b)=>{ const v=Math.sin(a*127.1+b*311.7)*43758.5453; return v-Math.floor(v); };
    const vn=(px,py,sc)=>{ const gx=px/sc, gy=py/sc, ix=Math.floor(gx), iy=Math.floor(gy), fx=gx-ix, fy=gy-iy, sx=fx*fx*(3-2*fx), sy=fy*fy*(3-2*fy);
      const a=hsh(ix,iy), b=hsh(ix+1,iy), c=hsh(ix,iy+1), d=hsh(ix+1,iy+1); return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy; };
    const fib=new Float32Array(W*H);
    for(let n=0;n<Math.round(W*H/260);n++){ let fx=hsh(n,1.7)*W, fy=hsh(n,9.3)*H; const ang=Math.PI/2+(hsh(n,4.1)-.5)*.9, L=4+hsh(n,7.7)*14, v=.25+hsh(n,2.2)*.35;
      for(let t=0;t<L;t++){ const px=Math.round(fx+Math.cos(ang)*t), py=Math.round(fy+Math.sin(ang)*t); if(px>=0&&py>=0&&px<W&&py<H) fib[py*W+px]=Math.max(fib[py*W+px],v); } }
    const im=x.createImageData(W,H), D=im.data;
    for(let py=0;py<H;py++) for(let px=0;px<W;px++){ const k=(py*W+px)*4, e=Math.min(px,W-1-px,py,H-1-py), th=bth(px,py);
      if(e<6 && e/6<=th) continue;                                   // poszarpany ditherem brzeg płyty
      const tx=vn(px,py,7)*.4+fib[py*W+px]*.9-.08;
      if(tx>th+.18){ D[k]=28; D[k+1]=31; D[k+2]=52; } D[k+3]=255; }
    x.clearRect(0,0,W,H); x.putImageData(im,0,0);
    for(const [k,c] of M){ const [a,b]=k.split(',').map(Number); x.fillStyle=COL[c]; x.fillRect(a,b,1,1); }
  }
  draw();
  if(window.ResizeObserver){ let t; new ResizeObserver(()=>{ clearTimeout(t); t=setTimeout(()=>{ if(pre.querySelector('canvas.gout')===cv) draw(); },80); }).observe(pre); }
}

/* --- brama: po kliknięciu cała ramka z napisami pęka na kawałki, które w niskich klatkach (9 kl/s) opadają w czeluść: kurczą się, obracają i migoczą aż znikną --- */
(() => {
  const gate=$('gate'); if(!gate) return;
  const FPS=9, STEP=1000/FPS;
  const hash=(a,b)=>{ const v=Math.sin(a*127.1+b*311.7)*43758.5453; return v-Math.floor(v); };
  let raf=0, ov=null;
  const reset=()=>{ cancelAnimationFrame(raf); raf=0; if(ov){ ov.remove(); ov=null; } const f=gate.querySelector('#gFrame'); if(f) f.style.visibility=''; };
  gate.addEventListener('reset',reset);
  // rastruje okno (płyta, ramki z canvasów, napisy) w połowie rozdzielczości, bez wygładzania alfa
  function raster(f){
    const fr=f.getBoundingClientRect(), w=Math.ceil(fr.width/2), h=Math.ceil(fr.height/2);
    const c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d',{willReadFrequently:true});
    x.fillStyle='#000'; x.fillRect(0,0,w,h); x.imageSmoothingEnabled=false;
    f.querySelectorAll('canvas').forEach(cv=>{ if(cv.style.visibility==='hidden') return; const r=cv.getBoundingClientRect(); if(r.width) x.drawImage(cv,(r.left-fr.left)/2,(r.top-fr.top)/2,r.width/2,r.height/2); });
    const tw=document.createTreeWalker(f,NodeFilter.SHOW_TEXT);
    for(let n;(n=tw.nextNode());){ const txt=n.textContent; if(!txt.trim()) continue; const par=n.parentElement, cs=getComputedStyle(par); if(cs.display==='none'||par.closest('[hidden]')) continue;
      const rg=document.createRange(); rg.selectNodeContents(n); const r=rg.getBoundingClientRect(); if(!r.width) continue;
      x.save(); x.scale(.5,.5); x.font=cs.font; x.fillStyle=cs.color; x.letterSpacing=cs.letterSpacing==='normal'?'0px':cs.letterSpacing; x.textBaseline='alphabetic';
      const m=x.measureText(txt); x.fillText(txt,r.left-fr.left,r.top-fr.top+(m.fontBoundingBoxAscent||r.height*.8)); x.restore(); }
    const im=x.getImageData(0,0,w,h), d=im.data; for(let i=3;i<d.length;i+=4) d[i]=255;
    return {w,h,d,fr};
  }
  // pęknięcie dowolnego elementu bramy (okno przy wejściu, przycisk drogi przy wyborze działu)
  const shatter=(f,quick)=>{
    reset(); if(!f) return;
    if(RM){ f.style.visibility='hidden'; return; }
    const R=raster(f), {w,h,d,fr}=R, gr=gate.getBoundingClientRect();
    // kawałki: komórki Woronoja z poszarpanymi krawędziami
    const N=13, seeds=[]; for(let i=0;i<N;i++){ let sx,sy,ok,tries=0; do{ sx=Math.random()*w; sy=Math.random()*h; ok=seeds.every(q=>Math.hypot(q[0]-sx,q[1]-sy)>Math.min(w,h)*.28); }while(!ok&&++tries<40); seeds.push([sx,sy]); }
    const id=new Int16Array(w*h);
    for(let y=0;y<h;y++) for(let xx=0;xx<w;xx++){ let best=0,bd=1e9; for(let i=0;i<N;i++){ const dd=Math.hypot(seeds[i][0]-xx,(seeds[i][1]-y)*1.25)+(hash(xx>>1,y>>1)-.5)*9; if(dd<bd){ bd=dd; best=i; } } id[y*w+xx]=best; }
    const P=[];
    for(let i=0;i<N;i++){ let x0=w,y0=h,x1=0,y1=0; for(let y=0;y<h;y++) for(let xx=0;xx<w;xx++) if(id[y*w+xx]===i){ x0=Math.min(x0,xx); x1=Math.max(x1,xx); y0=Math.min(y0,y); y1=Math.max(y1,y); } if(x1<x0) continue;
      const sw=x1-x0+1, sh=y1-y0+1, sc=document.createElement('canvas'); sc.width=sw; sc.height=sh; const sx=sc.getContext('2d'), si=sx.createImageData(sw,sh);
      for(let y=y0;y<=y1;y++) for(let xx=x0;xx<=x1;xx++){ const k=y*w+xx; if(id[k]!==i) continue;
        if((xx>0&&id[k-1]!==i)||(y>0&&id[k-w]!==i)) continue;                      // szczelina pęknięcia: 1 piksel
        const o=((y-y0)*sw+(xx-x0))*4, q=k*4; si.data[o]=d[q]; si.data[o+1]=d[q+1]; si.data[o+2]=d[q+2]; si.data[o+3]=255; }
      sx.putImageData(si,0,0);
      const mx=(x0+x1)/2-w/2, my=(y0+y1)/2-h/2;
      P.push({sc,sw,sh,x:(fr.left-gr.left)/2+x0,y:(fr.top-gr.top)/2+y0,vx:0,vy:0,rot:0,vr:(Math.random()<.5?-1:1)*(1+Math.floor(Math.random()*2))*Math.PI/12,
        delay:quick?1+Math.floor(Math.random()*3):6+Math.floor(Math.random()*5+(1-(my/h+.5))*3),   // w krokach; górne kawałki spadają nieco później, dolne pierwsze
        mx,my,age:-1,sca:1,jx:0,jy:0}); }
    ov=document.createElement('canvas'); const OW=Math.ceil(gr.width/2), OH=Math.ceil(gr.height/2); ov.width=OW; ov.height=OH;
    ov.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;image-rendering:pixelated;pointer-events:none;z-index:4'; gate.appendChild(ov);
    const ox=ov.getContext('2d'); ox.imageSmoothingEnabled=false;
    f.style.visibility='hidden';
    const cxg=OW/2, cyg=OH*.58;
    let t0=-1,last=-1;
    const step=now=>{
      if(t0<0) t0=now; const st=Math.floor((now-t0)/STEP);
      if(st!==last){ last=st;
        ox.clearRect(0,0,OW,OH); let alive=0;
        P.forEach((p,i)=>{
          if(p.age<0&&st>=p.delay) p.age=0;
          if(p.age>=0){ p.age++; p.vy+=.9; p.vx+=(cxg-(p.x+p.sw/2))*.004; p.x+=p.vx+(p.age<3?p.mx*.05:0); p.y+=p.vy*(p.age<3?.5:1); p.rot+=p.vr*(p.age>2?1:0); p.sca=Math.max(.15,p.sca*(p.age>3?.9:1)); }
          if(p.age<0){ p.jx=(Math.random()<.5?-1:1)*(st>3?1:0)*(Math.random()<.6?1:0); p.jy=(Math.random()<.5?-1:1)*(st>3?1:0)*(Math.random()<.6?1:0); if(st>=4){ p.jx+=Math.sign(p.mx)*(st>=5?1:0); p.jy+=Math.sign(p.my)*(st>=5?1:0); } }
          const gone=p.age>16||p.y>OH+20; if(gone) return; alive++;
          if(p.age>11 && (st+i)%2) return;                                          // na końcu kawałki migoczą
          ox.save(); ox.translate(Math.round(p.x+p.sw/2+(p.age<0?p.jx:0)),Math.round(p.y+p.sh/2+(p.age<0?p.jy:0)));
          if(p.age>=0){ ox.rotate(p.rot); ox.scale(p.sca,p.sca); }
          ox.drawImage(p.sc,-p.sw/2,-p.sh/2); ox.restore(); });
        if(!alive){ ov.remove(); ov=null; raf=0; return; } }
      raf=requestAnimationFrame(step); };
    raf=requestAnimationFrame(step);
  };
  gate.addEventListener('descend',()=>shatter(gate.querySelector('#gFrame')));
})();

/* ---------- I: brama ---------- */
FONTS().then(()=>{
  // komputer: pętla okręgów na całe okno (bez czarnych pasów po bokach szerokich ekranów); telefon: w bramie 9:16
  const gate=$('gate'), c=$('tun'), x=c.getContext('2d'); let W=GW, H=GH;
  const fit=()=>{ W=GP?GW:Math.max(GW,Math.round(GH*innerWidth/Math.max(1,innerHeight))); H=GH; c.width=W; c.height=H; if(typeof off!=='undefined'){ off.width=W; off.height=H; } };
  fit();
  const tints={red:{hi:[150,18,30],lo:[70,8,16]}}; const tint='red';
  const T={
    pl:{warn:'UWAGA: MIGAJĄCE OBRAZY · DŹWIĘK',enter:'[ ZEJDŹ W GŁĄB ]',calm:'» zejdź ostrożnie (tryb spokojny)',title:'Sztuka z chaosu',intro:'Ekspresja w tym, co nas otacza. A także w tym, czego nie rozumiemy.',s1:'muzyka · obraz · odsłony',s2:'projekty · doświadczenie · CV',mach:'Maszynologia'},
    en:{warn:'WARNING: FLASHING IMAGES · SOUND',enter:'[ DESCEND ]',calm:'» descend gently (calm mode)',title:'Art out of chaos',intro:'Expression in what surrounds us. And in what we do not understand.',s1:'music · image · unveilings',s2:'projects · experience · CV',mach:'Machinology'}
  };
  let lang=opts.lang;
  const frame=()=>{ const s=T[lang]; const w=40; const ctr=(str,ch=' ')=>{const n=[...str.replace(/\uFE0E/g,'')].length; const l=Math.floor((w-n)/2); return ch.repeat(Math.max(0,l))+str+ch.repeat(Math.max(0,w-n-l));};
    $('gFrame').innerHTML=
      `<button type="button" class="enter" id="gEnter">${s.enter}<span class="cur"></span></button>\n`+
      `<button type="button" class="calm" id="gCalm" hidden>${s.calm}</button>`+
      `<span class="gl gb"><span class="w">D. K.</span><span class="gx"></span><span class="yr">2026</span></span>`;
    gateOuter($('gFrame'));
    $('gEnter').onclick=()=>go(false); $('gCalm').onclick=()=>go(true);
    $('gTitle').textContent=s.title; $('gIntro').textContent=s.intro; $('gS1').textContent=s.s1; $('gS2').textContent=s.s2; $('gMach').textContent=s.mach; };
  // język zmienia wspólny przełącznik w rogu (LangKeys)
  // zmiana języka: stary napis rozsypuje się w bloki i rozkodowuje w nowy (jak zejście w bramie); na końcu ramka przycisków dopasowuje się do nowej szerokości
  let lt=0;
  const onLang=e=>{ if(!gate.isConnected){ removeEventListener('krzyk-lang',onLang); return; } if(e.detail===lang) return; lang=e.detail;
    const s=T[lang], calmHidden=!$('gCalm')||$('gCalm').hidden;
    import('./xlate').then(({decodeSwap})=>{
      const me=++lt; let n=0;
      Promise.all([['gEnter',s.enter],['gCalm',s.calm],['gTitle',s.title],['gIntro',s.intro],['gS1',s.s1],['gS2',s.s2],['gMach',s.mach]].map(([id,t])=>$(id)?decodeSwap($(id),t,{delay:n++*60}):0))
        .then(()=>{ if(me!==lt||!gate.isConnected) return; frame(); if($('gCalm')) $('gCalm').hidden=calmHidden; }); }); }; addEventListener('krzyk-lang',onLang);
  frame(); import('./gatecards');     // moduł kart pobiera się z góry, żeby wyłanianie ruszyło bez opóźnienia po zejściu
  // wybór drogi: wybrana karta się spala (ogień od dołu, piksele żarzą się i odlatują jako popiół), druga gaśnie w cieniu, potem z góry leci kurtyna sigili w kolorze działu (veil.js)
  let picked=false;
  gate.querySelectorAll('.path').forEach((b,i)=>b.addEventListener('click',()=>{ if(picked||!gate.querySelector('.paths.ready')&&!RM) return; picked=true;
    gate.querySelectorAll('.path').forEach(o=>{ if(o!==b) o.classList.add('dim'); }); gate.querySelector('.paths').classList.add('locked');
    if(RM){ opts.onPath&&opts.onPath(i); return; }
    import('./gatecards').then(({burnCard})=>burnCard(b,()=>{ opts.onPath&&opts.onPath(i); })); }));
  // kursor blokowy w przycisku
  loop(gate,2,(t)=>{ const cu=gate.querySelector('.enter .cur'); if(cu) cu.style.visibility=(Math.floor(t/500)%2)?'hidden':'visible'; });
  let falling=false, calm=false, f0=0, phase=0, done=false;
  const go=(c0)=>{ calm=c0; falling=true; f0=-1; gate.classList.add('falling'); gate.dispatchEvent(new CustomEvent('descend',{detail:{calm:c0}})); };
  const build=()=>{ gate.querySelectorAll('[data-build]').forEach(el=>{ const full=el.textContent; const r=[...full].map(()=>Math.random()); let k=0;
    const iv=setInterval(()=>{ k+=.12; el.textContent=[...full].map((ch,i)=> ch===' '?' ': (k>r[i]+.5? ch : (k>r[i] ? '░▒▓'[Math.floor((k-r[i])*6)%3] : ' '))).join(''); if(k>1.6){ clearInterval(iv); el.textContent=full; } },40); }); };
  const rings=['═╪═╪═╪','░▒▓▒░ ','·÷·÷· ','╬═╬═╬═','○∙●∙○∙','≡ ≡ ≡ ','╤╧╤╧╤╧','♦·♦·♦·','┼─┼─┼─','▓░▓░▓░'], RC=rings.map(r=>[...r]);
  /* Kręgi obracają się bez przerwy, każdy z własną prędkością i kierunkiem (0,06–0,4 rad/s) i z własnym kątem startu.
     Liczba znaków w kręgu rośnie przez podwajanie (8, 16, 32…): znaki, które już są, zostają dokładnie na swoich miejscach, a nowe pojawiają się między nimi
     i płynnie rosną z przezroczystości, więc przy rozszerzaniu kręgu nic nie przeskakuje (wcześniej każda zmiana liczby znaków rozstawiała cały krąg od nowa).
     Znak ma stały wygląd od narodzin (zależy od poziomu podwojenia, w którym się pojawił). Rozmiar czcionki zmienia się płynnie przez skalę, nie skokami co piksel. */
  const hr=i=>{ const v=Math.sin(i*12.9898+4.1)*43758.5453; return v-Math.floor(v); };
  const SPD=Array.from({length:16},(_,i)=>(i%2?1:-1)*(.06+.34*hr(i))), PH0=Array.from({length:16},(_,i)=>hr(i+40)*Math.PI*2);
  const ss=v=>{ v=clamp(v,0,1); return v*v*(3-2*v); };
  var off=document.createElement('canvas'); off.width=W; off.height=H; const ox=off.getContext('2d',{willReadFrequently:true});
  if(!GP){ let rt; addEventListener('resize',()=>{ clearTimeout(rt); rt=setTimeout(fit,120); },{passive:true}); }
  loop(gate,30,(t,dt)=>{
    if(falling && f0<0) f0=t;
    const dur=calm?2600:4200; const k=falling ? clamp((t-f0)/dur,0,1) : 0;
    const ease=k*k*(3-2*k);
    phase += dt/1000*(.018 + (falling ? (calm?.05:.12)*ease : 0));
    ox.setTransform(1,0,0,1,0,0); ox.globalAlpha=1; ox.fillStyle='#000'; ox.fillRect(0,0,W,H); ox.textAlign='center'; ox.textBaseline='middle'; ox.font='16px "Krzyk DOS"';
    const cx=W/2, cy=H/2, maxR=Math.hypot(W,H)*.55;
    for(let i=0;i<16;i++){
      const z=((i/16)+phase)%1; const R=6+Math.pow(z,2.2)*maxR; const fs=4+z*15, sc=fs/16;
      const chars=RC[i%RC.length], rot=SPD[i]*t/1000+PH0[i];
      const lv=Math.max(0,Math.log2(2*Math.PI*R/(fs*.7)/8)+.4), lk=Math.floor(lv), nk=8*(1<<lk), born=lk>0?ss((lv-lk)/.3):1;   // lk: poziom podwojenia, born: przezroczystość nowych znaków
      const bright=Math.min(1,z*1.3)*(1-Math.max(0,z-.85)/.15);
      ox.fillStyle=`rgba(255,255,255,${bright})`;
      for(let j=0;j<nk;j++){
        const a=j/nk*Math.PI*2+rot, px=cx+Math.cos(a)*R, py=cy+Math.sin(a)*R*.92; if(px<-20||px>W+20||py<-20||py>H+20) continue;   // poza płótnem nie rysujemy
        const tz=j?Math.min(lk,31-Math.clz32(j&-j)):lk, jb=j>>tz, b=lk-tz;                                                         // tz: ile razy znak jest „starszy”; jb, b: poziom i numer narodzin
        ox.globalAlpha=(tz===0&&lk>0)?born:1;
        const ca=Math.cos(a+Math.PI/2)*sc, sa=Math.sin(a+Math.PI/2)*sc; ox.setTransform(ca,sa,-sa,ca,px,py); ox.fillText(chars[(jb*3+b*5)%chars.length],0,0);
      }
    }
    ox.setTransform(1,0,0,1,0,0); ox.globalAlpha=1;
    // gaśnięcie ditherem na końcu wejścia
    const fade = falling ? clamp((k-.7)/.3,0,1) : 0;
    const src=ox.getImageData(0,0,W,H).data, out=x.createImageData(W,H), o=out.data, tc=tints[tint];
    for(let yy=0;yy<H;yy++) for(let xx=0;xx<W;xx++){ const kk=(yy*W+xx)*4; const v=src[kk]/255*(1-fade); const th=bth(xx,yy);
      if(v>th){ const c2=v>.55?tc.hi:tc.lo; o[kk]=c2[0]; o[kk+1]=c2[1]; o[kk+2]=c2[2]; } o[kk+3]=255; }
    x.putImageData(out,0,0);
    if(falling && k>=1 && !done){ done=true; gate.classList.add('done'); build(); import('./gatecards').then(({riseCards})=>riseCards(gate)); }
  });
});
}
