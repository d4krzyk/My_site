'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CardsNav from '@/components/CardsNav';
import { asset } from '@/lib/base';

const HREF = { brama: '/', krzyk: '/krzyk/', maszynologia: '/maszynologia/' };

// Maszynologia: cracktro w tle, plik NFO (IT CV) w czerwonej oprawie jak przy bramie, pod nim terminal z wirtualnymi plikami
export default function Maszyn() {
  const ref = useRef(null);
  const router = useRouter();
  useEffect(() => {
    let alive = true;
    import('@/engine/maszyn').then(({ initMaszyn }) => {
      if (alive && ref.current) initMaszyn(ref.current, { assets: { ornL: asset('/maszyn/ornL.png'), ornR: asset('/maszyn/ornR.png') } });
    });
    import('@/engine/redframe').then(({ redFrame }) => { if (alive && ref.current) ref.current.querySelectorAll('.rf').forEach(redFrame); });
    let offPager = null;
    import('@/engine/klatki').then(({ initPager }) => { if (alive && ref.current) offPager = initPager(ref.current); });   // przewijanie wierszami jak `more`
    import('@/engine/term').then(({ initTerm }) => {
      if (alive && ref.current) initTerm(ref.current.querySelector('.term'), { go: k => router.push(HREF[k] || '/') });
    });
    return () => { alive = false; if (offPager) offPager(); };
  }, [router]);
  return (
    <>
      <CardsNav current={2} />
      <main className="sec maszyn" ref={ref}>
        <h1 className="sr-only">Maszynologia [IT]</h1>
        <div className="m-prompt dos" aria-hidden="true">C:\MASZYNOLOGIA&gt; <span className="m-cur" /></div>
        <div className="cracktro" aria-hidden="true"><canvas id="demo" width="320" height="200" /></div>
        <div className="m-panel rf">
          <div className="nfo-wrap">
            <canvas id="ornL" className="orn-img" aria-hidden="true" />
            <div className="nfo-mid">
              <div className="nfo-title" aria-hidden="true">Maszynologia</div>
              <div className="nfo-sub dos">[ IT ] · RELEASE INFO · REV.2026</div>
              <pre id="nfo" className="selectable" />
            </div>
            <canvas id="ornR" className="orn-img" aria-hidden="true" />
          </div>
        </div>
        <section className="m-panel rf term" aria-label="Terminal">
          <div className="t-head dos"><span className="t-path" /><span className="t-desc" /></div>
          <div className="t-out dos selectable" role="log" aria-live="polite" />
          <form className="t-line">
            <label className="t-ps dos" htmlFor="t-in" />
            <input id="t-in" className="t-in dos" type="text" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck="false" enterKeyHint="send" aria-label="polecenie" />
          </form>
        </section>
      </main>
    </>
  );
}
