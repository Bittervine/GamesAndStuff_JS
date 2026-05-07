(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    var v = (window && window.GOPLUS_APP_VERSION) ? String(window.GOPLUS_APP_VERSION) : 'v1';
    navigator.serviceWorker.register('./sw.js?v=' + encodeURIComponent(v)).catch(function () {});
  });
}());
