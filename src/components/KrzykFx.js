'use client';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { asset } from '@/lib/base';
import { getLang, applyLangStatic } from '@/lib/lang';

// warstwy nad tłem działu Krzyk: hasło kolażu, stempel KRZYK, wersy w tle; animacje z engine/krzykfx
export function KrzykLayers() {
  return (
    <>
      <div className="k-lines" aria-hidden="true" />
      <canvas className="k-asm" aria-hidden="true" />
      <div className="k-safe" aria-hidden="true" />
      <div className="k-motto">
        <p data-t="" className="m1" data-en="art out of chaos.">sztuka z chaosu.</p>
        <p data-t="" className="m2" data-en="expression in what surrounds us.">ekspresja w tym, co nas otacza.</p>
      </div>
      <img className="k-stamp" src={asset('/krzyk/stamp.webp')} alt="KRZYK" draggable="false" />
    </>
  );
}

const TARGET = { walkman: 'k-muzyka', heads: 'k-persony', minidv: 'k-obraz', phone: 'k-kontakt' };

// uruchamia animacje i pole wyborów 3D; dzieci to znaczniki strony
export default function KrzykFx({ children }) {
  const ref = useRef(null);
  // język ustawiamy przed pierwszym rysowaniem (bez mignięcia polskiego tekstu), zanim animacje rozbiją napisy na litery
  useLayoutEffect(() => { const sec = ref.current.closest('.krzyk'); if (getLang() === 'en') applyLangStatic(sec, 'en'); else applyLangStatic(sec, 'pl'); }, []);
  useEffect(() => {
    let off = [], alive = true;
    const sec = ref.current.closest('.krzyk');
    const mu = sec.querySelector('#k-muzyka .mu-host');
    if (mu) import('@/engine/muzyka').then(({ initMuzyka }) => { if (alive) off.push(initMuzyka(mu, { bg: asset('/krzyk/bg-mid.webp'), tv: asset('/krzyk/3d/old_tv.glb'), vcr: asset('/krzyk/3d/vhs_player.glb'), tape: asset('/krzyk/3d/vhs_tape.glb'), remote: asset('/krzyk/3d/remote.glb') })); });
    import('@/engine/krzyklang').then(({ initKrzykLang }) => { if (alive) off.push(initKrzykLang(sec)); });
    import('@/engine/krzykfx').then(({ initKrzykFx }) => { if (alive) off.push(initKrzykFx(sec, { pieces: n => asset(`/krzyk/pieces/${n}`) })); });
    // przewijanie sekcjami: wariant B (skok blokowy); ?klatki=a — taśma filmowa
    import('@/engine/klatki').then(({ initKlatki }) => { if (alive) off.push(initKlatki(sec, { mode: new URLSearchParams(location.search).get('klatki') === 'a' ? 'film' : 'block' })); });
    import('@/engine/psx').then(({ initRooms, initPersonaStage, initPersonaTitles, personaActive }) => {
      if (!alive) return;
      const stage = sec.querySelector('.kp-stage canvas'); if (stage) off.push(initPersonaStage(stage, [...sec.querySelectorAll('.kp-part')]));
      off.push(initPersonaTitles([...sec.querySelectorAll('.kp-part')]));
      import('@/engine/persvoice').then(({ initPersonaVoices }) => { if (alive) off.push(initPersonaVoices([...sec.querySelectorAll('.kp-part')], personaActive)); });
      // instant: skok bez przewijania (gdy ekran zasłania animacja przejścia, np. słuchawki albo portal person)
      const go = (kind, instant) => { const el = document.getElementById(TARGET[kind]); if (!el) return;
        el.scrollIntoView({ behavior: instant || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + TARGET[kind]); };
      off.push(initRooms(ref.current, { go, assets: {
        walkman: asset('/krzyk/3d/walkman.glb'), minidv: asset('/krzyk/3d/minidv.glb'), hc90e: asset('/krzyk/3d/hc90e.glb'),
        phone: asset('/krzyk/3d/phone.glb'), lcd: asset('/krzyk/lcd.webp') } }));
    });
    return () => { alive = false; off.forEach(f => f && f()); };
  }, []);
  return <div ref={ref} className="k-fx">{children}</div>;
}
