// Menu inicial: desenha os mini-tabuleiros dos cards.
// (O painel de aparência fica em config.js, compartilhado com os jogos.)
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
})();
