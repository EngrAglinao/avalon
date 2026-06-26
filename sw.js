/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║         THE RESISTANCE: AVALON — Service Worker              ║
 * ║         PWA Offline Cache & Background Sync Engine           ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Strategy: Cache-First for static assets, Network-First for
 * Firebase API calls, Stale-While-Revalidate for Google Fonts.
 */

'use strict';

const CACHE_VERSION = 'avalon-v1.0.0';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const FONT_CACHE    = `${CACHE_VERSION}-fonts`;

/* ── Static assets to pre-cache on install ── */
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',

  /* ── Card Assets (./cards/) ── */
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

  /* ── Icon Assets (./icons/) ── */
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

/* ── External CDN URLs to cache dynamically ── */
const CDN_PATTERNS = [
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'www.gstatic.com/firebasejs',
];

/* ── Firebase/Firestore domains (Network-First, no cache) ── */
const NETWORK_ONLY_PATTERNS = [
  'firestore.googleapis.com',
  'firebase.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'firebasestorage.googleapis.com',
];

/* ══════════════════════════════════════════════════════════════
   INSTALL — Pre-cache all static assets
══════════════════════════════════════════════════════════════ */
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing ${CACHE_VERSION}`);
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      // Cache assets individually so one failure doesn't break all
      const results = await Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(e => {
          console.warn(`[SW] Failed to cache: ${url}`, e.message);
        }))
      );
      console.log(`[SW] Pre-cache complete. ${results.filter(r=>r.status==='fulfilled').length}/${STATIC_ASSETS.length} assets cached.`);
    })
  );
  // Activate immediately without waiting for old SW to retire
  self.skipWaiting();
});

/* ══════════════════════════════════════════════════════════════
   ACTIVATE — Clean up old caches
══════════════════════════════════════════════════════════════ */
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating ${CACHE_VERSION}`);
  event.waitUntil(
    caches.keys().then(async (cacheNames) => {
      const deletions = cacheNames
        .filter(name => name.startsWith('avalon-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== FONT_CACHE)
        .map(name => {
          console.log(`[SW] Deleting old cache: ${name}`);
          return caches.delete(name);
        });
      await Promise.all(deletions);
      // Take control of all open clients immediately
      await self.clients.claim();
      console.log('[SW] Active and controlling all clients.');
    })
  );
});

/* ══════════════════════════════════════════════════════════════
   FETCH — Intercept all network requests
══════════════════════════════════════════════════════════════ */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, PUT, DELETE — Firebase writes)
  if (request.method !== 'GET') return;

  // Skip chrome-extension and non-http(s) schemes
  if (!request.url.startsWith('http')) return;

  /* ── Strategy 1: Network-Only for Firebase APIs ── */
  if (NETWORK_ONLY_PATTERNS.some(p => url.hostname.includes(p))) {
    event.respondWith(fetch(request).catch(() => {
      return new Response(
        JSON.stringify({ error: 'offline', message: 'No network connection available.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }));
    return;
  }

  /* ── Strategy 2: Stale-While-Revalidate for Google Fonts & CDN ── */
  if (CDN_PATTERNS.some(p => url.hostname.includes(p))) {
    event.respondWith(staleWhileRevalidate(request, FONT_CACHE));
    return;
  }

  /* ── Strategy 3: Cache-First for local static assets ── */
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  /* ── Strategy 4: Network-First for everything else ── */
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

/* ══════════════════════════════════════════════════════════════
   CACHING STRATEGIES
══════════════════════════════════════════════════════════════ */

/**
 * Cache-First: Serve from cache, fallback to network, then cache the response.
 * Best for: Static assets that rarely change (images, fonts, app shell).
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
    // Return offline fallback for HTML pages
    if (request.headers.get('Accept')?.includes('text/html')) {
      const fallback = await cache.match('./index.html');
      if (fallback) return fallback;
    }
    return new Response('Offline — Asset not available.', { status: 503 });
  }
}

/**
 * Network-First: Try network, fallback to cache.
 * Best for: API calls and dynamic content that should be fresh when online.
 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response('Offline — Content not cached.', { status: 503 });
  }
}

/**
 * Stale-While-Revalidate: Serve from cache immediately, update cache in background.
 * Best for: CDN assets like fonts and libraries — fast loads + eventual freshness.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  return cached || await networkPromise || new Response('Offline', { status: 503 });
}

/* ══════════════════════════════════════════════════════════════
   BACKGROUND SYNC — Queue offline Firebase writes
══════════════════════════════════════════════════════════════ */
self.addEventListener('sync', (event) => {
  if (event.tag === 'avalon-sync-votes') {
    console.log('[SW] Background sync: avalon-sync-votes');
    // Votes are handled by Firebase SDK's offline persistence
    // This hook exists for custom queued actions if needed
  }
});

/* ══════════════════════════════════════════════════════════════
   PUSH NOTIFICATIONS (reserved for future use)
══════════════════════════════════════════════════════════════ */
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'The Resistance: Avalon';
  const options = {
    body: data.body || 'It\'s your turn!',
    icon: './icons/app_icon.png',
    badge: './icons/app_icon.png',
    data: data.url || './',
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Open Game' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes('index.html'));
      if (existing) { existing.focus(); }
      else { self.clients.openWindow('./index.html'); }
    })
  );
});

/* ══════════════════════════════════════════════════════════════
   MESSAGE HANDLER — Communication from main thread
══════════════════════════════════════════════════════════════ */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_VERSION':
      event.source.postMessage({ type: 'VERSION', version: CACHE_VERSION });
      break;
    case 'CLEAR_CACHE':
      caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))
        .then(() => event.source.postMessage({ type: 'CACHE_CLEARED' }));
      break;
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

console.log(`[SW] ${CACHE_VERSION} script loaded.`);
