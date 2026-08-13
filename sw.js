/* Service Worker — CRM Financeiro Sálvia Group
   Coloque este arquivo (sw.js) no MESMO diretório do HTML do CRM.
   Ele guarda uma cópia do app e das bibliotecas para funcionar offline. */

const CACHE = 'crm-financeiro-v15';

self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((chaves) =>
            Promise.all(chaves.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    if (e.request.method !== 'GET') return;

    // Nunca intercepta chamadas de dados (Firebase, Google APIs) — sempre rede
    if (/googleapis\.com|gstatic\.com\/firebasejs|accounts\.google\.com|firestore/.test(url.href)) return;

    // App e bibliotecas de CDN: rede primeiro, cache como reserva (offline)
    e.respondWith(
        fetch(e.request)
            .then((resp) => {
                if (resp && resp.status === 200 && (url.origin === location.origin || /unpkg\.com|cdnjs\.cloudflare\.com/.test(url.href))) {
                    const copia = resp.clone();
                    caches.open(CACHE).then((c) => c.put(e.request, copia));
                }
                return resp;
            })
            .catch(() => caches.match(e.request))
    );
});
