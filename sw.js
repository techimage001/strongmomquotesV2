/* Strong Mom Quotes service worker: true network-first.
   Every fetch bypasses the HTTP cache (cache:"no-cache") so a deploy is
   never stale. The Cache API copy is a fallback for offline only. */
var CACHE = 'smq-v3';
var CORE = ['/app.html', '/manifest.json', '/icon-192.png', '/icon-512.png', '/styles.css?v=7', '/site.js?v=7'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(CORE.map(function (u) {
        return fetch(u, { cache: 'no-cache' }).then(function (r) {
          if (r.ok) return c.put(u, r);
        }).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  /* Never cache the collector, the verify page or the admin. */
  if (url.pathname === '/subscribe.php' || url.pathname === '/leads.php' || url.pathname === '/verify.php') return;
  /* Admin, cron and blog are always live: never served from the cache copy. */
  if (url.pathname.indexOf('/admin/') === 0 || url.pathname.indexOf('/cron/') === 0) return;
  if (url.pathname.indexOf('/blog/') === 0) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(function (res) {
      if (res && res.ok && url.origin === location.origin) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (hit) {
        return hit || caches.match('/app.html');
      });
    })
  );
});
