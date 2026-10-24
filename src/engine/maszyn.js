// strona Maszynologia: cracktro (listing asm, copper, sine-scroller z dekodowaniem) i plik NFO z ornamentami; przeniesione z planszy
import { RM, rnd, clamp, FONTS, loop, N, fbm, bth, oneBit, makeGlyph, drawGlyph } from './core';
export function initMaszyn(root, opts) {
  const $ = id => root.querySelector('#'+id);
  const ASSETS = opts.assets;
/* ===== NFO · MASZYNOLOGIA [IT] =====
   Wnętrze panelu: tekst NFO + wewnętrzna ramka z półbloków CP437 (▀▄█▌▐ ░▒▓) TYLKO po bokach tekstu.
   Ornamenty boczne w duchu scrolli RAZOR 1911: łańcuch esowatych płomieni (wiązki równoległych pasm,
   zwężanych do ostrza, krzyżujących się na przegięciach), hakowate kolce, zwój, okrągły przerwany krąg
   z kreskami, jeden świecący krzyż ░▒▓ (lewa); półksiężyc, sterczyna ▒, kropla krwi (prawa).
   Układy: FULL (86 kol. x 37 wierszy, tekst w kol. 23-62, odstęp >= 3 kol.) i COMPACT (31 kol., bez ramki),
   wybierany po szerokości wnętrza .nfo-wrap (ResizeObserver). Generator: gen3/ (frame.py, text.py, emit.py).
   Klasy znaków: s srebro, d przygaszony, h krew (nagłówki), o ornament, q ornament ciemniejszy, r kropla. */
{
  const pre = $('nfo');
  const wrap = pre && pre.closest('.nfo-wrap');
  const oL = $('ornL'), oR = $('ornR');
  if (oL && ASSETS.ornL) oL.src = ASSETS.ornL;
  if (oR && ASSETS.ornR) oR.src = ASSETS.ornR;
  if (pre && wrap) {
    const L = {
      full: {cols: 86, ch: [
        "            ▄                                              ▄▄▄▀▀▀▀▀█▀▀█▀▀███▀▀▀▀▀▀▀███",
        "     ▄    ▄▀    ▄                                         ▐       ▌ ██▄▄█▓█▀",
        "    █  ▄██                     ·─═≡ R E L E A S E ≡═─·            ▌ █▀██▓█▀",
        "▀▄ █ ▄██▀                                                          ██ █▓█▀       ▄▀▀▀▄",
        " ▀█▄▄██                PROJEKT ..... VISUAL ECHOES 2.0             ██ █▓█       █  ▀▄",
        "  █ ███                TYP ......... PRACA MAGISTERSKA             ██ █▓█▄      ▀▄▀▀ ▄",
        "  █ ███                ROK ......... 2025 →                       ▌ █▄ ████    ▄ ▄▀▀▀",
        "  ▀█ ██▄               STACK ....... PYTHON · PYTORCH · HABITAT   ▀  ▀▄ ▀███▄▄  ▀▄",
        "   ▀▄ ██▄              ROLA ........ AUTOR                         ▀  ▀▀▄  ▀███▄ ▀█▄",
        "   ░█  ██                                                           ▀        ▀███▄ █▄",
        "  ▒▓▒▄  ██   ▄   ▄                                                             █▓█▄ █",
        "   ▒ ▀   ▀█▄  █  ▀               ─═ RELEASE NOTES ═─                ▄█▀         █▓█ █",
        "   ░      ███  █  █▄                                               ██          █▓█▀▄█",
        "           ███▄▀█ ██   Agent widzi obraz i słyszy echo.            ▀█▄        ▄█▓█ █▀",
        "            ███ ██▀█   Rozszerzyłem model z 4 do 36 orientacji       ▀▀      ▄██▀ █▀",
        "             ███ █ ▐   co 10° i zbadałem, ile kierunków                     ▄██▀ ▄▀  ▄",
        "            ▄██▀▄█ ▐   naprawdę się opłaca: krzywa nasyca się           ▄   ██  ▄▀",
        " ▄         ███▀ █▀ ▐   przy 9-12.                                      █  ▄█▀   ▀",
        "▄  ▄█▀  ▄███▀ ▄█  █                                                ▌  █  ██▀",
        "▀ █▀ ▄███▀   ▄▀  █                                                ▄▀ █▀▄██▀       ▄▄",
        " ██ ███▀        ▀                 ─═ MEMBER INFO ═─               ▌ ██ ███         ▀█",
        "▄█ █▓█▀       ▄▀▀▀▄                                               ▌ █ ███          ▄▀▀",
        "██ █▓█       ▌  ▄  ▀   MSK TORMAN ........ OPERATOR NOC  2025 →   ▌ █ ███        ▄█▀",
        "▀█▄█▓█▄      ▀▄   ▄▄   LUXOLIS ........... SOFTWARE ENG. 2023     ▌ █▄ ███",
        "█▀█ ███▄        ▀▀     PFEIFER & LANGEN .. STAŻ IT       2023     ▀  █▄ ▀██▄",
        "█▄▀█ ▀██▄       ▀      UMK TORUŃ ......... MSc AI        2024 →    ▀ █▀▄  ▀██  ▀",
        "▀  ▀▄  ██▄                                                          ▀█▀ ▀   ▀█▄ ▀",
        " ▌   ▄  ██▄  ▀                                                       █       ▀██ ▐",
        "         ███  █                   ─═ INNE RELEASY ═─                ▌ ▐       ██▄▀▄",
        "          ███▄ █▄ │                                                 █░█       ██▀▄▀",
        "  ▄▀▀▀▄    █▓█▄ █▄ ▄   WIKIROOMS ·÷· REMUZ.IO ·÷· MUSICCLUBAPP      █▒█      ▄██ █  ▀",
        " █ ▄▀  █   ▀█▓█▄▀█ ▐   SHADOWDETECTION ·÷· GAMEINJAVA              ▀█▒█▀    ▄█▀ ▄▀",
        " ▀▄ ▀▀▄▀    █▓▓█ ██                                                ▄▀▒▀▄   ▄▀  ▄",
        "   ▀▀▀▄     ▄█▓█ ██                                                █░▒░█   ▀",
        "       ▀    █▓█▀▄█     DŹWIĘK I OBRAZ  //  W SZTUCE I W KODZIE     █▒▒▒█",
        "          ▄█▓████▀ │                                               █▒▒▒█",
        " ███████████▀▀██▀▀█▀▀▀▀▀▀▀▀▀▀                                      █▒▒▒█"
      ], cl: [
        "            o                                              ooooooooooooooooooooooooooo",
        "     o    oo    q                                         o       q oooooooo",
        "    o  ooo                     dddddhhhhhhhhhhhhhddddd            q ooooooo",
        "oo o oooo                                                          oo oooo       ooooo",
        " oooooo                ssssssssdddddssssssssssssssssss             oo ooo       o  oo",
        "  o ooo                ssssdddddddddssssssssssssssssss             oo oooo      oooo o",
        "  o ooo                ssssdddddddddsssssss                       q oo oooo    o oooo",
        "  oo ooo               ssssssdddddddsssssssssssssssssssssssssss   q  oo oooooo  oo",
        "   oo ooo              sssssddddddddssssss                         q  ooo  ooooo ooo",
        "   qo  oo                                                           q        ooooo oo",
        "  qqqo  oo   o   q                                                             oooo o",
        "   q o   ooo  o  q               dddhhhhhhhhhhhhhddd                ooo         ooo o",
        "   q      ooo  o  qq                                               oo          oooooo",
        "           oooooo oo   ssssssssssssssssssssssssssssssss            ooo        oooo oo",
        "            ooo oooq   sssssssssssssssssssssssssssssssssssssss       oo      oooo oo",
        "             ooo o q   ssssssssssssssssssssssssssssssss                     oooo oo  q",
        "            oooooo q   ssssssssssssssssssssssssssssssssssssss           o   oo  oo",
        " q         oooo oo q   ssssssssss                                      o  ooo   o",
        "q  ooo  ooooo oo  q                                                q  o  ooo",
        "q oo ooooo   oo  q                                                qq oooooo       oo",
        " oo oooo        q                 dddhhhhhhhhhhhddd               q oo ooo         oo",
        "oo oooo       qqqqq                                               q o ooo          ooo",
        "oo ooo       q  o  q   sssssssssssddddddddsssssssssssssssssssss   q o ooo        ooo",
        "ooooooo      qq   qq   ssssssssdddddddddddsssssssssssssssssss     q oo ooo",
        "ooo oooo        qq     sssssssssssssssssddsssssssssssssssssss     q  oo oooo",
        "qqoo oooo       q      ssssssssssdddddddddsssssssssssssssssssss    q qoo  ooo  q",
        "q  oo  ooo                                                          qqq o   ooo q",
        " q   o  ooo  o                                                       q       ooo q",
        "         ooo  o                   dddhhhhhhhhhhhhddd                q q       oooqq",
        "          oooo oo q                                                 qqq       oooqq",
        "  ooooo    oooo oo q   ssssssssssdddssssssssssdddsssssssssssss      qqq      ooo q  q",
        " o oo  o   ooooooo q   ssssssssssssssssdddsssssssssss              qqqqq    ooo qq",
        " oo oooo    oooo oo                                                qqqqq   oo  q",
        "   oooo     oooo oo                                                qqqqq   r",
        "       o    oooooo     ssssssssssssssddddddsssssssssssssssssss     qqqqq",
        "          oooooooo q                                               qqqqq",
        " oooooooooooooooooooooooooooo                                      qqqqq"
      ]},
      compact: {cols: 31, ch: [
        "    ·─═≡ R E L E A S E ≡═─·",
        "",
        "PROJEKT . VISUAL ECHOES 2.0",
        "TYP ..... PRACA MAGISTERSKA",
        "ROK ..... 2025 →",
        "STACK ... PYTHON · PYTORCH ·",
        "          HABITAT",
        "ROLA .... AUTOR",
        "",
        "",
        "      ─═ RELEASE NOTES ═─",
        "",
        "Agent widzi obraz i słyszy",
        "echo. Rozszerzyłem model z 4 do",
        "36 orientacji co 10° i",
        "zbadałem, ile kierunków",
        "naprawdę się opłaca: krzywa",
        "nasyca się przy 9-12.",
        "",
        "",
        "       ─═ MEMBER INFO ═─",
        "",
        "MSK TORMAN ............. 2025 →",
        "  └─ OPERATOR NOC",
        "LUXOLIS .................. 2023",
        "  └─ SOFTWARE ENG.",
        "PFEIFER & LANGEN ......... 2023",
        "  └─ STAŻ IT",
        "UMK TORUŃ .............. 2024 →",
        "  └─ MSc AI",
        "",
        "",
        "      ─═ INNE RELEASY ═─",
        "",
        "    WIKIROOMS ·÷· REMUZ.IO",
        "  MUSICCLUBAPP ·÷· GAMEINJAVA",
        "        SHADOWDETECTION",
        "",
        "",
        "        DŹWIĘK I OBRAZ",
        "              //",
        "      W SZTUCE I W KODZIE"
      ], cl: [
        "    dddddhhhhhhhhhhhhhddddd",
        "",
        "ssssssssdssssssssssssssssss",
        "ssssdddddssssssssssssssssss",
        "ssssdddddsssssss",
        "ssssssdddsssssssssssssssssss",
        "          sssssss",
        "sssssddddssssss",
        "",
        "",
        "      dddhhhhhhhhhhhhhddd",
        "",
        "ssssssssssssssssssssssssss",
        "sssssssssssssssssssssssssssssss",
        "ssssssssssssssssssssss",
        "sssssssssssssssssssssss",
        "sssssssssssssssssssssssssss",
        "sssssssssssssssssssss",
        "",
        "",
        "       dddhhhhhhhhhhhddd",
        "",
        "sssssssssssdddddddddddddsssssss",
        "dddddssssssssssss",
        "ssssssssddddddddddddddddddsssss",
        "dddddsssssssssssss",
        "sssssssssssssssssdddddddddsssss",
        "dddddsssssss",
        "ssssssssssddddddddddddddsssssss",
        "dddddssssss",
        "",
        "",
        "      dddhhhhhhhhhhhhddd",
        "",
        "    ssssssssssdddsssssssss",
        "  sssssssssssssdddsssssssssss",
        "        sssssssssssssss",
        "",
        "",
        "        ssssssssssssss",
        "              dd",
        "      sssssssssssssssssss"
      ]}
    };
    /* ---- pełny profil IT: treść złożona z bloków; ornamenty boki z układu powyżej, środkowy fragment (wiersze A..B-1) powtarzany tyle razy, ile trzeba ---- */
    const BLOCKS = [
      {kv: [['AUTOR', 'DANIEL KRZYKOWSKI'], ['TYTUŁ', 'MSc COMPUTER SCIENCE (AI)'], ['ROLA', 'PYTHON & ML ENGINEER'], ['UCZELNIA', 'UMK TORUŃ'], ['JĘZYKI', 'PL NATYWNY · EN B2']]},
      {h: 'PROFIL'},
      {p: 'Absolwent informatyki, student magisterski sztucznej inteligencji na UMK w Toruniu. Pracuję w centrum operacji sieciowych (NOC) w MSK TORMAN. Praca magisterska rozwija system Visual Echoes 2.0 (pierwotnie z Facebook AI Research): lepsza percepcja 3D dzięki dokładniejszemu modelowaniu orientacji w przestrzeni.'},
      {h: 'DOŚWIADCZENIE'},
      {e: ['OPERATOR NOC · MSK TORMAN', '10.2025 → TERAZ', 'Nadzór operacyjny nad siecią MSK TORMAN w środowisku NOC: monitoring sieci i systemów, rozpoznawanie i obsługa incydentów, eskalacja do zespołów technicznych, dokumentowanie zdarzeń.']},
      {e: ['STAŻ · PFEIFER & LANGEN POLSKA', '08.2023 – 09.2023', 'Helpdesk, pomoc przy zadaniach infrastruktury sieciowej, pierwsze prace z Power BI (wizualizacja i analiza danych).']},
      {e: ['SOFTWARE ENGINEER · LUXOLIS', '09.2023 – 10.2023', 'Przygotowanie danych, dobór modeli, projekt API, wdrożenie i utrzymanie rozwiązań opartych na AI.']},
      {h: 'PROJEKT WYBRANY'},
      {e: ['VISUAL ECHOES 2.0', 'PRACA MAGISTERSKA · 2025 →', 'System percepcji 3D dla agentów autonomicznych: echo jako sygnał nadzorujący przy estymacji głębi z obrazów RGB. Mój wkład: klasyfikacja 4 kierunków zastąpiona modelowaniem 36 orientacji (co 10°) dla drobniejszej rozdzielczości kątowej; krzywa nasyca się przy 9-12 orientacjach.']},
      {h: 'EDUKACJA'},
      {e: ['MAGISTER · INFORMATYKA (AI)', 'UMK TORUŃ · 10.2024 → TERAZ', '']},
      {e: ['INŻYNIER · INFORMATYKA', 'UMK TORUŃ · 10.2020 – 05.2024', '']},
      {h: 'UMIEJĘTNOŚCI'},
      {kv: [['JĘZYKI', 'Python · C / C++ · C# / .NET · JavaScript · PHP'], ['WEB', 'REST API · React · Selenium'], ['DANE', 'PostgreSQL / MySQL · NumPy · Pandas · scikit-learn · PyTorch'], ['SYSTEMY', 'Linux / Bash · Git · Docker'], ['IT OPS', 'Network Monitoring · Incident Management · IT Operations']]},
      {h: 'MIĘKKIE'},
      {p: 'Charyzma i komunikacja · współpraca · kreatywność · adaptacja do projektu · dbałość o szczegóły · rozwiązywanie problemów · myślenie analityczne i krytyczne · priorytetyzacja zadań i czasu'},
      {h: 'INNE RELEASY'},
      {c: ['WIKIROOMS ·÷· REMUZ.IO ·÷· MUSICCLUBAPP', 'SHADOWDETECTION ·÷· GAMEINJAVA']},
      {h: 'ZAINTERESOWANIA'},
      {c: ['IT · MUZYKA · FOTOGRAFIA · DIY · BIEGANIE']},
      {h: 'KONTAKT'},
      {kv: [['GITHUB', 'github.com/d4krzyk'], ['LINKEDIN', 'linkedin.com/in/d4krzyk']]},
      {c: ['', 'DŹWIĘK I OBRAZ  //  W SZTUCE I W KODZIE']},
    ];
    // linki w NFO: słowo kluczowe w wierszu -> litera klasy (A..H) -> adres; po wciśnięciu napis zapala się na czerwono i otwiera repozytorium
    const GH = 'https://github.com/d4krzyk/';
    const LINKS = { A: GH + 'MasterWorkVE-2.0', B: GH + 'WikiRooms-Project', C: GH + 'Remuz-io', D: GH + 'MusicClubApp', E: GH + 'ShadowDetection', F: GH + 'GameInJava', G: 'https://github.com/d4krzyk', H: 'https://www.linkedin.com/in/d4krzyk' };
    const KEYS = [['VISUAL ECHOES 2.0', 'A'], ['WIKIROOMS', 'B'], ['REMUZ.IO', 'C'], ['MUSICCLUBAPP', 'D'], ['SHADOWDETECTION', 'E'], ['GAMEINJAVA', 'F'], ['github.com/d4krzyk', 'G'], ['linkedin.com/in/d4krzyk', 'H']];
    const linkify = rows => rows.map(([t, k]) => { const kk = [...k.padEnd(t.length, ' ')]; for (const [key, L] of KEYS) { let i = t.indexOf(key); while (i >= 0) { for (let j = 0; j < key.length; j++) kk[i + j] = L; i = t.indexOf(key, i + key.length); } } return [t, kk.join('')]; });
    const wrapText = (t, w) => { const out = []; let cur = ''; for (const wd of t.split(/\s+/)) { if (!wd) continue; if (!cur) cur = wd; else if ((cur + ' ' + wd).length <= w) cur += ' ' + wd; else { out.push(cur); cur = wd; } } if (cur) out.push(cur); return out; };
    // wiersze treści: [tekst, klasy] o szerokości do w
    const compose = (w, gap = 0) => {
      const rows = []; const add = (t, k) => rows.push([t, k || ' '.repeat(t.length)]);
      const mid = (t, k) => { const pad = Math.max(0, Math.floor((w - t.length) / 2)); add(' '.repeat(pad) + t, ' '.repeat(pad) + (k || 's'.repeat(t.length))); };
      for (const b of BLOCKS) {
        if (b.h) { for (let g = 0; g <= gap; g++) rows.push(['', '']); const t = `─═ ${b.h} ═─`; mid(t, 'dd' + 'd' + 'h'.repeat(b.h.length) + 'ddd'); rows.push(['', '']); }
        else if (b.p) wrapText(b.p, w).forEach(l => add(l, 's'.repeat(l.length)));
        else if (b.c) b.c.forEach(l0 => wrapText(l0, w).forEach(l => mid(l, 's'.repeat(l.length))));
        else if (b.kv) { const kc = Math.min(11, Math.floor(w * .34)); for (const [k, v] of b.kv) { if (Math.max(...v.split(' ').map(x => x.length)) > w - kc) { add(k, 'd'.repeat(k.length)); wrapText(v, w - 2).forEach(l => add('  ' + l, '  ' + 's'.repeat(l.length))); continue; } const vl = wrapText(v, w - kc - 1); vl.forEach((l, i) => { const key = i ? ' '.repeat(kc) : (k + ' ' + '.'.repeat(Math.max(1, kc - k.length - 2)) + ' ').padEnd(kc); const t = key + l; add(t.slice(0, w), (i ? ' '.repeat(kc) : 'd'.repeat(Math.min(kc, key.length))) + 's'.repeat(Math.max(0, t.length - kc))); }); } }
        else if (b.e) { const [t1, t2, tx] = b.e; wrapText(t1, w).forEach(l => add(l, 's'.repeat(l.length))); add('  ' + t2, '  ' + 'd'.repeat(t2.length)); wrapText(tx, w - 2).forEach(l => add('  ' + l, '  ' + 's'.repeat(l.length))); if (tx) rows.push(['', '']); }
      }
      return linkify(rows);
    };
    {
      const A = 9, B = 26, TW = 40, X0 = 23, SRC = L.full, N0 = SRC.ch.length;
      let body = compose(TW); while (body.length && !body[0][0]) body.shift();
      const ROW0 = 3, TAIL = 11;
      const loops = Math.max(0, Math.ceil((ROW0 + body.length + 3 - (A + TAIL)) / (B - A)));
      const total = A + loops * (B - A) + (N0 - B), slack = total - 1 - ROW0 - body.length - 2, heads = BLOCKS.filter(b => b.h).length;
      if (slack >= heads) { body = compose(TW, Math.floor(slack / heads)); while (body.length && !body[0][0]) body.shift(); }
      const idx = []; for (let i = 0; i < A; i++) idx.push(i); for (let l = 0; l < loops; l++) for (let i = A; i < B; i++) idx.push(i); for (let i = B; i < N0; i++) idx.push(i);
      const ch = [], cl = [];
      idx.forEach((si, ri) => {
        let r = [...SRC.ch[si].padEnd(86)], k = [...SRC.cl[si].padEnd(86)];
        if (ri >= 2 && ri < idx.length - 1) {
          // środek wymieniamy na nasz tekst (wiersz 2 to napis nagłówka, który podmieniamy też)
          for (let c = X0; c < X0 + TW; c++) { r[c] = ' '; k[c] = ' '; }
          const ln = body[ri - ROW0];
          if (ri === 2) { const t = '·─═≡ P R O F I L   I T ≡═─·'; const pad = X0 + Math.floor((TW - t.length) / 2); [...t].forEach((c, i) => { r[pad + i] = c; k[pad + i] = c === ' ' ? ' ' : /[A-Z]/.test(c) ? 'h' : 'd'; }); }
          else if (ln) [...ln[0]].forEach((c, i) => { r[X0 + i] = c; k[X0 + i] = ln[1][i] || ' '; });
        }
        ch.push(r.join('')); cl.push(k.join(''));
      });
      L.full = { cols: 86, ch, cl, off: idx.length - N0 };
      const cw = 31, cb = compose(cw); while (cb.length && !cb[0][0]) cb.shift();
      L.compact = { cols: cw, ch: ['    ·─═≡ P R O F I L   I T ≡═─·', ...cb.map(r => r[0])], cl: ['dddddddhhhhhhhhhhhhhdddddd'.padEnd(31, ' '), ...cb.map(r => r[1].padEnd(r[0].length, ' '))] };
      L.compact.ch = L.compact.ch.map(l => l.slice(0, cw)); L.compact.cl = L.compact.cl.map(l => l.slice(0, cw));
      var DROPOFF = L.full.off;
    }
    // spadająca kropla (układ FULL): klatki [wiersz, kolumna, znak, klasa]
    const DROP = [[[33, 75, "▀", "r"], [34, 75, " ", " "], [35, 75, " ", " "], [36, 75, " ", " "]], [[33, 75, "█", "r"], [34, 75, " ", " "], [35, 75, " ", " "], [36, 75, " ", " "]], [[33, 75, "▄", "r"], [34, 75, " ", " "], [35, 75, " ", " "], [36, 75, " ", " "]], [[33, 75, " ", " "], [34, 75, "▀", "r"], [35, 75, " ", " "], [36, 75, " ", " "]], [[33, 75, " ", " "], [34, 75, "▄", "r"], [35, 75, " ", " "], [36, 75, " ", " "]], [[33, 75, " ", " "], [34, 75, " ", " "], [35, 75, "▀", "r"], [36, 75, " ", " "]], [[33, 75, " ", " "], [34, 75, " ", " "], [35, 75, "▄", "r"], [36, 75, " ", " "]], [[33, 75, " ", " "], [34, 75, " ", " "], [35, 75, " ", " "], [36, 75, "▀", "r"]], [[33, 75, " ", " "], [34, 75, " ", " "], [35, 75, " ", " "], [36, 75, " ", " "]]];
    DROP.forEach(f => f.forEach(c => { c[0] += DROPOFF; }));
    const CLASS = {d: 'd', h: 'h', o: 'o', q: 'q', r: 'r'};
    const esc = g => g === '&' ? '&amp;' : g === '<' ? '&lt;' : g === '>' ? '&gt;' : g;
    let mode = null, dec = null;
    // rozkodowanie przy wczytaniu (jak w szczelinie): każdy znak przechodzi przez bloki ▓▒░, od góry ku dołowi, w rozrzuconej kolejności
    const BLK = '▓▒░', dh = (r, c) => { let n = (r * 7919 + c * 104729) ^ 0x5bd1e995; n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d); return ((n ^ (n >>> 13)) >>> 0) / 4294967296; };
    const render = (fx) => {
      const G = L[mode];
      const ov = {};
      if (fx) for (const [r, c, g, k] of fx) ov[r * 1000 + c] = [g, k];
      const out = [];
      for (let r = 0; r < G.ch.length; r++) {
        const row = [...G.ch[r]], cls = G.cl[r];
        let html = '', run = '', k0 = null;
        const flush = () => {
          if (!run) return;
          const c = CLASS[k0];
          if (LINKS[k0]) { html += `<a class="lk" href="${LINKS[k0]}" target="_blank" rel="noopener noreferrer">${run}</a>`; run = ''; return; }
          html += c ? `<span class="${c}"${c === 'o' || c === 'q' || c === 'r' ? ' aria-hidden="true"' : ''}>${run}</span>` : run;
          run = '';
        };
        const n = Math.max(row.length, fx ? G.cols : 0);
        for (let c = 0; c < n; c++) {
          let g = row[c] || ' ', k = cls[c] || ' ';
          const o = ov[r * 1000 + c];
          if (o) [g, k] = o;
          if (dec && g !== ' ') { const t = (dec.now - dec.t0 - (r / G.ch.length) * 900 - dh(r, c) * 420) / 150;
            if (t < 0) g = ' '; else if (t < 1) { g = BLK[Math.min(2, Math.floor(t * 3))]; k = 'd'; } }
          if ((g === ' ' && !LINKS[k]) || k === 's') k = ' ';
          if (k !== k0) { flush(); k0 = k; }
          run += esc(g);
        }
        flush();
        out.push(html.replace(/\s+$/, ''));
      }
      pre.innerHTML = out.join('\n');
    };
    const avail = () => { const cs = getComputedStyle(wrap); let w = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      wrap.querySelectorAll(':scope > img').forEach(im => { if (getComputedStyle(im).display !== 'none') w -= im.offsetWidth + 6; }); return w; };
    const pick = () => avail() >= L.full.cols * parseFloat(getComputedStyle(pre).fontSize) * .5 ? 'full' : 'compact';   // znak DOS = pół wysokości kroju
    const decode = () => {
      if (RM) return render(null);
      dec = { t0: performance.now(), now: performance.now() };
      const step = now => { dec.now = now; render(null); if (now - dec.t0 < 1600) requestAnimationFrame(step); else { dec = null; render(null); } };
      requestAnimationFrame(step);
    };
    const update = () => {
      const m = pick();
      if (m === mode) return;
      const first = mode === null;
      mode = m;
      pre.classList.toggle('compact', m === 'compact');
      if (first) decode(); else render(null);
    };
    update();
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(wrap);
    else addEventListener('resize', update, {passive: true});
    let holding = false;
    pre.addEventListener('pointerenter', () => { holding = true; }); pre.addEventListener('pointerleave', () => { holding = false; });
    pre.addEventListener('pointerdown', () => { holding = true; });
    pre.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a.lk'); if (!a) return; e.preventDefault();
      const url = a.href; a.classList.add('zap'); setTimeout(() => { a.classList.remove('zap'); window.open(url, '_blank', 'noopener'); }, RM ? 0 : 260); });
    if (!RM) {
      // co ~5 s kropla wydłuża się, odrywa i spada w dół (12 kl./s); tylko w układzie FULL
      let last = -1;
      loop(pre, 12, t => {
        if (mode !== 'full' || dec || holding) return;
        const cyc = t % 5200;
        const f = cyc < 4300 ? -1 : Math.min(DROP.length - 1, Math.floor((cyc - 4300) / 84));
        if (f !== last) { last = f; render(f < 0 ? null : DROP[f]); }
      });
    }
  }
}


FONTS().then(()=>{
  const c=$('demo'); if(!c) return;
  const x=c.getContext('2d',{willReadFrequently:true}); const W=320, COL=[196,18,29]; let H=200;
  const asm=`; KRZYK.COM — intro 256b
        org 100h
start:  mov al,13h
        int 10h          ; 320x200x256
        push 0a000h
        pop es
paleta: mov dx,3c8h
        xor ax,ax
        out dx,al
        inc dx
.p:     out dx,al        ; czerń → krew
        out dx,al
        out dx,al
        inc ax
        jnz .p
ogien:  mov cx,64000
.f:     mov al,[es:di+320]
        add al,[es:di+319]
        shr al,2
        stosb
        loop .f
        in al,60h
        dec al
        jnz ogien
        ret
; greetz: wszystkim, którzy
; jeszcze piszą ręcznie
`.split('\n');

  /* komunikaty: wyłącznie IT */
  const MSGS=[
    'MASZYNOLOGIA [IT]',
    'PYTHON · PYTORCH · HABITAT',
    'DOCKER · LINUX · REST API · POSTGRESQL',
    'VISUAL ECHOES 2.0: GŁĘBIA Z ECHA',
    '36 ORIENTACJI CO 10° · NASYCENIE PRZY 9-12',
    'OPERATOR NOC · MSK TORMAN',
    'RELEASE GOTOWY DO URUCHOMIENIA'
  ];
  /* śmieci do dekodowania: CP437 z Krzyk DOS (¤ nie ma w foncie) */
  const JUNK=[...'░▒▓█▄▀■≡±÷·°▌▐╬╫╪┼╔╗╚╝═║╠╣╦╩┤├┬┴αßΓπΣσµτΦΘΩδ∞φ√≈§¶@#$%&*<>?/\\ABCDEFGHJKLMNPRSTUVWXYZ0123456789'];

  /* sigile: drawGlyph(makeGlyph()) wypalone do ostrych, 1-bitowych sprite'ów 13×13 (s=10) */
  const SIG=[];
  while(SIG.length<24){
    const g=makeGlyph(); if(g.st.length<2) continue;
    const sc=document.createElement('canvas'); sc.width=sc.height=13; const sx=sc.getContext('2d',{willReadFrequently:true});
    sx.strokeStyle='#fff'; sx.fillStyle='#fff'; sx.lineWidth=1; drawGlyph(g,sx,1.5,1.5,10);
    const id=sx.getImageData(0,0,13,13), dd=id.data; let on=0;
    for(let k=0;k<dd.length;k+=4){ const v=dd[k+3]>96; dd[k]=dd[k+1]=dd[k+2]=255; dd[k+3]=v?255:0; on+=v; }
    if(on<12) continue; sx.putImageData(id,0,0); SIG.push(sc);
  }

  const CW=8, GAP=13, SEP='·÷·';
  const hash=n=>{ n=Math.imul(n^0x5bd1e995,0x9E3779B1); n^=n>>>15; n=Math.imul(n,0x85ebca6b); n^=n>>>13; return (n>>>0); };
  const h01=n=>hash(n)/4294967296;

  /* taśma: komunikat, przerwa z separatorem, następny… */
  const cells=[], blocks=[];
  MSGS.forEach((m,mi)=>{
    const chars=[...m];
    blocks.push({mi, start:cells.length, len:chars.length});
    chars.forEach((ch,i)=>cells.push({ch, m:mi, i, ph:Math.floor(Math.random()*997)}));
    for(let g=0;g<GAP;g++){ const si=g-5; cells.push({ch: si>=0&&si<3 ? SEP[si] : ' ', m:-1}); }
  });
  const LT=cells.length*CW;
  const ss=v=>v<=0?0:v>=1?1:v*v*(3-2*v);

  /* tempo liczone w klatkach: stały, całkowity krok piksela na klatkę */
  const FPS = RM ? 12 : 25, FT = 1000/FPS;
  const SP  = 2;                                // px/klatkę scrollera (50 px/s; RM 24 px/s)
  const A0  = RM ? 0 : 10;                      // amplituda fali śmieci (px)
  const QF  = RM ? 5 : 2;                       // klatek na jedną zmianę znaku-śmiecia
  const FL  = RM ? 0 : 3*SP;                    // błysk zatrzaśnięcia: 3 klatki
  /* strefa dekodowania liczona od prawej krawędzi (px przebyte przez znak) */
  const DS=116, DE=200;                         // pełna fala do DS, wygaszanie w stronę DE
  const AF=1.5;                                 // poniżej tej amplitudy fala = 0 (bez 1-px załamań, które czytają się jak ogonki: A→Ą)
  const LA=40,  LB=172;                         // zakres zatrzaśnięć (rozrzucona kolejność), kończy się zanim linia się wyprostuje
  /* demo na całą stronę: szerokość logiczna 320, wysokość dopasowana do proporcji okna; pas ze scrollerem zostaje przy dolnej krawędzi, a nad nim biegnie dłuższy listing */
  let Y0=141, BT=120, BB=175, SY=180, LN=10;
  const layout=()=>{ H=Math.max(200,Math.round(W*(innerHeight||200)/(innerWidth||320))); c.width=W; c.height=H; const d=H-200; Y0=141+d; BT=120+d; BB=175+d; SY=180+d; LN=Math.ceil((BT-2)/16)+1; };
  layout(); let rt; addEventListener('resize',()=>{ clearTimeout(rt); rt=setTimeout(layout,150); },{passive:true});
  const HOLD=Math.round(1300/FT)*SP;            // "KLUCZ OK" trzyma się ~1,3 s (w px drogi)

  /* każde przejście taśmy dekoduje w innej kolejności i z innymi sigilami */
  const lockD=(k,pass)=>LA+(LB-LA)*Math.pow(h01(k*7919+pass*104729+17),.62);
  const isSig=(k,pass)=>h01(k*3571+pass*7177+5)<.28;

  /* śmieci rysowane prosto na taśmie, potem gięte kolumna po kolumnie (klasyczny sine-scroller) */
  const SO=8, SH=40, ST=12;                     // margines X, wysokość taśmy, wiersz tekstu na taśmie
  const strip=document.createElement('canvas'); strip.width=W+2*SO; strip.height=SH;
  const sx=strip.getContext('2d');
  const amp=col=>{ const d=W-col, a=A0*(1-ss((d-DS)/(DE-DS))); return a<AF ? 0 : a; };   // obwiednia zależy tylko od X
  const AMP=new Float32Array(W); for(let i=0;i<W;i++) AMP[i]=amp(i);
  const DY=new Int8Array(W);                    // przesunięcie fali dla każdej kolumny (liczone co klatkę)

  let n=0;
  loop(c, FPS, ()=>{
    n++; const T=n*FT;
    x.fillStyle='#000'; x.fillRect(0,0,W,H);
    x.font='16px "Krzyk DOS"'; x.textBaseline='top';

    /* listing asm (jak w rev.03, przyciemniony do ~65% rastra), 1 px/klatkę */
    const ay=n%(asm.length*16);
    x.fillStyle='rgb(170,170,170)';
    for(let i=0;i<LN;i++){ const li=Math.floor(ay/16)+i; x.fillText(asm[li%asm.length],4,i*16-(ay%16)); }
    // rozpuszczanie listingu na górze i nad pasem
    let g=x.createLinearGradient(0,0,0,22); g.addColorStop(0,'rgba(0,0,0,1)'); g.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=g; x.fillRect(0,0,W,22);
    g=x.createLinearGradient(0,BT-34,0,BT-2); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,1)'); x.fillStyle=g; x.fillRect(0,BT-34,W,32);
    x.fillStyle='#000'; x.fillRect(0,BT-2,W,H-BT+2);

    /* pasek copper: kropkowane linie rzednące ku górze, maszerujące; na dole jedna linia */
    const f=Math.floor(n/(RM?5:3));
    x.fillStyle='#fff';
    for(let k=f%2;k<W;k+=2) x.fillRect(k,BT,1,1);
    for(let k=(f>>1)%4;k<W;k+=4) x.fillRect(k,BT-3,1,1);
    for(let k=(f>>2)%8;k<W;k+=8) x.fillRect(k,BT-7,1,1);
    for(let k=(W+1-f%2)%2;k<W;k+=2) x.fillRect(k,BB,1,1);

    /* scroller: śmieci na fali → dekodowanie → prosta linia */
    const s=n*SP-8;
    sx.clearRect(0,0,strip.width,SH); sx.font='16px "Krzyk DOS"'; sx.textBaseline='top';
    const ph1=T/430, ph2=T/610;
    for(let col=0;col<W;col++){ const a=AMP[col]; DY[col]=a ? Math.round(a*(Math.sin(col/13+ph1)+.28*Math.sin(col/31-ph2))) : 0; }
    const flashes=[], sigs=[], solid=[]; let prevFlashK=-9;
    for(let k=0;k<cells.length;k++){
      const raw=s-k*CW; if(raw<0) continue; const d=raw%LT; if(d>W+CW) continue;
      const cl=cells[k], px=W-d+SO, pass=Math.floor(raw/LT);
      if(cl.m<0){ if(cl.ch!==' ') solid.push([cl.ch,px-SO,'rgb(175,175,175)']); continue; }
      const L=lockD(k,pass);
      if(d>=L){
        if(cl.ch===' ') continue;                 // spacja w komunikacie: po zatrzaśnięciu po prostu znika
        // błysk w odwróconym wideo tylko na pierwsze klatki po zatrzaśnięciu i nigdy dwa obok siebie
        if(d-L<FL && prevFlashK!==k-1){ flashes.push([cl.ch,px-SO]); prevFlashK=k; continue; }
        solid.push([cl.ch,px-SO,'#fff']);
      } else {
        const hn=hash(k*131+pass*31+Math.floor((n+cl.ph)/(QF+cl.ph%2)));
        if(isSig(k,pass) && (hn&1)===0) sigs.push([SIG[(hn>>>1)%SIG.length],px-SO]);   // sigil: sztywny, nie gięty
        else { sx.fillStyle=(hn&7)===0 ? 'rgb(150,150,150)' : 'rgb(222,222,222)'; sx.fillText(JUNK[(hn>>>3)%JUNK.length],px,ST); }
      }
    }
    // gięcie śmieci: każda kolumna przesunięta o falę (śmieci „topią się” na sinusie)
    if(!A0) x.drawImage(strip,SO,0,W,SH,0,Y0-ST,W,SH);
    else for(let col=0;col<W;col++) x.drawImage(strip,col+SO,0,1,SH,col,Y0-ST+DY[col],1,SH);
    // to, co już odkodowane, jest sztywne: litera jedzie na fali w całości, bez 1-px załamań (A nie udaje Ą),
    // i osiada razem z obwiednią, aż linia jest idealnie prosta. Sigile (drawGlyph/makeGlyph) też sztywne i ostre.
    const wy=px=>Y0+DY[clamp(px+4,0,W-1)];
    for(const [img,px] of sigs) x.drawImage(img,px-2,wy(px)+2);
    for(const [ch,px,col] of solid){ x.fillStyle=col; x.fillText(ch,px,wy(px)); }
    // błyski zatrzaśnięcia na wierzchu, w ramce glifu (wiersze 1–14), nigdy dwa obok siebie
    for(const [ch,px] of flashes){ const y=wy(px); x.fillStyle='#fff'; x.fillRect(px-1,y+1,CW,14); x.fillStyle='#000'; x.fillText(ch,px,y); }

    /* wskaźnik dekodowania: najstarszy nieodkodowany komunikat; po odkodowaniu krótkie "KLUCZ OK" */
    let st=null;
    for(const b of blocks){
      const raw=s-b.start*CW; if(raw<0) continue;
      const hd=raw%LT, pass=Math.floor(raw/LT);
      let done=0, locked=0;
      for(let i=0;i<b.len;i++){ const L=lockD(b.start+i,pass); done=Math.max(done,L+i*CW); if(hd-i*CW>=L) locked++; }
      if(hd>=done+HOLD) continue;
      if(!st || hd>st.hd) st={hd, p: hd>=done ? 1 : locked/b.len};
    }
    const blink=RM ? 1 : Math.floor(n/10)%2;
    const TX='rgb(150,150,150)';
    if(st && st.p<1){
      x.fillStyle=TX; x.fillText('DEKODOWANIE',4,SY);
      const NB=8, BX=4+12*CW, nf=st.p*NB;
      for(let i=0;i<NB;i++){ const bx=BX+i*CW;
        if(i<Math.floor(nf)){ x.fillStyle='rgb(205,205,205)'; x.fillRect(bx,SY+3,7,9); }          // ▓
        else if(i===Math.floor(nf) && !RM && n%4<2){ x.fillStyle='rgb(150,150,150)'; x.fillRect(bx,SY+3,7,9); }
        else { x.fillStyle='rgb(62,62,62)'; x.fillRect(bx,SY+3,7,9); } }                           // ░
      x.fillStyle=TX; x.fillText((String(Math.floor(st.p*100))+'%').padStart(4,' '),BX+NB*CW+4,SY);
      if(blink) x.fillRect(BX+NB*CW+4+4*CW+2,SY+2,6,10);
    } else if(st){
      x.fillStyle=TX; x.fillText('KLUCZ OK',4,SY);
    } else if(blink){
      x.fillStyle=TX; x.fillRect(4,SY+2,6,10);
    }

    oneBit(x,W,H,COL,{bias:0});
  });
});

}
