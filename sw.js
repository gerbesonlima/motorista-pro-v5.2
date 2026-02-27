const CACHE_NAME = 'motorista-pro-v5.2-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './js/main.js',
  './js/storage.js',
  './js/calculate.js',
  './js/ui.js',
  './js/forms.js',
  './js/utils.js'
  // adicione aqui outros arquivos JS, CSS ou assets que quiser cachear
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});