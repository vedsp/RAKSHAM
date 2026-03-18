const CACHE_NAME = 'phishshield-v1';
const OFFLINE_URLS = ['/', '/analyze', '/history', '/about'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Cache result pages for offline viewing (last 10)
  if (request.url.includes('/result/') && request.method === 'GET') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Network-first for API
  if (request.url.includes('/api/')) {
    event.respondWith(fetch(request).catch(() => new Response('{}', { headers: { 'Content-Type': 'application/json' } })));
    return;
  }

  // Cache-first for static
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
