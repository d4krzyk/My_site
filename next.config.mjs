// statyczny eksport na GitHub Pages: strona żyje pod /My_site (PAGES=1 w workflow), lokalnie w korzeniu
const base = process.env.PAGES ? '/My_site' : '';
// wersja budowy dopisywana do adresów plików, żeby po publikacji przeglądarka nie brała starych obrazków z pamięci
const build = Date.now().toString(36);
export default {
  output: 'export',
  basePath: base,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE: base, NEXT_PUBLIC_BUILD: build },
};
