// Motor de regras do jogo da velha infinito (3x3, no máximo 3 peças por jogador).
// Puro: não toca no DOM. Funciona no navegador (global MotorInfinito) e no Node (require).
//
// Regras:
// - Cada jogador tem no máximo 3 peças; ao colocar a 4ª, a mais antiga dele some.
// - Só se joga em casa vazia (inclusive a peça que vai sumir ainda ocupa a casa).
// - A vitória é conferida DEPOIS de a peça antiga sumir.
//
// Estado: { tab: [9 casas], filas: { X: [posições, mais antiga primeiro], O: [...] },
//           vez, vencedor: null|'X'|'O', linha: [a,b,c]|null, ultima: índice|-1 }
(function (raiz) {
    'use strict';

    const MAX_PECAS = 3;
    const LINHAS = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
    ];

    const outro = (p) => (p === 'X' ? 'O' : 'X');

    function novoEstado() {
        return { tab: Array(9).fill(''), filas: { X: [], O: [] }, vez: 'X', vencedor: null, linha: null, ultima: -1 };
    }

    function clonar(e) {
        return {
            tab: e.tab.slice(),
            filas: { X: e.filas.X.slice(), O: e.filas.O.slice() },
            vez: e.vez, vencedor: e.vencedor, linha: e.linha, ultima: e.ultima,
        };
    }

    function linhaVencedora(tab, p) {
        return LINHAS.find(([a, b, c]) => tab[a] === p && tab[b] === p && tab[c] === p) || null;
    }

    function jogadasLegais(e) {
        if (e.vencedor) return [];
        const r = [];
        for (let i = 0; i < 9; i++) if (e.tab[i] === '') r.push(i);
        return r;
    }

    function ehLegal(e, pos) {
        return !e.vencedor && Number.isInteger(pos) && pos >= 0 && pos < 9 && e.tab[pos] === '';
    }

    // Peça de `p` que vai sumir na próxima jogada dele (ou -1)
    function proximaASumir(e, p) {
        return e.filas[p].length >= MAX_PECAS ? e.filas[p][0] : -1;
    }

    function jogar(e, pos) {
        if (!ehLegal(e, pos)) throw new Error('Jogada inválida: ' + pos);
        const n = clonar(e);
        const fila = n.filas[n.vez];
        n.tab[pos] = n.vez;
        fila.push(pos);
        if (fila.length > MAX_PECAS) n.tab[fila.shift()] = '';
        n.ultima = pos;
        const linha = linhaVencedora(n.tab, n.vez);
        if (linha) {
            n.vencedor = n.vez;
            n.linha = linha;
        } else {
            n.vez = outro(n.vez);
        }
        return n;
    }

    // Identifica a posição (a ordem das peças importa, por isso usamos as filas)
    function chave(e) {
        return e.filas.X.join('') + '|' + e.filas.O.join('') + '|' + e.vez;
    }

    const Motor = { MAX_PECAS, LINHAS, outro, novoEstado, clonar, jogadasLegais, ehLegal, jogar, proximaASumir, chave };
    raiz.MotorInfinito = Motor;
    if (typeof module !== 'undefined' && module.exports) module.exports = Motor;
})(typeof globalThis !== 'undefined' ? globalThis : this);
