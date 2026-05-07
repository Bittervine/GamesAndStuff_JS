'use strict';

var VERSION = 'v2';
try {
  var swUrl = new URL(self.location.href);
  if (swUrl.searchParams && swUrl.searchParams.get('v')) {
    VERSION = String(swUrl.searchParams.get('v'));
  }
} catch (e) {}
var CACHE_NAME = 'go-plus-js-' + VERSION;
var APP_SHELL = [
  './',
  './GoPlus_JS.html',
  './GameManual.html',
  './manifest.webmanifest',
  './pwa-register.js',
  './pwa-icon.svg',
  './pwa-icon-192.png',
  './pwa-icon-512.png'
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
  if (new URL(event.request.url).origin !== self.location.origin) return;

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
        return caches.match('./GoPlus_JS.html');
      });
    })
  );
});
