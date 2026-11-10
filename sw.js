const CACHE_NAME = "deaf-link-uganda-v2";
const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./images/deaf-link-uganda-logo.png",
  "./icons/favicon-32.png",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith("deaf-link-uganda-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response.ok) {
      event.waitUntil(cache.put(request, response.clone()));
    }
    return response;
  })().catch(async error => {
    if (request.mode === "navigate") {
      const cachedPage = await caches.match("./index.html");
      if (cachedPage) return cachedPage;
    }
    throw error;
  }));
});
