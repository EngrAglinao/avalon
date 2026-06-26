/**
 * ============================================================
 * THE RESISTANCE: AVALON — Service Worker (sw.js)
 * PWA Background Cache & Offline Support Engine
 * ============================================================
 * Strategy: Cache-First for static assets, Network-First for
 * Firebase API calls and live game data.
 * ============================================================
 */

'use strict';

/* ── Cache Configuration ──────────────────────────────────── */
const CACHE_VERSION   = 'avalon-v1.0.0';
const STATIC_CACHE    = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE   = `${CACHE_VERSION}-dynamic`;
const ASSET_CACHE     = `${CACHE_VERSION}-assets`;

/** Files cached on Service Worker install (App Shell) */
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  /* Google Fonts — cached at runtime on first fetch */
  /* Firebase SDKs — network-first, not precached */
];

/** Local card & icon assets to cache when first accessed */
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

/** Patterns that should always use Network-First strategy */
const NETWORK_FIRST_PATTERNS = [
  /firestore\.googleapis\.com/,
  /firebase\.googleapis\.com/,
  /identitytoolkit\.googleapis\.com/,
  /securetoken\.googleapis\.com/,
  /googleapis\.com\/identitytoolkit/,
];

/** Patterns that should use Cache-First strategy */
const CACHE_FIRST_PATTERNS = [
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
  /cdn\.jsdelivr\.net/,
  /www\.gstatic\.com\/firebasejs/,
];

/* ── Install Event ────────────────────────────────────────── */
self.addEventListener('install', event => {
  console.log('[SW] Installing Avalon Service Worker:', CACHE_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async cache => {
      try {
        await cache.addAll(PRECACHE_URLS);
        console.log('[SW] App shell cached successfully.');
      } catch (err) {
        console.warn('[SW] Precache partial failure (some files may not exist yet):', err.message);
      }
      // Attempt to pre-cache local game assets (fail gracefully)
      const assetCache = await caches.open(ASSET_CACHE);
      const allAssets  = [...CARD_ASSETS, ...ICON_ASSETS];
      await Promise.allSettled(
        allAssets.map(url =>
          fetch(url).then(res => {
            if (res.ok) return assetCache.put(url, res);
          }).catch(() => { /* asset not yet added — skip silently */ })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

/* ── Activate Event ───────────────────────────────────────── */
self.addEventListener('activate', event => {
  console.log('[SW] Activating Avalon Service Worker:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, ASSET_CACHE];
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('avalon-') && !validCaches.includes(name))
          .map(name => {
            console.log('[SW] Deleting stale cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

/* ── Fetch Event (Main Router) ────────────────────────────── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http schemes
  if (!url.protocol.startsWith('http')) return;

  // Route: Network-First for Firebase live data
  if (NETWORK_FIRST_PATTERNS.some(p => p.test(request.url))) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Route: Cache-First for CDN fonts and Firebase SDK scripts
  if (CACHE_FIRST_PATTERNS.some(p => p.test(request.url))) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Route: Cache-First for local card and icon assets
  if (request.url.includes('/cards/') || request.url.includes('/icons/')) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  // Route: Cache-First for app shell (HTML, manifest, SW itself)
  if (request.url.endsWith('.html') || request.url.endsWith('/') ||
      request.url.endsWith('manifest.json')) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // Default: Network with dynamic cache fallback
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

/* ── Caching Strategies ───────────────────────────────────── */

/**
 * Cache-First: Serve from cache, fall back to network.
 * Best for: static assets, fonts, CDN scripts.
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return offlineFallback(request);
  }
}

/**
 * Network-First: Try network, fall back to cache.
 * Best for: API calls, live game data.
 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineFallback(request);
  }
}

/**
 * Stale-While-Revalidate: Serve cached version immediately,
 * then update cache in the background.
 * Best for: HTML pages, frequently-updated content.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

/**
 * Offline Fallback: Return a minimal offline response.
 */
function offlineFallback(request) {
  const url = new URL(request.url);
  if (request.headers.get('accept')?.includes('text/html')) {
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Avalon — Offline</title>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>body{background:#11141a;color:#f2e6ce;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:2rem}</style>
      </head><body>
      <div>
        <div style="font-size:4rem;margin-bottom:1rem">⚔️</div>
        <h1 style="color:#d4af37;font-size:1.4rem;margin-bottom:0.5rem">You Are Offline</h1>
        <p style="color:#c8b89a;font-size:0.9rem;line-height:1.6">
          Reconnect to continue your quest.<br>
          The Round Table awaits your return.
        </p>
        <button onclick="location.reload()" style="margin-top:1.5rem;background:#d4af37;color:#0a0c10;border:none;padding:0.8rem 2rem;border-radius:30px;font-size:0.9rem;cursor:pointer;font-weight:700">
          🔄 Retry Connection
        </button>
      </div>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
  // For image assets — return a transparent 1x1 PNG fallback
  if (request.url.includes('/cards/') || request.url.includes('/icons/')) {
    const TRANSPARENT_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    return new Response(
      Uint8Array.from(atob(TRANSPARENT_PNG), c => c.charCodeAt(0)),
      { headers: { 'Content-Type': 'image/png' } }
    );
  }
  return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
}

/* ── Push Notification Handler (future use) ───────────────── */
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Avalon', {
      body:    data.body  || 'A quest awaits you at the Round Table.',
      icon:    './icons/app_icon.png',
      badge:   './icons/app_icon.png',
      vibrate: [200, 100, 200],
      data:    { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(event.notification.data?.url || '/');
    })
  );
});

/* ── Background Sync (future reconnect use) ───────────────── */
self.addEventListener('sync', event => {
  if (event.tag === 'avalon-reconnect') {
    console.log('[SW] Background sync: attempting reconnect to game room.');
  }
});

/* ── Message Handler ──────────────────────────────────────── */
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'CACHE_ASSET') {
    const { url } = event.data;
    caches.open(ASSET_CACHE).then(cache => cache.add(url)).catch(() => {});
  }
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});
