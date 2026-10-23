import CardsNav from '@/components/CardsNav';
import { asset } from '@/lib/base';

export const metadata = { title: 'Krzyk — Zejście', description: 'Krzyk: muzyka, obraz, persony. Sztuka z chaosu.' };

// szkic działu: kolaż jako okładka i trzy pokoje (treść w budowie)
const ROOMS = [
  ['A1', 'muzyka · taśmy', 'Nagrania nocy, których nie dało się opowiedzieć słowami.'],
  ['A2', 'persony', 'Twarze, maski i odsłony.'],
  ['A3', 'kolaż · okładka', 'Wycinki, przedarcia i stemple.'],
];

export default function Krzyk() {
  return (
    <>
      <CardsNav current={1} />
      <main className="sec krzyk">
        <header className="k-hero">
          <img src={asset('/krzyk/kolaz.webp')} alt="Kolaż KRZYK: portrety, wycinki z taśmą i stemplowy napis KRZYK" width="1280" height="720" />
        </header>
        <section className="k-intro">
          <p className="k-lv dos">·÷·──── POZIOM −1 ────·÷·</p>
          <h1 className="k-title">Krzyk</h1>
          <p className="k-lede">Sztuka z chaosu. Ekspresja w tym, co nas otacza. A także w tym, czego nie rozumiemy.</p>
        </section>
        <section className="k-rooms" aria-label="Pokoje">
          {ROOMS.map(([code, name, txt]) => (
            <article className="k-room" key={code}>
              <span className="k-code dos">{code}</span>
              <h2>{name}</h2>
              <p>{txt}</p>
              <span className="k-wip dos">▓ w budowie</span>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
