// dźwięki odpalania kasety w magnetowidzie VHS (synteza WebAudio, bez plików): stuk plastiku, zatrzask kieszeni, silnik i przekładnie ładowania taśmy,
// rozpędzanie bębna głowic, klaps „play”, szum śledzenia na niebieskim ekranie, zatrzaśnięcie ścieżki, wysuwanie kasety i klik pilota.
// Wszystko gra tylko przy włączonym dźwięku (ikonka oscyloskopu); wspólny AudioContext i głośność główna pochodzą z lib/sound.
import { audio, soundOn } from '../lib/sound';

const A = () => (soundOn() ? audio() : null);
const noise = ctx => { if (!noise.b || noise.c !== ctx) { const n = ctx.sampleRate * 2, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; noise.b = b; noise.c = ctx; } return noise.b; };
// krótki wybuch szumu przez filtr (kliknięcia, stuknięcia)
function burst(ctx, out, t, dur, type, f, q, gain) {
  const s = ctx.createBufferSource(); s.buffer = noise(ctx); const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(fl); fl.connect(g); g.connect(out); s.start(t, Math.random() * 1.5, dur + .02);
}
// ton z płynną zmianą wysokości i obwiednią (stuk, świst, pisk)
function tone(ctx, out, t, dur, type, f0, f1, gain, att = .004) {
  const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + .02);
}

// kaseta wchodzi do kieszeni: głuchy stuk i zatrzask
export function tapeThunk(d = 0) {
  const a = A(); if (!a) return; const { ctx, master } = a, t = ctx.currentTime + d;
  tone(ctx, master, t, .2, 'sine', 120, 42, 1);
  tone(ctx, master, t + .02, .08, 'triangle', 280, 140, .28);
  burst(ctx, master, t, .05, 'bandpass', 1700, 1.4, .55);
  burst(ctx, master, t + .12, .03, 'bandpass', 2700, 2, .3);
}
// silnik i przekładnie ładowania taśmy; rev = wysuwanie (obroty maleją)
export function loadWhirr(dur = 1.4, d = 0, rev = false) {
  const a = A(); if (!a) return; const { ctx, master } = a, t = ctx.currentTime + d;
  const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(rev ? 96 : 56, t); o.frequency.linearRampToValueAtTime(rev ? 54 : 96, t + dur);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 540; lp.Q.value = .8;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(.3, t + .15); g.gain.setValueAtTime(.3, t + dur - .2); g.gain.linearRampToValueAtTime(0.0001, t + dur);
  o.connect(lp); lp.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02);
  burst(ctx, master, t, dur, 'bandpass', 900, .9, .09);
  for (let x = .05; x < dur - .05; x += .055 + Math.random() * .025) burst(ctx, master, t + x, .01, 'highpass', 2800, .7, .1);   // zęby przekładni
}
// bęben głowic rozpędza się: narastający świst z lekkim drżeniem
export function drumSpin(d = 0) {
  const a = A(); if (!a) return; const { ctx, master } = a, t = ctx.currentTime + d, dur = .95;
  const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(430, t + dur);
  const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 22; lg.gain.value = 6; lfo.connect(lg); lg.connect(o.frequency);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(.17, t + dur * .8); g.gain.linearRampToValueAtTime(.07, t + dur);
  o.connect(g); g.connect(master); o.start(t); lfo.start(t); o.stop(t + dur + .02); lfo.stop(t + dur + .02);
  burst(ctx, master, t, dur, 'bandpass', 3800, 1, .05);
}
// klaps przycisku „play” (przekaźnik)
export function playClunk(d = 0) {
  const a = A(); if (!a) return; const { ctx, master } = a, t = ctx.currentTime + d;
  burst(ctx, master, t, .07, 'lowpass', 420, .8, .7); tone(ctx, master, t, .1, 'sine', 88, 55, .6); burst(ctx, master, t + .01, .02, 'bandpass', 2300, 1.5, .25);
}
// szum śledzenia na niebieskim ekranie: syk i pulsujący pomruk, gdy pasmo przechodzi przez ekran; zwraca obiekt z stop()
export function trackingHiss() {
  const a = A(); if (!a) return { stop() {} }; const { ctx, master } = a, t = ctx.currentTime;
  const s = ctx.createBufferSource(); s.buffer = noise(ctx); s.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = .6;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(.1, t + .2);
  const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .47; lg.gain.value = .05; lfo.connect(lg); lg.connect(g.gain);   // pasmo przechodzi co ~2 s
  const hum = ctx.createOscillator(); hum.type = 'sine'; hum.frequency.value = 100; const hg = ctx.createGain(); hg.gain.value = .03; hum.connect(hg); hg.connect(master);
  s.connect(bp); bp.connect(g); g.connect(master); s.start(t); lfo.start(t); hum.start(t);
  let done = false;
  return { stop() { if (done) return; done = true; const n = ctx.currentTime; g.gain.cancelScheduledValues(n); g.gain.setValueAtTime(g.gain.value, n); g.gain.linearRampToValueAtTime(0.0001, n + .12); hg.gain.linearRampToValueAtTime(0.0001, n + .12);
    setTimeout(() => { try { s.stop(); lfo.stop(); hum.stop(); } catch (e) {} }, 220); } };
}
// zatrzaśnięcie ścieżki: krótki pisk, szum odpływa
export function trackLock() {
  const a = A(); if (!a) return; const { ctx, master } = a, t = ctx.currentTime;
  tone(ctx, master, t, .18, 'sine', 2200, 900, .55); tone(ctx, master, t, .16, 'sine', 62, 40, .6); burst(ctx, master, t, .4, 'bandpass', 3000, .7, .5);
}
// wysuwanie kasety: obroty maleją, na końcu stuk
export function ejectSeq() { loadWhirr(1.1, 0, true); tapeThunk(1.05); }
// pilot: klik przycisku i krótki sygnał
export function remoteClick() {
  const a = A(); if (!a) return; const { ctx, master } = a, t = ctx.currentTime;
  burst(ctx, master, t, .012, 'bandpass', 3200, 1.2, .35); tone(ctx, master, t + .012, .018, 'square', 1100, 1100, .16); tone(ctx, master, t + .07, .022, 'square', 2600, 2600, .09);
}
