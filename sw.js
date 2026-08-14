/* Çevrimdışı çalışma.
   Ambarda telefon çekmese bile uygulama açılsın diye
   dosyaları telefonun kendi içine kaydediyoruz.          */

const SURUM  = "koltukambar-v1";
const DOSYA  = [
  "./",
  "./index.html",
  "./urunler.js",
  "./parcalar/zxing.min.js",
  "./manifest.webmanifest",
  "./ikon-192.png",
  "./ikon-512.png",
  "./ikon-180.png"
];

// Hiç değişmeyen, büyük dosyalar: önce hafızadan ver.
const SABIT = ["zxing.min.js", "ikon-"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(SURUM)
      .then(c => c.addAll(DOSYA))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(adlar => Promise.all(adlar.filter(a => a !== SURUM).map(a => caches.delete(a))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  const sabitMi = SABIT.some(p => e.request.url.includes(p));

  if (sabitMi){
    // önce hafıza, yoksa internet
    e.respondWith(
      caches.match(e.request).then(c => c || fetch(e.request).then(y => sakla(e.request, y)))
    );
    return;
  }

  // önce internet (2,5 saniye bekle), olmazsa hafıza
  e.respondWith(
    Promise.race([
      fetch(e.request).then(y => sakla(e.request, y)),
      new Promise((_, red) => setTimeout(() => red(new Error("yavaş")), 2500))
    ]).catch(() =>
      caches.match(e.request).then(c => c || caches.match("./index.html"))
    )
  );
});

function sakla(istek, yanit){
  if (yanit && yanit.ok){
    const kopya = yanit.clone();
    caches.open(SURUM).then(c => c.put(istek, kopya)).catch(() => {});
  }
  return yanit;
}
