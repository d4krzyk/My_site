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
Dźwięk jest domyślnie wyłączony; włącza go przycisk „głosy” pod nagłówkiem sekcji (przeglądarki wymagają kliknięcia). Przy ponownym wejściu na personę
gra tylko jej imię. Przy ograniczeniu animacji nic z tego nie działa, a pełny tekst zostaje w DOM (ukryty span dla czytników ekranu).

## Otwieranie projektów (Maszynologia)

Kliknięcie nazwy projektu w Release info albo `open <projekt>` w terminalu odtwarza animację przejścia (`src/engine/projopen.js`), potem otwiera się
repozytorium na GitHubie (nowa karta). Każdy projekt ma własną animację w swoim kolorze, w niskiej rozdzielczości 320×180 (piksel ×3, dither Bayera,
bitmapowa czcionka): Visual Echoes (sonar, echa odszyfrowują bębny), WikiRooms (pokój po pokoju, na końcu drzwi), Remuz.io (korektor LED, potem
analizator na cały ekran), MusicClubApp (winyl 3D nad szachownicą Amigi, napis wokół płyty rozświetla się jak kula disco), ShadowDetection (lampa okrąża
siatkę, cienie, na końcu rozświetla przejście), GameInJava (automat, jackpot, spadające komórki). Na pionowym ekranie nakładka jest obrócona o 90° (jak HC90E).
Jeśli przeglądarka zablokuje wyskakujące okno (animacja trwa kilka sekund), zostaje klikalny odnośnik „github ›”.
**W przyszłości projekty dostaną własne podstrony z prezentacją** (zob. plan niżej): animacja ma wtedy prowadzić do podstrony zamiast do GitHuba, więc
miejsce docelowe jest jedną funkcją (`finish` w `openProject`), a sama animacja zostaje bez zmian.

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
