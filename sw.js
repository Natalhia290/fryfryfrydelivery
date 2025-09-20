// Service Worker para PWA
const CACHE_NAME = 'fry-sushi-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/painel-pedidos.html',
  '/style.css',
  '/admin-style.css',
  '/script.js',
  '/admin-script.js',
  '/firebase-config.js',
  '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - retornar resposta
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
