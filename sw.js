/**
 * ════════════════════════════════════════════════════════════════
 *  THE RESISTANCE: AVALON — Service Worker (PWA Cache Engine)
 *  Handles offline caching, background sync, and asset management.
 * ════════════════════════════════════════════════════════════════
 */

const CACHE_VERSION    = 'avalon-v1.0.0';
const STATIC_CACHE     = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE    = `${CACHE_VERSION}-dynamic`;
const ASSET_CACHE      = `${CACHE_VERSION}-assets`;

/** Core app shell files — always cached on install */
const STATIC_PRECACHE = [
  './',
  './index.html',
  './manifest.json',
];

/** Card assets to cache */
const CARD_ASSETS = [
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
];

/** Icon/token assets to cache */
const ICON_ASSETS = [
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

/** External CDN resources to cache on first access */
const CDN_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdn.jsdelivr.net',
  'https://www.gstatic.com',
];

/* ════════════════════════════════════════════════════════════════
   INSTALL — Pre-cache static shell and all local game assets
════════════════════════════════════════════════════════════════ */
self.addEventListener('install', event => {
  console.log('[SW] Installing Avalon Service Worker…');

  event.waitUntil(
    (async () => {
      try {
        // Cache static shell
        const staticCache = await caches.open(STATIC_CACHE);
        await staticCache.addAll(STATIC_PRECACHE);
        console.log('[SW] Static shell cached.');
      } catch (err) {
        console.warn('[SW] Static cache failed:', err);
      }

      try {
        // Cache game assets (cards + icons)
        const assetCache = await caches.open(ASSET_CACHE);
        const allAssets = [...CARD_ASSETS, ...ICON_ASSETS];
        await Promise.allSettled(
          allAssets.map(url =>
            assetCache.add(url).catch(e => console.warn(`[SW] Asset skip (${url}):`, e.message))
          )
        );
        console.log('[SW] Game assets cached.');
      } catch (err) {
        console.warn('[SW] Asset cache failed:', err);
      }

      // Force immediate activation
      await self.skipWaiting();
    })()
  );
});

/* ════════════════════════════════════════════════════════════════
   ACTIVATE — Purge outdated caches
════════════════════════════════════════════════════════════════ */
self.addEventListener('activate', event => {
  console.log('[SW] Activating Avalon Service Worker…');

  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, ASSET_CACHE];

      await Promise.all(
        keys
          .filter(key => !currentCaches.includes(key))
          .map(key => {
            console.log('[SW] Purging stale cache:', key);
            return caches.delete(key);
          })
      );

      // Claim all open clients immediately
      await self.clients.claim();
      console.log('[SW] Service Worker is active and controlling all clients.');
    })()
  );
});

/* ════════════════════════════════════════════════════════════════
   FETCH — Smart caching strategy per request type
════════════════════════════════════════════════════════════════ */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and browser-extension requests
  if (request.method !== 'GET') return;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Skip Firebase SDK / Firestore network calls — always live
  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') && url.pathname.includes('firestore') ||
    url.hostname.includes('identitytoolkit') ||
    url.hostname.includes('securetoken')
  ) {
    return; // Let Firebase requests pass through without caching
  }

  event.respondWith(resolveRequest(request, url));
});

/**
 * Routing logic:
 * - Local HTML/shell: Cache-first with network fallback
 * - Local game assets (cards/icons): Cache-first, cache on miss
 * - Google Fonts / CDN: Stale-while-revalidate
 * - Everything else: Network-first with dynamic cache fallback
 */
async function resolveRequest(request, url) {
  const isLocalAsset =
    url.pathname.startsWith('/cards/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/sw.js';

  const isCDN = CDN_ORIGINS.some(origin => url.href.startsWith(origin));

  // ── Strategy 1: Local shell / assets → Cache-First ──
  if (isLocalAsset) {
    return cacheFirst(request, isLocalAsset ? ASSET_CACHE : STATIC_CACHE);
  }

  // ── Strategy 2: CDN Fonts / Libraries → Stale-While-Revalidate ──
  if (isCDN) {
    return staleWhileRevalidate(request, DYNAMIC_CACHE);
  }

  // ── Strategy 3: Everything else → Network-First ──
  return networkFirst(request, DYNAMIC_CACHE);
}

/** Cache-First: Return cached response if available, otherwise fetch & cache. */
async function cacheFirst(request, cacheName) {
  const cache    = await caches.open(cacheName);
  const cached   = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Asset unavailable offline.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

/** Stale-While-Revalidate: Return cache immediately, update cache in background. */
async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(response => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

/** Network-First: Try network, fall back to cache on failure. */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Offline fallback for navigation requests
    if (request.mode === 'navigate') {
      const shell = await caches.match('./index.html');
      if (shell) return shell;
    }
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/* ════════════════════════════════════════════════════════════════
   MESSAGE HANDLER — Client-to-SW communication
════════════════════════════════════════════════════════════════ */
self.addEventListener('message', event => {
  const { type, payload } = event.data || {};

  switch (type) {

    // Force-refresh the entire cache
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    // Purge a specific cache bucket
    case 'CLEAR_CACHE':
      caches.delete(payload?.cacheName || DYNAMIC_CACHE)
        .then(() => event.source?.postMessage({ type: 'CACHE_CLEARED' }));
      break;

    // Report all cached URLs to the client
    case 'GET_CACHE_STATUS':
      (async () => {
        const allKeys  = await caches.keys();
        const allUrls  = [];
        for (const key of allKeys) {
          const cache  = await caches.open(key);
          const reqs   = await cache.keys();
          allUrls.push(...reqs.map(r => r.url));
        }
        event.source?.postMessage({ type: 'CACHE_STATUS', payload: allUrls });
      })();
      break;

    default:
      console.log('[SW] Unknown message type:', type);
  }
});

/* ════════════════════════════════════════════════════════════════
   BACKGROUND SYNC — Queue offline actions (e.g. votes cast offline)
════════════════════════════════════════════════════════════════ */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-votes') {
    event.waitUntil(syncQueuedVotes());
  }
});

async function syncQueuedVotes() {
  // Placeholder: in a full deployment, retrieve queued votes from IndexedDB
  // and push them to Firestore here.
  console.log('[SW] Background sync: syncing queued votes...');
}

/* ════════════════════════════════════════════════════════════════
   PUSH NOTIFICATIONS — Future expansion hook
════════════════════════════════════════════════════════════════ */
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const title   = data.title   || 'Avalon';
  const options = {
    body: data.body || 'A quest awaits!',
    icon: './icons/app_icon.png',
    badge: './icons/app_icon.png',
    data: data.url || '/',
    vibrate: [200, 100, 200],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      const target = event.notification.data;
      for (const client of clients) {
        if (client.url === target && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
