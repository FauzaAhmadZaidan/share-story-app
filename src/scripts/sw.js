import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Inject manifest (wajib)
precacheAndRoute(self.__WB_MANIFEST);

// Cache static asset
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
  })
);

// Cache CSS & JS
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// Cache API story
registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev',
  new NetworkFirst({
    cacheName: 'story-api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Handle push notification
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {
    title: 'Notifikasi Baru',
    body: 'Ada pembaruan baru!',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
    })
  );
});

// Local postMessage notification
self.addEventListener('message', (event) => {
  if (event.data?.type === 'NEW_STORY') {
    self.registration.showNotification('Share Story App', {
      body: 'Cerita baru berhasil ditambahkan!',
      vibrate: [100, 50, 100],
    });
  }
});
