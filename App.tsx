// ============================================================
// THE RESISTANCE: AVALON — Service Worker (PWA Cache Engine)
// ============================================================
const CACHE_NAME = 'avalon-pwa-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
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
  '/icons/vote_approve.png',
  '/icons/vote_reject.png',
  '/icons/leader_token.png',
  '/icons/quest_marker_good.png',
  '/icons/quest_marker_evil.png',
  '/icons/vote_tracker_token.png',
  '/icons/team_shield.png',
  '/icons/lady_token.png',
  '/icons/app_icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Failed to cache:', url, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const cloned = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        return response;
      }).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
