(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js?v=20260418b', { updateViaCache: 'none' }).catch(function () {});
  });
}());
