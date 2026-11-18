// Painel de aparência (engrenagem), usado no menu e nos 3 jogos.
// Ele só mexe nos <select> escondidos (#opcoesTemas / #opcoesCores); quem
// aplica e salva o tema continua sendo o temas.js. O interruptor de
// Marcações (só no 9x9) é o próprio #marcacoes, que temas.js e cores.js já ouvem.
(() => {
    const URL_CORES = new URL('../9x9/cores.json', document.currentScript.src);

    const btn = document.querySelector('.btn-config');
    const painel = document.getElementById('painelConfig');
    const selTema = document.getElementById('opcoesTemas');
    const selCores = document.getElementById('opcoesCores');
    if (!btn || !painel || !selTema || !selCores) return;

    const boxCores = painel.querySelector('.opcoes-cores');
    const botoesTema = painel.querySelectorAll('[data-tema]');

    function abrir(aberto) {
        painel.hidden = !aberto;
        btn.setAttribute('aria-expanded', String(aberto));
    }
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        abrir(painel.hidden);
    });
    painel.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', () => abrir(false));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !painel.hidden) {
            abrir(false);
            btn.focus();
        }
    });

    function escolher(select, valor) {
        if (select.value === valor) return;
        select.value = valor;
        select.dispatchEvent(new Event('change')); // temas.js aplica e salva
        marcarAtivos();
    }

    function marcarAtivos() {
        botoesTema.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tema === selTema.value)));
        boxCores.querySelectorAll('button').forEach((b) =>
            b.setAttribute('aria-pressed', String(b.dataset.cores === selCores.value)));
    }

    botoesTema.forEach((b) => b.addEventListener('click', () => escolher(selTema, b.dataset.tema)));

    // Uma amostra "XO" por paleta, já nas cores dela
    const amostras = [...selCores.options].map((opt) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.dataset.cores = opt.value;
        b.title = opt.textContent;
        b.setAttribute('aria-label', opt.textContent);
        b.innerHTML = '<span>X</span><span>O</span>';
        b.addEventListener('click', () => escolher(selCores, opt.value));
        boxCores.appendChild(b);
        return b;
    });
    marcarAtivos();

    fetch(URL_CORES)
        .then((r) => r.json())
        .then((dados) => {
            amostras.forEach((b) => {
                const p = dados.cores.find((c) => c.nome === b.dataset.cores);
                if (!p) return;
                const [x, o] = b.children;
                x.style.color = p.corX;
                x.style.textShadow = `0 0 4px ${p.corX}`;
                o.style.color = p.corO;
                o.style.textShadow = `0 0 4px ${p.corO}`;
            });
        })
        .catch(() => { /* sem as cores: as amostras ficam na cor do texto */ });
})();
