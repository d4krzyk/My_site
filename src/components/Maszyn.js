'use client';
import { useEffect, useRef } from 'react';
import CardsNav from '@/components/CardsNav';
import { asset } from '@/lib/base';

// Maszynologia: cracktro (320×200, dekodowanie) i plik NFO z ornamentami; animacje z silnika przeniesionego z planszy
export default function Maszyn() {
  const ref = useRef(null);
  useEffect(() => {
    let alive = true;
    import('@/engine/maszyn').then(({ initMaszyn }) => {
      if (alive && ref.current) initMaszyn(ref.current, { assets: { ornL: asset('/maszyn/ornL.png'), ornR: asset('/maszyn/ornR.png') } });
    });
    return () => { alive = false; };
  }, []);
  return (
    <>
      <CardsNav current={2} />
      <main className="sec maszyn" ref={ref}>
        <h1 className="sr-only">Maszynologia [IT]</h1>
        <div className="m-prompt dos" aria-hidden="true">C:\MASZYNOLOGIA&gt; <span className="m-cur" /></div>
        <div className="cracktro" aria-hidden="true"><canvas id="demo" width="320" height="200" /></div>
        <div className="nfo-wrap">
          <img id="ornL" alt="" draggable="false" />
          <div className="nfo-mid">
            <div className="nfo-title" aria-hidden="true">Maszynologia</div>
            <div className="nfo-sub dos">[ IT ] · RELEASE INFO · REV.2026</div>
            <pre id="nfo" className="selectable" />
          </div>
          <img id="ornR" alt="" draggable="false" />
        </div>
      </main>
    </>
  );
}
