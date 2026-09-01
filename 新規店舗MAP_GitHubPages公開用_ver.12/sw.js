// 新規店舗MAP用のシンプルなService Worker
// - Chrome/EdgeでPWAとして「インストール」できるようにするための最小要件を満たす
// - あわせてアプリ本体(HTML/アイコン)をキャッシュし、次回以降はオフラインでも起動できるようにする
// - CSVの読み込みや地図タイル(OpenStreetMap)はキャッシュ対象外(常に最新を取得)

const CACHE_NAME = 'shinki-tenpo-map-v4'; // アイコン等を更新したら、この末尾の番号を上げてください
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // アプリ本体(同じオリジン)はキャッシュ優先、それ以外(CDNや地図タイルなど)は通常通りネットワークから
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
  }
});
