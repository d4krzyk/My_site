// język strony (pl / en): zapamiętany w przeglądarce, wspólny dla bramy i kart nawigacji
const KEY = 'krzyk-lang';
export function getLang() {
  try { const v = localStorage.getItem(KEY); if (v === 'pl' || v === 'en') return v; } catch (e) {}
  return (typeof navigator !== 'undefined' && /^pl\b/i.test(navigator.language || '')) ? 'pl' : 'en';
}
// Zmiana języka uruchamia animacje (pisanie, dekodowanie); kolejna zmiana w trakcie nakładałaby je na siebie i część tekstu zostawała bez efektu,
// więc przełącznik jest zablokowany na czas animacji (LANG_MS), a przyciski w rogu przygaszone (zdarzenie krzyk-lang-busy).
const LANG_MS = 2600; let busy = false;
export const langBusy = () => busy;
export function setLang(l) {
  if (busy || l === getLang()) return false;
  try { localStorage.setItem(KEY, l); } catch (e) {}
  if (typeof document !== 'undefined') document.documentElement.lang = l;
  if (typeof window !== 'undefined') {
    busy = true; window.dispatchEvent(new CustomEvent('krzyk-lang-busy', { detail: true }));
    window.dispatchEvent(new CustomEvent('krzyk-lang', { detail: l }));
    setTimeout(() => { busy = false; window.dispatchEvent(new CustomEvent('krzyk-lang-busy', { detail: false })); }, LANG_MS);
  }
  return true;
}
// teksty kart nawigacji
export const CARD_TEXT = {
  pl: { names: ['Brama', 'Krzyk', 'Maszynologia'], roads: ['w próg', 'ku słońcu', 'ku księżycowi'], here: '▸ tu jesteś', dialog: 'Rozdziały', switch: 'Język' },
  en: { names: ['Gate', 'Krzyk', 'Machinology'], roads: ['to the threshold', 'toward the sun', 'toward the moon'], here: '▸ you are here', dialog: 'Chapters', switch: 'Language' },
};

// teksty dwujęzyczne w znacznikach: element z data-en (tekst) i data-en-aria (etykieta); oryginał PL zostaje w data-pl / data-pl-aria.
// To przepisanie bez animacji (start strony); animowaną zmianę robią moduły działów (Krzyk: pisanie, Maszynologia i brama: odkodowanie)
export function applyLangStatic(root, lang, skip) {
  root.querySelectorAll('[data-en],[data-en-aria]').forEach(el => {
    if (el.dataset.en != null) {
      if (el.dataset.pl == null) el.dataset.pl = el.textContent;
      if (!el.dataset.prep && !(skip && skip(el))) el.textContent = lang === 'en' ? el.dataset.en : el.dataset.pl;
    }
    if (el.dataset.enAria != null) {
      if (el.dataset.plAria == null) el.dataset.plAria = el.getAttribute('aria-label') || '';
      el.setAttribute('aria-label', lang === 'en' ? el.dataset.enAria : el.dataset.plAria);
    }
  });
}
export const tr = (pl, en) => (typeof document !== 'undefined' && document.documentElement.lang === 'en') ? en : pl;
