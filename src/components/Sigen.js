'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLang } from '@/lib/lang';
import { OPTS, COLORS, randomize, build, draw, toPNG, toSVG, toHash, fromHash, bth } from '@/engine/sigen';

// ukryty generator sigili (wejście: komenda `sigen` w terminalu Maszynologii); stan siedzi w adresie (#s=…), więc linkiem dzieli się gotowym sigilem
const T = {
  pl: { sub: 'generator sigili · ukryty proces', back: '◀ cd ~/maszynologia', frame: 'rama', sym: 'symetria', glyph: 'znaki', core: 'rdzeń', style: 'styl', density: 'gęstość', weight: 'grubość', color: 'kolor', extras: 'dodatki',
    seed: 'ziarno', shape: '[ losuj kształt ]', all: '[ losuj wszystko ]', export: 'pobierz (przezroczyste tło)', link: 'kopiuj link', copied: 'skopiowano', bg: 'tło podglądu', bgs: ['ciemne', 'jasne', 'szachownica'] },
  en: { sub: 'sigil generator · hidden process', back: '◀ cd ~/machinology', frame: 'frame', sym: 'symmetry', glyph: 'marks', core: 'core', style: 'style', density: 'density', weight: 'weight', color: 'colour', extras: 'extras',
    seed: 'seed', shape: '[ random shape ]', all: '[ random all ]', export: 'download (transparent)', link: 'copy link', copied: 'copied', bg: 'preview background', bgs: ['dark', 'light', 'checker'] },
};
const EN = { 'koło': 'circle', 'podwójne koło': 'double circle', 'kwadrat': 'square', 'romb': 'diamond', 'sześciokąt': 'hexagon', 'brak': 'none', 'lustro': 'mirror', 'cyber': 'cyber', 'linie': 'lines', 'łuki': 'arcs', 'runy': 'runes',
  'oko': 'eye', 'krzyż': 'cross', 'półksiężyc': 'crescent', 'gwiazda': 'star', 'cyber-piksel': 'cyber-pixel', 'tusz': 'ink', 'rycina': 'engraving', 'oś': 'axis', 'węzły': 'nodes', 'ciernie': 'thorns', 'krople': 'drops',
  'promienie': 'rays', 'kropkowany krąg': 'dotted ring', 'krzyżyki': 'crosslets', 'biel': 'white', 'krew': 'blood', 'czerń': 'black', 'cyjan': 'cyan', 'srebro': 'silver' };

export default function Sigen() {
  const router = useRouter(), cv = useRef(null);
  const [s, set] = useState(null), [lang, setL] = useState('pl'), [bg, setBg] = useState(0), [msg, setMsg] = useState('');
  useEffect(() => { set(fromHash(location.hash)); setL(getLang()); const on = e => setL(e.detail); addEventListener('krzyk-lang', on); return () => removeEventListener('krzyk-lang', on); }, []);
  // rysowanie z krótkim „odkodowaniem": piksele sigila pojawiają się w kolejności Bayera
  useEffect(() => {
    if (!s || !cv.current) return; history.replaceState(null, '', toHash(s));
    const c = cv.current, S = c.width, x = c.getContext('2d'), off = document.createElement('canvas'); off.width = off.height = S; draw(off.getContext('2d'), S, s, build(s));
    const src = off.getContext('2d').getImageData(0, 0, S, S), t0 = performance.now(); let raf = 0;
    const step = now => { const k = Math.min(1, (now - t0) / 260); if (k >= 1 || matchMedia('(prefers-reduced-motion: reduce)').matches) { x.clearRect(0, 0, S, S); x.drawImage(off, 0, 0); return; }
      const out = x.createImageData(S, S), D = out.data, A = src.data;
      for (let yy = 0; yy < S; yy++) for (let xx = 0; xx < S; xx++) { const i = (yy * S + xx) * 4; if (A[i + 3] && bth(xx >> 2, yy >> 2) < k) { D[i] = A[i]; D[i + 1] = A[i + 1]; D[i + 2] = A[i + 2]; D[i + 3] = A[i + 3]; } }
      x.putImageData(out, 0, 0); raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [s]);
  if (!s) return <main className="sigen" />;
  const L = T[lang] || T.pl, tr = v => (lang === 'en' ? EN[v] || v.replace('promień', 'radial') : v), up = o => set({ ...s, ...o });
  const chips = (key, list) => (
    <div className="sg-row"><span className="sg-k">{L[key]}</span><div className="sg-chips">
      {list.map(v => <button type="button" key={v} aria-pressed={s[key] === v} onClick={() => up({ [key]: v })}>{tr(v)}</button>)}</div></div>);
  const save = async (blob, name) => { const u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 2000); };
  const back = () => import('@/engine/veil').then(({ veilGo }) => veilGo('/maszynologia/', 'maszynologia', h => router.push(h)));
  return (
    <main className="sigen">
      <header className="sg-head">
        <button type="button" className="sg-back dos" onClick={back}>{L.back}</button>
        <h1 className="sg-title">SIGEN</h1>
        <p className="sg-sub dos">{L.sub}</p>
      </header>
      <div className="sg-grid">
        <div className="sg-view">
          <div className={`sg-stage bg${bg}`}><canvas ref={cv} width="640" height="640" aria-label="sigil" role="img" /></div>
          <div className="sg-row sg-bg"><span className="sg-k">{L.bg}</span><div className="sg-chips">{L.bgs.map((b, i) => <button type="button" key={b} aria-pressed={bg === i} onClick={() => setBg(i)}>{b}</button>)}</div></div>
        </div>
        <div className="sg-panel dos">
          {chips('frame', OPTS.frame)}{chips('sym', OPTS.sym)}{chips('glyph', OPTS.glyph)}{chips('core', OPTS.core)}{chips('style', OPTS.style)}
          <div className="sg-row"><span className="sg-k">{L.density} · {s.density}</span><input type="range" min="3" max="14" value={s.density} onChange={e => up({ density: +e.target.value })} /></div>
          <div className="sg-row"><span className="sg-k">{L.weight} · {s.weight}</span><input type="range" min="1" max="4" value={s.weight} onChange={e => up({ weight: +e.target.value })} /></div>
          <div className="sg-row"><span className="sg-k">{L.color}</span><div className="sg-chips">{Object.entries(COLORS).map(([k, c]) => <button type="button" key={k} className="sg-sw" aria-pressed={s.color === k} onClick={() => up({ color: k })} style={{ '--sw': c }}>{tr(k)}</button>)}</div></div>
          <div className="sg-row"><span className="sg-k">{L.extras}</span><div className="sg-chips">{OPTS.extras.map(e => <button type="button" key={e} aria-pressed={s.extras.includes(e)} onClick={() => up({ extras: s.extras.includes(e) ? s.extras.filter(v => v !== e) : [...s.extras, e] })}>{tr(e)}</button>)}</div></div>
          <div className="sg-row"><span className="sg-k">{L.seed}</span><input className="sg-seed" type="number" value={s.seed} onChange={e => up({ seed: Math.abs(parseInt(e.target.value, 10) || 0) })} /></div>
          <div className="sg-acts"><button type="button" onClick={() => set(randomize(s, false))}>{L.shape}</button><button type="button" onClick={() => set(randomize(s, true))}>{L.all}</button></div>
          <div className="sg-row"><span className="sg-k">{L.export}</span><div className="sg-chips">
            {[512, 1024, 2048].map(n => <button type="button" key={n} onClick={async () => save(await toPNG(s, n), `sigil-${s.seed}-${n}.png`)}>PNG {n}</button>)}
            <button type="button" onClick={() => save(new Blob([toSVG(s)], { type: 'image/svg+xml' }), `sigil-${s.seed}.svg`)}>SVG</button>
            <button type="button" onClick={() => { navigator.clipboard?.writeText(location.href).then(() => { setMsg(L.copied); setTimeout(() => setMsg(''), 1200); }); }}>{msg || L.link}</button></div></div>
        </div>
      </div>
    </main>
  );
}
