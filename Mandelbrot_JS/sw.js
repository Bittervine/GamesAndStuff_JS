
var cacheName = 'mandelbrot-pwa';
var filesToCache = [  
  './',
  './favicon.ico',
  './index.html',
  './manifest.json',  
  './sw.js',
  './css/style.css',  
  './images/mandelbrot-icon-128.png',
  './images/mandelbrot-icon-512.png',
  './js/mandelbrot.js'
    
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
