# KRZYK — Zejście

Portfolio d4krzyk w dwóch działach: **Krzyk** (muzyka, obraz, persony) i **Maszynologia** (projekty IT, CV, kontakt).
Estetyka: zin post-punk lat 90., dither, PS1 low-poly, demoscena.

## Struktura

- `src/app/` — strony (App Router):
  - `/` — brama: zejście w tunel, sztandary słońca i księżyca palą się, popiół składa się w sigile; po zejściu ścieżki do działów,
  - `/krzyk/` — dział artystyczny (szkic),
  - `/maszynologia/` — dział IT w stylu NFO (szkic).
- `src/components/` — `Gate` (brama) i `CardsNav` (nawigacja kartami IV · II · IV na podstronach).
- `src/engine/` — silnik wizualny przeniesiony z planszy stylu: dither Bayera, pętle o stałej liczbie klatek, brama, karty.
- `public/` — fonty pikselowe, sztandary, sprite'y kart, kolaż.
- `legacy/` — poprzednia wersja strony (HTML/CSS/jQuery), zostawiona do wglądu.

## Uruchomienie

```bash
npm install
npm run dev      # podgląd na http://localhost:3000
npm run build    # statyczny eksport do out/
```

## Publikacja

Workflow `.github/workflows/pages.yml` buduje stronę przy pushu na `main` i publikuje ją na GitHub Pages
pod `/My_site` (zmienna `PAGES=1` ustawia `basePath`). W ustawieniach repozytorium: **Settings → Pages → Source: GitHub Actions**.

## Licencje fontów

`Alagard PL` i `Krzyk DOS` są w `public/fonts/`. Przed publikacją trzeba potwierdzić ich licencje.
Fonty tylko do użytku osobistego (np. Archive Stamp, HVD Poster, Eroded) nie są dołączone.
