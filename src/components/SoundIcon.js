'use client';
import { useEffect, useRef, useState } from 'react';
import { getLang } from '@/lib/lang';
import { soundChoice, setSound, audio } from '@/lib/sound';
import { blip } from '@/engine/voices';

// ikonka dźwięku w lewym dolnym rogu każdej strony: mały srebrny oscyloskop (płaska linia = wyłączony, fala krzyku = włączony),
// pod nim napis „dźwięk" i „wł" / „wył". Kliknięcie przełącza dźwięk wszędzie; wybór pamięta przeglądarka (lib/sound).
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5], bay = (x, y) => (B4[(y & 3) * 4 + (x & 3)] + .5) / 16;
const wave = (i, t, amp) => Math.round(Math.sin(i * .75 + t * 9) * amp * (.55 + .45 * Math.sin(i * .31 - t * 2.3)) + Math.sin(i * 2.1 + t * 17) * amp * .18);
const TXT = { pl: { name: 'dźwięk', on: 'wł', off: 'wył', label: ['Dźwięk wyłączony. Kliknij, aby włączyć.', 'Dźwięk włączony. Kliknij, aby wyłączyć.'] }, en: { name: 'sound', on: 'on', off: 'off', label: ['Sound off. Click to turn on.', 'Sound on. Click to turn off.'] } };
function drawOsc(x, on, t) {
  const W = 42, H = 34, X0 = 3, Y0 = 3, BW = 36, BH = 27, R = (a, b, w, h, c) => { x.fillStyle = c; x.fillRect(a, b, w || 1, h || 1); };
  x.clearRect(0, 0, W, H);
  for (let yy = Y0 + 2; yy < Y0 + BH + 3; yy++) for (let xx = X0 + 2; xx < X0 + BW + 3; xx++) if ((xx >= X0 + BW || yy >= Y0 + BH) && bay(xx, yy) < .55) R(xx, yy, 1, 1, '#000');            // rzucony cień w ditherze
  R(X0, Y0, BW, BH, '#8c8f9a'); R(X0, Y0, BW, 1, '#e6e8ee'); R(X0, Y0, 1, BH, '#cdd0d8'); R(X0, Y0 + BH - 1, BW, 1, '#3a3c46'); R(X0 + BW - 1, Y0, 1, BH, '#464852'); R(X0 + 1, Y0 + 1, BW - 2, 1, '#b8bbc4');   // srebrna oprawa
  [[X0 + 2, Y0 + 2], [X0 + BW - 3, Y0 + 2], [X0 + 2, Y0 + BH - 3], [X0 + BW - 3, Y0 + BH - 3]].forEach(p => R(p[0], p[1], 1, 1, '#24252d')); R(X0 + BW - 7, Y0 + BH - 3, 3, 1, '#24252d');
  const SX = X0 + 4, SY = Y0 + 4, SW = BW - 8, SH = BH - 9;
  for (let yy = SY; yy < SY + SH; yy++) for (let xx = SX; xx < SX + SW; xx++) { const vg = Math.min(xx - SX, SX + SW - 1 - xx, yy - SY, SY + SH - 1 - yy); R(xx, yy, 1, 1, vg < 1 ? '#020608' : (vg < 2 && bay(xx, yy) < .5) ? '#03090c' : '#04121a'); }
  for (let gx = SX + 3; gx < SX + SW; gx += 4) for (let gy = SY + 2; gy < SY + SH; gy += 4) R(gx, gy, 1, 1, '#0c2a33');
  const mid = SY + Math.floor(SH / 2);
  if (on) { const amp = Math.min(6, SH / 2 - 2) * (.7 + .3 * Math.sin(t * 3.1));
    for (let k = 2; k >= 0; k--) { const tt = t - k * .05, col = k === 0 ? '#e9ffff' : k === 1 ? '#3ff0ff' : '#0e7c8a'; for (let i = 1; i < SW - 1; i++) { const y = mid + wave(i, tt, amp); R(SX + i, y, 1, 1, col); if (k === 0 && Math.abs(y - mid) > amp * .7) R(SX + i, y, 1, 1, '#fff'); } }
    for (let i = 1; i < SW - 1; i++) { const y = mid + wave(i, t, amp); if (bay(SX + i, y + 1) < .4) R(SX + i, y + 1, 1, 1, '#0e7c8a'); }       // poświata pod linią
  } else { for (let i = 1; i < SW - 1; i++) R(SX + i, mid, 1, 1, i % 3 ? '#1f4a52' : '#2a5a60'); if (Math.floor(t * 1.6) % 2) R(X0 + BW - 5, Y0 + BH - 3, 2, 1, '#ff2a3a'); }   // wyłączony: płaska kreska i migająca dioda
}

export default function SoundIcon() {
  const cv = useRef(null);
  const [st, setSt] = useState({ on: false, choice: null, lang: 'pl' });   // bez stanu przy pierwszym renderze, żeby HTML ze statycznego eksportu zgadzał się z klientem
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const read = () => setSt({ on: soundChoice() === 'on', choice: soundChoice(), lang: getLang() }); read(); setReady(true);
    addEventListener('krzyk-sound', read); addEventListener('krzyk-lang', read);
    return () => { removeEventListener('krzyk-sound', read); removeEventListener('krzyk-lang', read); };
  }, []);
  useEffect(() => {
    const c = cv.current; if (!c) return; const x = c.getContext('2d'), rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now(), draw = () => { if (!document.hidden) drawOsc(x, st.on, rm ? 1.3 : (performance.now() - t0) / 1000); };
    draw(); if (rm) return; const iv = setInterval(draw, st.on ? 66 : 120); return () => clearInterval(iv);
  }, [st.on, ready]);
  const T = TXT[st.lang] || TXT.pl;
  const click = () => { const next = !st.on; setSound(next); if (next) { const a = audio(); if (a) blip(a.ctx, a.master, 1, 'o', 1, true, a.ctx.currentTime + .02); } };
  return (
    <button type="button" className={`snd-icon${ready && st.choice === null ? ' unset' : ''}`} aria-pressed={st.on} aria-label={T.label[st.on ? 1 : 0]} onClick={click}>
      <canvas ref={cv} width="42" height="34" aria-hidden="true" />
      <span className="sn-l" aria-hidden="true">{T.name}</span>
      <span className="sn-s" aria-hidden="true">{st.on ? T.on : T.off}</span>
    </button>
  );
}
