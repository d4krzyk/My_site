// zmiana języka w dziale Krzyk: motyw to maszyna do pisania, więc nagłówki i podpisy cofają się i piszą na nowo po angielsku (albo po polsku);
// zwykłe akapity piszą się tak samo, ale bez rozbijania na litery. Opisy person czyta persvoice (głosem persony). Teksty niewidoczne w oknie podmieniają się od razu
import { RM } from './core';
import { getLang } from '@/lib/lang';
import { retype, reprep } from './krzykfx';
import { typeSwap } from './xlate';

export function initKrzykLang(sec) {
  let cur = getLang();
  const pick = (el, l) => l === 'en' ? el.dataset.en : el.dataset.pl;
  const vis = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  const on = e => {
    const l = e.detail; if (l === cur) return; cur = l; let n = 0;
    sec.querySelectorAll('[data-en],[data-en-aria]').forEach(el => {
      if (el.dataset.enAria != null) el.setAttribute('aria-label', l === 'en' ? el.dataset.enAria : el.dataset.plAria);
      const t = el.dataset.en != null ? pick(el, l) : null; if (t == null || el.querySelector('.kp-gl')) return;     // opisy person: persvoice
      const typed = el.hasAttribute('data-type') || el.hasAttribute('data-t') || el.dataset.prep, seed = +(el.dataset.seed || 5) + n, delay = n++ * 55;
      if (typed) {
        const revealed = el.querySelector('.tw.on');
        if (!el.dataset.prep && !revealed) { el.textContent = t; return; }                    // jeszcze nietknięty: przy wjeździe w kadr napisze się po nowemu
        if (!revealed) reprep(el, t, seed); else if (RM || !vis(el)) reprep(el, t, seed, true); else retype(el, t, { seed, delay, speed: 1.7 });
      } else if (RM || !vis(el)) el.textContent = t; else typeSwap(el, t, { delay, speed: 1.5 });
    });
  };
  addEventListener('krzyk-lang', on);
  return () => removeEventListener('krzyk-lang', on);
}
