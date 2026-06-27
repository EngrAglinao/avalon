/**
 * ════════════════════════════════════════════════════════════
 * THE RESISTANCE: AVALON — Service Worker (sw.js)
 * PWA Caching & Offline Support
 * ════════════════════════════════════════════════════════════
 */

const CACHE_NAME = 'avalon-pwa-v1.0.0';
const RUNTIME_CACHE = 'avalon-runtime-v1.0.0';

/**
 * Static assets to pre-cache on install.
 * These are the core files required for offline play UI.
 */
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',

  // ── Core Card Assets (./cards/) ──────────────────────────
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

  // ── Icon & Token Assets (./icons/) ──────────────────────
  './icons/vote_approve.png',
  './icons/vote_reject.png',
  './icons/leader_token.png',
  './icons/quest_marker_good.png',
  './icons/quest_marker_evil.png',
  './icons/vote_tracker_token.png',
  './icons/team_shield.png',
  './icons/lady_token.png',
  './icons/app_icon.png',
];

/**
 * External CDN resources to cache at runtime (network-first strategy).
 */
const CDN_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net',
  'www.gstatic.com',
];

// ════════════════════════════════════════════════════════════
// INSTALL EVENT — Pre-cache static shell
// ════════════════════════════════════════════════════════════
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache each asset individually to avoid fatal errors on missing files
      return Promise.allSettled(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(err => {
            console.warn(`[SW] Pre-cache skipped (not found): ${url}`, err.message);
          })
        )
      );
    }).then(() => {
      // Force activate immediately without waiting for old SW to unload
      return self.skipWaiting();
    })
  );
});

// ════════════════════════════════════════════════════════════
// ACTIVATE EVENT — Clean up stale caches
// ════════════════════════════════════════════════════════════
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => !currentCaches.includes(name))
          .map(name => {
            console.log(`[SW] Deleting stale cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ════════════════════════════════════════════════════════════
// FETCH EVENT — Routing Strategy
// ════════════════════════════════════════════════════════════
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (Firebase writes, auth, etc.)
  if (request.method !== 'GET') return;

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') return;

  // Skip Firebase / Firestore requests (always live)
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('firestore') ||
    url.hostname.includes('googleapis.com') && url.pathname.includes('firestore')
  ) return;

  // ── Strategy 1: Cache-First for pre-cached static assets ──
  if (isPrecached(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // ── Strategy 2: Network-First for CDN resources ──────────
  if (CDN_HOSTS.some(host => url.hostname.includes(host))) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
    return;
  }

  // ── Strategy 3: Stale-While-Revalidate for everything else ──
  event.respondWith(staleWhileRevalidate(request));
});

// ════════════════════════════════════════════════════════════
// CACHING STRATEGY IMPLEMENTATIONS
// ════════════════════════════════════════════════════════════

/**
 * Cache-First: Serve from cache; fallback to network.
 * Best for: Static app shell, card/icon assets.
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    return new Response('Offline — asset unavailable', { status: 503 });
  }
}

/**
 * Network-First: Try network; fallback to cache.
 * Best for: CDN fonts, libraries, Firebase SDK.
 */
async function networkFirst(request, cacheName = RUNTIME_CACHE) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline — CDN resource unavailable', { status: 503 });
  }
}

/**
 * Stale-While-Revalidate: Serve cache instantly; update in background.
 * Best for: HTML pages, dynamic content.
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const networkFetch = fetch(request).then(response => {
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  return cached || await networkFetch || new Response('Offline', { status: 503 });
}

/**
 * Helper: Check if a URL is in the pre-cache list.
 */
function isPrecached(url) {
  const path = url.pathname;
  return PRECACHE_URLS.some(u => {
    try {
      return new URL(u, self.location.origin).pathname === path;
    } catch {
      return u === path || path.endsWith(u.replace('./', '/'));
    }
  });
}

// ════════════════════════════════════════════════════════════
// BACKGROUND SYNC (Future Use)
// ════════════════════════════════════════════════════════════
self.addEventListener('sync', (event) => {
  if (event.tag === 'avalon-sync-votes') {
    console.log('[SW] Background sync: avalon-sync-votes');
    // Implement vote sync queue here when needed
  }
});

// ════════════════════════════════════════════════════════════
// PUSH NOTIFICATIONS (Future Use — game event alerts)
// ════════════════════════════════════════════════════════════
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body || 'Your quest awaits…',
    icon: './icons/app_icon.png',
    badge: './icons/app_icon.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: '⚔️ Open Game' },
      { action: 'dismiss', title: '✕ Dismiss' },
    ],
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'The Resistance: Avalon', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

console.log('[SW] The Resistance: Avalon Service Worker v1.0.0 loaded.');
