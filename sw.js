const CACHE_NAME = 'web-validade-v70'; // Versão atualizada para forçar a limpeza total do navegador
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './painel.html'
];

// Instalação: Salva os arquivos essenciais no cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache atualizado e mapeado');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Ativação: Limpa absolutamente todos os caches antigos anteriores
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Removendo cache antigo:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Busca (Fetch): Tenta a rede primeiro para garantir dados atualizados, se falhar usa o cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
