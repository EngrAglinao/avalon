/* ============================================================
   THE RESISTANCE: AVALON — Service Worker (PWA Cache Engine)
   Version: 1.0.0
   ============================================================ */

const CACHE_NAME = 'avalon-pwa-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  /* Card Assets */
  './cards/merlin.png',
  './cards/percival.png',
  './cards/good_generic.png',
  './cards/good_generic_alt.png',
  './cards/assassin.png',
  './cards/morgana.png',
  './cards/mordred.png',
  './cards/oberon.png',
  './cards/evil_generic.png',
  './cards/evil_generic_alt.png',
  './cards/quest_success.png',
  './cards/quest_fail.png',
  /* Icon Assets */
  './icons/vote_approve.png',
  './icons/vote_reject.png',
  './icons/leader_token.png',
  './icons/quest_marker_good.png',
  './icons/quest_marker_evil.png',
  './icons/vote_tracker_token.png',
  './icons/team_shield.png',
  './icons/lady_token.png',
  './icons/app_icon.png'
];

/* ── INSTALL: Pre-cache all static assets ── */
self.addEventListener('install', event => {
  console.log('[SW] Installing Avalon Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching static assets...');
      return cache.addAll(STATIC_ASSETS.map(url => {
        return new Request(url, { cache: 'reload' });
      })).catch(err => {
        console.warn('[SW] Some assets failed to cache (may not exist yet):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE: Clean old caches ── */
self.addEventListener('activate', event => {
  console.log('[SW] Activating Avalon Service Worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

/* ── FETCH: Network-first with cache fallback strategy ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* Skip non-GET and Firebase/external requests — always go to network */
  if (request.method !== 'GET' || 
      url.hostname.includes('firebaseio.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('gstatic.com') ||
      url.hostname.includes('fonts.gstatic.com') ||
      url.hostname.includes('cdn.jsdelivr.net')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        /* Clone and cache the fresh response */
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => {
        /* Network failed — serve from cache */
        return caches.match(request).then(cached => {
          if (cached) return cached;
          /* Ultimate fallback to index.html for navigation */
          if (request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

/* ── PUSH: Notification support placeholder ── */
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'The Resistance: Avalon';
  const options = {
    body: data.body || 'A game event has occurred.',
    icon: './icons/app_icon.png',
    badge: './icons/app_icon.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || './' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || './'));
});

console.log('[SW] Avalon Service Worker script loaded.');
