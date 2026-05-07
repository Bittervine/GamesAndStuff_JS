(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    var v = (window && window.NAC_APP_VERSION) ? String(window.NAC_APP_VERSION) : 'v20';
    navigator.serviceWorker.register('./sw.js?v=' + encodeURIComponent(v)).catch(function () {});
  });
}());
