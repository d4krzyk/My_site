'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getLang, setLang } from '@/lib/lang';

// przełącznik języka: jedna pikselowa płytka z dwoma polami i suwakiem (skokowo przesuwa się na aktywny język), zawsze w prawym górnym rogu obok kart, w kolorze działu
export default function LangKeys() {
  const path = usePathname() || '/';
  const [lang, set] = useState(null);           // do zamontowania bez stanu, żeby HTML ze statycznego eksportu zgadzał się z klientem
  useEffect(() => { set(getLang()); const on = e => set(e.detail); window.addEventListener('krzyk-lang', on); return () => window.removeEventListener('krzyk-lang', on); }, []);
  // zablokowany na czas animacji zmiany języka (lib/lang)
  const [busy, setBusy] = useState(false);
  useEffect(() => { const on = e => setBusy(!!e.detail); window.addEventListener('krzyk-lang-busy', on); return () => window.removeEventListener('krzyk-lang-busy', on); }, []);
  const kind = path.includes('/maszynologia') ? 'maszyn' : path.includes('/krzyk') ? 'krzyk' : 'brama';
  return (
    <div className={`lang-keys ${kind}${busy ? ' busy' : ''}`} data-on={lang === 'en' ? 'en' : 'pl'} role="group" aria-label={lang === 'en' ? 'Language' : 'Język'}>
      <i className="lk-thumb" aria-hidden="true" />
      {['pl', 'en'].map(l => (
        <button key={l} type="button" aria-pressed={lang === l} aria-disabled={busy && lang !== l ? 'true' : undefined} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}
