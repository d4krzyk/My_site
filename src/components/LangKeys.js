'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getLang, setLang } from '@/lib/lang';

// przełącznik języka: dwa pikselowe klawisze, zawsze w prawym górnym rogu obok kart; aktywny wciśnięty, w kolorze działu
export default function LangKeys() {
  const path = usePathname() || '/';
  const [lang, set] = useState(null);           // do zamontowania bez stanu, żeby HTML ze statycznego eksportu zgadzał się z klientem
  useEffect(() => { set(getLang()); const on = e => set(e.detail); window.addEventListener('krzyk-lang', on); return () => window.removeEventListener('krzyk-lang', on); }, []);
  const kind = path.includes('/maszynologia') ? 'maszyn' : path.includes('/krzyk') ? 'krzyk' : 'brama';
  return (
    <div className={`lang-keys ${kind}`} role="group" aria-label={lang === 'en' ? 'Language' : 'Język'}>
      {['pl', 'en'].map(l => (
        <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}
