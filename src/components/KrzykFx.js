'use client';
import { useEffect, useRef } from 'react';
import { asset } from '@/lib/base';

// warstwy nad tłem działu Krzyk: hasło kolażu, stempel KRZYK, wersy w tle; animacje z engine/krzykfx
export function KrzykLayers() {
  return (
    <>
      <div className="k-lines" aria-hidden="true" />
      <canvas className="k-asm" aria-hidden="true" />
      <div className="k-safe" aria-hidden="true" />
      <div className="k-motto">
        <p data-t="" className="m1">sztuka z chaosu.</p>
        <p data-t="" className="m2">ekspresja w tym, co nas otacza.</p>
      </div>
      <img className="k-stamp" src={asset('/krzyk/stamp.webp')} alt="KRZYK" draggable="false" />
    </>
  );
}

const TARGET = { walkman: 'k-muzyka', heads: 'k-persony', minidv: 'k-obraz', phone: 'k-kontakt' };

// uruchamia animacje i pole wyborów 3D; dzieci to znaczniki strony
export default function KrzykFx({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    let off = [], alive = true;
    const sec = ref.current.closest('.krzyk');
    import('@/engine/krzykfx').then(({ initKrzykFx }) => { if (alive) off.push(initKrzykFx(sec, { pieces: n => asset(`/krzyk/pieces/${n}`) })); });
    // przewijanie sekcjami: wariant A (taśma) domyślnie, ?klatki=b — wariant B (skok blokowy)
    import('@/engine/klatki').then(({ initKlatki }) => { if (alive) off.push(initKlatki(sec, { mode: new URLSearchParams(location.search).get('klatki') === 'b' ? 'block' : 'film' })); });
    import('@/engine/psx').then(({ initRooms }) => {
      if (!alive) return;
      const go = kind => { const el = document.getElementById(TARGET[kind]); if (!el) return;
        el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + TARGET[kind]); };
      off.push(initRooms(ref.current, { go, assets: {
        walkman: asset('/krzyk/3d/walkman.glb'), minidv: asset('/krzyk/3d/minidv.glb'), hc90e: asset('/krzyk/3d/hc90e.glb'),
        phone: asset('/krzyk/3d/phone.glb'), lcd: asset('/krzyk/lcd.webp') } }));
    });
    return () => { alive = false; off.forEach(f => f && f()); };
  }, []);
  return <div ref={ref} className="k-fx">{children}</div>;
}
