// Menu inicial: desenha os mini-tabuleiros dos cards e cuida do painel de
// aparência (engrenagem). O painel só mexe nos <select> escondidos; quem
// aplica e salva o tema continua sendo o temas.js.
(() => {
    // --- Mini-tabuleiros -------------------------------------------------------
    function casa(simbolo) {
        const el = document.createElement('div');
        el.className = 'casa';
        if (simbolo === 'X' || simbolo === 'O') {
            el.textContent = simbolo;
            el.classList.add(simbolo.toLowerCase());
        }
        return el;
    }

    // 3x3: data-casas="XO..XO..X", data-vitoria="0,4,8", data-sumindo="0"
    document.querySelectorAll('.mini-3x3').forEach((mini) => {
        const casas = mini.dataset.casas || '.........';
        const vitoria = (mini.dataset.vitoria || '').split(',').filter(Boolean).map(Number);
        const sumindo = (mini.dataset.sumindo || '').split(',').filter(Boolean).map(Number);
        [...casas].forEach((s, i) => {
            const el = casa(s);
            if (vitoria.includes(i)) el.classList.add('vitoria');
            if (sumindo.includes(i)) el.classList.add('sumindo');
            mini.appendChild(el);
        });
    });

    // 9x9: uma partida no meio. Só o campo central está liberado; os outros
    // ficam escurecidos e os já ganhos mostram o dono por cima, como no jogo.
    const CAMPOS_9X9 = [
        { casas: 'XXX.O.O..', dono: 'X' },
        { casas: '.O..X....' },
        { casas: 'O...X.O..' },
        { casas: '..X.O....' },
        { casas: 'X..OX...O', livre: true },
        { casas: 'OX..O..XO', dono: 'O' },
        { casas: '.X..O.X..' },
        { casas: '....X.O..' },
        { casas: 'X.O.X....' },
    ];
    const mini9 = document.querySelector('.mini-9x9');
    if (mini9) {
        CAMPOS_9X9.forEach(({ casas, dono, livre }) => {
            const campo = document.createElement('div');
            campo.className = 'campo';
            const grade = document.createElement('div');
            grade.className = 'grade';
            [...casas].forEach((s) => grade.appendChild(casa(s)));
            campo.appendChild(grade);
            if (!livre) {
                const bloqueio = document.createElement('div');
                bloqueio.className = 'bloqueio';
                if (dono) {
                    bloqueio.textContent = dono;
                    bloqueio.classList.add(dono.toLowerCase());
                }
                campo.appendChild(bloqueio);
            }
            mini9.appendChild(campo);
        });
    }

    // --- Painel de aparência ---------------------------------------------------
    const btn = document.querySelector('.btn-config');
    const painel = document.getElementById('painelConfig');
    const selTema = document.getElementById('opcoesTemas');
    const selCores = document.getElementById('opcoesCores');
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
        b.innerHTML = '<span class="ax">X</span><span class="ao">O</span>';
        b.addEventListener('click', () => escolher(selCores, opt.value));
        boxCores.appendChild(b);
        return b;
    });
    marcarAtivos();

    fetch('the-game-of-old/cores.json')
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
