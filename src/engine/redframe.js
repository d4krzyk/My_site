// czerwona wersja zewnętrznej oprawy bramy (narożniki z zawijasem, romb ze skrzydłami, krzyżyk w pnączach, ciemna płyta z fakturą) dla ramek Maszynologii
import { bth } from './core';

export function redFrame(pre){
  if(!pre) return;
  const PX=2, COL={'#':'#e3313c',s:'#a8161f',d:'#6e0d14',D:'#3c070b',w:'#ffd9d4',c:'#ff5a3c',t:'#8c1018',T:'#4a080c'};
  const old=pre.querySelector('canvas.rframe'); if(old) old.remove();
  const cv=document.createElement('canvas'); cv.className='rframe'; pre.prepend(cv);
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
      if(tx>th+.18){ D[k]=44; D[k+1]=9; D[k+2]=13; } D[k+3]=242; }
    x.clearRect(0,0,W,H); x.putImageData(im,0,0);
    for(const [k,c] of M){ const [a,b]=k.split(',').map(Number); x.fillStyle=COL[c]; x.fillRect(a,b,1,1); }
  }
  draw();
  if(window.ResizeObserver){ let t; new ResizeObserver(()=>{ clearTimeout(t); t=setTimeout(()=>{ if(pre.querySelector('canvas.rframe')===cv) draw(); },80); }).observe(pre); }
}

