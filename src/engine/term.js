// terminal Maszynologii: wirtualny system plików (CV, projekty, kontakt), polecenia linuksowe, krzyk przy próbie zmian;
// wyjście wjeżdża linia po linii jak w demoscenie (linia ASCII przelatuje, rozwiera się w górę i w dół, znaki rozkodowują się z bloków)
import { RM } from './core';

const BL = '░▒▓';
const HOME = '/home/daniel';
const ME = 'gosc', HOST = 'maszynologia';                 // terminal przegląda gość, nie właściciel

/* ---------- pliki ---------- */
const P = (title, lines) => [`# ${title}`, '', ...lines];
const TODO = ['Opis projektu jest w przygotowaniu.', 'Wróć tu niedługo albo zajrzyj do: cat ~/kontakt.txt'];
const FS = {
  '/': { d: ['bin', 'etc', 'home', 'proc', 'tmp', 'usr', 'var'] },
  '/bin': { d: [], f: ['bash', 'cat', 'cd', 'ls', 'pwd', 'grep', 'tree', 'neofetch'] },
  '/etc': { d: [], f: ['hostname', 'motd', 'os-release', 'passwd'] },
  '/home': { d: ['daniel'] },
  '/home/daniel': { d: ['projekty', 'doswiadczenie', 'edukacja'], f: ['cv.txt', 'o-mnie.txt', 'kontakt.txt', 'umiejetnosci.txt'], h: ['.bashrc', '.bash_history'] },
  '/home/daniel/projekty': { d: ['visual-echoes-2.0', 'wikirooms', 'remuz.io', 'musicclubapp', 'shadowdetection', 'gameinjava'] },
  '/home/daniel/projekty/visual-echoes-2.0': { f: ['README.md', 'github.url'] },
  '/home/daniel/projekty/wikirooms': { f: ['README.md', 'github.url'] },
  '/home/daniel/projekty/remuz.io': { f: ['README.md', 'github.url'] },
  '/home/daniel/projekty/musicclubapp': { f: ['README.md', 'github.url'] },
  '/home/daniel/projekty/shadowdetection': { f: ['README.md', 'github.url'] },
  '/home/daniel/projekty/gameinjava': { f: ['README.md', 'github.url'] },
  '/home/daniel/doswiadczenie': { f: ['msk-torman.txt', 'luxolis.txt', 'pfeifer-langen.txt'] },
  '/home/daniel/edukacja': { f: ['umk-torun.txt'] },
  '/proc': { f: ['cpuinfo', 'uptime', 'version'] },
  '/tmp': {}, '/usr': { d: ['bin', 'share'] }, '/usr/bin': {}, '/usr/share': {},
  '/var': { d: ['log'] }, '/var/log': { f: ['syslog'] },
};
const FILES = {
  '/home/daniel/cv.txt': ['DANIEL KRZYK — MASZYNOLOGIA [IT]', '', 'DOŚWIADCZENIE', '  2025 →  MSK TORMAN ......... operator NOC', '  2023    LUXOLIS ............ software engineer', '  2023    PFEIFER & LANGEN ... staż IT', '',
    'EDUKACJA', '  2024 →  UMK TORUŃ .......... MSc, sztuczna inteligencja', '', 'PROJEKTY', '  visual-echoes-2.0 · wikirooms · remuz.io · musicclubapp · shadowdetection · gameinjava', '',
    'STACK', '  python · pytorch · habitat · docker · linux · rest api · postgresql', '', 'Więcej: ls ~/projekty  ·  cat ~/kontakt.txt'],
  '/home/daniel/o-mnie.txt': ['Dźwięk i obraz. W sztuce i w kodzie.', 'Maszyny, które widzą, słyszą i coś z tego rozumieją.'],
  '/home/daniel/kontakt.txt': ['e-mail ... (wkrótce)', 'github ... github.com/d4krzyk', '', 'Więcej w dziale Krzyk → kontakt.'],
  '/home/daniel/umiejetnosci.txt': ['python ......... ████████░░', 'pytorch ........ ███████░░░', 'linux .......... ████████░░', 'docker ......... ██████░░░░', 'rest api ....... ███████░░░', 'postgresql ..... ██████░░░░'],
  '/home/daniel/.bashrc': ['export PS1="\\u@\\h:\\w\\$ "', 'alias cv="cat ~/cv.txt"', 'alias projekty="ls ~/projekty"', '# greetz: wszystkim, którzy jeszcze piszą ręcznie'],
  '/home/daniel/.bash_history': ['ssh noc-01', 'docker ps', 'python train.py --orientations 36', 'git push', 'cat /dev/urandom | head -c 64 | xxd', 'exit'],
  '/home/daniel/projekty/visual-echoes-2.0/README.md': P('VISUAL ECHOES 2.0', ['Praca magisterska · 2025 → · autor', 'Stack: python · pytorch · habitat', '',
    'Ile orientacji agenta trzeba wyrenderować akustycznie, żeby model przewidujący głębię z obrazu i echa działał dobrze?',
    'Rozszerzenie VisualEchoes z 4 kierunków do 36 orientacji co 10°.', 'Wynik: krzywa nasyca się przy 9-12 orientacjach; 4 → 9 daje 6,7× więcej niż reszta rozszerzenia do 36.']),
  '/home/daniel/projekty/wikirooms/README.md': P('WIKIROOMS', ['Projekt badawczo-rozwojowy.', 'Backend: FastAPI · Alembic · PostgreSQL · Docker Compose (z pgAdminem).']),
  '/home/daniel/projekty/remuz.io/README.md': P('REMUZ.IO', ['Praca dyplomowa: edytor wielościeżkowego audio w przeglądarce.', 'Wavesurfer.js: podgląd i edycja przebiegów fali w czasie rzeczywistym.', 'Stack: javascript · node.js']),
  '/home/daniel/projekty/musicclubapp/README.md': P('MUSICCLUBAPP', ['Aplikacja do poznawania ludzi o podobnym guście muzycznym.', 'Wspólni artyści i gatunki z katalogu Deezera ustawiają propozycje znajomych; posty, czat, powiadomienia, PL/EN.', 'Stack: spring boot · postgresql · react + vite · docker compose']),
  '/home/daniel/projekty/shadowdetection/README.md': P('SHADOWDETECTION', ['Szacowanie kierunku źródła światła z geometrii cieni na obrazie, w GIF-ach i wideo.', 'Dane: SBU Shadow Dataset, VIDIT.', 'Stack: python']),
  '/home/daniel/projekty/gameinjava/README.md': P('GAMEINJAVA', ['Gra w Javie.', 'Stack: java']),
  '/home/daniel/projekty/visual-echoes-2.0/github.url': ['https://github.com/d4krzyk/MasterWorkVE-2.0'],
  '/home/daniel/projekty/wikirooms/github.url': ['https://github.com/d4krzyk/WikiRooms-Project'],
  '/home/daniel/projekty/remuz.io/github.url': ['https://github.com/d4krzyk/Remuz-io'],
  '/home/daniel/projekty/musicclubapp/github.url': ['https://github.com/d4krzyk/MusicClubApp'],
  '/home/daniel/projekty/shadowdetection/github.url': ['https://github.com/d4krzyk/ShadowDetection'],
  '/home/daniel/projekty/gameinjava/github.url': ['https://github.com/d4krzyk/GameInJava'],
  '/home/daniel/doswiadczenie/msk-torman.txt': ['MSK TORMAN · 2025 →', 'Operator NOC: monitoring sieci i usług, reagowanie na incydenty.'],
  '/home/daniel/doswiadczenie/luxolis.txt': ['LUXOLIS · 2023', 'Software engineer.'],
  '/home/daniel/doswiadczenie/pfeifer-langen.txt': ['PFEIFER & LANGEN · 2023', 'Staż IT.'],
  '/home/daniel/edukacja/umk-torun.txt': ['UMK TORUŃ · 2024 →', 'Studia magisterskie: sztuczna inteligencja.'],
  '/etc/hostname': [HOST], '/etc/motd': ['KrzykOS 2026'],
  '/etc/os-release': ['NAME="KrzykOS"', 'VERSION="2026"', 'ID=krzyk', 'PRETTY_NAME="KrzykOS 2026"'],
  '/etc/passwd': ['root:x:0:0:root:/root:/bin/nologin', 'daniel:x:1000:1000:Daniel:/home/daniel:/bin/bash', 'gosc:x:1001:1001:gość:/home/daniel:/bin/bash'],
  '/proc/cpuinfo': ['model name : Intel 80486DX2 @ 66 MHz (turbo)', 'cache size : 8 KB', 'flags      : fpu vme krzyk'],
  '/proc/version': ['Linux version 6.6.6-krzyk (gcc 13) #1 SMP PREEMPT'],
  '/var/log/syslog': ['crond: odpalono dekoder sine-scrollera', 'sshd: gość zalogowany z przeglądarki', 'kernel: wykryto próbę rm -rf, odmówiono z krzykiem'],
};
const T0 = Date.now();
const DESC = {
  '/': 'korzeń systemu', '/bin': 'polecenia', '/etc': 'konfiguracja systemu', '/home': 'katalogi domowe', '/proc': 'procesor i jądro', '/tmp': 'pliki tymczasowe (pusto)',
  '/usr': 'programy i zasoby', '/usr/bin': 'programy', '/usr/share': 'zasoby', '/var': 'dane zmienne', '/var/log': 'logi systemowe',
  '/home/daniel': 'katalog domowy · CV, projekty, doświadczenie, kontakt', '/home/daniel/projekty': 'projekty · w każdym README.md i github.url',
  '/home/daniel/doswiadczenie': 'doświadczenie zawodowe', '/home/daniel/edukacja': 'edukacja',
  '/home/daniel/projekty/visual-echoes-2.0': 'praca magisterska · echo, obraz i głębia', '/home/daniel/projekty/wikirooms': 'projekt badawczo-rozwojowy · fastapi, postgresql',
  '/home/daniel/projekty/remuz.io': 'praca dyplomowa · wielościeżkowy edytor audio', '/home/daniel/projekty/musicclubapp': 'ludzie o podobnym guście muzycznym',
  '/home/daniel/projekty/shadowdetection': 'kierunek światła z geometrii cieni', '/home/daniel/projekty/gameinjava': 'gra w javie',
};

const norm = (cwd, p) => {
  if (!p || p === '~') return HOME;
  if (p.startsWith('~')) p = HOME + p.slice(1);
  const parts = (p.startsWith('/') ? p : cwd + '/' + p).split('/'), out = [];
  for (const s of parts) { if (!s || s === '.') continue; if (s === '..') out.pop(); else out.push(s); }
  return '/' + out.join('/');
};
const isDir = p => !!FS[p];
const isFile = p => !!FILES[p] || (() => { const i = p.lastIndexOf('/'), d = FS[p.slice(0, i) || '/'], n = p.slice(i + 1); return d && ((d.f || []).includes(n) || (d.h || []).includes(n)); })();
const read = p => FILES[p] || ['(plik binarny albo pusty)'];
const short = p => p === HOME ? '~' : p.startsWith(HOME + '/') ? '~' + p.slice(HOME.length) : p;

const SCREAM = ['███ K R Z Y K ███', 'BRAK UPRAWNIEŃ!!!'];
const DENY = new Set(['rm', 'rmdir', 'mv', 'cp', 'mkdir', 'touch', 'chmod', 'chown', 'chgrp', 'ln', 'dd', 'mkfs', 'kill', 'killall', 'pkill', 'shutdown', 'reboot', 'halt', 'poweroff',
  'apt', 'apt-get', 'pacman', 'dnf', 'yum', 'pip', 'npm', 'useradd', 'userdel', 'passwd', 'mount', 'umount', 'fdisk', 'crontab', 'systemctl', 'service', 'iptables', 'truncate', 'shred', 'wget', 'curl', 'scp', 'rsync', 'git']);
const EDIT = new Set(['nano', 'vim', 'vi', 'emacs', 'ed', 'code']);
const HELP = [
  'POLECENIA (dotknij nazwy pliku lub katalogu w wyniku, żeby go otworzyć; Tab dopełnia, ↑↓ historia)', '',
  '— pliki i katalogi —',
  'ls [-l] [-a] [ścieżka] ... zawartość katalogu; -l szczegóły, -a ukryte pliki (ll = ls -la)',
  'cd [ścieżka] ............. zmiana katalogu: cd projekty · cd .. · cd ~ · cd /etc',
  'pwd ...................... bieżący katalog',
  'tree [ścieżka] ........... drzewo katalogów',
  'find [ścieżka] -name x ... szukanie po nazwie, np. find ~ -name readme',
  'cat <plik> ............... wyświetla plik (też: less, more)',
  'head <plik> · tail <plik>  pierwsze / ostatnie 5 wierszy',
  'grep <słowo> <plik> ...... wiersze zawierające słowo, np. grep python cv.txt',
  'wc <plik> ................ wiersze, słowa, znaki',
  'file <ścieżka> ........... rodzaj pliku', 'du ....................... zajętość katalogów',
  '', '— skróty —',
  'cv ....................... cat ~/cv.txt',
  'projekty ................. lista projektów',
  'open <projekt> ........... README projektu, np. open wikirooms',
  'cat github.url ........... otwiera repozytorium projektu na GitHubie',
  'kontakt · o-mnie ......... cat ~/kontakt.txt · cat ~/o-mnie.txt',
  '', '— system —',
  'whoami · id · hostname ... kim i gdzie jesteś',
  'uname [-a] ............... jądro i system',
  'uptime · date · cal ...... czas pracy, data, kalendarz',
  'ps · top ................. procesy',
  'df -h · free -h .......... dysk i pamięć',
    'env · echo <tekst> ....... zmienne środowiska · wypisanie tekstu',
  'history · which <cmd> .... historia poleceń · ścieżka polecenia',
  'man <polecenie> .......... krótki opis polecenia',
  '', '— zabawa —',
  'neofetch · cowsay <tekst> · matrix · banner <tekst>',
  '', '— strona —',
  'brama · krzyk ............ przejście do innego działu',
  'clear (Ctrl+L) ........... czyści ekran',
  'exit ..................... wyjście do bramy',
];
const MAN = { ls: 'ls — wypisuje zawartość katalogu. -l szczegóły, -a ukryte pliki.', cd: 'cd — zmienia katalog. cd .. w górę, cd ~ do domu.', cat: 'cat — wyświetla plik.', rm: 'rm — w tym systemie: krzyk.', grep: 'grep WZÓR PLIK — wiersze zawierające wzór.', open: 'open PROJEKT — otwiera README projektu.' };

export function initTerm(root, { go } = {}) {
  const out = root.querySelector('.t-out'), form = root.querySelector('.t-line'), inp = root.querySelector('.t-in'), ps = root.querySelector('.t-ps');
  let cwd = HOME; const hist = []; let hi = 0, queue = Promise.resolve();
  const prompt = () => `${ME}@${HOST}:${short(cwd)}$`;
  const hp = root.querySelector('.t-path'), hd = root.querySelector('.t-desc');
  const setPs = () => { ps.textContent = prompt(); if (hp) hp.textContent = short(cwd); if (hd) hd.textContent = DESC[cwd] || ''; };

  /* ---------- wyjście: linie wjeżdżają schodkowo, znaki rozkodowują się z bloków ---------- */
  // linia = tablica segmentów {t, c(klasa), cmd(polecenie po dotknięciu)}
  const seg = (t, c, cmd) => ({ t, c, cmd });
  const decodeChars = (spans, t0) => {
    if (RM) return;
    const rv = spans.map(() => 60 + Math.random() * 380), orig = spans.map(s => s.textContent);
    spans.forEach((s, i) => { if (orig[i] !== ' ') s.textContent = ' '; });
    const tick = now => { let busy = false;
      spans.forEach((s, i) => { if (orig[i] === ' ') return; const k = (now - t0 - rv[i]) / 150;
        const ch = k < 0 ? ' ' : k < 1 ? BL[2 - Math.min(2, Math.floor(k * 3))] : orig[i];
        if (s.textContent !== ch) s.textContent = ch; s.classList.toggle('blk', k >= 0 && k < 1); if (k < 1) busy = true; });
      if (busy) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  const print = (lines, cls = '') => {
    queue = queue.then(() => new Promise(done => {
      const els = lines.map((ln, i) => {
        const row = document.createElement('div'); row.className = 'tl ' + cls; if (RM) row.classList.add('on');
        const body = document.createElement('span'); body.className = 'tb'; const spans = [];
        (Array.isArray(ln) ? ln : [seg(ln)]).forEach(sg => {
          const w = document.createElement(sg.cmd ? 'button' : 'span'); w.className = sg.c || ''; if (sg.cmd) { w.type = 'button'; w.dataset.cmd = sg.cmd; w.classList.add('t-link'); }
          [...(sg.t || '')].forEach(ch => { const s = document.createElement('span'); s.textContent = ch; w.appendChild(s); spans.push(s); }); body.appendChild(w); });
        if (!spans.length) body.textContent = '\u00a0';
        row.appendChild(body); out.appendChild(row); return { row, spans };
      });
      out.scrollTop = out.scrollHeight;
      if (RM) { done(); return; }
      els.forEach(({ row, spans }, i) => setTimeout(() => { row.classList.add('on'); decodeChars(spans, performance.now() + 260); out.scrollTop = out.scrollHeight; }, i * 55));
      setTimeout(done, Math.min(900, els.length * 55 + 120));
    }));
    return queue;
  };
  const link = async url => { await print([[seg('otwieram ', 'dim'), seg(url, 'dir')]]); window.open(url, '_blank', 'noopener'); };
  // wiersze bez dekodowania, do animacji klatkowych (matrix)
  const raw = (n, cls) => { const rows = Array.from({ length: n }, () => { const r = document.createElement('div'); r.className = 'tl on pre plain ' + cls; out.appendChild(r); return r; }); out.scrollTop = out.scrollHeight; return rows; };
  const anim = (ms, fps, f) => new Promise(done => { if (RM) { f(1); return done(); } const t0 = performance.now(); let last = 0;
    const st = now => { if (now - last >= 1000 / fps) { last = now; f(Math.min(1, (now - t0) / ms)); } if (now - t0 < ms) requestAnimationFrame(st); else { f(1); done(); } }; requestAnimationFrame(st); });
  const cols = () => Math.max(20, Math.floor(out.clientWidth / (parseFloat(getComputedStyle(out).fontSize) * .5)) - 2);
  const GL = '01ABCDEFGHJKLMNPRSTUVWXYZ0123456789#$%&@*+=<>?░▒▓';
  const rain = () => queue = queue.then(() => { const H = 12, W = cols(), rows = raw(H, 'green'), drops = Array.from({ length: W }, () => Math.random() * -H * 1.5), sp = drops.map(() => .25 + Math.random() * .6), g = [];
    for (let y = 0; y < H; y++) g.push(Array.from({ length: W }, () => ' '));
    return anim(4200, 18, k => { for (let x = 0; x < W; x++) { drops[x] += sp[x]; const hy = Math.floor(drops[x]);
        for (let y = 0; y < H; y++) { const d = hy - y; g[y][x] = d === 0 ? GL[Math.floor(Math.random() * GL.length)] : d > 0 && d < 7 && k < .85 ? (Math.random() < .15 ? GL[Math.floor(Math.random() * GL.length)] : g[y][x]) : d >= 7 || k >= .85 && d > 0 ? ' ' : g[y][x]; }
        if (hy - 7 > H && k < .7) drops[x] = Math.random() * -6; }
      rows.forEach((r, y) => { r.textContent = g[y].join(''); }); }).then(() => rows.forEach(r => r.remove())); });
  const scream = () => {
    root.classList.remove('shake'); void root.offsetWidth; root.classList.add('shake');
    return print(SCREAM, 'scream');
  };

  /* ---------- polecenia ---------- */
  const listing = (p, flags) => {
    const d = FS[p]; if (!d) return [`ls: nie ma dostępu do '${p}': Nie ma takiego pliku ani katalogu`];
    const all = [...(d.d || []).map(n => [n, 1]), ...(d.f || []).map(n => [n, 0]), ...(flags.includes('a') ? (d.h || []).map(n => [n, 0]) : [])];
    if (!all.length) return [];
    const full = n => (p === '/' ? '' : p) + '/' + n;
    if (flags.includes('l')) return all.map(([n, dir]) => [seg(`${dir ? 'drwxr-xr-x' : '-r--r--r--'} 1 daniel daniel ${String(dir ? 4096 : (read(full(n)).join('\n').length || 64)).padStart(5)} paź 24 2026 `, 'dim'),
      seg(n + (dir ? '/' : ''), dir ? 'dir' : 'file', dir ? `cd ${full(n)}` : `cat ${full(n)}`)]);
    const line = []; all.forEach(([n, dir], i) => { if (i) line.push(seg('   ')); line.push(seg(n + (dir ? '/' : ''), dir ? 'dir' : 'file', dir ? `cd ${full(n)}` : `cat ${full(n)}`)); });
    return [line];
  };
  const tree = (p, pre = '', outl = []) => {
    const d = FS[p] || {}; const items = [...(d.d || []).map(n => [n, 1]), ...(d.f || []).map(n => [n, 0])];
    items.forEach(([n, dir], i) => { const last = i === items.length - 1, full = (p === '/' ? '' : p) + '/' + n;
      outl.push([seg(pre + (last ? '└── ' : '├── '), 'dim'), seg(n + (dir ? '/' : ''), dir ? 'dir' : 'file', dir ? `cd ${full}` : `cat ${full}`)]);
      if (dir) tree(full, pre + (last ? '    ' : '│   '), outl); });
    return outl;
  };
  const allPaths = (p = '/', acc = []) => { const d = FS[p] || {}; (d.d || []).forEach(n => { const f = (p === '/' ? '' : p) + '/' + n; acc.push(f + '/'); allPaths(f, acc); }); (d.f || []).forEach(n => acc.push((p === '/' ? '' : p) + '/' + n)); return acc; };
  const fileArg = (cmd, a) => { if (!a) return [`${cmd}: brak argumentu`]; const p = norm(cwd, a); if (isDir(p)) return [`${cmd}: ${a}: To jest katalog`]; if (!isFile(p)) return [`${cmd}: ${a}: Nie ma takiego pliku ani katalogu`]; return read(p); };
  // banner: pikselowy krój 3×5 z bloków
  const FONT5 = { a: '010101111101101', b: '110101110101110', c: '011100100100011', d: '110101101101110', e: '111100110100111', f: '111100110100100', g: '011100101101011', h: '101101111101101', i: '111010010010111',
    j: '001001001101010', k: '101101110101101', l: '100100100100111', m: '101111111101101', n: '110101101101101', o: '010101101101010', p: '110101110100100', q: '010101101110011', r: '110101110101101',
    s: '011100010001110', t: '111010010010010', u: '101101101101111', v: '101101101101010', w: '101101111111101', x: '101101010101101', y: '101101010010010', z: '111001010100111',
    0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110', 4: '101101111001001', 5: '111100110001110', 6: '011100110101010', 7: '111001010010010', 8: '010101010101010', 9: '010101011001110', ' ': '000000000000000', '-': '000000111000000', '!': '010010010000010', '.': '000000000000010' };
  const PL = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' };
  const banner = t => { const ch = [...t.toLowerCase().slice(0, 14)].map(c => FONT5[PL[c] || c] || FONT5[' ']);
    return [0, 1, 2, 3, 4].map(r => ch.map(g => [0, 1, 2].map(k => g[r * 3 + k] === '1' ? '█' : ' ').join('')).join(' ')); };
  const PROJ = Object.keys(FS).filter(k => k.startsWith(HOME + '/projekty/')).map(k => k.split('/').pop());

  const run = async raw => {
    const line = raw.trim(); await print([[seg(prompt() + ' ', 'ps'), seg(line)]], 'echo');
    if (!line) return;
    hist.push(line); hi = hist.length;
    if (/rm\s+-rf\s+\/(\s|$)/.test(line) || /:\(\)\s*\{/.test(line)) return scream();
    const [cmd0, ...args] = line.split(/\s+/); const cmd = cmd0.toLowerCase(); const a = args.filter(x => !x.startsWith('-')), flags = args.filter(x => x.startsWith('-')).join('');
    if (cmd === 'sudo' || cmd === 'su' || cmd === 'doas') return scream();
    if (DENY.has(cmd)) return scream();
    if (EDIT.has(cmd)) return scream();
    switch (cmd) {
      case 'help': case '?': return print(HELP);
      case 'ls': case 'dir': case 'll': return print(listing(norm(cwd, a[0] || '.'), cmd === 'll' ? 'la' : flags));
      case 'pwd': return print([cwd]);
      case 'cd': { const p = norm(cwd, a[0] || '~'); if (!isDir(p)) return print([`cd: ${a[0]}: ${isFile(p) ? 'To nie jest katalog' : 'Nie ma takiego pliku ani katalogu'}`], 'err'); cwd = p; setPs(); return print(listing(cwd, '')); }
      case 'cat': case 'less': case 'more': case 'bat': { const p = norm(cwd, a[0] || ''); if (p.endsWith('.url') && isFile(p)) return link(read(p)[0]); return print(fileArg(cmd, a[0])); }
      case 'head': return print(fileArg(cmd, a[0]).slice(0, 5));
      case 'tail': return print(fileArg(cmd, a[0]).slice(-5));
      case 'wc': { const f = fileArg(cmd, a[0]); return print([`${f.length} ${f.join(' ').split(/\s+/).length} ${f.join('\n').length} ${a[0] || ''}`]); }
      case 'file': { const p = norm(cwd, a[0] || '.'); return print([`${a[0]}: ${isDir(p) ? 'directory' : isFile(p) ? 'UTF-8 Unicode text' : 'cannot open'}`]); }
      case 'grep': { if (a.length < 2) return print(['użycie: grep WZÓR PLIK'], 'err'); const f = fileArg('grep', a[1]); const hits = f.filter(l => l.toLowerCase().includes(a[0].toLowerCase())); return print(hits.length ? hits : ['(brak dopasowań)']); }
      case 'tree': return print([short(norm(cwd, a[0] || '.')), ...tree(norm(cwd, a[0] || '.'))]);
      case 'find': { const base = norm(cwd, a[0] || '.'); const name = (args[args.indexOf('-name') + 1] || '').replace(/\*/g, ''); return print(allPaths(base).filter(p => p.startsWith(base) && p.includes(name)).map(p => [seg(p, p.endsWith('/') ? 'dir' : 'file', p.endsWith('/') ? `cd ${p}` : `cat ${p}`)])); }
      case 'du': return print(['4.0K\t./kontakt.txt', '8.0K\t./cv.txt', '1.3M\t./projekty', '666K\t./doswiadczenie', '1.9M\t.']);
      case 'cv': return print(read(HOME + '/cv.txt'));
      case 'kontakt': return print(read(HOME + '/kontakt.txt'));
      case 'o-mnie': case 'about': return print(read(HOME + '/o-mnie.txt'));
      case 'projekty': case 'projects': return print([...listing(HOME + '/projekty', ''), '', 'open <projekt> albo dotknij nazwy.']);
      case 'open': case 'xdg-open': { const n = (a[0] || '').toLowerCase().replace(/\/$/, ''); const m = PROJ.find(p => p === n || p.startsWith(n)); if (!n || !m) return print([`open: nie znam projektu '${a[0] || ''}'. Dostępne: ${PROJ.join(', ')}`], 'err'); cwd = HOME + '/projekty/' + m; setPs(); return print([...read(cwd + '/README.md'), '', [seg('github.url', 'file', `cat ${cwd}/github.url`), seg('  → repozytorium na GitHubie', 'dim')]]); }
      case 'whoami': { const ua = navigator.userAgent, os = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac/.test(ua) ? 'macOS' : /Win/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'nieznany system';
        const br = /Edg\//.test(ua) ? 'Edge' : /Firefox/.test(ua) ? 'Firefox' : /Chrome/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : 'przeglądarka'; return print([ME, `gość odwiedzający stronę · ${br} na ${os}`], ''); }
      case 'id': return print([`uid=1001(${ME}) gid=1001(${ME}) grupy=1001(${ME}),100(goscie)`]);
      case 'hostname': return print([HOST]);
      case 'uname': return print([flags.includes('a') ? `Linux ${HOST} 6.6.6-krzyk #1 SMP PREEMPT x86_64 KrzykOS` : 'Linux']);
      case 'uptime': { const s = Math.floor((Date.now() - T0) / 1000); return print([` ${new Date().toTimeString().slice(0, 8)} up ${Math.floor(s / 60)} min, 1 user, load average: 0.66, 0.06, 0.13`]); }
      case 'date': return print([new Date().toString()]);
      case 'cal': { const d = new Date(), y = d.getFullYear(), m = d.getMonth(), first = (new Date(y, m, 1).getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate(); const rows = ['    ' + d.toLocaleString('pl', { month: 'long' }) + ' ' + y, 'Pn Wt Śr Cz Pt So Nd']; let r = '   '.repeat(first);
        for (let i = 1; i <= n; i++) { r += String(i).padStart(2) + ' '; if ((first + i) % 7 === 0) { rows.push(r); r = ''; } } if (r) rows.push(r); return print(rows); }
      case 'ps': return print(['  PID TTY          TIME CMD', '    1 tty1     00:00:01 init', '  404 tty1     00:00:13 cracktro', '  666 tty1     00:00:00 krzyk', ' 1337 tty1     00:00:00 bash', ` 2026 tty1     00:00:00 ps`]);
      case 'top': case 'htop': return print(['top - 1 user, load average: 0.66', 'Tasks: 5 total, 1 running', '%Cpu(s): 13.0 us, 6.6 sy, 80.4 id', '  PID USER     %CPU %MEM COMMAND', '  404 daniel   12.0  4.2 cracktro', '  666 daniel    6.6  0.6 krzyk', ' 1337 daniel    0.3  0.1 bash']);
      case 'df': return print(['System plików   Rozm. Użyte Dost. %Uż. Zamont. na', '/dev/kaseta     60M   59M   1M   98% /', 'tmpfs           640K  0     640K  0%  /tmp']);
      case 'free': return print(['              total   used   free', 'Mem:          640K   512K   128K', 'Swap:         0B     0B     0B   (640K powinno każdemu wystarczyć)']);
      case 'env': case 'printenv': return print([`USER=${ME}`, `HOME=${HOME}`, `PWD=${cwd}`, 'SHELL=/bin/bash', 'TERM=vt100-krzyk', 'LANG=pl_PL.UTF-8']);
      case 'export': case 'alias': case 'unalias': return print([`${cmd}: zmiany środowiska nie przetrwają, ale niech ci będzie.`]);
      case 'echo': return print([args.join(' ')]);
      case 'history': return print(hist.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`));
      case 'which': case 'type': return print(a.map(x => `/usr/bin/${x}`));
      case 'man': return print([MAN[a[0]] || (a[0] ? `Brak strony podręcznika dla ${a[0]}. Spróbuj: help` : 'Którą stronę podręcznika? np. man ls')]);
      case 'clear': case 'cls': out.textContent = ''; return;
      case 'neofetch': case 'fastfetch': { const L = [['~≈~≈~≈~≈~≈~', 'sky'], ['  ▄▀▀▀▀▀▄', 'red'], [' █ ▀█ █▀ █', 'red'], ['▐▌   ▄   ▐▌', 'red'], ['█▌  ▐█▌  ▐█', 'red'], ['▐▌  ▀▀▀  ▐▌', 'red'], [' ▀▄     ▄▀', 'red'], ['   ▀▄ ▄▀', 'red'], ['    █ █', 'red']];
        const R = [seg(`${ME}@${HOST}`, 'dir'), seg('------------------', 'dim'), seg('OS: KrzykOS 2026'), seg('Kernel: 6.6.6-krzyk'), seg('Shell: bash 5.2'), seg('Stack: python · pytorch · docker · linux'), seg('Projekty: ' + PROJ.length), seg(''), seg('')];
        return print(L.map(([t, c], k) => [seg(t.padEnd(13), c), R[k]]), 'pre'); }
      case 'cowsay': { const t = args.join(' ') || 'muu'; return print([' ' + '_'.repeat(t.length + 2), `< ${t} >`, ' ' + '-'.repeat(t.length + 2), '        \\   ^__^', '         \\  (oo)\\_______', '            (__)\\       )\\/\\', '                ||----w |', '                ||     ||']); }
      case 'matrix': case 'cmatrix': return rain();
      case 'banner': case 'figlet': return print(banner(args.join(' ') || 'krzyk'), 'red pre');
      case 'brama': case 'krzyk': case 'maszynologia': if (go) { await print([`przechodzę: ${cmd}…`]); setTimeout(() => go(cmd), 400); } return;
      case 'exit': case 'logout': case 'quit': if (go) { await print(['logout', 'Do zobaczenia przy bramie.']); setTimeout(() => go('brama'), 600); } return;
      case 'hello': case 'cześć': case 'czesc': case 'hej': return print(['Cześć. Wpisz help, żeby zobaczyć, co tu można.']);
      default: return print([`${cmd0}: nie znaleziono polecenia. Wpisz help.`], 'err');
    }
  };

  /* ---------- wejście ---------- */
  const busy = { v: false };
  const submit = async v => { if (busy.v) return; busy.v = true; inp.value = ''; try { await run(v); await queue; } finally { busy.v = false; } };
  form.addEventListener('submit', e => { e.preventDefault(); submit(inp.value); });
  root.addEventListener('click', e => { const b = e.target.closest('[data-cmd]'); if (b) { e.preventDefault(); submit(b.dataset.cmd); } else if (e.target.closest('.t-out')) inp.focus({ preventScroll: true }); });
  const CMDS = ['help', 'ls', 'cd', 'pwd', 'cat', 'tree', 'find', 'grep', 'head', 'tail', 'wc', 'file', 'cv', 'projekty', 'open', 'kontakt', 'o-mnie', 'whoami', 'id', 'hostname', 'uname', 'uptime', 'date', 'cal', 'ps', 'top', 'df', 'free', 'env', 'echo', 'history', 'man', 'clear', 'neofetch', 'cowsay', 'matrix', 'banner', 'brama', 'krzyk', 'exit'];
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) { hi--; inp.value = hist[hi]; } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (hi < hist.length) { hi++; inp.value = hist[hi] || ''; } }
    else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.textContent = ''; }
    else if (e.key === 'Tab') { e.preventDefault(); const v = inp.value, parts = v.split(/\s+/), last = parts[parts.length - 1];
      let opts;
      if (parts.length === 1) opts = CMDS.filter(c => c.startsWith(last)).map(c => c + ' ');
      else { const i = last.lastIndexOf('/'), dirPart = i >= 0 ? last.slice(0, i + 1) : '', base = norm(cwd, dirPart || '.'), d = FS[base] || {};
        opts = [...(d.d || []).map(n => n + '/'), ...(d.f || []), ...(d.h || [])].filter(n => n.startsWith(last.slice(i + 1))).map(n => dirPart + n); if (parts[0] === 'open') opts = PROJ.filter(p => p.startsWith(last)); }
      if (opts.length === 1) { parts[parts.length - 1] = opts[0]; inp.value = parts.join(' '); } else if (opts.length > 1) print([opts.join('   ')], 'dim'); }
  });
  setPs();
  print([[seg('help', 'file', 'help'), seg(' — lista poleceń', 'dim')]]);
}
