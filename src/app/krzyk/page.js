import CardsNav from '@/components/CardsNav';
import KrzykFx, { KrzykLayers } from '@/components/KrzykFx';
import { asset } from '@/lib/base';

export const metadata = { title: 'Krzyk — KRZYK', description: 'Krzyk: muzyka, obraz, persony. Sztuka z chaosu.' };

// dział Krzyk: kolaż przechodzący w ciemne tła, pod nim od razu pole wyborów z modelami 3D, potem podrozdziały z ciemnej tektury (treść w budowie);
// pole wyborów i każdy podrozdział zajmują pełny ekran
// pole wyborów: model 3D, podpis, dopisek
// wersje angielskie (en) przełącza engine/krzyklang: nagłówki cofają się i piszą od nowa
const PICKS = [
  ['walkman', 'muzyka', 'klipy · taśmy · odtwarzacz', 'music', 'clips · tapes · player'],
  ['heads', 'persony', 'trzy maski, trzy nastroje', 'personas', 'three masks, three moods'],
  ['minidv', 'obraz', 'kaseta miniDV · aparat DSC-V1', 'image', 'miniDV tape · DSC-V1 camera'],
];
// persony: trzy części sekcji; maski lewitują u góry (scena 3D), przy części danej persony ona wychyla się do przodu
const PERSONY = [
  ['Anxtan', 'haunted · nawiedzona', 'Boi się i analizuje wszystko po kilka razy. Mówi szybko i dużo, wiecznie przestraszona życiem.',
    'haunted · possessed', 'Afraid of everything and analyzes it all several times over. Talks fast and a lot, forever frightened by life.'],
  ['Nugis', 'indie sleaze · hyperpop · chilled 2000s', 'Spokojna, cieszy się prostymi chwilami. Energiczna i głośna, czasem zbyt impulsywna; dużo głupotek i goofy momentów.',
    'indie sleaze · hyperpop · chilled 2000s', 'Calm, enjoys simple moments. Energetic and loud, sometimes too impulsive; plenty of silliness and goofy moments.'],
  ['Stoir', 'gotycka · sakralna', 'Skupiona na rozwoju wewnętrznym, nie traci czasu na głupoty. Posępna i zadziorna, patrzy z góry i obserwuje; szuka połączenia ze sobą.',
    'gothic · sacral', 'Focused on inner growth, wastes no time on nonsense. Gloomy and combative, looks down and observes; seeks a connection with the self.'],
];
// podrozdziały (treść później)
const SUBS = [
  ['k-muzyka', 'A1', 'muzyka · taśmy', 'Tu będą klipy w odtwarzaczu.', 'music · tapes', 'Clips will play here, in the player.'],
  ['k-persony', 'A2', 'persony', '', 'personas', ''],
  ['k-obraz', 'A3', 'obraz · DSC-V1', 'Tu będzie aparat Sony DSC-V1 do przeglądania zdjęć.', 'image · DSC-V1', 'A Sony DSC-V1 camera for browsing photos will live here.'],
  ['k-kontakt', 'A4', 'kontakt', 'Tu będzie kontakt.', 'contact', 'Contact details will go here.'],
];

export default function Krzyk() {
  const bg = n => `url(${asset(`/krzyk/bg-${n}.webp`)})`, bgp = n => `url(${asset(`/krzyk/bg-${n}-p.webp`)})`, u = p => `url(${asset(p)})`;
  return (
    <>
      <CardsNav current={1} />
      <main className="sec krzyk" style={{ '--bt': bg('top'), '--bm': bg('mid'), '--bb': bg('bot'), '--btp': bgp('top'), '--bmp': bgp('mid'), '--bbp': bgp('bot'),
        '--dust-m': u('/krzyk/dust-motto.png'), '--dust-l': u('/krzyk/dust-lines.png'), '--board': u('/krzyk/board.webp'),
        '--board-t': u('/krzyk/board-top.webp'), '--board-b': u('/krzyk/board-bot.webp') }}>
        <div className="k-bgs" role="img" aria-label="Kolaż z napisem KRZYK, przycięty nierówno, przechodzący w ciemne zdjęcia natury" data-en-aria="Collage with the word KRZYK, cut unevenly, fading into dark nature photographs" />
        <KrzykLayers />
        <div className="k-body">
          <KrzykFx>
            <h1 className="sr-only">Krzyk</h1>
            <nav className="k-choose" aria-label="Podrozdziały" data-en-aria="Subsections">
              <div className="k-trio">
                {PICKS.map(([k, t, s, te, se], i) => (
                  <button type="button" className="k-pick" data-room={k} key={k} style={{ '--plate': u(`/krzyk/plate-${i}.webp`) }} aria-label={`${t}: ${s}`} data-en-aria={`${te}: ${se}`}>
                    <canvas />
                    <span className="k-pick-t" data-type="" data-seed={10 + i} data-en={te}>{t}</span>
                    <span className="k-pick-s dos" data-en={se}>{s}</span>
                  </button>
                ))}
              </div>
              <button type="button" className="k-pick k-pick-phone" data-room="phone" style={{ '--plate': u('/krzyk/plate-3.webp') }} aria-label="kontakt" data-en-aria="contact">
                <canvas />
                <span className="k-pick-t" data-type="" data-seed="14" data-en="contact">kontakt</span>
                <span className="k-pick-s dos" data-en="call · write">zadzwoń · napisz</span>
              </button>
            </nav>
            {SUBS.map(([id, code, h, txt, he, txte]) => id === 'k-muzyka' ? (
              <section className="k-sub k-muzyka" id={id} key={id}>
                <span className="k-code dos">{code}</span>
                <h2 className="sr-only" data-en={he}>{h}</h2>
                {/* pokój z telewizorem w zinowej wyrwie (engine/muzyka): klik w kasetę, magnetowid, pilot albo ekran; tabliczka krzywo naklejona w rogu */}
                <div className="mu-host">
                  <div className="mu-plq" aria-hidden="true"><i style={{ backgroundImage: `url(${asset('/krzyk/plate-0.webp')})` }} /><u /><s /><b data-en="music">muzyka</b></div>
                </div>
              </section>
            ) : id === 'k-persony' ? (
              <section className="k-sub k-persony" id={id} key={id}>
                <span className="k-code dos">{code}</span>
                <h2 data-type="" data-seed={code.charCodeAt(1)} data-en={he}>{h}</h2>
                <div className="kp-stage" aria-hidden="true"><div className="kp-stage-in"><canvas /></div></div>
                {PERSONY.map(([n, tag, d, tage, de], i) => (
                  <div className="kp-part" data-p={i} data-name={n} key={n}>
                    <h3 data-type="" data-seed={30 + i}>{n}</h3>
                    <p className="kp-tag dos" data-en={tage}>{tag}</p>
                    <p data-en={de}>{d}</p>
                  </div>
                ))}
                <p className="k-wip dos" data-en="▓ under construction">▓ w budowie</p>
              </section>
            ) : (
              <section className="k-sub" id={id} key={id}>
                <span className="k-code dos">{code}</span>
                <h2 data-type="" data-seed={code.charCodeAt(1)} data-en={he}>{h}</h2>
                <p data-en={txte}>{txt}</p>
                <p className="k-wip dos" data-en="▓ under construction">▓ w budowie</p>
              </section>
            ))}
          </KrzykFx>
        </div>
        <div className="k-foot" aria-hidden="true" />
      </main>
    </>
  );
}
