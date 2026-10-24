import CardsNav from '@/components/CardsNav';
import { asset } from '@/lib/base';

export const metadata = { title: 'Krzyk — Zejście', description: 'Krzyk: muzyka, obraz, persony. Sztuka z chaosu.' };

// szkic działu: tło to kolaż rozpadający się ditherem w rozdartą kartkę, na której leży treść (treść pokojów w budowie)
const LOREM = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
];
const ROOMS = [
  ['A1', 'muzyka · taśmy', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.'],
  ['A2', 'persony', 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.'],
  ['A3', 'kolaż · okładka', 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.'],
];

export default function Krzyk() {
  const bg = n => `url(${asset(`/krzyk/bg-${n}.webp`)})`, bgp = n => `url(${asset(`/krzyk/bg-${n}-p.webp`)})`;
  return (
    <>
      <CardsNav current={1} />
      <main className="sec krzyk" style={{ '--bt': bg('top'), '--bm': bg('mid'), '--bb': bg('bot'), '--btp': bgp('top'), '--bmp': bgp('mid'), '--bbp': bgp('bot') }}>
        <div className="k-bgs" role="img" aria-label="Kolaż z napisem KRZYK, z którego schodzą w dół rozdarte paski zdjęć natury" />
        <div className="k-body">
          <section className="k-intro">
            <p className="k-lv dos">·÷·──── POZIOM −1 ────·÷·</p>
            <h1 className="k-title">Krzyk</h1>
            <p className="k-lede">Sztuka z chaosu. Ekspresja w tym, co nas otacza. A także w tym, czego nie rozumiemy.</p>
          </section>
          <section className="k-text">{LOREM.map((t, i) => <p key={i}>{t}</p>)}</section>
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
          <section className="k-text" style={{ marginTop: 40 }}>{LOREM.concat(LOREM).map((t, i) => <p key={i}>{t}</p>)}</section>
        </div>
        <div className="k-foot" aria-hidden="true" />
      </main>
    </>
  );
}
