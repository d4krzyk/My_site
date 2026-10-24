// prefiks ścieżki do plików z public/ (basePath nie jest dodawany automatycznie do adresów w JS i CSS)
export const BASE = process.env.NEXT_PUBLIC_BASE || '';
const BUILD = process.env.NEXT_PUBLIC_BUILD || '';
export const asset = p => BASE + p + (BUILD ? `?v=${BUILD}` : '');
