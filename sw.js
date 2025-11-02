/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const CACHE_NAME = 'stylon-cache-v2';
// Corrected: Removed .tsx files which are not requested by the browser.
const urlsToCache = [
  '/',
  '/index.html',
  '/index.css',
  '/manifest.json',
  '/public/icon-180.png',
  '/public/icon-192.png',
  '/public/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Instrument+Serif:wght@400;700&family=Inter:wght@400;500;600&display=swap'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use addAll with a catch to prevent install failure if one asset fails.
        return cache.addAll(urlsToCache).catch(err => {
          console.error('Failed to cache files during install:', err);
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all pages under its scope immediately.
  );
});

self.addEventListener('fetch', event => {
    // We only want to handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    const url = new URL(event.request.url);

    // FIX: Intercept requests for ads.txt and serve it directly from the service worker.
    // This bypasses server-side routing issues common in SPAs where all paths might
    // be redirected to index.html, causing a 404 for files like ads.txt.
    if (url.pathname === '/ads.txt' || url.pathname === '/ads.txt/') {
        event.respondWith(
            new Response('google.com, pub-4077008126781068, DIRECT, f08c47fec0942fa0', {
                headers: { 'Content-Type': 'text/plain' }
            })
        );
        return;
    }

    // Strategy: Network-first for navigation requests (HTML pages).
    // This ensures users get the latest app shell and avoids cached errors.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).then(response => {
                // If successful, cache the response and return it.
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            }).catch(() => {
                // If network fails, serve the main page from the cache.
                return caches.match('/');
            })
        );
        return;
    }

    // Strategy: Cache-first for all other assets (JS, CSS, images).
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // Return from cache if available.
            if (cachedResponse) {
                return cachedResponse;
            }
            
            // For API calls, always fetch from network and don't cache
            if (url.hostname.includes('generativelanguage.googleapis.com') || 
                url.hostname.includes('supabase.co')) {
                return fetch(event.request);
            }
            
            // For other requests, try network first, then cache
            return fetch(event.request).then(networkResponse => {
                const isAdScript = url.hostname.includes('revenuecpmgate.com') || 
                                 url.hostname.includes('googlesyndication.com');
                
                // Only cache valid responses for static assets that aren't ads
                if (networkResponse && networkResponse.status === 200 && !isAdScript) {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                }
                
                return networkResponse;
            }).catch(() => {
                // If network fails, try to get from cache
                return caches.match(event.request).then(cachedResponse => {
                    return cachedResponse || new Response('Network error', { status: 408 });
                });
            });
        })
    );
});