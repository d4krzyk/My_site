# KRZYK: notatki projektu

Nie nazywaj projektu „Zejście” — nigdzie (teksty, nagłówki, tytuły, komentarze).

Portfolio Daniela (d4krzyk): Next.js (eksport statyczny) na GitHub Pages. Działy: Brama (strona główna), Krzyk, Maszynologia.
Tła i grafiki działu Krzyk powstają ze skryptów generujących (kolaż, tła, tektura); w repozytorium są gotowe pliki w `public/krzyk/`.

## Persony (dział Krzyk → „persony”)

Na stronie są pokazane jako teatralne maski w stylu PS1 (nie głowy).

1. **Lękowa** — boi się i dużo analizuje, overthinking, często mówi szybko i dużo, wiecznie przestraszona życiem.
   Estetyka: haunted, nawiedzona.
2. **Wyluzowana** — spokojna, nie przejmuje się życiem, cieszy się prostymi chwilami; bardzo energiczna, głośna,
   czasem zbyt impulsywna i nie przemyśla niektórych rzeczy; traci czas na głupotki, dużo goofy momentów.
   Estetyka: indie sleaze / hyperpop, chilled 2000s.
3. **Poważna** (biała maska, męski gotycki makijaż, bez aureoli; rusza się szarpnięciami jak manekin) — skupiona na rozwoju wewnętrznym, nie traci czasu na głupoty; posępna i zadziorna, patrzy z góry,
   obserwatorska; wysokie skupienie na duchowości i poczuciu połączenia ze sobą.
   Estetyka: gotycka, sakralna.

W polu wyborów są tylko trzy maski (bez ukrytej czwartej za nimi).

**Czwarta persona jest sekretem.** Ma być ukryta najgłębiej, niewidoczna przy pierwszym oglądaniu strony;
najwyżej rzadkie, ulotne skrawki (gdzie i jak — do ustalenia z autorem). Nie opisuj jej w tekstach strony, w repozytorium
ani w opisach commitów i PR-ów — szczegóły zna tylko autor.

## Kamera HC90E (przejście z kasety miniDV do sekcji Obraz)

Na ekranie LCD kamery jest na razie zastępcze zdjęcie (`public/krzyk/lcd.webp`). Gdy powstanie sekcja ze zdjęciami,
podmienić je na zdjęcie z tej sekcji. Na pionowych ekranach (telefon) animacja jest obrócona o 90°, a obraz na LCD ma format 9:16.

## Telefon → kontakt (przejście)

Klik w telefon: model wylatuje z karty, kamera najeżdża na ekran modelu, aż LCD wypełni okno (na telefonie szerokość). Na ekraniku 84×48
(Nokia 3310, `src/engine/nokia.js`): „HALO? / CZY TO...?", fala krzyku jak na oscyloskopie wycina z siebie KRZYK, potem zielony szum zalewa stronę
i odsłania sekcję kontaktu.

## Nazwy person (sekcja Krzyk → persony)

Nazwa aktywnej persony to niskorozdzielcza, miękka tekstura na wstążce z 8 wielokątów (`initPersonaTitles` w `src/engine/psx.js`): mapowanie afiniczne,
przyciąganie wierzchołków do pikseli, fala i skręt biegnące bez przerwy oraz smuga ruchu, wzór z dema PS1 z Euskal 2001. Przy wejściu słowo wynurza się
z ciemności jako pognieciona kreska i się prostuje, przy wyjściu zwija się i gaśnie. Zwykły `h3` zostaje w stronie (ukryty wizualnie), a przy ograniczeniu
animacji w systemie nagłówek jest zwykłym tekstem.

## Plan na przyszłość (ustalone z autorem, jeszcze niezrobione)

- **Kamera HC90E:** po powstaniu sekcji Obraz podmienić zdjęcie na LCD (zob. wyżej).
- **Przewijanie sekcjami (Krzyk, wariant B – skok blokowy):** sprawdzić na gładziku (Mac); przystanki pośrednie przy wysokim kolażu są już dodane (nie testowane na gładziku).
- **Release info (Maszynologia): zdjęcie autora pod CV.** Dodać pod CV zdjęcie autora w formie progowej, ditherowanej (czarno-czerwona, jakby w cieniu).
  Autor dośle zdjęcia; wtedy zaproponować warianty (np. próg + dither Bayera w czerni i krwi, z żarzącymi się oczami, rozpad w piksele przy odkodowaniu
  razem z resztą animacji wejścia). Używać tylko zdjęć dostarczonych przez autora i bez innych osób; zdjęcie ma być częścią animowanego odkodowania strony.
- **Maszynologia: podstrony projektów (po obronie magisterki).** Z czasem zrobić podstrony poszczególnych projektów autora z GitHuba, żeby lepiej pokazać,
  co robią (opis, zrzuty, linki). Na razie projekty są tylko jako klikalne linki do repozytoriów w Release info oraz pliki README w terminalu. Termin: po magisterce, bez pośpiechu.
- **Maszynologia: przejście przy otwieraniu projektu.** Po wejściu w projekt (np. `open <projekt>` w terminalu lub kliknięcie) ma się pokazać
  szyfr tekstowy 10 na 10 znaków, który odszyfrowuje się w kombinacji, wyświetlając kolor projektu. Przejście w stylu cyberpunkowej demosceny,
  spójne z resztą podstrony Maszynologii.
