let vez = 'X';
let jaVenceu = false;
const tabuleiro = ['', '', '', '', '', '', '', '', ''];
const filasX = []; // fila FIFO das posições de X (mais antiga primeiro)
const filasO = []; // fila FIFO das posições de O (mais antiga primeiro)
const MAX_PECAS = 3;

const COMBINACOES_VITORIA = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontais
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticais
    [0, 4, 8], [2, 4, 6]              // Diagonais
];

function jogada(elemento) {
    const pos = parseInt(elemento.getAttribute('data-pos'));
    if (tabuleiro[pos] !== '' || jaVenceu) return;

    // Coloca a nova peça
    tabuleiro[pos] = vez;
    elemento.innerHTML = vez;
    const corAtual = vez === 'X' ? corX : corO;
    elemento.style.color = corAtual;
    elemento.style.textShadow = textShadow + corAtual;

    const fila = vez === 'X' ? filasX : filasO;
    fila.push(pos);

    // Se ultrapassou o limite, remove a peça mais antiga
    if (fila.length > MAX_PECAS) {
        const posRemover = fila.shift();
        tabuleiro[posRemover] = '';
        const celulaRemover = document.querySelector(`.celula[data-pos="${posRemover}"]`);
        celulaRemover.innerHTML = '';
        celulaRemover.style.color = '';
        celulaRemover.style.textShadow = '';
        celulaRemover.style.backgroundColor = fundo;
    }

    // Verifica vitória com o tabuleiro já no estado correto (peça antiga já removida)
    if (verificarVencedor()) {
        venceu();
        return;
    }

    vez = vez === 'X' ? 'O' : 'X';
    modificacoes();
    atualizarTranslucidez();
}

function modificacoes() {
    const jogadorU = document.querySelector('.jogadorU');
    const jogadorD = document.querySelector('.jogadorD');
    const corBorda = '#7f7f7f55';
    if (vez === 'X') {
        jogadorU.style.backgroundColor = corBorda;
        jogadorD.style.backgroundColor = '';
    } else {
        jogadorD.style.backgroundColor = corBorda;
        jogadorU.style.backgroundColor = '';
    }
}

function verificarVencedor() {
    return COMBINACOES_VITORIA.some(([a, b, c]) =>
        tabuleiro[a] !== '' && tabuleiro[a] === vez && tabuleiro[b] === vez && tabuleiro[c] === vez
    );
}

function hexAlpha(cor, alpha) {
    if (/^#[0-9a-fA-F]{3}$/.test(cor)) {
        cor = '#' + cor[1]+cor[1] + cor[2]+cor[2] + cor[3]+cor[3];
    }
    return cor + alpha;
}

function atualizarTranslucidez() {
    [[filasX, corX], [filasO, corO]].forEach(([fila, cor]) => {
        fila.forEach(pos => {
            const celula = document.querySelector(`.celula[data-pos="${pos}"]`);
            celula.style.color = cor;
            celula.style.textShadow = textShadow + cor;
        });
        if (fila.length >= MAX_PECAS) {
            const celula = document.querySelector(`.celula[data-pos="${fila[0]}"]`);
            celula.style.color = hexAlpha(cor, '55');
            celula.style.textShadow = textShadow + hexAlpha(cor, '55');
        }
    });
}

function reiniciar() {
    tabuleiro.fill('');
    filasX.length = 0;
    filasO.length = 0;
    jaVenceu = false;
    vez = 'X';
    document.querySelectorAll('.boxgame .celula').forEach(celula => {
        celula.innerHTML = '';
        celula.style.color = '';
        celula.style.textShadow = '';
        celula.style.backgroundColor = fundo;
    });
    document.querySelector('.jogadorU').style.backgroundColor = '#7f7f7f55';
    document.querySelector('.jogadorD').style.backgroundColor = '';
}

function venceu() {
    jaVenceu = true;
    Swal.fire({
        title: vez,
        width: 450,
        text: " É O VENCEDOR!!",
        color: vez === 'X' ? corX : corO,
        background: fundo + "ee",
        confirmButtonColor: vez === 'X' ? corX : corO,
        confirmButtonText: "GG",
    });
}
