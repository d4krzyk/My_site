// czytanie opisu persony: gdy persona staje się aktywna, jej opis wpisuje się litera po literze, a każda litera gra „blip" głosu persony (engine/voices).
// Głosy grają, gdy dźwięk jest włączony (wybór w bramie albo ikonka oscyloskopu w rogu, lib/sound); bez dźwięku zostaje samo pisanie i ruch maski.
// Każda wpisana litera daje też sygnał do sceny person (setPersonaTalk), więc maska w rogu „duka" w rytmie tekstu. Przy ograniczeniu animacji nic się nie dzieje.
import { RM } from './core';
import { blip, VOICE_MS, VOICE_NAMES } from './voices';
import { setPersonaTalk } from './psx';
import { getLang } from '@/lib/lang';
import { soundOn, audio } from '@/lib/sound';

export function initPersonaVoices(parts, getActive) {
  if (RM || !parts.length) return () => {};
  let on = soundOn(), lang = getLang();
  const onSnd = e => { on = !!e.detail; }; addEventListener('krzyk-sound', onSnd);
  let relang = () => {}; const onLang = e => { if (e.detail === lang) return; lang = e.detail; relang(); }; addEventListener('krzyk-lang', onLang);
  // opis rozbity na litery (ukryte, odsłaniane po kolei); pełny tekst zostaje w ukrytym spanie dla czytników ekranu i wyszukiwarek
  const textOf = p => (lang === 'en' ? p.dataset.en : p.dataset.pl) ?? p.dataset.pl ?? p.textContent;
  const build = (el, k) => { const p = el.querySelectorAll('p')[1]; if (!p) return null; const text = textOf(p), ch = [];
    const full = document.createElement('span'); full.className = 'kp-gl'; full.textContent = text;
    const vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true');
    text.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) { vis.appendChild(document.createTextNode(w)); return; }
      const ws = document.createElement('span'); ws.className = 'kw'; [...w].forEach(c => { const s = document.createElement('span'); s.className = 'kc'; s.textContent = c; ws.appendChild(s); ch.push(s); }); vis.appendChild(ws); });
    p.textContent = ''; p.append(full, vis); return { k, p, text, ch, n: 0, done: false, timer: 0, chars: [...text] }; };
  if (parts.some(el => { const p = el.querySelectorAll('p')[1]; return p && p.dataset.pl == null; })) parts.forEach(el => { const p = el.querySelectorAll('p')[1]; if (p && p.dataset.pl == null) p.dataset.pl = p.textContent; });
  const R = parts.map(build);
  const sound = (r, i) => { if (!on) return; const a = audio(); if (!a || a.ctx.state !== 'running') return; const c = r.chars[i]; if (!/[a-ząćęłńóśźż]/i.test(c)) return;
    const nx = r.chars[i + 1]; blip(a.ctx, a.master, r.k, c, i, !nx || /[\s.,;:!?]/.test(nx), a.ctx.currentTime + .005); };
  const finish = r => { clearTimeout(r.timer); setPersonaTalk(-1, 0); r.ch.forEach(s => s.classList.add('on')); r.n = r.ch.length; r.done = true; };
  const type = r => { if (r.n >= r.chars.length) { r.done = true; setPersonaTalk(-1, 0); return; } const i = r.n++, c = r.chars[i];
    if (!/\s/.test(c)) { r.ch[r.chIdx = (r.chIdx || 0)].classList.add('on'); r.chIdx++; sound(r, i); setPersonaTalk(r.k, r.chIdx); }
    const pause = /[.,;:!?]/.test(c) ? (r.k === 0 ? 60 : 170) : 0; r.timer = setTimeout(() => type(r), (/\s/.test(c) ? VOICE_MS[r.k] * .6 : VOICE_MS[r.k]) + pause); };
  // krótkie powitanie przy ponownym wejściu: imię persony wypowiedziane jej głosem
  const greet = k => { if (!on) return; const au = audio(); if (!au || au.ctx.state !== 'running') return; [...VOICE_NAMES[k]].forEach((c, i, a) => setTimeout(() => { if (on) blip(au.ctx, au.master, k, c, i, i === a.length - 1, au.ctx.currentTime + .005); }, i * VOICE_MS[k] * 1.3)); };
  let prev = -1;
  // zmiana języka: opis przepisuje się w nowym języku; aktywna persona czyta go od nowa swoim głosem, pozostałe pokazują gotowy tekst (albo czekają na pierwsze czytanie)
  relang = () => R.forEach((old, k) => { if (!old) return; clearTimeout(old.timer); const was = old.done || old.n >= old.ch.length;
    const r = R[k] = build(parts[k], k); if (!r) return;
    if (k === prev && !RM) { r.n = 0; r.chIdx = 0; type(r); } else if (was) finish(r); });
  const poll = setInterval(() => { const a = getActive(); if (a === prev) return; const old = R[prev];
    if (old && !old.done) finish(old);                     // wyjście w trakcie czytania: reszta tekstu pojawia się od razu
    prev = a; const r = R[a]; if (!r) return;
    if (r.done) greet(r.k); else { r.n = 0; r.chIdx = 0; type(r); } }, 120);
  return () => { clearInterval(poll); R.forEach(r => r && finish(r)); removeEventListener('krzyk-lang', onLang); removeEventListener('krzyk-sound', onSnd); setPersonaTalk(-1, 0); };
}
