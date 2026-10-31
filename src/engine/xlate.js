// animowana zmiana tekstu elementu przy zmianie języka. Dwie wspólne techniki, zależnie od motywu miejsca:
//  decodeSwap: stary tekst rozsypuje się w bloki ▓▒░, które rozkodowują się w nowy (brama, Maszynologia, terminal)
//  typeSwap:   stary tekst znika wstecz jak cofany na maszynie, nowy pisze się litera po literze (Krzyk)
import { RM } from './core';
const BL = '▓▒░';
const hh = (a, b) => { let n = (a * 7919 + b * 104729) ^ 0x5bd1e995; n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d); return ((n ^ (n >>> 13)) >>> 0) / 4294967296; };
// tekst elementu: pierwszy węzeł tekstowy (gdy są też dzieci, np. kursor w przycisku), inaczej cały textContent
const node = el => { const f = el.firstChild; return f && f.nodeType === 3 && el.childNodes.length > 1 ? f : null; };
const read = el => { const n = node(el); return n ? n.nodeValue : el.textContent; };
const write = (el, s) => { const n = node(el); if (n) n.nodeValue = s; else el.textContent = s; };

export function decodeSwap(el, text, { delay = 0, dur = 640 } = {}) {
  if (!el) return Promise.resolve();
  const from = [...read(el)], to = [...text], id = el._xl = (el._xl || 0) + 1;
  if (RM || read(el) === text) { write(el, text); return Promise.resolve(); }
  const n = Math.max(from.length, to.length), seed = Math.floor(Math.random() * 1e4);
  // każdy znak ma własny start (od lewej z rozrzutem); 150 ms w blokach, potem nowy znak
  const st = Array.from({ length: n }, (_, i) => delay + (i / n) * dur * .55 + hh(i, seed) * dur * .3), B = 170;
  return new Promise(res => { const t0 = performance.now();
    const tick = now => { if (el._xl !== id) return res();             // przerwane nowszą zmianą
      const t = now - t0; let s = '', busy = false;
      for (let i = 0; i < n; i++) { const k = (t - st[i]) / B, a = from[i] ?? ' ', b = to[i] ?? '';
        if (k < 0) { s += a; busy = true; } else if (k < 1) { s += (a === ' ' && b === ' ') ? ' ' : BL[Math.min(2, Math.floor(k * 3))]; busy = true; } else s += b; }
      write(el, busy ? s : text); if (busy) requestAnimationFrame(tick); else res(); };
    requestAnimationFrame(tick); });
}

// pisanie zwykłego tekstu (bez rozbijania na litery-spany, żeby akapity zawijały się po słowach)
export function typeSwap(el, text, { delay = 0, speed = 1 } = {}) {
  if (!el) return Promise.resolve();
  const id = el._xl = (el._xl || 0) + 1, old = read(el);
  if (RM || old === text) { write(el, text); return Promise.resolve(); }
  return new Promise(res => { let i = old.length;
    const back = () => { if (el._xl !== id) return res(); if (i > 0) { i = Math.max(0, i - Math.ceil(old.length / 14)); write(el, old.slice(0, i)); setTimeout(back, 16); } else fwd(); };
    let j = 0; const fwd = () => { if (el._xl !== id) return res(); if (j > text.length) return res(); write(el, text.slice(0, j++));
      const ch = text[j - 2]; setTimeout(fwd, ((ch === ' ' ? 60 : /[,.]/.test(ch || '') ? 160 : 24) + Math.random() * 38) / speed); };
    setTimeout(back, delay); });
}
