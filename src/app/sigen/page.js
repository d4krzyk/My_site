import CardsNav from '@/components/CardsNav';
import Sigen from '@/components/Sigen';

export const metadata = { title: 'SIGEN — KRZYK', description: 'Ukryty generator sigili.', robots: { index: false, follow: false } };

export default function SigenPage() {
  return (<><CardsNav current={2} /><Sigen /></>);
}
