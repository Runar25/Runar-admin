// Rúnar Service Worker — v1
// Cache-first for app shell; network-only for Supabase/external APIs

const CACHE = 'runar-v1';
const SHELL = [
  '/Runar-admin/v2/runar-reader.html',
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
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
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

  // Pass through: external origins (Supabase, ElevenLabs, CDN fonts, etc.)
  if (url.hostname !== self.location.hostname) return;

  // Pass through: Supabase Edge Functions and auth paths
  if (url.pathname.includes('/functions/') || url.pathname.includes('/auth/')) return;

  // Cache-first for same-origin GET requests
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      }).catch(() => cached); // fallback to cache if network fails
    })
  );
});
