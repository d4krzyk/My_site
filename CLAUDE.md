# KRZYK: notatki projektu

Nie nazywaj projektu „Zejście” — nigdzie (teksty, nagłówki, tytuły, komentarze).

Portfolio Daniela (d4krzyk): Next.js (eksport statyczny) na GitHub Pages. Działy: Brama (strona główna), Krzyk, Maszynologia.
Tła i grafiki działu Krzyk powstają ze skryptów generujących (kolaż, tła, tektura); w repozytorium są gotowe pliki w `public/krzyk/`.

## Persony (dział Krzyk → „persony”)

Na stronie są pokazane jako teatralne maski w stylu PS1 (nie głowy).

1. **Lękowa** (nazwa na stronie: **Anxtan**) — boi się i dużo analizuje, overthinking, często mówi szybko i dużo, wiecznie przestraszona życiem.
   Estetyka: haunted, nawiedzona.
2. **Wyluzowana** (nazwa na stronie: **Nugis**) — spokojna, nie przejmuje się życiem, cieszy się prostymi chwilami; bardzo energiczna, głośna,
   czasem zbyt impulsywna i nie przemyśla niektórych rzeczy; traci czas na głupotki, dużo goofy momentów.
   Estetyka: indie sleaze / hyperpop, chilled 2000s.
3. **Poważna** (nazwa na stronie: **Stoir**; biała maska, męski gotycki makijaż, bez aureoli; rusza się szarpnięciami jak manekin) — skupiona na rozwoju wewnętrznym, nie traci czasu na głupoty; posępna i zadziorna, patrzy z góry,
   obserwatorska; wysokie skupienie na duchowości i poczuciu połączenia ze sobą.
   Estetyka: gotycka, sakralna.

W polu wyborów są tylko trzy maski (bez ukrytej czwartej za nimi).

**Czwarta persona jest sekretem.** Ma być ukryta najgłębiej, niewidoczna przy pierwszym oglądaniu strony;
najwyżej rzadkie, ulotne skrawki (gdzie i jak — do ustalenia z autorem). Nie opisuj jej w tekstach strony, w repozytorium
ani w opisach commitów i PR-ów — szczegóły zna tylko autor.

## Kamera HC90E (przejście z kasety miniDV do sekcji Obraz)

Na ekranie LCD kamery jest na razie zastępcze zdjęcie (`public/krzyk/lcd.webp`). Gdy powstanie sekcja ze zdjęciami,
podmienić je na zdjęcie z tej sekcji. Na pionowych ekranach (telefon) animacja jest obrócona o 90°, a obraz na LCD ma format 9:16.

## Głosy person (czytanie opisu)

Gdy persona staje się aktywna, jej opis wpisuje się litera po literze (`src/engine/persvoice.js`), a każda litera gra „blip” głosu (`src/engine/voices.js`,
synteza WebAudio, bez plików dźwiękowych). Głosy: Anxtan to bardzo szybkie dukanie jak odwrócona nagrana mowa (narastanie i ucięcie, jąkanie), Nugis to wolne
blipy ślizgające się w górę jak w Undertale (koniec słowa wyżej), Stoir to niski, obrażony głos z akcentem (spadek tonu, podniesienie na końcu słowa).
Dźwięk jest domyślnie wyłączony i bez wyboru; włącza go wybór w bramie albo ikonka oscyloskopu w rogu (zob. „Persony w rogu i dźwięk”; przycisk „głosy” usunięty). Przy ponownym wejściu na personę
gra tylko jej imię. Przy ograniczeniu animacji nic z tego nie działa, a pełny tekst zostaje w DOM (ukryty span dla czytników ekranu).

## Otwieranie projektów (Maszynologia)

Kliknięcie nazwy projektu w Release info albo `open <projekt>` w terminalu odtwarza animację przejścia (`src/engine/projopen.js`), potem otwiera się
repozytorium na GitHubie (w tej samej karcie, bez przycisku; powrót przyciskiem „wstecz” usuwa nakładkę). Każdy projekt ma własną animację w swoim kolorze, w niskiej rozdzielczości 320×180 (piksel ×3, dither Bayera,
bitmapowa czcionka): Visual Echoes (sonar, echa odszyfrowują bębny), WikiRooms (pokój po pokoju, na końcu drzwi), Remuz.io (korektor LED, potem
analizator na cały ekran), MusicClubApp (winyl 3D nad szachownicą Amigi, napis wokół płyty rozświetla się jak kula disco), ShadowDetection (lampa okrąża
siatkę, cienie, na końcu rozświetla przejście), GameInJava (automat, jackpot, spadające komórki). Na pionowym ekranie (telefon) sceny mają osobny układ pionowy, nie obrót poziomego: płótno 180 px szerokości i wysokość z proporcji ekranu, większa siatka
wyśrodkowana pionowo, efekty (sonar, analizator, lampa, wiry) sięgają całej wysokości, nazwa projektu w końcowej klatce złamana na wiersze.
Przed animacją strona się zawala: od miejsca kliknięcia (albo od terminala) rozlewa się ciemność z ditherem, na jej froncie pasmo zakodowanych bloków w kolorze
projektu, ekran gaśnie, a animacja wyłania się z ciemności progiem Bayera (`collapse` w `openProject`).
Dopóki trwa animacja, kolejne kliknięcia projektów i komendy `open` są ignorowane, a nakładka przejmuje klawiaturę (Esc pomija animację i od razu przenosi na repozytorium).
Linki w Release info: przerysowanie tekstu NFO (animacja przewijania) czeka na puszczenie przycisku myszy, inaczej kliknięcie przepadało.
**W przyszłości projekty dostaną własne podstrony z prezentacją** (zob. plan niżej): animacja ma wtedy prowadzić do podstrony zamiast do GitHuba, więc
miejsce docelowe jest jedną funkcją (`finish` w `openProject`), a sama animacja zostaje bez zmian.

## Telefon → kontakt (przejście)

Klik w telefon: model wylatuje z karty, kamera najeżdża na ekran modelu, aż LCD wypełni okno (na telefonie szerokość). Na ekraniku 84×48
(Nokia 3310, `src/engine/nokia.js`): „HALO? / CZY TO...?", fala krzyku jak na oscyloskopie wycina z siebie KRZYK, potem zielony szum zalewa stronę
i odsłania sekcję kontaktu: pod koniec całość (obraz LCD, przyciemnienie i szum) rozpuszcza się stopniowo ditherem na blokach, a nie znika naraz.

## Wybór sekcji i przewijanie (Krzyk)

- **Blokada kart:** dopóki trwa animacja jednej opcji (walkman, maski, kaseta, telefon), pozostałe są nieaktywne i przygaszone (`rooms-busy` w `initRooms`, wspólna flaga dla wszystkich kart).
- **Układ wyboru (A0):** bez napisu „wybierz”; trzy płyty w rzędzie (muzyka, persony, obraz), mniejsze i nieco powyżej środka, pod nimi niski, szeroki pasek kontaktu z leżącym telefonem (płótno 210×90, `PHONE_CAM_Z`, `PHONE_TILT`); całość w jednym ekranie. Na telefonie płyty jedna pod drugą na pełną szerokość, pasek kontaktu na końcu. Przejście kontaktu startuje z leżącego telefonu w płycie i w locie podnosi go do pionu.
- **Przewijanie sekcjami (wariant B):** `points()` w `klatki.js`: skok od sekcji do sekcji, górna krawędź sekcji u góry okna; tylko sekcja wyższa od okna o >12% dostaje dodatkowy
  przystanek u dołu; sekcja person ma przystanek dla każdej persony; za ostatnim przystankiem jeden skok na sam dół, potem ruch w dół nic nie robi.

## Karty: wybór drogi w bramie i nawigacja kartami

- **Wybór drogi w bramie** (`src/engine/gatecards.js`, markup w `Gate.js`): po zejściu dwie karty (awersy z `public/cards/`: II ze słońcem = Krzyk, IV z księżycem = Maszynologia), bez napisów „poziom -1/-2”.
  Wyłaniają się z cienia (dither odpływa): na komputerze od spodu, na telefonie z boków, ustawione na ukos (lewa i prawa, przechylone), a tekst (nazwa, opis) leży obok karty prosto i czytelnie.
  Po wyborze wybrana karta się spala (magiczny płomień od dołu, piksele żarzą się biało/cyjanowo/turkusowo, zwęglają się na granat i odlatują jako cyjanowy pył; z frontu unoszą się runy-zaklęcia; paleta `PAL` w `gatecards.js`), druga gaśnie w cieniu, potem kurtyna sigili (`veil.js`).
  Kliknięcia są blokowane do końca wyłaniania i po wyborze; przy ograniczeniu animacji karty są od razu i wybór przenosi bez spalania.
- **Nawigacja kartami:** napis przy bieżącej karcie to „tu jesteś” / „you are here”.
- **Spalony róg karty IV (Maszynologia):** na rewersie (`back-2`, `mini-2`) jest po prawej, na awersie (`face-maszynologia`) po lewej, bo po obróceniu karty róg ma być po drugiej stronie.
  Nad spalenie dochodzi magiczny żar (krawędź przypalenia pulsuje cyjanem i bielą, cyjanowe płomyki, iskry, a w płomieniach powoli ulatniają się runy) (`emberCorner`): w bramie i na karcie w rozkładzie nawigacji.
  Napisy przy kartach w bramie nie łamią się na kilka linii (`white-space:nowrap`; na telefonie `[ IT ]` schodzi pod nazwę).

## Brama (strona główna)

Kręgi ze znaków w tle (`gate.js`, pętla 30 kl./s) obracają się bez przerwy, każdy z własną prędkością i kierunkiem (0,06–0,4 rad/s). Liczba znaków w kręgu rośnie przez podwajanie
(8, 16, 32…), a nowe znaki wyłaniają się między istniejącymi, więc przy rozszerzaniu kręgu nic nie przeskakuje; rozmiar czcionki zmienia się płynnie przez skalę. Nie wracać do
przeliczania liczby znaków co klatkę: każda jej zmiana rozstawiała cały krąg od nowa (zacięcia).

## Nazwy person (sekcja Krzyk → persony)

Nazwa aktywnej persony to niskorozdzielcza, miękka tekstura na wstążce z 8 wielokątów (`initPersonaTitles` w `src/engine/psx.js`): mapowanie afiniczne,
przyciąganie wierzchołków do pikseli, fala i skręt biegnące bez przerwy oraz smuga ruchu (echo), wzór z dema PS1 z Euskal 2001; **stylu wstążki nie zmieniać**. Wstążka stoi w rogu obok maski (zob. „Persony w rogu i dźwięk”). Przy wejściu słowo wynurza się
z ciemności jako pognieciona kreska i się prostuje, przy wyjściu zwija się i gaśnie. Zwykły `h3` zostaje w stronie (ukryty wizualnie), a przy ograniczeniu
animacji w systemie nagłówek jest zwykłym tekstem.

## Język PL/EN i animowana zmiana

Przełącznik języka (`LangKeys`, zdarzenie `krzyk-lang`, `src/lib/lang.js`) zmienia tylko teksty informacyjne. **Nazwy własne zostają bez zmian:** persony (Anxtan, Nugis, Stoir), KRZYK, imię i nazwisko autora,
nazwy projektów i instytucji, napisy w tle (wersy kolażu, listing cracktro, ekran Nokii w przejściu kontaktu). Nazwy działów mają wersje (Brama/Gate, Maszynologia/Machinology: też tytuł i prompt na stronie Maszynologii).
Zmiana jest animowana zgodnie z motywem miejsca, żeby nie było nagłego przeskoku:
- **Krzyk (maszyna do pisania):** nagłówki i podpisy cofają się wstecz i piszą od nowa (`retype` w `krzykfx.js`, `src/engine/krzyklang.js`), akapity tak samo bez rozbijania na litery (`typeSwap` w `xlate.js`);
  opis aktywnej persony czyta się od nowa jej głosem (`persvoice.js`). Teksty poza oknem podmieniają się od razu. Teksty dwujęzyczne w znacznikach: atrybut `data-en` (oryginał PL zostaje w `data-pl`), `data-en-aria` dla etykiet;
  start strony ustawia język w `useLayoutEffect` (bez mignięcia polskiego tekstu).
- **Maszynologia i brama (dekodowanie):** stary tekst rozsypuje się w bloki ▓▒░ i rozkodowuje w nowy (`decodeSwap`). NFO układa się od nowa z `BL_PL`/`BL_EN` w `maszyn.js` (długość wierszy jest inna, więc ryciny rosną znów pod nowy układ);
  terminal ma dwujęzyczne pomoc, `man`, komunikaty i pliki (`FILES_EN`, `lg`/`tr` w `term.js`), ścieżki i polecenia zostają polskie jak w systemie plików (`projekty`, `doswiadczenie`).
- Przy ograniczeniu animacji (`RM`) tekst podmienia się natychmiast.
- Dodając nowy tekst informacyjny, dodaj od razu wersję angielską w tym samym miejscu (`data-en`, słownik albo drugi blok).

## Muzyka (pokój z telewizorem)

Sekcja `#k-muzyka` w Krzyku (`src/engine/muzyka.js`, markup w `krzyk/page.js`, style `.mu-*` w `globals.css`): kanciasta wyrwa w zinie (tło strony z tego miejsca, `bg-mid.webp`, brzegi: raster, suche pociągnięcia czarnego pędzla, czerwony tusz; bez taśm i bez białego brzegu),
za nią ciemny pokój PSX: dywan okrągły, ściana w pasy, okno z roletami po prawej (światło miasta, paski na podłodze i ścianie), plakat, kable, telewizor po lewej z magnetowidem, jedna kaseta i pilot na dywanie.
Modele w `public/krzyk/3d/` (`old_tv`, `vhs_player`, `vhs_tape`, `remote`). Z siatki magnetowidu wycięty jest wbudowany, leżący fragment kasety (`stripFront`), bo animowana kaseta jest osobna (inaczej były dwie).
Sterowanie tylko klikiem w obiekty (bez przycisków): kaseta → wsuwa się do magnetowidu i rusza klip, magnetowid → wysuwa kasetę, pilot → zmienia klip, telewizor → kamera najeżdża i ekran wypełnia kadr (Esc albo kolejny klik cofa).
Ekran i wyświetlacz VFD to płótna 2D przyklejone homografią do modelu. **Nie dodawać migających cząsteczek** (kurz, losowe kreski na ekranie): wyglądały źle i zostały usunięte; szum jest tylko na pustym ekranie.
Telefon (≤700 px): wariant „dwa piętra” — scena pionowa 288×480 (`LAYOUTS.port`): telewizor z magnetowidem u góry, dywan z kasetą i pilotem pod nim, zoom dopasowany do szerokości; układ przełącza się też przy zmianie szerokości (`applyLayout`).
Tabliczka „muzyka” (tekstura płyty wyboru, krzywo) w prawym górnym rogu. Później: plakietki z tytułami utworów, z których wysuwa się kaseta i rusza klip z YouTube.

## Persony w rogu i dźwięk

- **Maski (`initPersonaStage` w `psx.js`):** trzy maski stoją u góry w rzędzie. Aktywna persona wyjeżdża łukiem w lewy górny róg sceny (sticky), maska patrzy w środek strony, obok niej stoi nazwa jako falująca wstążka PS1 (`initPersonaTitles` dokłada jej płótno do kontenera `.kp-cn`, pojawia się po wylądowaniu maski; tag persony zostaje tylko w opisie), a pozostałe maski zostają u góry przyciemnione.
  Płótno z maskami (`.kp-stage-in`) ma szerokość okna, kamera stoi daleko z wąskim kątem (`CAMD`, `FOV`), żeby maski przy krawędziach się nie wyginały, i leży na pierwszym planie, więc maski mogą wychodzić poza brązową planszę (jej tło `.kp-stage::before` zostaje szerokości planszy; plansza ma być jeszcze przerobiona).
  Przejście jest po kolei: najpierw poprzednia maska wraca do rzędu (cień), dopiero potem następna wychodzi do rogu. Opis zaczyna się pisać po wylądowaniu maski (`personaSeated` zamiast `personaActive` w `persvoice`).
  Dukanie: `persvoice` zgłasza każdą wpisaną literę (`setPersonaTalk`), maska w rogu rusza się w jej rytmie, każda inaczej (Anxtan drży i strzela na boki, Nugis podskakuje i kiwa głową, Stoir szarpie się jak manekin); działa też bez dźwięku.
- **Dźwięk (`src/lib/sound.js`):** stan w `localStorage` (`krzyk-sound`: `on`/`off`, domyślnie brak wyboru = wyłączony), zdarzenie `krzyk-sound`, wspólny `AudioContext` (`audio()`); po odświeżeniu strony wznawiany pierwszym gestem.
  Wybór „z dźwiękiem / bez dźwięku” pod ostrzeżeniem w ramce bramy (`gate.js`, `.gsnd`) i ikonka oscyloskopu w lewym dolnym rogu każdej strony (`components/SoundIcon.js`, w `layout.js`): wykończenie A (srebrny monitor ze śrubkami i cieniem), płaska linia = wył, fala krzyku z poświatą = wł,
  pod spodem „dźwięk” i „wł/wył” (EN: „sound”, „on/off”). Gdy nie ma jeszcze wyboru, ikonka kilka razy pulsuje. Głosy person (`persvoice`) grają tylko przy włączonym dźwięku.

## Plan na przyszłość (ustalone z autorem, jeszcze niezrobione)

- **Ustalone w wizualizacjach (artefakt „Wizualizacje dla Krzyku”), do wdrożenia:**
  - (wdrożone) Persony (A2) i dźwięk: zob. sekcja „Persony w rogu i dźwięk” wyżej.
  - (wdrożone) Muzyka (A1): zob. sekcja „Muzyka (pokój z telewizorem)” wyżej.
- **Kamera HC90E:** po powstaniu sekcji Obraz podmienić zdjęcie na LCD (zob. wyżej).
- **Do sprawdzenia na prawdziwych urządzeniach (nie testowane, tylko emulacja w Chromium):** przewijanie sekcjami w Krzyku na gładziku (Mac); animacje na prawdziwym telefonie i tablecie; Safari (m.in. powrót z GitHuba przyciskiem „wstecz”).
- **Release info (Maszynologia): zdjęcie autora pod CV.** Dodać pod CV zdjęcie autora w formie progowej, ditherowanej (czarno-czerwona, jakby w cieniu).
  Autor dośle zdjęcia; wtedy zaproponować warianty (np. próg + dither Bayera w czerni i krwi, z żarzącymi się oczami, rozpad w piksele przy odkodowaniu
  razem z resztą animacji wejścia). Używać tylko zdjęć dostarczonych przez autora i bez innych osób; zdjęcie ma być częścią animowanego odkodowania strony.
  **Stan (2026-10-31):** autor dodał już zdjęcie do Maszynologii (plik na jego Dysku Google); pracę nad nim zaplanowano na później. Linku nie zapisuję w repozytorium
  (jest publiczne, a oryginał nie ma być publiczny, na stronie ma być tylko wersja progowa); gdy przyjdzie czas, autor poda go ponownie.
- **Maszynologia: podstrony projektów (po obronie magisterki).** Z czasem zrobić podstrony poszczególnych projektów autora z GitHuba, żeby lepiej pokazać,
  co robią (opis, zrzuty, linki). Na razie projekty są tylko jako klikalne linki do repozytoriów w Release info oraz pliki README w terminalu. Termin: po magisterce, bez pośpiechu.

## Efekty demosceny: referencja techniczna (obowiązująca)

Zapisane na prośbę autora (2026-10-31). **Gdy autor prosi o zbudowanie lub optymalizację efektu demosceny, trzymaj się ściśle poniższych modeli matematycznych,
niskopoziomowej logiki i strategii optymalizacji.** (Treść zachowana po angielsku, jak ją podał autor.)

### 1. 2D & raster effects

* **Text Scroller / Sine Scroller**
  - Core logic: smooth horizontal pixel stepping (hardware scroll registers or Blitter shifts).
  - Math for sine variant: `Y_offset(x) = Amplitude * sin(Step * x + Time)`.
  - Rule: render font characters into a horizontal buffer, shift coordinates frame-by-frame, and modulate vertical position per column using a precomputed sine lookup table (LUT).

* **Copper Bars / Raster Bars**
  - Core logic: modulating the background color register precisely at specific screen scanlines (co-processor driven via WAIT and MOVE equivalents).
  - Rule: to allow multiple overlapping bars moving at independent speeds, a linear sorting algorithm (e.g. Insertion Sort) must run during the Vertical Blank Interrupt (V-Blank)
    to sort bar positions from top to bottom before generating the final raster instruction list.

* **Vertical Copper Bars**
  - Core logic: modulating color registers horizontally across a single scanline.
  - Rule: require cycle-exact timing loops. The CPU or co-processor must write to the color palette register multiple times within the tight window of a single horizontal line drawing phase.

* **BOBs (Blitter Objects) & Shade BOBs**
  - Core logic: drawing large quantities of arbitrary-sized animations directly into bitplanes instead of using hardware sprite limits.
  - Shade BOBs modifier: instead of a destructive copy, use bitwise logical operations (OR / AND) or pixel value incrementation upon overlap to cycle colors,
    creating additive blending and semi-transparency illusions.

* **Plasma Effect**
  - Core logic: organic, fluid-like moving color maps generated by compounding trigonometric functions.
  - Math: `Color_Index(x, y, t) = sin(x/a + t) + cos(y/b + t) + sin((x+y)/c + t) + sin(sqrt(x^2 + y^2)/d - t)`.
  - Rule: never compute sin/cos/sqrt in the main pixel loop. Precompute trig values into 8-bit integer LUTs and cycle the color palette indices (Color Cycling) rather than recalculating RGB values per pixel.

### 2. Image transformations & illusions

* **Twister Effect**
  - Core logic: simulating a twisting 3D ribbon or polygon bar line-by-line.
  - Rule: for each horizontal line y, calculate the current width and phase shift using a sine wave: `Width(y) = Base_Width * sin(y * Frequency + Time)`.
    Draw texture spans or colored blocks mapped to these dynamic bounds per line.

* **Roto-Zoomer**
  - Core logic: affine transformation applied to a fullscreen texture to rotate and scale simultaneously.
  - Math: `tex_x = (screen_x * cos(a) - screen_y * sin(a)) * scale; tex_y = (screen_x * sin(a) + screen_y * cos(a)) * scale`.
  - Rule: use fixed-point arithmetic (16.16 integers). Calculate the starting vector and delta steps (dx, dy). The inner loop must only consist of simple fixed-point additions:
    `tex_x += d_tex_x, tex_y += d_tex_y`.

* **Tunnel Effect**
  - Core logic: first-person illusion of flying through a textured cylinder.
  - Math: transform Cartesian screen coordinates (x, y) centered at (0,0) into polar coordinates: `Angle (U) = atan2(y, x)`, `Distance (V) = 1.0 / sqrt(x^2 + y^2)`.
  - Rule: precompute the (U, V) lookup values for every pixel on the screen into a massive 2D array (Transformation Map). In the real-time frame loop, simply offset the lookup
    indices: `Texture_Lookup(U + rotation_time, V + scroll_time)`.

* **Oscillating Circles**
  - Core logic: concentric or overlapping geometric vector circles waving dynamically.
  - Rule: render native vector circles where the radius R and center coordinates (Cx, Cy) are modulated via layered sine waves at varying frequencies.

### 3. Vector & real-time 3D effects

* **3D Flat/Shaded Vectors**
  - Core logic: real-time rendering of solid 3D mesh geometry.
  - Pipeline: 3D vertex rotations (matrix multiplication) -> perspective projection (`X_screen = X_3d / Z_3d, Y_screen = Y_3d / Z_3d`) -> face sorting (Painter's Algorithm / Z-sorting) -> polygon filling.
  - Flat shading math: `Intensity = DotProduct(Face_Normal, Light_Direction)`. Map intensity to a range of color shades.

* **Glass / Lens Vectors**
  - Core logic: translucent 3D wireframes overlaying background graphics.
  - Rule: project 3D vector lines, but replace standard drawing with additive blending loops: `Destination_Pixel = Minimum(Destination_Pixel + Line_Color, Max_Color_Value)`.

* **Vector Balls**
  - Core logic: representing 3D object vertices as independent spheres rather than connected lines.
  - Rule: track 3D points, apply rotation matrices, perform perspective projection, and draw pre-rendered 2D graphic balls (sprites/BOBs) at the projected (X, Y) coordinates.
    Scale the ball size based on the projected Z depth.

### 4. Audio synchronization

* **MOD Tracker Playroutines**
  - Core logic: synchronizing visuals directly with music patterns.
  - Rule: parse Amiga .MOD structure (channels, periods, samples, effects). Expose internal tracker playroutine variables (Current Row, Current Pattern, Active Channel Trigger)
    as global system interrupts. Use these registers to instantly modulate visual variables (e.g. trigger a screen flash when a bass drum sample fires on Channel 0).
