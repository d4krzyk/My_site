import CardsNav from '@/components/CardsNav';
import KrzykFx, { KrzykLayers } from '@/components/KrzykFx';
import { asset } from '@/lib/base';

export const metadata = { title: 'Krzyk — KRZYK', description: 'Krzyk: muzyka, obraz, persony. Sztuka z chaosu.' };

// dział Krzyk: kolaż przechodzący w ciemne tła, pod nim od razu pole wyborów z modelami 3D, potem podrozdziały z ciemnej tektury (treść w budowie);
// pole wyborów i każdy podrozdział zajmują pełny ekran
// pole wyborów: model 3D, podpis, dopisek
const PICKS = [
  ['walkman', 'muzyka', 'klipy · taśmy · odtwarzacz'],
  ['heads', 'persony', 'trzy maski, trzy nastroje'],
  ['minidv', 'obraz', 'kaseta miniDV · aparat DSC-V1'],
];
// persony: trzy części sekcji; maski lewitują u góry (scena 3D), przy części danej persony ona wychyla się do przodu
const PERSONY = [
  ['Anxtan', 'haunted · nawiedzona', 'Boi się i analizuje wszystko po kilka razy. Mówi szybko i dużo, wiecznie przestraszona życiem.'],
  ['Nugis', 'indie sleaze · hyperpop · chilled 2000s', 'Spokojna, cieszy się prostymi chwilami. Energiczna i głośna, czasem zbyt impulsywna; dużo głupotek i goofy momentów.'],
  ['Stoir', 'gotycka · sakralna', 'Skupiona na rozwoju wewnętrznym, nie traci czasu na głupoty. Posępna i zadziorna, patrzy z góry i obserwuje; szuka połączenia ze sobą.'],
];
// podrozdziały (treść później)
const SUBS = [
  ['k-muzyka', 'A1', 'muzyka · taśmy', 'Tu będą klipy w odtwarzaczu.'],
  ['k-persony', 'A2', 'persony', 'Tu zamieszkają trzy persony: Anxtan, Nugis i Stoir.'],
  ['k-obraz', 'A3', 'obraz · DSC-V1', 'Tu będzie aparat Sony DSC-V1 do przeglądania zdjęć.'],
  ['k-kontakt', 'A4', 'kontakt', 'Tu będzie kontakt.'],
];

export default function Krzyk() {
  const bg = n => `url(${asset(`/krzyk/bg-${n}.webp`)})`, bgp = n => `url(${asset(`/krzyk/bg-${n}-p.webp`)})`, u = p => `url(${asset(p)})`;
  return (
    <>
      <CardsNav current={1} />
      <main className="sec krzyk" style={{ '--bt': bg('top'), '--bm': bg('mid'), '--bb': bg('bot'), '--btp': bgp('top'), '--bmp': bgp('mid'), '--bbp': bgp('bot'),
        '--dust-m': u('/krzyk/dust-motto.png'), '--dust-l': u('/krzyk/dust-lines.png'), '--board': u('/krzyk/board.webp'),
        '--board-t': u('/krzyk/board-top.webp'), '--board-b': u('/krzyk/board-bot.webp') }}>
        <div className="k-bgs" role="img" aria-label="Kolaż z napisem KRZYK, przycięty nierówno, przechodzący w ciemne zdjęcia natury" />
        <KrzykLayers />
        <div className="k-body">
          <KrzykFx>
            <h1 className="sr-only">Krzyk</h1>
            <nav className="k-choose" aria-label="Podrozdziały">
              <p className="k-choose-h dos" data-type="" data-seed="3">·÷·── wybierz ──·÷·</p>
              <div className="k-trio">
                {PICKS.map(([k, t, s], i) => (
                  <button type="button" className="k-pick" data-room={k} key={k} style={{ '--plate': u(`/krzyk/plate-${i}.webp`) }} aria-label={`${t}: ${s}`}>
                    <canvas />
                    <span className="k-pick-t" data-type="" data-seed={10 + i}>{t}</span>
                    <span className="k-pick-s dos">{s}</span>
                  </button>
                ))}
              </div>
              <button type="button" className="k-pick k-pick-phone" data-room="phone" style={{ '--plate': u('/krzyk/plate-3.webp') }} aria-label="kontakt">
                <canvas />
                <span className="k-pick-t" data-type="" data-seed="14">kontakt</span>
                <span className="k-pick-s dos">zadzwoń · napisz</span>
              </button>
            </nav>
            {SUBS.map(([id, code, h, txt]) => id === 'k-persony' ? (
              <section className="k-sub k-persony" id={id} key={id}>
                <span className="k-code dos">{code}</span>
                <h2 data-type="" data-seed={code.charCodeAt(1)}>{h}</h2>
                <div className="kp-stage" aria-hidden="true"><canvas /></div>
                {PERSONY.map(([n, tag, d], i) => (
                  <div className="kp-part" data-p={i} data-name={n} key={n}>
                    <h3 data-type="" data-seed={30 + i}>{n}</h3>
                    <p className="kp-tag dos">{tag}</p>
                    <p>{d}</p>
                  </div>
                ))}
                <p className="k-wip dos">▓ w budowie</p>
              </section>
            ) : (
              <section className="k-sub" id={id} key={id}>
                <span className="k-code dos">{code}</span>
                <h2 data-type="" data-seed={code.charCodeAt(1)}>{h}</h2>
                <p>{txt}</p>
                <p className="k-wip dos">▓ w budowie</p>
              </section>
            ))}
          </KrzykFx>
        </div>
        <div className="k-foot" aria-hidden="true" />
      </main>
    </>
  );
}
