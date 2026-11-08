const CACHE_NAME = 'abbey-stitches-v1';

// Files to cache for offline availability
const ASSETS_TO_CACHE = [
  './',
  './home.html',
  './shop.html',
  './shop-detail.html',
  './cart.html',
  './checkout.html',
  './confirm.html',
  './account.html',
  './custom-order.html',
  './wishlist.html',
  './ankara.html',
  './gowns.html',
  './corporate-wear.html',
  './kiddies.html',
  './accessories.html',
  './admin.html',
  './admin-products.html',
  './admin-orders.html',
  './admin-customers.html',
  './manifest.json',
  './scrn1.png',
  './scrn2.png',
  './scrn3.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap'
];

// Install Event - Caching App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell & Assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Cleaning Up Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Cache-First, Network Fallback Strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache dynamic image uploads or missing pages on the fly
        if (event.request.method === 'GET' && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Fallback response when completely offline
      return caches.match('./home.html');
    })
  );
});
