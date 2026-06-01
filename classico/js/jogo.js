let vez = 'X';
let jaVenceu = false;
const tabuleiro = ['', '', '', '', '', '', '', '', ''];

const COMBINACOES_VITORIA = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontais
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticais
    [0, 4, 8], [2, 4, 6]              // Diagonais
];

function jogada(elemento) {
    const pos = parseInt(elemento.getAttribute('data-pos'));
    if (tabuleiro[pos] !== '' || jaVenceu) return;

    tabuleiro[pos] = vez;
    elemento.innerHTML = vez;

    color = vez === 'X' ? corX : corO;
    elemento.style.color = color;
    elemento.style.textShadow = textShadow + color;

    if (verificarVencedor()) {
        venceu();
        return;
    }

    if (tabuleiro.every(c => c !== '')) {
        velha();
        return;
    }

    vez = vez === 'X' ? 'O' : 'X';
    modificacoes();
}

function modificacoes() {
    const jogadorU = document.querySelector('.jogadorU');
    const jogadorD = document.querySelector('.jogadorD');
    const corBorda = '#7f7f7f55';
    if (vez === 'O') {
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

function reiniciar() {
    tabuleiro.fill('');
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
    }).then(() => reiniciar());
}

function velha() {
    Swal.fire({
        width: 450,
        title: "Deu Velha!!",
        text: "Empatou, joguem novamente",
        color: linhas,
        background: fundo + "ee",
        confirmButtonColor: neutra,
        confirmButtonText: "GG",
    }).then(() => reiniciar());
}
