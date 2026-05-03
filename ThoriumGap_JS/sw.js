'use strict';

var APP_VERSION = 'thoriumgap-v9';
var CACHE_NAME = APP_VERSION;
var APP_SHELL = [
  './ThoriumGap.html',
  './ThoriumGap.js',
  './GameManual.html',
  './manifest.webmanifest',
  './pwa-icon.svg'
];

var ASSET_ROOTS = ['assets/', 'devel/'];
var SW_SCOPE_PATH = new URL(self.registration.scope).pathname;
function isAssetRequest(pathname) {
  var relativePath = pathname.indexOf(SW_SCOPE_PATH) === 0 ? pathname.slice(SW_SCOPE_PATH.length) : pathname;
  for (var i = 0; i < ASSET_ROOTS.length; i++) {
    if (relativePath.indexOf(ASSET_ROOTS[i]) === 0) return true;
  }
  return false;
}
function z2(n) { return (n < 10 ? '0' : '') + n; }
function z3(n) { return (n < 10 ? '00' : (n < 100 ? '0' : '')) + n; }
var APP_ASSETS = (function () {
  var out = [];
  var lvl;
  var ship;
  out.push('./assets/Thorium_Gap_title.png');
  out.push('./assets/players_spaceship.png');
  out.push('./assets/players_aura.png');
  out.push('./assets/glow_e_white.png');
  out.push('./assets/glow_e_blue.png');
  out.push('./assets/glow_e_green.png');
  out.push('./assets/glow_e_red.png');

  for (lvl = 1; lvl <= 13; lvl++) out.push('./assets/Boss_' + z2(lvl) + '.png');
  out.push('./assets/Boss_13_Body.png');
  out.push('./assets/Boss_13_LeftClaw.png');
  for (lvl = 1; lvl <= 32; lvl++) out.push('./assets/planet_image_' + z2(lvl) + '.png');
  for (lvl = 1; lvl <= 13; lvl++) {
    for (ship = 0; ship <= 6; ship++) {
      out.push('./assets/Enemy_' + z3(lvl) + z2(ship) + 'a.png');
    }
  }
  return out;
}());

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL.concat(APP_ASSETS));
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

  if (event.request.mode === 'navigate' || event.request.destination === 'document' || url.pathname === '/ThoriumGap.html' || url.pathname === '/ThoriumGap/' || url.pathname === '/ThoriumGap.js' || url.pathname === '/ThoriumGap_JS/ThoriumGap.html' || url.pathname === '/ThoriumGap_JS/ThoriumGap.js') {
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
          if (event.request.destination === 'document' || event.request.mode === 'navigate') {
            return caches.match('./ThoriumGap.html');
          }
          return caches.match(event.request, { ignoreSearch: true }).then(function (fallback) {
            if (fallback) return fallback;
            return Response.error();
          });
        });
      })
    );
    return;
  }

  if (isAssetRequest(url.pathname)) {
      event.respondWith(
        fetch(event.request, { cache: 'no-store' }).then(function (response) {
          if (response && response.ok) {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, copy);
            });
          }
          return response;
        }).catch(function () {
          return caches.match(event.request).then(function (cached) {
            if (cached) return cached;
            return fetch(event.request);
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
        return Response.error();
      });
    })
  );
});
