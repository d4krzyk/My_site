// dźwięk strony: jedno miejsce prawdy dla głosów person i ikonki w rogu. Stan pamięta przeglądarka ('on' | 'off'); domyślnie wyłączony i bez wyboru.
// Wybór pada klikiem (ekran bramy albo ikonka), więc AudioContext można od razu utworzyć; po odświeżeniu strony przeglądarka blokuje dźwięk do pierwszego gestu.
const KEY = 'krzyk-sound';
let ctx = null, master = null;
export function soundChoice() { try { const v = localStorage.getItem(KEY); return v === 'on' || v === 'off' ? v : null; } catch (e) { return null; } }
export const soundOn = () => soundChoice() === 'on';
export function audio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = .22; master.connect(ctx.destination); } catch (e) { return null; } }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return { ctx, master };
}
export function setSound(on) {
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {}
  if (on) audio();
  window.dispatchEvent(new CustomEvent('krzyk-sound', { detail: on }));
}
if (typeof window !== 'undefined') {
  const wake = () => { if (soundOn()) audio(); removeEventListener('pointerdown', wake, true); removeEventListener('keydown', wake, true); };
  addEventListener('pointerdown', wake, true); addEventListener('keydown', wake, true);
}
