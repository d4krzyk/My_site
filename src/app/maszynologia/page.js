import CardsNav from '@/components/CardsNav';

export const metadata = { title: 'Maszynologia — Zejście', description: 'Maszynologia: projekty, doświadczenie, CV, kontakt.' };

// szkic działu w stylu pliku NFO: ramka ASCII, sekcje z kodami (treść w budowie)
const NFO = String.raw`
 ╔════════════════════════════════════════════════╗
 ║   -=-  M A S Z Y N O L O G I A   [ IT ]  -=-   ║
 ╟────────────────────────────────────────────────╢
 ║   wskrzeszanie maszyn . zaklinanie fal         ║
 ║   POZIOM -2                     REV.2026       ║
 ╚════════════════════════════════════════════════╝`;

const SECTIONS = [
  ['B1', 'projekty', 'Rzeczy zbudowane, naprawione i przywrócone do życia.'],
  ['B2', 'doświadczenie · CV', 'Gdzie i z czym pracowałem.'],
  ['B3', 'kontakt', 'Jak się odezwać.'],
];

export default function Maszynologia() {
  return (
    <>
      <CardsNav current={2} />
      <main className="sec maszyn">
        <h1 className="sr-only">Maszynologia</h1>
        <pre className="nfo dos" aria-hidden="true">{NFO}</pre>
        <section className="m-list" aria-label="Sekcje">
          {SECTIONS.map(([code, name, txt]) => (
            <article className="m-row" key={code}>
              <span className="m-code dos">[{code}]</span>
              <div>
                <h2 className="dos">{name}</h2>
                <p>{txt}</p>
              </div>
              <span className="m-wip dos">░▒▓ w budowie</span>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
