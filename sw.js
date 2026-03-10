const CACHE_NAME = 'golf-app-v20-permanent';
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
      // ネットワーク経由でVue.jsなどを一気に保存
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

// 通信発生時の処理: ネットワークが死んでいてもキャッシュを即座に返す
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // キャッシュがあればそれを返す
      }
      return fetch(event.request).then((res) => {
        // 新しいリソースがあればついでに保存
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, res.clone());
          return res;
        });
      });
    })
  );
});