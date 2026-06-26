// ⚔️ AVALON PWA — Service Worker
// Handles: install caching, offline fallback, fetch strategy, state routing

const CACHE_NAME = 'avalon-pwa-v1';
const CACHE_VERSION = 1;

// Core files to cache on install
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js'
];

// External CDN resources to cache
const CDN_CACHE_NAME = 'avalon-cdn-v1';
const CDN_URLS = [
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js'
];

// ─── INSTALL ────────────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing Avalon Service Worker v' + CACHE_VERSION);
  event.waitUntil(
    Promise.all([
      // Cache core app files
      caches.open(CACHE_NAME).then(cache => {
        console.log('[SW] Pre-caching core app files');
        return cache.addAll(PRECACHE_URLS).catch(err => {
          console.warn('[SW] Pre-cache partial failure (expected in dev):', err);
        });
      }),
      // Cache CDN files with individual error handling
      caches.open(CDN_CACHE_NAME).then(cache => {
        console.log('[SW] Pre-caching CDN resources');
        return Promise.allSettled(
          CDN_URLS.map(url =>
            fetch(url, { mode: 'cors' })
              .then(response => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              })
              .catch(err => console.warn('[SW] CDN cache miss for:', url, err))
          )
        );
      })
    ]).then(() => {
      console.log('[SW] Install complete — skipping waiting');
      return self.skipWaiting();
    })
  );
});

// ─── ACTIVATE ───────────────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating Avalon Service Worker v' + CACHE_VERSION);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            // Delete old versions of our caches
            return (
              (cacheName.startsWith('avalon-pwa-') && cacheName !== CACHE_NAME) ||
              (cacheName.startsWith('avalon-cdn-') && cacheName !== CDN_CACHE_NAME)
            );
          })
          .map(cacheName => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('[SW] Activation complete — claiming clients');
      return self.clients.claim();
    })
  );
});

// ─── FETCH STRATEGY ─────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Firebase API calls (always go to network)
  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('firebase.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('securetoken.googleapis.com') ||
    url.pathname.includes('/__/auth/')
  ) {
    return; // Let Firebase handle its own requests
  }

  // Skip ipify / IP detection calls (always network)
  if (url.hostname.includes('ipify.org') || url.hostname.includes('ipapi.co')) {
    return;
  }

  // CDN resources — Cache First strategy
  if (
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('cdn.jsdelivr.net') ||
    url.hostname.includes('unpkg.com')
  ) {
    event.respondWith(cacheFirst(request, CDN_CACHE_NAME));
    return;
  }

  // Core app files — Network First with Cache Fallback
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }
});

// ─── CACHE STRATEGIES ───────────────────────────────────────────

/**
 * Cache First: Try cache, fall back to network, update cache
 */
async function cacheFirst(request, cacheName = CACHE_NAME) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    // Refresh cache in background
    fetch(request).then(response => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
    }).catch(() => {});
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return offlineFallback(request);
  }
}

/**
 * Network First: Try network, fall back to cache
 */
async function networkFirstWithFallback(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    // If requesting a navigation (HTML page), return the app shell
    if (request.mode === 'navigate') {
      const appShell = await cache.match('./index.html') ||
                        await cache.match('/index.html');
      if (appShell) return appShell;
    }
    return offlineFallback(request);
  }
}

/**
 * Offline fallback response
 */
function offlineFallback(request) {
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    return new Response(getOfflinePage(), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
  return new Response('Offline — resource unavailable', {
    status: 503,
    headers: { 'Content-Type': 'text/plain' }
  });
}

/**
 * Inline offline fallback page
 */
function getOfflinePage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Avalon — Offline</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #1a0a2e;
      color: #c9a84c;
      font-family: 'Georgia', serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 2rem;
    }
    .crest {
      font-size: 5rem;
      margin-bottom: 1.5rem;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.95); }
    }
    h1 { font-size: 2rem; margin-bottom: 0.75rem; letter-spacing: 0.2em; }
    p { color: #9d7ecf; font-size: 1rem; line-height: 1.6; max-width: 300px; margin-bottom: 2rem; }
    button {
      background: linear-gradient(135deg, #c9a84c, #8b6914);
      color: #1a0a2e;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: bold;
      letter-spacing: 0.1em;
      cursor: pointer;
    }
    .divider {
      width: 200px;
      height: 1px;
      background: linear-gradient(to right, transparent, #c9a84c, transparent);
      margin: 1.5rem auto;
    }
  </style>
</head>
<body>
  <div class="crest">⚔️</div>
  <h1>NO SIGNAL</h1>
  <div class="divider"></div>
  <p>The Round Table cannot be reached. You appear to be offline. Please check your connection and try again.</p>
  <button onclick="window.location.reload()">Try Again</button>
</body>
</html>`;
}

// ─── MESSAGE HANDLING ────────────────────────────────────────────
self.addEventListener('message', event => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: CACHE_VERSION, cacheName: CACHE_NAME });
      break;

    case 'CLEAR_CACHE':
      caches.keys().then(names => {
        Promise.all(names.map(name => caches.delete(name))).then(() => {
          event.ports[0]?.postMessage({ success: true });
        });
      });
      break;

    case 'CACHE_URLS':
      if (payload?.urls && Array.isArray(payload.urls)) {
        caches.open(CACHE_NAME).then(cache => {
          cache.addAll(payload.urls).catch(err => {
            console.warn('[SW] Manual cache add failed:', err);
          });
        });
      }
      break;

    default:
      break;
  }
});

// ─── PUSH NOTIFICATIONS (future-ready) ──────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json().catch(() => ({ title: 'Avalon', body: event.data.text() }));
  event.waitUntil(
    data.then(payload => {
      return self.registration.showNotification(payload.title || 'Avalon', {
        body: payload.body || '',
        icon: './manifest.json',
        badge: './manifest.json',
        tag: 'avalon-notification',
        renotify: true,
        data: payload.data || {}
      });
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});

console.log('[SW] Avalon Service Worker loaded — v' + CACHE_VERSION);
