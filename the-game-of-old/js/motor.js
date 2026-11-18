// Motor de regras do The Game of Old (jogo da velha 9x9 / "ultimate").
// Puro: não toca no DOM. Funciona no navegador, dentro do Web Worker do bot
// (global MotorUltimate) e no Node (require).
//
// Numeração:
// - campo: 0..8, da esquerda pra direita, de cima pra baixo (os 9 jogos 3x3)
// - celula: 0..8, mesma ordem, dentro de cada campo
// - casa: campo * 9 + celula (0..80)
//
// Regras:
// - A célula jogada define o campo onde o adversário joga (célula 2 → campo 2).
// - Se esse campo já tem vencedor ou está cheio, o adversário joga em qualquer
//   campo ainda aberto.
// - Ganha o campo quem fizer 3 em linha nele; campo ganho ou cheio fica fechado.
// - Ganha o jogo quem fizer 3 campos em linha. Todos os campos fechados sem
//   isso = velha.
//
// Estado (só números, para o bot copiar rápido):
//   casas: 81 × (0 vazia | 1 X | 2 O)
//   campos: 9 × (0 aberto | 1 X | 2 O | 3 cheio sem vencedor)
//   ocupadas: 9 × quantas casas preenchidas em cada campo
//   proximo: campo obrigatório (0..8) ou -1 = qualquer campo aberto
//   vez: 1 (X) | 2 (O)
//   vencedor: 0 em andamento | 1 X | 2 O | 3 velha
//   ultima: última casa jogada (-1 no início)
(function (raiz) {
    'use strict';

    const VAZIO = 0, X = 1, O = 2, VELHA = 3;
    const LINHAS = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
    ];
    // Linhas que passam por cada posição (para conferir só o necessário)
    const LINHAS_POR_POSICAO = Array.from({ length: 9 }, (_, p) => LINHAS.filter((l) => l.includes(p)));

    const simbolo = (n) => (n === X ? 'X' : n === O ? 'O' : '');
    const outro = (n) => 3 - n;

    function novoEstado() {
        return {
            casas: new Array(81).fill(VAZIO),
            campos: new Array(9).fill(VAZIO),
            ocupadas: new Array(9).fill(0),
            proximo: -1,
            vez: X,
            vencedor: VAZIO,
            ultima: -1,
        };
    }

    function clonar(e) {
        return {
            casas: e.casas.slice(),
            campos: e.campos.slice(),
            ocupadas: e.ocupadas.slice(),
            proximo: e.proximo,
            vez: e.vez,
            vencedor: e.vencedor,
            ultima: e.ultima,
        };
    }

    // Campos onde quem tem a vez pode jogar agora
    function camposLiberados(e) {
        if (e.vencedor) return [];
        if (e.proximo !== -1) return [e.proximo];
        const r = [];
        for (let c = 0; c < 9; c++) if (e.campos[c] === VAZIO) r.push(c);
        return r;
    }

    function jogadasLegais(e) {
        const r = [];
        for (const c of camposLiberados(e)) {
            const base = c * 9;
            for (let i = 0; i < 9; i++) if (e.casas[base + i] === VAZIO) r.push(base + i);
        }
        return r;
    }

    function ehLegal(e, casa) {
        if (e.vencedor || !Number.isInteger(casa) || casa < 0 || casa > 80) return false;
        if (e.casas[casa] !== VAZIO) return false;
        const campo = Math.floor(casa / 9);
        if (e.campos[campo] !== VAZIO) return false;
        return e.proximo === -1 || e.proximo === campo;
    }

    function fezLinha(valores, base, pos, p) {
        for (const [a, b, c] of LINHAS_POR_POSICAO[pos]) {
            if (valores[base + a] === p && valores[base + b] === p && valores[base + c] === p) return true;
        }
        return false;
    }

    // Aplica a jogada NO PRÓPRIO estado (rápido, usado pelo bot). Não valida.
    function aplicar(e, casa) {
        const p = e.vez;
        const campo = Math.floor(casa / 9);
        const celula = casa % 9;
        e.casas[casa] = p;
        e.ocupadas[campo]++;
        e.ultima = casa;

        if (fezLinha(e.casas, campo * 9, celula, p)) {
            e.campos[campo] = p;
            if (fezLinha(e.campos, 0, campo, p)) {
                e.vencedor = p;
                e.proximo = -1;
                return e;
            }
        } else if (e.ocupadas[campo] === 9) {
            e.campos[campo] = VELHA;
        }

        if (e.campos.every((c) => c !== VAZIO)) {
            e.vencedor = VELHA;
            e.proximo = -1;
            return e;
        }

        e.proximo = e.campos[celula] === VAZIO ? celula : -1;
        e.vez = outro(p);
        return e;
    }

    // Versão segura para a interface: valida e devolve um NOVO estado
    function jogar(e, casa) {
        if (!ehLegal(e, casa)) throw new Error('Jogada inválida: ' + casa);
        return aplicar(clonar(e), casa);
    }

    // Linha de 3 campos que deu a vitória (para destacar), ou null
    function linhaVencedora(e) {
        if (e.vencedor !== X && e.vencedor !== O) return null;
        const p = e.vencedor;
        return LINHAS.find(([a, b, c]) => e.campos[a] === p && e.campos[b] === p && e.campos[c] === p) || null;
    }

    // Conversão com o data-pos do HTML ("a1".."i9": letra = coluna, número = linha)
    function casaDoDataPos(dataPos) {
        const coluna = dataPos.charCodeAt(0) - 97;
        const linha = parseInt(dataPos.slice(1)) - 1;
        const campo = Math.floor(linha / 3) * 3 + Math.floor(coluna / 3);
        const celula = (linha % 3) * 3 + (coluna % 3);
        return campo * 9 + celula;
    }

    function dataPosDaCasa(casa) {
        const campo = Math.floor(casa / 9), celula = casa % 9;
        const linha = Math.floor(campo / 3) * 3 + Math.floor(celula / 3);
        const coluna = (campo % 3) * 3 + (celula % 3);
        return String.fromCharCode(97 + coluna) + (linha + 1);
    }

    const Motor = {
        VAZIO, X, O, VELHA, LINHAS,
        simbolo, outro, novoEstado, clonar, camposLiberados, jogadasLegais, ehLegal,
        aplicar, jogar, linhaVencedora, casaDoDataPos, dataPosDaCasa,
    };
    raiz.MotorUltimate = Motor;
    if (typeof module !== 'undefined' && module.exports) module.exports = Motor;
})(typeof globalThis !== 'undefined' ? globalThis : this);
