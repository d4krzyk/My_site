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
- **Persony, sekcja: błędy sceny z maskami.** Przy powrocie na górę (przewijanie wstecz) kolejność części się psuje; czasem środkowa
  persona nie wychodzi na wprost, a pozostałe nie ciemnieją. Do naprawy: aktywną personę wybierać z położenia części względem środka
  ekranu przy każdym przewinięciu (a nie ze zdarzeń przecięcia), z wygładzonym przejściem.
- **Kamera HC90E:** po powstaniu sekcji Obraz podmienić zdjęcie na LCD (zob. wyżej).
- **Przewijanie sekcjami (Krzyk, wariant B – skok blokowy):** sprawdzić na gładziku (Mac) i ewentualnie dodać punkt zatrzymania w środku kolażu.
- **Generator sigili (`/sigen/`): styl suwaków i pasków.** Zmienić wygląd pasków (suwaki gęstości i grubości, panel) na bardziej imersyjny,
  w stylistyce pixel haunted (np. pikselowe, ditherowane suwaki w kolorach krwi i kości słoniowej, nawiedzony klimat zamiast domyślnych kontrolek).
- **Maszynologia na telefonie: znikają ramki.** W wersji na telefon ramki wokół paneli (Release info i terminal) nie są widoczne. Do sprawdzenia i naprawy
  (m.in. rysowanie ramki na wąskim ekranie i moment jej animacji po wejściu przez kurtynę).
- **Przełącznik PL/EN na telefonie: lepsze umiejscowienie.** Na telefonie klawisze języka (prawy górny róg, obok kart) zasłaniają dużo treści.
  Znaleźć miejsce, które nic nie zasłania (np. wmontowane w układ strony albo chowane przy przewijaniu), zachowując spójność między bramą a podstronami.
- **Kurtyna przejścia przy kartach (telefon): rozciągnięte piksele.** Na telefonie przy przejściu z kart (kurtyna z sigili/pikseli) piksele
  się rozciągają: ich wysokość i szerokość nie zachowują proporcji. Do sprawdzenia w `src/engine/veil.js`. Prawdopodobna przyczyna (niepotwierdzona):
  płótno liczone z `innerHeight`, a rozciągane CSS-em do `100svh`; na telefonie te wartości różnią się przez pasek przeglądarki, więc piksele wychodzą
  prostokątne. Trzeba utrzymać kwadratowe piksele (rozmiar płótna i rozmiar wyświetlania z tej samej wysokości).
- **Release info (Maszynologia): zdjęcie autora pod CV.** Dodać pod CV zdjęcie autora w formie progowej, ditherowanej (czarno-czerwona, jakby w cieniu).
  Autor dośle zdjęcia; wtedy zaproponować warianty (np. próg + dither Bayera w czerni i krwi, z żarzącymi się oczami, rozpad w piksele przy odkodowaniu
  razem z resztą animacji wejścia). Używać tylko zdjęć dostarczonych przez autora i bez innych osób; zdjęcie ma być częścią animowanego odkodowania strony.
