const CACHE_NAME = 'streamvault-offline-v10';
const MEDIA_CACHE = 'streamvault-media-cache';
const OFFLINE_URL = '/offline.html';
const OFFLINE_PLAYER_URL = '/offline-player.html';
const HLS_JS_URL = 'https://cdn.jsdelivr.net/npm/hls.js@latest';

const APP_SHELL = [
  OFFLINE_URL,
  OFFLINE_PLAYER_URL,
  HLS_JS_URL,
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
];

// ─── INSTALL ───
self.addEventListener('install', (event) => {
  console.log('[SW] Install v10');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache each resource individually — don't let one failure break everything
      for (const url of APP_SHELL) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn('[SW] Failed to cache:', url, err.message);
        }
      }
    })
  );
  self.skipWaiting();
});

// ─── ACTIVATE ───
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate v10');
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME && name !== MEDIA_CACHE) {
            console.log('[SW] Purging old cache:', name);
            return caches.delete(name);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Helper: find a cached response by trying multiple URL match strategies ───
async function findInMediaCache(request) {
  const cache = await caches.open(MEDIA_CACHE);

  // Strategy 1: exact match
  const exact = await cache.match(request);
  if (exact) return exact;

  // Strategy 2: match ignoring query params order / variation
  const url = new URL(request.url);

  // If this is a /api/proxy?url=... request, extract the inner URL and try matching 
  if (url.pathname === '/api/proxy' && url.searchParams.has('url')) {
    const innerUrl = url.searchParams.get('url');
    // Try matching by the full constructed key
    const proxyKey = `/api/proxy?url=${encodeURIComponent(innerUrl)}`;
    const proxyMatch = await cache.match(new Request(new URL(proxyKey, url.origin).href));
    if (proxyMatch) return proxyMatch;

    // Try matching the raw inner URL directly  
    const rawMatch = await cache.match(new Request(innerUrl));
    if (rawMatch) return rawMatch;
  }

  // Strategy 3: for raw external URLs, check if we cached them via the proxy key
  if (url.hostname !== self.location.hostname && !url.pathname.startsWith('/api/')) {
    const proxyKey = `/api/proxy?url=${encodeURIComponent(request.url)}`;
    const proxyMatch = await cache.match(new Request(new URL(proxyKey, self.location.origin).href));
    if (proxyMatch) return proxyMatch;
  }

  return null;
}

// ─── FETCH STRATEGY ───
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1) MEDIA STREAMS: cache-first for .ts, .m3u8, /api/proxy
  if (
    url.pathname.endsWith('.ts') ||
    url.pathname.endsWith('.m3u8') ||
    url.pathname.startsWith('/api/proxy')
  ) {
    event.respondWith(
      (async () => {
        // Try cache first (with flexible matching)
        const cached = await findInMediaCache(event.request);
        if (cached) {
          console.log('[SW] Cache hit (media):', url.pathname.substring(0, 60));
          return cached;
        }

        // Not in cache → try network
        try {
          const fetchOpts = url.pathname.startsWith('/api/proxy')
            ? { credentials: 'include' }
            : {};
          const response = await fetch(event.request, fetchOpts);
          return response;
        } catch (err) {
          console.warn('[SW] Offline, chunk not cached:', url.href.substring(0, 80));
          return new Response('Offline — chunk not cached', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        }
      })()
    );
    return;
  }

  // 2) SKIP non-GET, most API calls, HMR, extensions
  if (
    event.request.method !== 'GET' ||
    (url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/progress')) ||
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.protocol === 'chrome-extension:'
  ) {
    return;
  }

  // 3) STATIC ASSETS: cache-first
  if (url.pathname.startsWith('/_next/static/') || url.pathname.match(/\.(png|jpg|svg|webp|ico|woff2?)$/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;

        try {
          const response = await fetch(event.request);
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        } catch {
          return new Response('', { status: 503 });
        }
      })
    );
    return;
  }

  // 4) NAVIGATION & OTHER: network-first with offline fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && response.type === 'basic' && event.request.mode !== 'navigate') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cache = await caches.open(CACHE_NAME);

        if (event.request.mode === 'navigate') {
          // Offline navigation: always go to the offline player (which has downloads UI)
          const isPlayer = url.pathname.includes('offline-player');
          const isDownloads = url.pathname.includes('downloads');

          if (isPlayer || isDownloads) {
            const page = await cache.match(OFFLINE_PLAYER_URL);
            if (page) return page;
          }
          const fallback = await cache.match(OFFLINE_URL);
          if (fallback) return fallback;
        }

        const cached = await cache.match(event.request);
        if (cached) return cached;

        return new Response('Offline', { status: 503 });
      })
  );
});

// ─── MESSAGE HANDLER ───
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  if (type === 'DELETE_DOWNLOAD_CACHE') {
    const { urls } = payload || {};
    if (urls && urls.length > 0) {
      caches.open(MEDIA_CACHE).then((cache) => {
        let deleted = 0;
        Promise.all(
          urls.map((url) =>
            cache.delete(url).then((ok) => { if (ok) deleted++; })
          )
        ).then(() => {
          console.log(`[SW] Deleted ${deleted}/${urls.length} cached chunks`);
          event.ports[0]?.postMessage({ deleted });
        });
      });
    }
  }

  if (type === 'GET_STORAGE_ESTIMATE') {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        event.ports[0]?.postMessage({
          usage: est.usage || 0,
          quota: est.quota || 0,
        });
      });
    } else {
      event.ports[0]?.postMessage({ usage: 0, quota: 0 });
    }
  }

  if (type === 'CLEAR_ALL_MEDIA_CACHE') {
    caches.delete(MEDIA_CACHE).then(() => {
      console.log('[SW] All media cache cleared');
      event.ports[0]?.postMessage({ ok: true });
    });
  }
});
