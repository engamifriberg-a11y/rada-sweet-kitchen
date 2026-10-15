/* eslint-disable no-restricted-globals */
/**
 * Service worker — כדי שהאפליקציה תעבוד במטבח גם בלי רשת.
 *
 * אסטרטגיה:
 *  - ניווטים: רשת תחילה, ובנפילה המטמון. כך עדכונים מגיעים מיד
 *    ובלי אינטרנט עדיין נפתח מה שנשמר.
 *  - קבצים סטטיים (_next, אייקונים, גופנים): מטמון תחילה, הם לא משתנים.
 *  - /api: אף פעם לא במטמון. תשובת יצירה ישנה גרועה מהודעת שגיאה.
 */

const VERSION = 'rada-v1';
const SHELL = `shell-${VERSION}`;
const ASSETS = `assets-${VERSION}`;

const PRECACHE = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(SHELL)
      .then((c) => c.addAll(PRECACHE).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'skip-waiting') self.skipWaiting();
});

function isStatic(url) {
  return (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(png|svg|webmanifest|woff2?|css|js)$/.test(url.pathname)
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // בקשות יצירה אף פעם לא מהמטמון
  if (url.pathname.startsWith('/api/')) return;

  // גופנים של Google ושאר מקורות חיצוניים — מטמון תחילה, ובלי להיכשל
  const sameOrigin = url.origin === self.location.origin;

  if (!sameOrigin) {
    if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
      event.respondWith(
        caches.open(ASSETS).then(async (cache) => {
          const hit = await cache.match(request);
          if (hit) return hit;
          try {
            const res = await fetch(request);
            if (res.ok || res.type === 'opaque') cache.put(request, res.clone());
            return res;
          } catch {
            return hit || Response.error();
          }
        })
      );
    }
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          const cache = await caches.open(SHELL);
          cache.put('/', res.clone());
          return res;
        } catch {
          const cache = await caches.open(SHELL);
          return (await cache.match(request)) || (await cache.match('/')) || Response.error();
        }
      })()
    );
    return;
  }

  if (isStatic(url)) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        try {
          const res = await fetch(request);
          if (res.ok) cache.put(request, res.clone());
          return res;
        } catch {
          return hit || Response.error();
        }
      })
    );
  }
});
