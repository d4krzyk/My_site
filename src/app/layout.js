import { Martian_Mono, VT323 } from 'next/font/google';
import { BASE } from '@/lib/base';
import './globals.css';

const martian = Martian_Mono({ subsets: ['latin', 'latin-ext'], weight: ['300', '400', '600'], variable: '--font-martian', display: 'swap' });
const vt = VT323({ subsets: ['latin', 'latin-ext'], weight: '400', variable: '--font-vt', display: 'swap' });

export const metadata = {
  title: 'KRZYK',
  description: 'Krzyk i Maszynologia: sztuka z chaosu, muzyka, obraz i maszyny.',
};

// pikselowe kroje ładowane pod stałymi nazwami, bo rysuje nimi też canvas (tunel bramy)
const faces = `
@font-face{font-family:"Alagard PL";src:url(${BASE}/fonts/alagard-pl.otf) format("opentype");font-display:block}
@font-face{font-family:"Krzyk DOS";src:url(${BASE}/fonts/krzyk-dos.otf) format("opentype");font-display:block}
@font-face{font-family:"Liberation Serif K";src:url(${BASE}/fonts/liberation-serif.woff2) format("woff2");font-display:swap}
@font-face{font-family:"Special Elite K";src:url(${BASE}/fonts/special-elite.woff2) format("woff2");font-display:block}`;

export default function RootLayout({ children }) {
  return (
    <html lang="pl" className={`${martian.variable} ${vt.variable}`}>
      <head><style dangerouslySetInnerHTML={{ __html: faces }} /></head>
      <body>{children}</body>
    </html>
  );
}
