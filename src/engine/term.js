// terminal Maszynologii: wirtualny system plików (CV, projekty, kontakt), polecenia linuksowe, krzyk przy próbie zmian;
// wyjście wjeżdża linia po linii jak w demoscenie (linia ASCII przelatuje, rozwiera się w górę i w dół, znaki rozkodowują się z bloków)
import { RM } from './core';

const BL = '░▒▓';
const HOME = '/home/daniel';
const ME = 'daniel', HOST = 'maszynologia';

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
  '/home/daniel/projekty/visual-echoes-2.0': { f: ['README.md'] },
  '/home/daniel/projekty/wikirooms': { f: ['README.md'] },
  '/home/daniel/projekty/remuz.io': { f: ['README.md'] },
  '/home/daniel/projekty/musicclubapp': { f: ['README.md'] },
  '/home/daniel/projekty/shadowdetection': { f: ['README.md'] },
  '/home/daniel/projekty/gameinjava': { f: ['README.md'] },
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
  '/home/daniel/kontakt.txt': ['e-mail ... (wkrótce)', 'github ... github.com/d4krzyk', '', 'Pełny kontakt pojawi się w dziale Krzyk → kontakt.'],
  '/home/daniel/umiejetnosci.txt': ['python ......... ████████░░', 'pytorch ........ ███████░░░', 'linux .......... ████████░░', 'docker ......... ██████░░░░', 'rest api ....... ███████░░░', 'postgresql ..... ██████░░░░'],
  '/home/daniel/.bashrc': ['export PS1="\\u@\\h:\\w\\$ "', 'alias cv="cat ~/cv.txt"', 'alias projekty="ls ~/projekty"', '# greetz: wszystkim, którzy jeszcze piszą ręcznie'],
  '/home/daniel/.bash_history': ['ssh noc-01', 'docker ps', 'python train.py --orientations 36', 'git push', 'cat /dev/urandom | head -c 64 | xxd', 'exit'],
  '/home/daniel/projekty/visual-echoes-2.0/README.md': P('VISUAL ECHOES 2.0', ['Praca magisterska · 2025 → · autor', 'Stack: python · pytorch · habitat', '', 'Agent widzi obraz i słyszy echo.', 'Rozszerzyłem model z 4 do 36 orientacji co 10°', 'i zbadałem, ile kierunków naprawdę się opłaca:', 'krzywa nasyca się przy 9-12.']),
  '/home/daniel/projekty/wikirooms/README.md': P('WIKIROOMS', TODO),
  '/home/daniel/projekty/remuz.io/README.md': P('REMUZ.IO', TODO),
  '/home/daniel/projekty/musicclubapp/README.md': P('MUSICCLUBAPP', TODO),
  '/home/daniel/projekty/shadowdetection/README.md': P('SHADOWDETECTION', TODO),
  '/home/daniel/projekty/gameinjava/README.md': P('GAMEINJAVA', TODO),
  '/home/daniel/doswiadczenie/msk-torman.txt': ['MSK TORMAN · 2025 →', 'Operator NOC: monitoring sieci i usług, reagowanie na incydenty.'],
  '/home/daniel/doswiadczenie/luxolis.txt': ['LUXOLIS · 2023', 'Software engineer.'],
  '/home/daniel/doswiadczenie/pfeifer-langen.txt': ['PFEIFER & LANGEN · 2023', 'Staż IT.'],
  '/home/daniel/edukacja/umk-torun.txt': ['UMK TORUŃ · 2024 →', 'Studia magisterskie: sztuczna inteligencja.'],
  '/etc/hostname': [HOST], '/etc/motd': ['Witaj w MASZYNOLOGII. Tu nic nie usuniesz.'],
  '/etc/os-release': ['NAME="KrzykOS"', 'VERSION="2026 (Zejście)"', 'ID=krzyk', 'PRETTY_NAME="KrzykOS 2026"'],
  '/etc/passwd': ['root:x:0:0:root:/root:/bin/nologin', 'daniel:x:1000:1000:Daniel:/home/daniel:/bin/bash', 'gosc:x:1001:1001:gość:/home/daniel:/bin/rbash'],
  '/proc/cpuinfo': ['model name : Intel 80486DX2 @ 66 MHz (turbo)', 'cache size : 8 KB', 'flags      : fpu vme krzyk'],
  '/proc/version': ['Linux version 6.6.6-krzyk (gcc 13) #1 SMP PREEMPT'],
  '/var/log/syslog': ['kernel: zejście: podniesiono poziom −2', 'crond: odpalono dekoder sine-scrollera', 'sshd: gość zalogowany z przeglądarki', 'kernel: wykryto próbę rm -rf, odmówiono z krzykiem'],
};
const T0 = Date.now();

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

const SCREAM = ['███ K R Z Y K ███', 'BRAK UPRAWNIEŃ!!! Ten system jest tylko do odczytu.', 'Nic tu nie przeniesiesz, nie skasujesz i nie zmienisz.'];
const DENY = new Set(['rm', 'rmdir', 'mv', 'cp', 'mkdir', 'touch', 'chmod', 'chown', 'chgrp', 'ln', 'dd', 'mkfs', 'kill', 'killall', 'pkill', 'shutdown', 'reboot', 'halt', 'poweroff',
  'apt', 'apt-get', 'pacman', 'dnf', 'yum', 'pip', 'npm', 'useradd', 'userdel', 'passwd', 'mount', 'umount', 'fdisk', 'crontab', 'systemctl', 'service', 'iptables', 'truncate', 'shred', 'wget', 'curl', 'scp', 'rsync', 'git']);
const EDIT = new Set(['nano', 'vim', 'vi', 'emacs', 'ed', 'code']);
const HELP = [
  'nawigacja .... ls [-la] · cd <katalog> · pwd · tree · find',
  'czytanie ..... cat · less · head · tail · grep <słowo> <plik> · wc · file',
  'skróty ....... cv · projekty · open <projekt> · kontakt · o-mnie',
  'system ....... whoami · id · hostname · uname -a · uptime · date · cal · ps · top · df -h · free -h · ip a · env',
  'sieć ......... ping <host> · ssh · traceroute',
  'zabawa ....... neofetch · fortune · cowsay <tekst> · sl · matrix · banner <tekst> · echo · history · man <cmd>',
  'strona ....... brama · krzyk (przejście do działów) · clear · exit',
  '',
  'Dotknij nazwy pliku albo katalogu w wyniku ls, żeby go otworzyć. Tab dopełnia, ↑↓ historia.',
];
const MAN = { ls: 'ls — wypisuje zawartość katalogu. -l szczegóły, -a ukryte pliki.', cd: 'cd — zmienia katalog. cd .. w górę, cd ~ do domu.', cat: 'cat — wyświetla plik.', rm: 'rm — w tym systemie: krzyk.', grep: 'grep WZÓR PLIK — wiersze zawierające wzór.', open: 'open PROJEKT — otwiera README projektu.' };
const FORTUNES = ['Sztuka z chaosu. Kod też.', 'Najpierw działa, potem jest ładne, potem jest szybkie. Czasem w odwrotnej kolejności.', 'Każdy bug to echo jakiejś decyzji.', 'Nasycenie przy 9-12 kierunkach. Reszta to szum.', 'Kto pisze ręcznie, ten pamięta.'];

export function initTerm(root, { go } = {}) {
  const out = root.querySelector('.t-out'), form = root.querySelector('.t-line'), inp = root.querySelector('.t-in'), ps = root.querySelector('.t-ps');
  let cwd = HOME; const hist = []; let hi = 0, queue = Promise.resolve();
  const prompt = () => `${ME}@${HOST}:${short(cwd)}$`;
  const setPs = () => { ps.textContent = prompt(); };

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
  const banner = t => { const B = { a: '▄▀█', b: '█▄▄', c: '█▀▀', d: '█▀▄', e: '█▀▀', k: '█▄▀', r: '█▀█', y: '█▄█', z: '▀█', s: '█▀', i: '█', o: '█▀█', n: '█▄ █', m: '█▀▄▀█', t: '▀█▀', l: '█', u: '█ █', w: '█ █ █', p: '█▀█', g: '█▀▀', h: '█ █' };
    return [[...t.toLowerCase()].map(ch => B[ch] || (ch === ' ' ? '  ' : ch)).join(' ')]; };
  const PROJ = Object.keys(FS).filter(k => k.startsWith(HOME + '/projekty/')).map(k => k.split('/').pop());

  const run = async raw => {
    const line = raw.trim(); await print([[seg(prompt() + ' ', 'ps'), seg(line)]], 'echo');
    if (!line) return;
    hist.push(line); hi = hist.length;
    if (/rm\s+-rf\s+\/(\s|$)/.test(line) || /:\(\)\s*\{/.test(line)) { await scream(); return print(['...i jeszcze raz: NIE.'], 'scream'); }
    const [cmd0, ...args] = line.split(/\s+/); const cmd = cmd0.toLowerCase(); const a = args.filter(x => !x.startsWith('-')), flags = args.filter(x => x.startsWith('-')).join('');
    if (cmd === 'sudo' || cmd === 'su' || cmd === 'doas') { await scream(); return print([`${cmd}: ${ME} nie jest w pliku sudoers. Ten incydent zostanie zgłoszony. Krzykiem.`], 'err'); }
    if (DENY.has(cmd)) return scream();
    if (EDIT.has(cmd)) return print([`${cmd}: system plików tylko do odczytu. Możesz czytać: cat ${a[0] || 'plik'}`], 'err');
    switch (cmd) {
      case 'help': case '?': return print(HELP);
      case 'ls': case 'dir': case 'll': return print(listing(norm(cwd, a[0] || '.'), cmd === 'll' ? 'la' : flags));
      case 'pwd': return print([cwd]);
      case 'cd': { const p = norm(cwd, a[0] || '~'); if (!isDir(p)) return print([`cd: ${a[0]}: ${isFile(p) ? 'To nie jest katalog' : 'Nie ma takiego pliku ani katalogu'}`], 'err'); cwd = p; setPs(); return print(listing(cwd, '')); }
      case 'cat': case 'less': case 'more': case 'bat': return print(fileArg(cmd, a[0]));
      case 'head': return print(fileArg(cmd, a[0]).slice(0, 5));
      case 'tail': return print(fileArg(cmd, a[0]).slice(-5));
      case 'wc': { const f = fileArg(cmd, a[0]); return print([`${f.length} ${f.join(' ').split(/\s+/).length} ${f.join('\n').length} ${a[0] || ''}`]); }
      case 'file': { const p = norm(cwd, a[0] || '.'); return print([`${a[0]}: ${isDir(p) ? 'directory' : isFile(p) ? 'UTF-8 Unicode text, tylko do odczytu' : 'cannot open'}`]); }
      case 'grep': { if (a.length < 2) return print(['użycie: grep WZÓR PLIK'], 'err'); const f = fileArg('grep', a[1]); const hits = f.filter(l => l.toLowerCase().includes(a[0].toLowerCase())); return print(hits.length ? hits : ['(brak dopasowań)']); }
      case 'tree': return print([short(norm(cwd, a[0] || '.')), ...tree(norm(cwd, a[0] || '.'))]);
      case 'find': { const base = norm(cwd, a[0] || '.'); const name = (args[args.indexOf('-name') + 1] || '').replace(/\*/g, ''); return print(allPaths(base).filter(p => p.startsWith(base) && p.includes(name)).map(p => [seg(p, p.endsWith('/') ? 'dir' : 'file', p.endsWith('/') ? `cd ${p}` : `cat ${p}`)])); }
      case 'du': return print(['4.0K\t./kontakt.txt', '8.0K\t./cv.txt', '1.3M\t./projekty', '666K\t./doswiadczenie', '1.9M\t.']);
      case 'cv': return print(read(HOME + '/cv.txt'));
      case 'kontakt': return print(read(HOME + '/kontakt.txt'));
      case 'o-mnie': case 'about': return print(read(HOME + '/o-mnie.txt'));
      case 'projekty': case 'projects': return print([...listing(HOME + '/projekty', ''), '', 'open <projekt> albo dotknij nazwy.']);
      case 'open': case 'xdg-open': { const n = (a[0] || '').toLowerCase().replace(/\/$/, ''); const m = PROJ.find(p => p === n || p.startsWith(n)); if (!n || !m) return print([`open: nie znam projektu '${a[0] || ''}'. Dostępne: ${PROJ.join(', ')}`], 'err'); cwd = HOME + '/projekty/' + m; setPs(); return print(read(cwd + '/README.md')); }
      case 'whoami': return print([ME]);
      case 'id': return print([`uid=1000(${ME}) gid=1000(${ME}) grupy=1000(${ME}),27(krzyk),66(maszyny)`]);
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
      case 'ip': case 'ifconfig': return print(['lo:   inet 127.0.0.1/8', 'eth0: inet 10.66.6.13/24  ether 00:13:37:66:06:66', 'tun0: inet 10.2.0.1/32  (zejście)']);
      case 'env': case 'printenv': return print([`USER=${ME}`, `HOME=${HOME}`, `PWD=${cwd}`, 'SHELL=/bin/bash', 'TERM=vt100-krzyk', 'LANG=pl_PL.UTF-8']);
      case 'export': case 'alias': case 'unalias': return print([`${cmd}: zmiany środowiska nie przetrwają, ale niech ci będzie.`]);
      case 'echo': return print([args.join(' ')]);
      case 'history': return print(hist.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`));
      case 'which': case 'type': return print(a.map(x => `/usr/bin/${x}`));
      case 'man': return print([MAN[a[0]] || (a[0] ? `Brak strony podręcznika dla ${a[0]}. Spróbuj: help` : 'Którą stronę podręcznika? np. man ls')]);
      case 'clear': case 'cls': out.textContent = ''; return;
      case 'ping': { const h = a[0] || 'zejscie.local'; await print([`PING ${h} (10.66.6.6) 56(84) bajtów danych.`]); for (let i = 1; i <= 4; i++) await print([`64 bajty od ${h}: icmp_seq=${i} ttl=66 czas=${(6 + Math.random() * 7).toFixed(1)} ms`]); return print([`--- ${h} ping --- 4 wysłane, 4 odebrane, 0% strat`]); }
      case 'traceroute': return print([`traceroute do ${a[0] || 'krzyk'}`, ' 1  brama (10.0.0.1)  1.3 ms', ' 2  poziom-1 (10.0.1.1)  6.6 ms', ' 3  poziom-2 (10.0.2.1)  13.0 ms', ' 4  * * *  (dalej nie schodzimy)']);
      case 'ssh': case 'telnet': return print([`${cmd}: połączenie odrzucone. Tu się tylko czyta.`], 'err');
      case 'neofetch': case 'fastfetch': return print([
        [seg('   ▄▄▄▄▄▄▄▄   ', 'red'), seg(`${ME}@${HOST}`, 'dir')], [seg('  █ ▄▄  ▄▄ █  ', 'red'), seg('---------------------', 'dim')], [seg('  █ ██  ██ █  ', 'red'), seg('OS: KrzykOS 2026 (Zejście)')],
        [seg('  █   ▀▀   █  ', 'red'), seg('Kernel: 6.6.6-krzyk')], [seg('   ▀▄▄▄▄▄▄▀   ', 'red'), seg('Shell: bash 5.2 (tylko do odczytu)')], [seg('    █ ██ █    ', 'red'), seg('Stack: python · pytorch · docker · linux')],
        [seg('              '), seg('Projekty: ' + PROJ.length)], [seg('              '), seg('█', 'red'), seg('█', 'dir'), seg('█', 'file'), seg('█', 'dim')]]);
      case 'fortune': return print([FORTUNES[Math.floor(Math.random() * FORTUNES.length)]]);
      case 'cowsay': { const t = args.join(' ') || 'muu, tylko do odczytu'; return print([' ' + '_'.repeat(t.length + 2), `< ${t} >`, ' ' + '-'.repeat(t.length + 2), '        \\   ^__^', '         \\  (oo)\\_______', '            (__)\\       )\\/\\', '                ||----w |', '                ||     ||']); }
      case 'sl': return print(['      ====        ________                ___________', '  _D _|  |_______/        \\__I_I_____===__|_________|', '   |(_)---  |   H\\________/ |   |        =|___ ___|', '   /     |  |   H  |  |     |   |         ||_| |_||', '  |      |  |   H  |__--------------------| [___] |', '  | ________|___H__/__|_____/[][]~\\_______|       |', '  |/ |   |-----------I_____I [][] []  D   |=======|__', 'Literówka w ls? Pociąg przejechał.']);
      case 'matrix': case 'cmatrix': return print(Array.from({ length: 8 }, () => Array.from({ length: 40 }, () => '01ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ'[Math.floor(Math.random() * 36)]).join('')), 'green');
      case 'banner': case 'figlet': return print(banner(args.join(' ') || 'krzyk'), 'red');
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
  const CMDS = ['help', 'ls', 'cd', 'pwd', 'cat', 'tree', 'find', 'grep', 'head', 'tail', 'wc', 'file', 'cv', 'projekty', 'open', 'kontakt', 'o-mnie', 'whoami', 'id', 'hostname', 'uname', 'uptime', 'date', 'cal', 'ps', 'top', 'df', 'free', 'ip', 'env', 'echo', 'history', 'man', 'clear', 'ping', 'traceroute', 'neofetch', 'fortune', 'cowsay', 'sl', 'matrix', 'banner', 'brama', 'krzyk', 'exit'];
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
  print(['KrzykOS 2026 (Zejście) tty1', '', ...read('/etc/motd'), 'Wpisz help albo dotknij polecenia poniżej. Pliki i katalogi w wynikach też da się dotknąć.', '']);
  run('ls');
}
