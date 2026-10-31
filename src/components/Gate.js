'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { asset } from '@/lib/base';
import { getLang, setLang } from '@/lib/lang';

// zasoby sztandarów: wersje pionowe (desktop) i poziome do obrotu (telefon) + zakres ryciny w pikselach pasa
const GATE_ASSETS = {
  sun3: asset('/gate/sun.png'), moon3: asset('/gate/moon.png'),
  sun3p: asset('/gate/sun-p.png'), moon3p: asset('/gate/moon-p.png'),
  sunArt: [166, 137], moonArt: [159, 112], moonArtP: [179, 112],
};
const PATHS = ['/krzyk/', '/maszynologia/'];

export default function Gate() {
  const ref = useRef(null);
  const router = useRouter();
  useEffect(() => {
    let alive = true;
    import('@/engine/gate').then(({ initGate }) => {
      if (alive && ref.current) { const lang = getLang(); document.documentElement.lang = lang; initGate(ref.current, { assets: GATE_ASSETS, lang, setLang, onPath: i => import('@/engine/veil').then(({ veilGo }) => veilGo(PATHS[i], ['krzyk', 'maszynologia'][i], h => router.push(h))) }); }
    });
    return () => { alive = false; };          // pętle animacji same się kończą, gdy brama zniknie z dokumentu
  }, [router]);

  return (
    <main className="gate-page" ref={ref}>
      <div className="gate" id="gate">
        <canvas className="tun" id="tun" width="480" height="270" />
        <canvas className="tab l" id="sunT" aria-hidden="true" />
        <canvas className="tab r" id="moonT" aria-hidden="true" />
        <div className="layer entry"><div className="frame dos" id="gFrame" /></div>
        <div className="layer intro">
          <div>
            <h1 className="h3" id="gTitle" data-build="">Sztuka z chaosu</h1>
            <p id="gIntro" data-build="">Ekspresja w tym, co nas otacza. A także w tym, czego nie rozumiemy.</p>
            <nav className="paths" aria-label="Działy">
              <button type="button" className="path" data-i="0"><span className="pcard"><img alt="" src={asset('/cards/face-krzyk.png')} draggable="false" /></span><span className="ptxt"><span className="nm">Krzyk <small>[ Art ]</small></span><span className="sub" id="gS1">muzyka · obraz · odsłony</span></span></button>
              <button type="button" className="path" data-i="1"><span className="pcard"><img alt="" src={asset('/cards/face-maszynologia.png')} draggable="false" /></span><span className="ptxt"><span className="nm"><span id="gMach">Maszynologia</span> <small>[ IT ]</small></span><span className="sub" id="gS2">projekty · doświadczenie · CV</span></span></button>
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
}
