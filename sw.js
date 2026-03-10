const CACHE_NAME = 'golf-app-v10-final-offline';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://unpkg.com/vue@3/dist/vue.global.js',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 外部ライブラリも一気に取得して保存
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // 外部CDNリソース(Vue.js等)に対してもキャッシュ優先で対応する
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // キャッシュがあれば即座に返す
      }
      return fetch(event.request).then((networkResponse) => {
        // 取得した新しいリソースをキャッシュに保存して返す
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => {
      // オフラインかつキャッシュ無しの場合でも、致命的なエラーは出さない
    })
  );
});