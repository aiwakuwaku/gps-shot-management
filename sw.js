const CACHE_NAME = 'golf-app-v30-final-offline-stable';
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
      // 一つずつ確実にキャッシュに入れる
      return Promise.all(
        urlsToCache.map(url => {
          return cache.add(url).catch(err => console.error('Cache add error:', url, err));
        })
      );
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

// 通信処理：キャッシュ第一 (Cache-First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // スマホの中に保存されたファイルがあれば即座にそれを返す
      if (response) {
        return response;
      }
      // なければインターネットへ取りにいく
      return fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // ついでに保存しておく
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});