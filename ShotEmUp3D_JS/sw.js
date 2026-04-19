'use strict';

var CACHE_NAME = 'shotemup-3d-v5';
var APP_SHELL = [
  './ShotEmUp3D_JS.html',
  './ShotEmUp_JS.js',
  './manifest.webmanifest',
  './pwa-icon.svg',
  './assets/players_spaceship.png',
  './assets/Thorium_Gap_title.png',
  './assets/player_spaceship.glb'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key !== CACHE_NAME) return caches.delete(key);
        return Promise.resolve();
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate' || event.request.destination === 'document' || url.pathname === '/ShotEmUp3D_JS.html' || url.pathname === '/ShotEmUp3D_JS/' || url.pathname === '/ShotEmUp_JS.js' || url.pathname === '/ShotEmUp3D_JS/ShotEmUp3D_JS.html' || url.pathname === '/ShotEmUp3D_JS/ShotEmUp_JS.js') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).then(function (response) {
        if (response && response.ok && event.request.destination !== 'document' && event.request.mode !== 'navigate') {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, copy);
          });
        }
        return response;
      }).catch(function () {
        return caches.match(event.request).then(function (cached) {
          if (cached) return cached;
          return caches.match('./ShotEmUp3D_JS.html');
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (response) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, copy);
        });
        return response;
      }).catch(function () {
        return caches.match('./ShotEmUp3D_JS.html');
      });
    })
  );
});
