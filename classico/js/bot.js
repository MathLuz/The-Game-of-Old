// Bot do clássico: minimax completo (o jogo é pequeno o bastante para o bot
// enxergar todas as possibilidades). No impossível é imbatível.
(function (raiz) {
    'use strict';
    const Motor = raiz.MotorClassico || require('./motor.js');
    const Niveis = raiz.Niveis || require('../../js/niveis.js');

    const memo = new Map();

    // Valor do estado para quem tem a vez: +10..+1 = vence (quanto antes, maior),
    // 0 = empate, negativo = perde.
    function valorPara(e) {
        const chave = e.tab.join(',') + e.vez;
        if (memo.has(chave)) return memo.get(chave);
        let melhor = -Infinity;
        for (const pos of Motor.jogadasLegais(e)) {
            melhor = Math.max(melhor, valorDaJogada(e, pos));
        }
        memo.set(chave, melhor);
        return melhor;
    }

    // Valor de fazer `pos` para quem está jogando agora
    function valorDaJogada(e, pos) {
        const n = Motor.jogar(e, pos);
        if (n.vencedor === 'velha') return 0;
        if (n.vencedor) return 10 - contarPecas(n.tab); // vitória mais rápida vale mais
        return -valorPara(n);
    }

    const contarPecas = (tab) => tab.filter((c) => c !== '').length;

    // Depois de `pos`, o adversário consegue vencer na jogada seguinte?
    function entrega(e, pos) {
        const n = Motor.jogar(e, pos);
        return !n.vencedor && Motor.jogadasLegais(n).some((p) => Motor.jogar(n, p).vencedor === n.vez);
    }

    function avaliar(e) {
        return Motor.jogadasLegais(e).map((pos) => ({ pos, valor: valorDaJogada(e, pos), entrega: entrega(e, pos) }));
    }

    function escolherJogada(e, nivel, aleatorio = Math.random) {
        const avaliadas = avaliar(e);
        if (!avaliadas.length) return null;
        const vitoria = avaliadas
            .filter((a) => Motor.jogar(e, a.pos).vencedor === e.vez)
            .map((a) => a.pos);
        return Niveis.escolherPorNivel(avaliadas, vitoria, nivel, aleatorio);
    }

    const Bot = { escolherJogada, avaliar, valorPara };
    raiz.BotClassico = Bot;
    if (typeof module !== 'undefined' && module.exports) module.exports = Bot;
})(typeof globalThis !== 'undefined' ? globalThis : this);
