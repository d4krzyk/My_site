'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getLang, setLang } from '@/lib/lang';

// przełącznik języka: dwa pikselowe klawisze, zawsze w prawym górnym rogu obok kart; aktywny wciśnięty, w kolorze działu
export default function LangKeys() {
  const path = usePathname() || '/';
  const [lang, set] = useState(null);           // do zamontowania bez stanu, żeby HTML ze statycznego eksportu zgadzał się z klientem
  useEffect(() => { set(getLang()); const on = e => set(e.detail); window.addEventListener('krzyk-lang', on); return () => window.removeEventListener('krzyk-lang', on); }, []);
  // telefon: klawisze chowają się przy przewijaniu w dół (nie zasłaniają treści) i wracają przy przewijaniu w górę lub na samej górze
  const [away, setAway] = useState(false);
  useEffect(() => {
    let last = window.scrollY, raf = 0;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const y = window.scrollY, d = y - last;
      if (!window.matchMedia('(max-width:700px)').matches || y < 60) setAway(false); else if (d > 6) setAway(true); else if (d < -6) setAway(false); last = y; }); };
    window.addEventListener('scroll', on, { passive: true }); return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, []);
  const kind = path.includes('/maszynologia') ? 'maszyn' : path.includes('/krzyk') ? 'krzyk' : 'brama';
  return (
    <div className={`lang-keys ${kind}${away ? ' away' : ''}`} role="group" aria-label={lang === 'en' ? 'Language' : 'Język'}>
      {['pl', 'en'].map(l => (
        <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}
