'use strict';

var APP_VERSION = 'thoriumgap-v115'; // BUMP ME
var CACHE_NAME = APP_VERSION;
var APP_SHELL = [
  './ThoriumGap.html',
  './ThoriumGap.js?v=thoriumgap-v115',
  './GameManual.html',
  './manifest.webmanifest',
  './pwa-icon.svg',
  './pwa-icon-192.png',
  './pwa-icon-512.png'
];

var ASSET_ROOTS = ['assets/', 'devel/', 'models/', 'lib/'];
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
  out.push('./assets/boss_13_body.png');
  out.push('./assets/boss_13_leftclaw.png');
  out.push('./assets/enemy_nemesis2.png');
  out.push('./assets/glow_e_blue.png');
  out.push('./assets/glow_e_green.png');
  out.push('./assets/glow_e_red.png');
  out.push('./assets/glow_e_white.png');
  out.push('./assets/players_aura.png');
  out.push('./assets/players_spaceship.png');
  out.push('./assets/thorium_gap_title.png');
  out.push('./assets/soundtrack1.ogg');
  out.push('./assets/titlescreen.ogg');
  for (lvl = 1; lvl <= 13; lvl++) out.push('./assets/boss_' + z2(lvl) + '.png');
  for (lvl = 1; lvl <= 32; lvl++) out.push('./assets/planet_image_' + z2(lvl) + '.png');
  for (lvl = 1; lvl <= 28; lvl++) out.push('./assets/asteroid-' + z2(lvl) + '.png');
  for (lvl = 1; lvl <= 13; lvl++) {
    for (ship = 0; ship <= 6; ship++) {
      out.push('./assets/enemy_' + z3(lvl) + z2(ship) + 'a.png');
    }
  }
  return out;
}());

var APP_MODEL_ASSETS = [
  './models/player_spaceship.glb',
  './models/Ship_Crosspanel_1.glb',
  './models/Ship_Crosspanel_10.glb',
  './models/Ship_Crosspanel_11.glb',
  './models/Ship_Crosspanel_16.glb',
  './models/Ship_Crosspanel_18.glb',
  './models/Ship_Crosspanel_2.glb',
  './models/Ship_Crosspanel_3.glb',
  './models/Ship_Crosspanel_4.glb',
  './models/Ship_Crosspanel_5.glb',
  './models/Ship_Crosspanel_6.glb',
  './models/Ship_Crosspanel_7.glb',
  './models/Ship_DeltaWing_108179.glb',
  './models/Ship_DeltaWing_368386.glb',
  './models/Ship_DeltaWing_394511.glb',
  './models/Ship_DeltaWing_535536.glb',
  './models/Ship_DeltaWing_691262.glb',
  './models/Ship_DeltaWing_853002.glb',
  './models/Ship_DeltaWing_894551.glb',
  './models/Ship_FlyingSaucer_298877.glb',
  './models/Ship_FlyingSaucer_301176.glb',
  './models/Ship_FlyingSaucer_336064.glb',
  './models/Ship_FlyingSaucer_528770.glb',
  './models/Ship_FlyingSaucer_654444.glb',
  './models/Ship_FlyingSaucer_750147.glb',
  './models/Ship_FlyingSaucer_752605.glb',
  './models/Ship_FlyingSaucer_772429.glb',
  './models/Ship_Hooper_219385.glb',
  './models/Ship_Hooper_302864.glb',
  './models/Ship_Hooper_378031.glb',
  './models/Ship_Hooper_443110.glb',
  './models/Ship_Hooper_508807.glb',
  './models/Ship_Hooper_517819.glb',
  './models/Ship_Hooper_740839.glb',
  './models/Ship_Hooper_760830.glb',
  './models/Ship_Longwing_1.glb',
  './models/Ship_Longwing_2.glb',
  './models/Ship_Longwing_3.glb',
  './models/Ship_Longwing_4.glb',
  './models/Ship_Longwing_5.glb',
  './models/Ship_Longwing_6.glb',
  './models/Ship_Longwing_7.glb',
  './models/Ship_Longwing_8.glb',
  './models/Ship_LunarCourier_153144.glb',
  './models/Ship_LunarCourier_322196.glb',
  './models/Ship_LunarCourier_451424.glb',
  './models/Ship_LunarCourier_5002.glb',
  './models/Ship_LunarCourier_7.glb',
  './models/Ship_LunarCourier_826239.glb',
  './models/Ship_LunarCourier_899475.glb',
  './models/Ship_LunarCourier_95901.glb',
  './models/Ship_LunarCourier_994899.glb',
  './models/Ship_ManraRay_130405.glb',
  './models/Ship_ManraRay_16943.glb',
  './models/Ship_ManraRay_190663.glb',
  './models/Ship_ManraRay_459947.glb',
  './models/Ship_ManraRay_46262.glb',
  './models/Ship_ManraRay_766613.glb',
  './models/Ship_ManraRay_792763.glb',
  './models/Ship_ManraRay_858242.glb',
  './models/ship_nemesis2.glb',
  './models/Ship_Orca_492814.glb',
  './models/Ship_Pirate_1.glb',
  './models/Ship_Pirate_2.glb',
  './models/Ship_Pirate_3.glb',
  './models/Ship_Pirate_4.glb',
  './models/Ship_Pirate_5.glb',
  './models/Ship_Pirate_6.glb',
  './models/Ship_Pirate_7.glb',
  './models/Ship_PyramidLifter_290115.glb',
  './models/Ship_PyramidLifter_327178.glb',
  './models/Ship_PyramidLifter_390936.glb',
  './models/Ship_PyramidLifter_426685.glb',
  './models/Ship_PyramidLifter_478836.glb',
  './models/Ship_PyramidLifter_741828.glb',
  './models/Ship_PyramidLifter_97249.glb',
  './models/Ship_PyramidLifter_990348.glb',
  './models/Ship_Standard_1.glb',
  './models/Ship_Standard_10.glb',
  './models/Ship_Standard_11.glb',
  './models/Ship_Standard_12.glb',
  './models/Ship_Standard_13.glb',
  './models/Ship_Standard_14.glb',
  './models/Ship_Standard_17.glb',
  './models/Ship_Standard_2.glb',
  './models/Ship_Standard_20.glb',
  './models/Ship_Standard_3.glb',
  './models/Ship_Standard_4.glb',
  './models/Ship_Standard_5.glb',
  './models/Ship_Standard_6.glb',
  './models/Ship_Standard_7.glb',
  './models/Ship_Standard_8.glb',
  './models/Ship_Standard_9.glb',
  './models/Ship_Talonhunter_269536.glb',
  './models/Ship_Talonhunter_291527.glb',
  './models/Ship_Talonhunter_337968.glb',
  './models/Ship_Talonhunter_585024.glb',
  './models/Ship_Talonhunter_647300.glb',
  './models/Ship_Talonhunter_91803.glb',
  './models/Ship_TigerWing_1.glb',
  './models/Ship_TigerWing_2.glb',
  './models/Ship_TigerWing_3.glb',
  './models/Ship_TigerWing_4.glb',
  './models/Ship_TigerWing_5.glb',
  './models/Ship_TigerWing_6.glb',
  './models/Ship_TigerWing_7.glb',
  './models/planet_map_01.glb',
  './models/planet_map_02.glb',
  './models/planet_map_03.glb',
  './models/planet_map_04.glb',
  './models/planet_map_05.glb',
  './models/planet_map_06.glb',
  './models/planet_map_07.glb',
  './models/planet_map_08.glb',
  './models/planet_map_09.glb',
  './models/planet_map_10.glb',
  './models/planet_map_11.glb',
  './models/planet_map_12.glb',
  './models/planet_map_13.glb',
  './models/planet_map_14.glb',
  './models/planet_map_15.glb',
  './models/planet_map_16.glb',
  './models/planet_map_17.glb',
  './models/planet_map_18.glb',
  './models/planet_map_19.glb',
  './models/planet_map_20.glb',
  './models/planet_map_21.glb',
];

var APP_LIB_ASSETS = [
  './lib/loaders/GLTFLoader.js',
  './lib/three.module.js',
  './lib/utils/BufferGeometryUtils.js',
];


self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL.concat(APP_ASSETS, APP_MODEL_ASSETS, APP_LIB_ASSETS));
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
  var isGameScriptRequest = url.pathname === '/ThoriumGap.js' || url.pathname === '/ThoriumGap_JS/ThoriumGap.js';
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate' || event.request.destination === 'document' || url.pathname === '/ThoriumGap.html' || url.pathname === '/ThoriumGap/' || isGameScriptRequest) {
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
          if (isGameScriptRequest && url.search) return Response.error();
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
