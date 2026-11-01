// lista filmów z kanału YouTube „CHAOTYCZNE WYRAZY EKSPRESJI” (@zchaosu) dla telewizora w sekcji muzyki.
// Uruchamiana przed budową (prebuild): pobiera kanał RSS (bez klucza API), łączy go ze stanem zapisanym w public/krzyk/clips.json
// (RSS daje tylko 15 najnowszych, więc starsze zostają z zapisanego pliku) i zapisuje wynik posortowany od najnowszych.
// Brak sieci albo błąd nigdy nie psuje budowy: zostaje zapisany plik.
import { readFile, writeFile } from 'node:fs/promises';
const CHANNEL = 'UCgylhn-JysNUsZeHJWQdb2g', FILE = new URL('../public/krzyk/clips.json', import.meta.url);
const dec = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
let base = []; try { base = JSON.parse(await readFile(FILE, 'utf8')).clips || []; } catch (e) {}
let fresh = [];
try {
  const r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL}`, { signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const xml = await r.text();
  fresh = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => { const e = m[1], g = re => (e.match(re) || [])[1];
    return { id: g(/<yt:videoId>([^<]+)</), title: dec(g(/<title>([^<]*)</) || ''), published: g(/<published>([^<]+)</) }; }).filter(c => c.id);
} catch (e) { console.warn('clips: pominięto pobieranie (' + (e.message || e) + '), zostaje zapisana lista'); }
const by = new Map(base.map(c => [c.id, c]));
for (const c of fresh) by.set(c.id, { ...by.get(c.id), ...c });
const clips = [...by.values()].sort((a, b) => (b.published || '').localeCompare(a.published || ''));
await writeFile(FILE, JSON.stringify({ channel: CHANNEL, handle: '@zchaosu', clips }, null, 1) + '\n');
console.log(`clips: ${clips.length} filmów (${fresh.length} z RSS)`);
