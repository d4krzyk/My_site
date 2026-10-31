// język strony (pl / en): zapamiętany w przeglądarce, wspólny dla bramy i kart nawigacji
const KEY = 'krzyk-lang';
export function getLang() {
  try { const v = localStorage.getItem(KEY); if (v === 'pl' || v === 'en') return v; } catch (e) {}
  return (typeof navigator !== 'undefined' && /^pl\b/i.test(navigator.language || '')) ? 'pl' : 'en';
}
export function setLang(l) {
  try { localStorage.setItem(KEY, l); } catch (e) {}
  if (typeof document !== 'undefined') document.documentElement.lang = l;
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('krzyk-lang', { detail: l }));
}
// teksty kart nawigacji
export const CARD_TEXT = {
  pl: { names: ['Brama', 'Krzyk', 'Maszynologia'], roads: ['w próg', 'ku słońcu', 'ku księżycowi'], here: '▸ tu jesteś', dialog: 'Rozdziały', switch: 'Język' },
  en: { names: ['Gate', 'Krzyk', 'Machinology'], roads: ['to the threshold', 'toward the sun', 'toward the moon'], here: '▸ you are here', dialog: 'Chapters', switch: 'Language' },
};
