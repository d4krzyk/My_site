'use client';
import { useEffect } from 'react';

// kursor strony (klucz i mrugające oko nad klikalnymi elementami); tylko na urządzeniach z myszą
export default function CursorInit() {
  useEffect(() => { import('@/engine/cursor').then(({ initCursor }) => initCursor()); }, []);
  return null;
}
