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

## Plan na przyszłość (ustalone z autorem, jeszcze niezrobione)

- **Kontakt (telefon): animacja wejścia.** Najazd na telefon; telefon dzwoni, z jego przycisków bije światło. Wyskakuje pikselowy
  dymek z liniami od telefonu, jak od kogoś, kto krzyczy do słuchawki, z napisem „HALO? CZY TO KRZYK?!”. Odpowiedzią są trzy kropki
  („...”), które dodają grozy. Potem ditherowy przeskok do sekcji kontaktu (jak w przejściach walkman → muzyka i persony). Na telefonie ta sama animacja.
- **Kamera HC90E:** po powstaniu sekcji Obraz podmienić zdjęcie na LCD (zob. wyżej).
- **Przewijanie sekcjami (Krzyk, wariant B – skok blokowy):** sprawdzić na gładziku (Mac); przystanki pośrednie przy wysokim kolażu są już dodane (nie testowane na gładziku).
- **Generator sigili (`/sigen/`): styl suwaków i pasków.** Zmienić wygląd pasków (suwaki gęstości i grubości, panel) na bardziej imersyjny,
  w stylistyce pixel haunted (np. pikselowe, ditherowane suwaki w kolorach krwi i kości słoniowej, nawiedzony klimat zamiast domyślnych kontrolek).
- **Release info (Maszynologia): zdjęcie autora pod CV.** Dodać pod CV zdjęcie autora w formie progowej, ditherowanej (czarno-czerwona, jakby w cieniu).
  Autor dośle zdjęcia; wtedy zaproponować warianty (np. próg + dither Bayera w czerni i krwi, z żarzącymi się oczami, rozpad w piksele przy odkodowaniu
  razem z resztą animacji wejścia). Używać tylko zdjęć dostarczonych przez autora i bez innych osób; zdjęcie ma być częścią animowanego odkodowania strony.
- **Maszynologia: animacja tekstu przy przewijaniu.** Linijki tekstu Release info mają się przy przewijaniu w dół rozszyfrowywać od dołu ekranu
  (budować znak po znaku, jak przy wczytaniu), a przy dalszym zjeżdżaniu lub przewijaniu w górę szyfrować się z powrotem od góry. Teraz tego nie ma:
  rozkodowanie odbywa się tylko raz, przy wejściu na stronę.
- **Maszynologia: podstrony projektów (po obronie magisterki).** Z czasem zrobić podstrony poszczególnych projektów autora z GitHuba, żeby lepiej pokazać,
  co robią (opis, zrzuty, linki). Na razie projekty są tylko jako klikalne linki do repozytoriów w Release info oraz pliki README w terminalu. Termin: po magisterce, bez pośpiechu.
- **Maszynologia: przejście przy otwieraniu projektu.** Po wejściu w projekt (np. `open <projekt>` w terminalu lub kliknięcie) ma się pokazać
  szyfr tekstowy 10 na 10 znaków, który odszyfrowuje się w kombinacji, wyświetlając kolor projektu. Przejście w stylu cyberpunkowej demosceny,
  spójne z resztą podstrony Maszynologii.
