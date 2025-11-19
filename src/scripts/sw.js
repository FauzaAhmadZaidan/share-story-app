import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';


precacheAndRoute(self.__WB_MANIFEST);


const htmlHandler = new NetworkFirst({
  cacheName: 'html-cache',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
  ],
});


const navigationRoute = new NavigationRoute(htmlHandler);
registerRoute(navigationRoute);


registerRoute(
  ({ request }) =>
    request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);


registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
  })
);


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


self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {
      title: 'Notifikasi',
      body: event.data ? event.data.text() : 'Pesan baru diterima',
    };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notifikasi', {
      body: data.body || 'Ada pembaruan baru!',
      icon: '/icons/icon-192x192.png',
    })
  );
});


self.addEventListener('message', (event) => {
  if (event.data?.type === 'NEW_STORY') {
    self.registration.showNotification('Share Story App', {
      body: 'Cerita baru berhasil ditambahkan!',
      vibrate: [100, 50, 100],
    });
  }
});
