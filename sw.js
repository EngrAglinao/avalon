// =====================================================================
// AVALON PWA SERVICE WORKER
// Handles offline caching for assets, cards, and icons
// =====================================================================

const CACHE_NAME = 'avalon-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Character Cards
  '/cards/merlin.png',
  '/cards/percival.png',
  '/cards/good_generic.png',
  '/cards/good_generic_alt.png',
  '/cards/assassin.png',
  '/cards/morgana.png',
  '/cards/mordred.png',
  '/cards/oberon.png',
  '/cards/evil_generic.png',
  '/cards/evil_generic_alt.png',
  '/cards/quest_success.png',
  '/cards/quest_fail.png',
  // Icons & Tokens
  '/icons/vote_approve.png',
  '/icons/vote_reject.png',
  '/icons/leader_token.png',
  '/icons/quest_marker_good.png',
  '/icons/quest_marker_evil.png',
  '/icons/vote_tracker_token.png',
  '/icons/team_shield.png',
  '/icons/lady_token.png',
  '/icons/app_icon.png',
];

// Install: Cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets...');
      // Cache what we can — missing images won't block install
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(() => null))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: Remove old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Cache-first with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET and Firebase/external requests
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('firebaseapp.com')) return;
  if (event.request.url.includes('googleapis.com')) return;
  if (event.request.url.includes('gstatic.com')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return response;
      }).catch(() => {
        // Offline fallback for navigation
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
