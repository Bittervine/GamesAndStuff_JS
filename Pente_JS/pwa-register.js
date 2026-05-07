(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    var v = (window && window.PENTE_APP_VERSION) ? String(window.PENTE_APP_VERSION) : 'v5';
    navigator.serviceWorker.register('./sw.js?v=' + encodeURIComponent(v)).catch(function () {});
  });
}());
