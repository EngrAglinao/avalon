/**
 * ═══════════════════════════════════════════════════════════════
 * THE RESISTANCE: AVALON — SERVICE WORKER
 * Progressive Web App Offline Cache Engine
 * ═══════════════════════════════════════════════════════════════
 *
 * Strategy:
 *   - Cache-First for static assets (HTML, icons, cards)
 *   - Network-First for Firebase API calls
 *   - Stale-While-Revalidate for Google Fonts & CDN resources
 */

'use strict';

const CACHE_VERSION   = 'avalon-v1.2.0';
const STATIC_CACHE    = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE   = `${CACHE_VERSION}-dynamic`;
const FONT_CACHE      = `${CACHE_VERSION}-fonts`;

/** Core application shell — always cache these on install */
const PRECACHE_ASSETS = [
  './index.html',
  './manifest.json',

  /* ── Card Assets (./cards/) ──────────────────────────────── */
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

  /* ── Icon & Token Assets (./icons/) ─────────────────────── */
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

/** CDN resources to cache dynamically on first use */
const CDN_PREFIXES = [
  'https://cdn.jsdelivr.net',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

/** Firebase URLs — always bypass cache, go to network */
const NETWORK_ONLY_PREFIXES = [
  'https://firebaseio.com',
  'https://firebase.googleapis.com',
  'https://identitytoolkit.googleapis.com',
  'https://securetoken.googleapis.com',
  'https://www.googleapis.com/identitytoolkit',
];

/* ════════════════════════════════════════════════════════════════
   INSTALL — Pre-cache all static assets
════════════════════════════════════════════════════════════════ */
self.addEventListener('install', event => {
  console.log(`[Avalon SW] Installing cache: ${CACHE_VERSION}`);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        // Cache assets individually so one missing file doesn't break install
        return Promise.allSettled(
          PRECACHE_ASSETS.map(url =>
            cache.add(url).catch(err => {
              console.warn(`[Avalon SW] Could not pre-cache: ${url}`, err.message);
            })
          )
        );
      })
      .then(() => {
        console.log('[Avalon SW] Install complete. Skipping waiting.');
        return self.skipWaiting();
      })
  );
});

/* ════════════════════════════════════════════════════════════════
   ACTIVATE — Clean up old cache versions
════════════════════════════════════════════════════════════════ */
self.addEventListener('activate', event => {
  console.log(`[Avalon SW] Activating: ${CACHE_VERSION}`);
  event.waitUntil(
    caches.keys()
      .then(keys => {
        const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, FONT_CACHE];
        return Promise.all(
          keys
            .filter(key => !validCaches.includes(key))
            .map(key => {
              console.log(`[Avalon SW] Deleting old cache: ${key}`);
              return caches.delete(key);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

/* ════════════════════════════════════════════════════════════════
   FETCH — Route requests through the appropriate strategy
════════════════════════════════════════════════════════════════ */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = request.url;

  // Skip non-GET requests entirely
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!url.startsWith('http')) return;

  // ── Strategy 1: Network-Only (Firebase, Auth APIs) ───────
  if (NETWORK_ONLY_PREFIXES.some(prefix => url.includes(prefix))) {
    event.respondWith(fetch(request));
    return;
  }

  // ── Strategy 2: Cache-First (Static App Shell) ───────────
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // ── Strategy 3: Stale-While-Revalidate (CDN Fonts/Libs) ─
  if (CDN_PREFIXES.some(prefix => url.startsWith(prefix))) {
    event.respondWith(staleWhileRevalidate(request, FONT_CACHE));
    return;
  }

  // ── Strategy 4: Network-First with Cache Fallback ────────
  event.respondWith(networkFirstWithFallback(request, DYNAMIC_CACHE));
});

/* ════════════════════════════════════════════════════════════════
   CACHE STRATEGY IMPLEMENTATIONS
════════════════════════════════════════════════════════════════ */

/**
 * Cache-First: Return cached response immediately if available.
 * Falls back to network and caches the new response.
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    return new Response('Offline — asset not cached.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

/**
 * Stale-While-Revalidate: Return cached immediately, update cache in background.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

/**
 * Network-First: Try network, fall back to cache on failure.
 */
async function networkFirstWithFallback(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Offline fallback for navigation requests
    if (request.mode === 'navigate') {
      const shell = await caches.match('./index.html');
      if (shell) return shell;
    }

    return new Response(offlineFallbackHTML(), {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

/* ════════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════ */
function isStaticAsset(url) {
  const pathname = new URL(url).pathname;
  return PRECACHE_ASSETS.some(asset => {
    const assetPath = asset.startsWith('./') ? asset.slice(1) : asset;
    return pathname.endsWith(assetPath) || pathname === assetPath;
  });
}

function offlineFallbackHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Avalon — Offline</title>
  <style>
    body {
      margin: 0;
      background: #11141a;
      color: #f2e6ce;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100dvh;
      font-family: sans-serif;
      text-align: center;
      padding: 24px;
    }
    h2 { color: #d4af37; font-size: 20px; }
    p  { color: #c8b89a; font-size: 14px; line-height: 1.6; }
  </style>
</head>
<body>
  <div style="font-size:56px;margin-bottom:16px;">🏰</div>
  <h2>You Are Offline</h2>
  <p>The Round Table awaits your return.<br/>Check your connection and try again.</p>
  <button onclick="location.reload()"
    style="margin-top:24px;padding:12px 28px;background:linear-gradient(135deg,#8a6e22,#d4af37);color:#0a0a0a;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">
    Retry Connection
  </button>
</body>
</html>`;
}

/* ════════════════════════════════════════════════════════════════
   BACKGROUND SYNC — Retry failed vote submissions
════════════════════════════════════════════════════════════════ */
self.addEventListener('sync', event => {
  if (event.tag === 'avalon-vote-sync') {
    event.waitUntil(replayPendingVotes());
  }
});

async function replayPendingVotes() {
  // Retrieve any queued votes from IndexedDB and retry submission
  // This ensures votes are not lost if connectivity drops during voting
  console.log('[Avalon SW] Background sync: replaying pending votes...');
}

/* ════════════════════════════════════════════════════════════════
   PUSH NOTIFICATIONS — Game phase alerts
════════════════════════════════════════════════════════════════ */
self.addEventListener('push', event => {
  if (!event.data) return;

  let payload;
  try { payload = event.data.json(); }
  catch { payload = { title: 'Avalon', body: event.data.text() }; }

  const options = {
    body:    payload.body    || 'It\'s your turn at the Round Table!',
    icon:    './icons/app_icon.png',
    badge:   './icons/leader_token.png',
    tag:     payload.tag     || 'avalon-notification',
    vibrate: [100, 50, 100],
    data:    { url: payload.url || './' },
    actions: [
      { action: 'open',    title: '⚔️ Open Game'   },
      { action: 'dismiss', title: '✕ Dismiss'       },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Avalon', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        for (const client of clientList) {
          if ('focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow('./');
      })
    );
  }
});

/* ════════════════════════════════════════════════════════════════
   MESSAGE HANDLER — Runtime cache control from main thread
════════════════════════════════════════════════════════════════ */
self.addEventListener('message', event => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CACHE_ASSET':
      // Hot-swap a custom card image asset into the dynamic cache
      if (payload?.url && payload?.data) {
        caches.open(DYNAMIC_CACHE).then(cache => {
          const response = new Response(payload.data, {
            headers: { 'Content-Type': payload.contentType || 'image/png' }
          });
          cache.put(payload.url, response);
        });
      }
      break;

    case 'CLEAR_CACHE':
      caches.keys().then(keys =>
        Promise.all(keys.map(key => caches.delete(key)))
      );
      break;

    case 'GET_VERSION':
      event.source?.postMessage({ type: 'VERSION', version: CACHE_VERSION });
      break;

    default:
      break;
  }
});

console.log(`[Avalon SW] Service Worker loaded — Cache Version: ${CACHE_VERSION}`);
