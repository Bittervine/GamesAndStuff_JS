'use strict';

var CACHE_NAME = 'shotemup-3d-v10';
var APP_SHELL = [
  './ShotEmUp3D_JS.html',
  './ShotEmUp_JS.js',
  './GameManual.html',
  './manifest.webmanifest',
  './pwa-icon.svg',
  './assets/players_spaceship.png',
  './assets/players_aura.png',
  './assets/Thorium_Gap_title.png',
  './assets/glow_e_white.png',
  './assets/glow_e_red.png',
  './assets/glow_e_green.png',
  './assets/glow_e_blue.png',
  './assets/Boss_01.png',
  './assets/Boss_02.png',
  './assets/Boss_03.png',
  './assets/Boss_04.png',
  './assets/Boss_05.png',
  './assets/Boss_06.png',
  './assets/Boss_07.png',
  './assets/Boss_08.png',
  './assets/Boss_09.png',
  './assets/Boss_10.png',
  './assets/Boss_11.png',
  './assets/Boss_12.png',
  './assets/Boss_13.png',
  './assets/Enemy_00100a.png',
  './assets/Enemy_00100b.png',
  './assets/Enemy_00101a.png',
  './assets/Enemy_00101b.png',
  './assets/Enemy_00102a.png',
  './assets/Enemy_00102b.png',
  './assets/Enemy_00103a.png',
  './assets/Enemy_00103b.png',
  './assets/Enemy_00104a.png',
  './assets/Enemy_00104b.png',
  './assets/Enemy_00105a.png',
  './assets/Enemy_00105b.png',
  './assets/Enemy_00106a.png',
  './assets/Enemy_00106b.png',
  './assets/Enemy_00200a.png',
  './assets/Enemy_00200b.png',
  './assets/Enemy_00201a.png',
  './assets/Enemy_00201b.png',
  './assets/Enemy_00202a.png',
  './assets/Enemy_00202b.png',
  './assets/Enemy_00203a.png',
  './assets/Enemy_00203b.png',
  './assets/Enemy_00204a.png',
  './assets/Enemy_00204b.png',
  './assets/Enemy_00205a.png',
  './assets/Enemy_00205b.png',
  './assets/Enemy_00206a.png',
  './assets/Enemy_00206b.png',
  './assets/Enemy_00207a.png',
  './assets/Enemy_00207b.png',
  './assets/Enemy_00300a.png',
  './assets/Enemy_00300b.png',
  './assets/Enemy_00301a.png',
  './assets/Enemy_00301b.png',
  './assets/Enemy_00302a.png',
  './assets/Enemy_00302b.png',
  './assets/Enemy_00303a.png',
  './assets/Enemy_00303b.png',
  './assets/Enemy_00304a.png',
  './assets/Enemy_00304b.png',
  './assets/Enemy_00305a.png',
  './assets/Enemy_00305b.png',
  './assets/Enemy_00306a.png',
  './assets/Enemy_00306b.png',
  './assets/Enemy_00307a.png',
  './assets/Enemy_00307b.png',
  './assets/Enemy_00400a.png',
  './assets/Enemy_00400b.png',
  './assets/Enemy_00401a.png',
  './assets/Enemy_00401b.png',
  './assets/Enemy_00402a.png',
  './assets/Enemy_00402b.png',
  './assets/Enemy_00403a.png',
  './assets/Enemy_00403b.png',
  './assets/Enemy_00404a.png',
  './assets/Enemy_00404b.png',
  './assets/Enemy_00405a.png',
  './assets/Enemy_00405b.png',
  './assets/Enemy_00406a.png',
  './assets/Enemy_00406b.png',
  './assets/Enemy_00407a.png',
  './assets/Enemy_00407b.png',
  './assets/Enemy_00500a.png',
  './assets/Enemy_00500b.png',
  './assets/Enemy_00501a.png',
  './assets/Enemy_00501b.png',
  './assets/Enemy_00502a.png',
  './assets/Enemy_00502b.png',
  './assets/Enemy_00503a.png',
  './assets/Enemy_00503b.png',
  './assets/Enemy_00504a.png',
  './assets/Enemy_00504b.png',
  './assets/Enemy_00505a.png',
  './assets/Enemy_00505b.png',
  './assets/Enemy_00506a.png',
  './assets/Enemy_00506b.png',
  './assets/Enemy_00507a.png',
  './assets/Enemy_00507b.png',
  './assets/Enemy_00508a.png',
  './assets/Enemy_00508b.png',
  './assets/Enemy_00509a.png',
  './assets/Enemy_00509b.png',
  './assets/Enemy_00510a.png',
  './assets/Enemy_00510b.png',
  './assets/Enemy_00600a.png',
  './assets/Enemy_00600b.png',
  './assets/Enemy_00601a.png',
  './assets/Enemy_00601b.png',
  './assets/Enemy_00602a.png',
  './assets/Enemy_00602b.png',
  './assets/Enemy_00603a.png',
  './assets/Enemy_00603b.png',
  './assets/Enemy_00604a.png',
  './assets/Enemy_00604b.png',
  './assets/Enemy_00605a.png',
  './assets/Enemy_00605b.png',
  './assets/Enemy_00606a.png',
  './assets/Enemy_00606b.png',
  './assets/Enemy_00607a.png',
  './assets/Enemy_00607b.png',
  './assets/Enemy_00608a.png',
  './assets/Enemy_00608b.png',
  './assets/Enemy_00700a.png',
  './assets/Enemy_00700b.png',
  './assets/Enemy_00701a.png',
  './assets/Enemy_00701b.png',
  './assets/Enemy_00702a.png',
  './assets/Enemy_00702b.png',
  './assets/Enemy_00703a.png',
  './assets/Enemy_00703b.png',
  './assets/Enemy_00704a.png',
  './assets/Enemy_00704b.png',
  './assets/Enemy_00705a.png',
  './assets/Enemy_00705b.png',
  './assets/Enemy_00706a.png',
  './assets/Enemy_00706b.png',
  './assets/Enemy_00800a.png',
  './assets/Enemy_00800b.png',
  './assets/Enemy_00801a.png',
  './assets/Enemy_00801b.png',
  './assets/Enemy_00802a.png',
  './assets/Enemy_00802b.png',
  './assets/Enemy_00803a.png',
  './assets/Enemy_00803b.png',
  './assets/Enemy_00804a.png',
  './assets/Enemy_00804b.png',
  './assets/Enemy_00805a.png',
  './assets/Enemy_00805b.png',
  './assets/Enemy_00806a.png',
  './assets/Enemy_00806b.png',
  './assets/Enemy_00900a.png',
  './assets/Enemy_00900b.png',
  './assets/Enemy_00901a.png',
  './assets/Enemy_00901b.png',
  './assets/Enemy_00902a.png',
  './assets/Enemy_00902b.png',
  './assets/Enemy_00903a.png',
  './assets/Enemy_00903b.png',
  './assets/Enemy_00904a.png',
  './assets/Enemy_00904b.png',
  './assets/Enemy_00905a.png',
  './assets/Enemy_00905b.png',
  './assets/Enemy_00906a.png',
  './assets/Enemy_00906b.png',
  './assets/Enemy_01000a.png',
  './assets/Enemy_01000b.png',
  './assets/Enemy_01001a.png',
  './assets/Enemy_01001b.png',
  './assets/Enemy_01002a.png',
  './assets/Enemy_01002b.png',
  './assets/Enemy_01003a.png',
  './assets/Enemy_01003b.png',
  './assets/Enemy_01004a.png',
  './assets/Enemy_01004b.png',
  './assets/Enemy_01005a.png',
  './assets/Enemy_01005b.png',
  './assets/Enemy_01006a.png',
  './assets/Enemy_01006b.png',
  './assets/Enemy_01100a.png',
  './assets/Enemy_01100b.png',
  './assets/Enemy_01101a.png',
  './assets/Enemy_01101b.png',
  './assets/Enemy_01102a.png',
  './assets/Enemy_01102b.png',
  './assets/Enemy_01103a.png',
  './assets/Enemy_01103b.png',
  './assets/Enemy_01104a.png',
  './assets/Enemy_01104b.png',
  './assets/Enemy_01105a.png',
  './assets/Enemy_01105b.png',
  './assets/Enemy_01106a.png',
  './assets/Enemy_01106b.png',
  './assets/Enemy_01200a.png',
  './assets/Enemy_01200b.png',
  './assets/Enemy_01201a.png',
  './assets/Enemy_01201b.png',
  './assets/Enemy_01202a.png',
  './assets/Enemy_01202b.png',
  './assets/Enemy_01203a.png',
  './assets/Enemy_01203b.png',
  './assets/Enemy_01204a.png',
  './assets/Enemy_01204b.png',
  './assets/Enemy_01205a.png',
  './assets/Enemy_01205b.png',
  './assets/Enemy_01206a.png',
  './assets/Enemy_01206b.png',
  './assets/Enemy_01300a.png',
  './assets/Enemy_01300b.png',
  './assets/Enemy_01301a.png',
  './assets/Enemy_01301b.png',
  './assets/Enemy_01302a.png',
  './assets/Enemy_01302b.png',
  './assets/Enemy_01303a.png',
  './assets/Enemy_01303b.png',
  './assets/Enemy_01304a.png',
  './assets/Enemy_01304b.png',
  './assets/Enemy_01305a.png',
  './assets/Enemy_01305b.png',
  './assets/Enemy_01306a.png',
  './assets/Enemy_01306b.png',
  './assets/Enemy_01500a.png',
  './assets/Enemy_01501a.png',
  './assets/Enemy_01502a.png',
  './assets/Enemy_01502b.png',
  './assets/Enemy_01503a.png',
  './assets/Enemy_01505a.png'
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
