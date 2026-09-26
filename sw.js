/* SKALA — service worker
   • Halaman HTML: SELALU dari jaringan dulu; simpanan hanya dipakai saat offline.
   • File /assets/: tampil dari simpanan, diperbarui diam-diam di belakang.
   • Permintaan ke domain lain (Apps Script, Cloudflare, Google Fonts) TIDAK disentuh.
   Naikkan VERSI setiap kali mengganti daftar ASET. */
const VERSI = "skala-v17";
const ASET = ["/assets/logo-stekom-bulat.png?v=1", "/assets/skala-turunan.css?v=13", "/assets/skala-turunan.js?v=12",
              "/assets/gedung-960.webp?v=2", "/assets/icon-192.png"];
const OFFLINE = '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>SKALA — offline</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#061a38;font-family:system-ui,Arial,sans-serif;color:#132135;padding:20px}' +
  '.k{background:#fff;border-radius:20px;padding:28px 24px;max-width:360px;text-align:center}h1{font-size:20px;margin:12px 0 6px;color:#061a38}p{color:#495D78;margin:0 0 16px}' +
  'button{font:inherit;font-weight:700;border:0;border-radius:12px;padding:12px 20px;background:#D8232A;color:#fff}</style></head><body><div class="k">' +
  '<img src="/assets/logo-stekom-bulat.png?v=1" width="64" height="64" alt=""><h1>Kamu sedang offline</h1>' +
  '<p>SKALA butuh koneksi internet untuk mencari dan mengajukan sertifikat.</p><button onclick="location.reload()">Coba lagi</button></div></body></html>';

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(ASET)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== VERSI).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(res => {
      const salin = res.clone(); caches.open(VERSI).then(c => c.put(r, salin)).catch(() => {});
      return res;
    }).catch(() => caches.match(r).then(m => m || caches.match("/")).then(m => m ||
      new Response(OFFLINE, { headers: { "Content-Type": "text/html; charset=utf-8" } }))));
    return;
  }
  if (u.pathname.startsWith("/assets/")) {
    e.respondWith(caches.open(VERSI).then(c => c.match(r).then(m => {
      const baru = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => m);
      return m || baru;
    })));
  }
});
