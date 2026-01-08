const CACHE_NAME = 'pharmabf-cache-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json',
    '/logo.png',
    '/globals.css',
];

// Installation : Mise en cache des ressources de base
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activation : Nettoyage des vieux caches
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

// Stratégie : Network First with Cache Fallback for Pages, Cache First for Assets
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Pour les pages et les données API, on privilégie le réseau
    if (event.request.mode === 'navigate' || url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // On met à jour le cache
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    return response;
                })
                .catch(() => caches.match(event.request) || caches.match('/'))
        );
    } else {
        // Pour les assets (images, scripts, styles), cache d'abord
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request).then((fetchRes) => {
                    const copy = fetchRes.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    return fetchRes;
                });
            })
        );
    }
});
