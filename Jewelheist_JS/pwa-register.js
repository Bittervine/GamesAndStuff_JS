(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    var v = (window && window.JH_APP_VERSION) ? String(window.JH_APP_VERSION) : 'v4';
    navigator.serviceWorker.register('./sw.js?v=' + encodeURIComponent(v)).catch(function () {});
  });
}());
