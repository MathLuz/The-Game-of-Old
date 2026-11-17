// Service worker: deixa o site funcionando offline.
// Estratégia "network-first": com internet, sempre busca a versão mais nova
// e atualiza o cache; sem internet (ou rede muito lenta), usa o que está salvo.
// Não é preciso mudar nada aqui quando os arquivos do site mudarem.
const CACHE = 'jogos-da-velha';
const TEMPO_LIMITE_REDE = 4000; // ms até desistir da rede e usar o cache

// Arquivos locais (caminhos relativos ao sw.js)
const ARQUIVOS_LOCAIS = [
    './',
    'index.html',
    'style.css',
    'manifest.json',
    'js/temas.js',
    'js/pwa.js',
    'assets/img/iconjv.png',
    'assets/img/icons/icon-192.png',
    'assets/img/icons/icon-512.png',
    'assets/img/icons/icon-maskable-512.png',
    'assets/img/icons/apple-touch-icon.png',

    'the-game-of-old/',
    'the-game-of-old/index.html',
    'the-game-of-old/style.css',
    'the-game-of-old/cores.json',
    'the-game-of-old/js/cores.js',
    'the-game-of-old/js/jogo.js',

    'classico/',
    'classico/index.html',
    'classico/style.css',
    'classico/js/cores.js',
    'classico/js/jogo.js',

    'infinito/',
    'infinito/index.html',
    'infinito/style.css',
    'infinito/js/cores.js',
    'infinito/js/jogo.js',
];

// Recursos externos (CDN) usados pelas páginas
const FA = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0';
const ARQUIVOS_EXTERNOS = [
    `${FA}/css/all.min.css`,
    `${FA}/webfonts/fa-solid-900.woff2`,
    `${FA}/webfonts/fa-regular-400.woff2`,
    `${FA}/webfonts/fa-brands-400.woff2`,
    'https://cdn.jsdelivr.net/npm/sweetalert2@11',
    'https://cdn.jsdelivr.net/npm/@sweetalert2/theme-dark@5/dark.css',
    'https://fonts.googleapis.com/css2?family=Acme&family=Jacquard+12+Charted&display=swap',
];

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE);
        // 'reload' ignora o cache HTTP do navegador para salvar a versão mais nova
        await cache.addAll(ARQUIVOS_LOCAIS.map((url) => new Request(url, { cache: 'reload' })));
        // Externos: falha em um não impede a instalação
        await Promise.all(ARQUIVOS_EXTERNOS.map(async (url) => {
            try {
                const res = await fetch(url, { mode: 'cors' });
                if (res.ok) await cache.put(url, res);
            } catch (e) {
                console.warn('[sw] não foi possível cachear', url, e);
            }
        }));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const chaves = await caches.keys();
        await Promise.all(chaves
            .filter((k) => k.startsWith('jogos-da-velha-') && k !== CACHE)
            .map((k) => caches.delete(k)));
        await self.clients.claim();
    })());
});

// Network-first: tenta a rede; se responder, atualiza o cache e devolve a versão nova.
// Se estiver offline ou demorar mais que TEMPO_LIMITE_REDE, usa o cache.
self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (!url.protocol.startsWith('http')) return;
    const mesmaOrigem = url.origin === self.location.origin;

    event.respondWith((async () => {
        const cache = await caches.open(CACHE);

        // Arquivos do próprio site: 'no-cache' faz o navegador confirmar com o
        // servidor se mudou (barato quando não mudou, graças ao ETag).
        const daRede = fetch(mesmaOrigem ? new Request(req, { cache: 'no-cache' }) : req)
            .then(async (res) => {
                if (res && (res.ok || res.type === 'opaque')) {
                    await cache.put(req, res.clone());
                }
                return res;
            });
        // Mesmo se o cache for usado, deixa a atualização terminar em segundo plano
        event.waitUntil(daRede.catch(() => {}));

        let limite;
        const tempoEsgotado = new Promise((_, rejeita) => {
            limite = setTimeout(() => rejeita(new Error('timeout')), TEMPO_LIMITE_REDE);
        });

        try {
            return await Promise.race([daRede, tempoEsgotado]);
        } catch {
            const emCache = await cache.match(req, { ignoreSearch: mesmaOrigem });
            if (emCache) return emCache;
            // Sem cache: se só demorou, espera a rede mesmo assim
            try { return await daRede; } catch { /* offline */ }
            // Offline e sem cache: para navegação, cai na página inicial
            if (req.mode === 'navigate') {
                const inicio = await cache.match('./');
                if (inicio) return inicio;
            }
            return Response.error();
        } finally {
            clearTimeout(limite);
        }
    })());
});
