'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { asset } from '@/lib/base';

const HREF = ['/', '/krzyk/', '/maszynologia/'];
const FACE = ['brama', 'krzyk', 'maszynologia'];

// ikonka trzech kart w prawym górnym rogu; po kliknięciu rozkład kart z drogami do działów
export default function CardsNav({ current }) {
  const ref = useRef(null);
  const router = useRouter();
  useEffect(() => {
    let alive = true;
    import('@/engine/cards').then(({ initCards }) => {
      if (!alive || !ref.current) return;
      initCards(ref.current, {
        current,
        minis: [0, 1, 2].map(i => asset(`/cards/mini-${i}.png`)),
        backs: [0, 1, 2].map(i => asset(`/cards/back-${i}.png`)),
        faces: FACE.map(k => asset(`/cards/face-${k}.png`)),
        onGo: i => router.push(HREF[i]),
      });
    });
    return () => { alive = false; };
  }, [current, router]);
  return (
    <div className="cards-nav" ref={ref}>
      <button type="button" className="deck" aria-label="Rozdziały"><canvas /></button>
    </div>
  );
}
