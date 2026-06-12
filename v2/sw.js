// Rúnar Service Worker — v83
// HTML: network-first (always fresh). JS/CSS/icons: cache-first (fast, offline ok).
// External (Supabase, ElevenLabs, fonts): pass-through, never intercepted.

const CACHE = 'runar-v83';
const JS_SHELL = [
  '/Runar-admin/v2/runar-reader.css',
  '/Runar-admin/v2/runar-utils.js',
  '/Runar-admin/v2/runar-journal.js',
  '/Runar-admin/v2/runar-tree.js',
  '/Runar-admin/v2/runar-gathering.js',
  '/Runar-admin/v2/runar-auth.js',
  '/Runar-admin/v2/runar-reading.js',
  '/Runar-admin/v2/runar-app.js',
  '/Runar-admin/v2/runar-config.js',
  '/Runar-admin/v2/runar-runes.js',
  '/Runar-admin/v2/runar-translations.js',
  '/Runar-admin/v2/runar-character.js',
  '/Runar-admin/v2/runar-svgs.js',
  '/Runar-admin/v2/manifest.json',
  '/Runar-admin/v2/icons/apple-touch-icon.png',
  '/Runar-admin/v2/icons/web-app-manifest-192x192.png',
  '/Runar-admin/v2/icons/web-app-manifest-512x512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(JS_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Never intercept: external origins (Supabase, ElevenLabs, CDN, fonts)
  if (url.hostname !== self.location.hostname) return;
  if (e.request.method !== 'GET') return;

  // ── HTML pages: network-first so user always gets latest code ──
  if (url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(e.request)) // offline fallback
    );
    return;
  }

  // ── JS / icons / manifest: cache-first, update in background ──
  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      });
      return cached || networkFetch;
    })
  );
});
