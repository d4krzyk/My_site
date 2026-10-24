// silnik wizualny przeniesiony z planszy „Zejście”: dither Bayera, szum, pętla o stałej liczbie klatek, sigile
export const RM = typeof window!=='undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const rnd = (a=1,b) => b===undefined ? Math.random()*a : a+Math.random()*(b-a);
export const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
// czekamy na pikselowe kroje (tunel rysuje nimi znaki), ale najwyżej 1,5 s, żeby brama nigdy nie stała pusta
export const FONTS = () => Promise.race([Promise.all([document.fonts.load('16px "Krzyk DOS"'), document.fonts.load('16px "Alagard PL"')]).catch(()=>{}), new Promise(r=>setTimeout(r,1500))]);
/* widoczność + pętla o stałej liczbie klatek */
const vis = new WeakMap();
const io = new IntersectionObserver(es => es.forEach(e => vis.set(e.target, e.isIntersecting)), {rootMargin:'150px'});
export function loop(el, fps, fn){
  // element obserwujemy raz: ponowne observe() nie wywołuje już zdarzenia, więc reset flagi zatrzymałby pętle na zawsze
  if(!vis.has(el)){ vis.set(el,false); io.observe(el); }
  let acc=0, t=0, prev=performance.now();
  (function f(now){ if(!el.isConnected){ io.unobserve(el); return; } requestAnimationFrame(f); const dt=Math.min(100,now-prev); prev=now; if(!vis.get(el)) return;
    acc+=dt; t+=dt; const step=1000/fps; if(acc<step) return; const d=acc; acc%=step; fn(t,d); })(prev);
}

/* szum */
export function makeNoise(seed){
  const perm=[...Array(256).keys()]; let s=seed||1; const r=()=>(s=(s*16807)%2147483647)/2147483647;
  for(let i=255;i>0;i--){const j=Math.floor(r()*(i+1)); [perm[i],perm[j]]=[perm[j],perm[i]];}
  const p=new Uint8Array(512); for(let i=0;i<512;i++) p[i]=perm[i&255];
  const g=(h,x,y)=>((h&1)?x:-x)+((h&2)?y:-y); const fd=t=>t*t*t*(t*(t*6-15)+10); const l=(t,a,b)=>a+t*(b-a);
  return (x,y)=>{const X=Math.floor(x)&255,Y=Math.floor(y)&255; x-=Math.floor(x); y-=Math.floor(y); const u=fd(x),v=fd(y), a=p[X]+Y, b=p[X+1]+Y;
    return l(v,l(u,g(p[a],x,y),g(p[b],x-1,y)),l(u,g(p[a+1],x,y-1),g(p[b+1],x-1,y-1)));};
}
export const N=makeNoise(7);
export const fbm=(x,y,o=5)=>{let v=0,a=.5,f=1; for(let i=0;i<o;i++){v+=a*N(x*f,y*f); f*=2; a*=.5;} return v;};
export const BAYER=[0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21].map(v=>(v+.5)/64);
export const bth=(x,y)=>BAYER[(y&7)*8+(x&7)];


export function makeGlyph(){ const n=[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1],[0,2],[1,2],[2,2]]; const st=[]; const k=3+Math.floor(Math.random()*3);
  for(let i=0;i<k;i++){const a=n[Math.floor(Math.random()*9)], b=n[Math.floor(Math.random()*9)]; if(a!==b) st.push([a,b]);}
  return {st, ring:Math.random()<.22, dot:Math.random()<.4?n[Math.floor(Math.random()*9)]:null}; }
export function drawGlyph(g,x,gx,gy,s){ x.beginPath(); g.st.forEach(([a,b])=>{x.moveTo(gx+a[0]*s/2,gy+a[1]*s/2); x.lineTo(gx+b[0]*s/2,gy+b[1]*s/2);});
  if(g.ring){x.moveTo(gx+s*.5+s*.3,gy+s*.5); x.arc(gx+s*.5,gy+s*.5,s*.3,0,Math.PI*2);} x.stroke(); if(g.dot) x.fillRect(gx+g.dot[0]*s/2-1,gy+g.dot[1]*s/2-1,2,2); }

export function oneBit(ctx,w,h,col,opts={}){
  const id=ctx.getImageData(0,0,w,h), d=id.data, bias=opts.bias||0;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const k=(y*w+x)*4; const v=(d[k]+d[k+1]+d[k+2])/765*(d[k+3]/255);
    if(v+bias>bth(x,y)){ d[k]=col[0]; d[k+1]=col[1]; d[k+2]=col[2]; d[k+3]=255; } else { d[k]=d[k+1]=d[k+2]=0; d[k+3]=opts.keepBg?255:0; } }
  ctx.putImageData(id,0,0);
}
