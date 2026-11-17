// Registra o service worker (sw.js na raiz do site) a partir de qualquer página.
(() => {
    if (!('serviceWorker' in navigator)) return;
    const base = new URL('../', document.currentScript.src);
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register(new URL('sw.js', base), { scope: base.pathname, updateViaCache: 'none' })
            .catch((e) => console.warn('Falha ao registrar o service worker:', e));
    });
})();
