// głosy person w stylu Undertale: jeden syntezowany „blip" na literę czytanego tekstu (WebAudio, bez plików dźwiękowych).
// Funkcje przyjmują dowolny BaseAudioContext, więc te same głosy można wyrenderować offline (podgląd WAV).
//   0 Anxtan: bardzo szybkie, szeleszczące dukanie jak odwrócona nagrana mowa (narastanie i ucięcie), losowe formanty i jąkanie
//   1 Nugis:  wolne, figlarne blipy, każdy ślizga się w górę; koniec słowa jeszcze wyżej
//   2 Stoir:  niski, obrażony głos z akcentem: lekki spadek tonu i podniesienie na końcu słowa, piła przez filtr dolnoprzepustowy
export const VOICE_MS = [24, 62, 76];            // odstęp między literami przy czytaniu (ms)
export const VOICE_NAMES = ['Anxtan', 'Nugis', 'Stoir'];
const VOICE_GAIN = [2.3, 2.6, 1];                 // wyrównanie głośności (niski Stoir sam z siebie jest najgłośniejszy)

const rnd = (code, n, salt = 0) => { let h = (code * 374761393 + n * 668265263 + salt * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

// k: indeks persony, ch: litera, n: numer litery w tekście, last: ostatnia litera słowa, t: czas startu (s) w kontekście ctx
export function blip(ctx, out, k, ch, n, last, t) {
  const code = ch.toLowerCase().charCodeAt(0) || 97, r = rnd(code, n), og = ctx.createGain(), env = ctx.createGain(); og.gain.value = VOICE_GAIN[k]; og.connect(out); env.connect(og);
  const osc = (type, f0, f1, t0, t1) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t0); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t1); return o; };
  if (k === 0) {
    // odwrócona mowa: wolne narastanie i nagłe ucięcie; do tego pasmo formantu skacze między literami, a co trzecia litera jąka się podwójnie
    const reps = n % 3 === 2 ? 2 : 1;
    for (let q = 0; q < reps; q++) { const t0 = t + q * .028, d = .05, f = (420 + r * 760) * (q ? .72 : 1) * (n % 9 === 8 ? 2 : 1);
      const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0); e.gain.linearRampToValueAtTime(.55, t0 + d * .85); e.gain.setValueAtTime(0.0001, t0 + d * .9); e.connect(env);
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 5; bp.frequency.value = 600 + rnd(code, n, 3) * 1900; bp.connect(e);
      const o = osc('square', f, f * (.85 + rnd(code, n, 5) * .3), t0, t0 + d); o.connect(bp); o.start(t0); o.stop(t0 + d + .01); }
    env.gain.value = .9; return;
  }
  if (k === 1) {
    // ślizg w górę, jak mowa postaci z Undertale; koniec słowa wyżej i dłużej
    const d = last ? .13 : .085, f0 = 300 + (code % 6) * 38 + r * 20, f1 = f0 * (last ? 1.9 : 1.5);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3600; lp.connect(env);
    env.gain.setValueAtTime(0.0001, t); env.gain.linearRampToValueAtTime(.5, t + .008); env.gain.exponentialRampToValueAtTime(0.0001, t + d);
    const a = osc('triangle', f0, f1, t, t + d), b = osc('square', f0, f1, t, t + d), bg = ctx.createGain(); bg.gain.value = .22; a.connect(lp); b.connect(bg); bg.connect(lp);
    a.start(t); b.start(t); a.stop(t + d + .01); b.stop(t + d + .01); return;
  }
  // 2: niski, obrażony, z akcentem: spadek tonu, potem unoszący się koniec słowa
  const d = last ? .17 : .12, f0 = 82 + (code % 5) * 9 + r * 4, lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 560; lp.Q.value = 4; lp.connect(env);
  env.gain.setValueAtTime(0.0001, t); env.gain.linearRampToValueAtTime(.9, t + .022); env.gain.setValueAtTime(.9, t + d * .65); env.gain.linearRampToValueAtTime(0.0001, t + d);
  const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * .88, t + d * .5); o.frequency.exponentialRampToValueAtTime(f0 * (last ? 1.28 : 1.04), t + d);
  const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 5.5; lg.gain.value = 2.5; lfo.connect(lg); lg.connect(o.frequency);
  const fm = ctx.createBiquadFilter(); fm.type = 'bandpass'; fm.frequency.value = 720 + r * 180; fm.Q.value = 3; const fg = ctx.createGain(); fg.gain.value = .3; o.connect(lp); o.connect(fm); fm.connect(fg); fg.connect(env);
  o.start(t); lfo.start(t); o.stop(t + d + .01); lfo.stop(t + d + .01);
}

// zaplanowanie całego tekstu offline (podgląd): zwraca czas trwania w sekundach
export function scheduleText(ctx, out, k, text, t0) {
  let t = t0; const ms = VOICE_MS[k] / 1000;
  for (let i = 0; i < text.length; i++) { const ch = text[i];
    if (/\s/.test(ch)) { t += ms * .6; continue; }
    if (/[a-ząćęłńóśźż]/i.test(ch)) blip(ctx, out, k, ch, i, !text[i + 1] || /[\s.,;:!?]/.test(text[i + 1]), t);
    t += ms + (/[.,;:!?]/.test(ch) ? (k === 0 ? .06 : .16) : 0); }
  return t - t0;
}
