// statyczny eksport na GitHub Pages: strona żyje pod /My_site (PAGES=1 w workflow), lokalnie w korzeniu
const base = process.env.PAGES ? '/My_site' : '';
export default {
  output: 'export',
  basePath: base,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE: base },
};
