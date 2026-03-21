const CACHE_NAME = 'streamvault-offline-v7';
const OFFLINE_URL = '/offline.html';
const OFFLINE_PLAYER_URL = '/offline-player.html';
const HLS_JS_URL = 'https://cdn.jsdelivr.net/npm/hls.js@latest';

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install v7');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache the offline pages and the video stream decoder
      return cache.addAll([OFFLINE_URL, OFFLINE_PLAYER_URL, HLS_JS_URL]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate v7');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== 'streamvault-media-cache') {
            console.log('[Service Worker] Deleting old app cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Explicitly intercept all video fragments and streaming endpoints (including proxy)
  if (url.pathname.endsWith('.ts') || url.pathname.endsWith('.m3u8') || url.pathname.startsWith('/api/proxy')) {
    event.respondWith(
      caches.open('streamvault-media-cache').then((mediaCache) => {
        return mediaCache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request);
        });
      })
    );
    return;
  }

  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.protocol === 'chrome-extension:'
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          // DO NOT cache general HTML navigation documents!
          // Caching Next.js dev HTML traps the user in broken shells offline.
          if (event.request.mode !== 'navigate') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
               cache.put(event.request, responseToCache);
            });
          }
        }
        return networkResponse;
      })
      .catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        
        // If it's a navigation request (user typed a URL, or hit F5), 
        // we bypass any accidental cache and strictly serve the offline fallback!
        if (event.request.mode === 'navigate') {
           const isOfflinePlayer = url.pathname.includes('offline-player');
           const fallback = await cache.match(isOfflinePlayer ? OFFLINE_PLAYER_URL : OFFLINE_URL);
           if (fallback) return fallback;
        }

        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
           return cachedResponse;
        }

        return new Response('Offline and not cached', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});
