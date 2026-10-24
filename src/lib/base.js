// prefiks ścieżki do plików z public/ (basePath nie jest dodawany automatycznie do adresów w JS i CSS)
export const BASE = process.env.NEXT_PUBLIC_BASE || '';
export const asset = p => BASE + p;
