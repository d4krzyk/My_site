'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getLang, setLang } from '@/lib/lang';

// przełącznik języka: dwa pikselowe klawisze, zawsze w prawym górnym rogu obok kart; aktywny wciśnięty, w kolorze działu
export default function LangKeys() {
  const path = usePathname() || '/';
  const [lang, set] = useState(null);           // do zamontowania bez stanu, żeby HTML ze statycznego eksportu zgadzał się z klientem
  useEffect(() => { set(getLang()); const on = e => set(e.detail); window.addEventListener('krzyk-lang', on); return () => window.removeEventListener('krzyk-lang', on); }, []);
  // zablokowany na czas animacji zmiany języka (lib/lang)
  const [busy, setBusy] = useState(false);
  useEffect(() => { const on = e => setBusy(!!e.detail); window.addEventListener('krzyk-lang-busy', on); return () => window.removeEventListener('krzyk-lang-busy', on); }, []);
  const kind = path.includes('/maszynologia') ? 'maszyn' : path.includes('/krzyk') ? 'krzyk' : 'brama';
  return (
    <div className={`lang-keys ${kind}${busy ? ' busy' : ''}`} role="group" aria-label={lang === 'en' ? 'Language' : 'Język'}>
      {['pl', 'en'].map(l => (
        <button key={l} type="button" aria-pressed={lang === l} aria-disabled={busy && lang !== l ? 'true' : undefined} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}
