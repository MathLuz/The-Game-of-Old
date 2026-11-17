// Motor de regras do jogo da velha clássico (3x3).
// Puro: não toca no DOM. Funciona no navegador (global MotorClassico) e no Node (require).
//
// Estado: { tab: ['', 'X', 'O', ...] (9 casas), vez: 'X'|'O',
//           vencedor: null|'X'|'O'|'velha', linha: [a,b,c]|null, ultima: índice|-1 }
(function (raiz) {
    'use strict';

    const LINHAS = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontais
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticais
        [0, 4, 8], [2, 4, 6],            // Diagonais
    ];

    const outro = (p) => (p === 'X' ? 'O' : 'X');

    function novoEstado() {
        return { tab: Array(9).fill(''), vez: 'X', vencedor: null, linha: null, ultima: -1 };
    }

    function clonar(e) {
        return { tab: e.tab.slice(), vez: e.vez, vencedor: e.vencedor, linha: e.linha, ultima: e.ultima };
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

    // Devolve um NOVO estado com a jogada aplicada. Em fim de jogo `vez` continua
    // sendo quem fez a última jogada.
    function jogar(e, pos) {
        if (!ehLegal(e, pos)) throw new Error('Jogada inválida: ' + pos);
        const n = clonar(e);
        n.tab[pos] = n.vez;
        n.ultima = pos;
        const linha = linhaVencedora(n.tab, n.vez);
        if (linha) {
            n.vencedor = n.vez;
            n.linha = linha;
        } else if (n.tab.every((c) => c !== '')) {
            n.vencedor = 'velha';
        } else {
            n.vez = outro(n.vez);
        }
        return n;
    }

    const Motor = { LINHAS, outro, novoEstado, clonar, jogadasLegais, ehLegal, jogar, linhaVencedora };
    raiz.MotorClassico = Motor;
    if (typeof module !== 'undefined' && module.exports) module.exports = Motor;
})(typeof globalThis !== 'undefined' ? globalThis : this);
