// Como cada nível de dificuldade escolhe entre as jogadas já avaliadas.
// Usado pelos bots do Clássico e do Infinito (o 9x9 usa o tempo de busca do MCTS).
//
// `avaliadas`: [{ pos, valor, entrega }] — valor maior = melhor para o bot;
//              `entrega` = depois dela o adversário vence na jogada seguinte.
// `vitoriaImediata`: lista de posições que ganham na hora.
//
// Níveis:
//  - facil / medio: às vezes jogam qualquer coisa (até entregar a vitória).
//  - dificil: joga a melhor quase sempre; quando erra, é um erro "sutil" —
//    nunca deixa de ganhar na hora nem de bloquear uma ameaça direta, mas
//    pode cair numa armadilha (garfo). Dá para vencer, mas é preciso planejar.
//  - impossivel: nunca erra (joga perfeitamente).
(function (raiz) {
    'use strict';

    const NIVEIS = ['facil', 'medio', 'dificil', 'impossivel'];

    // Chance de o bot ignorar a melhor jogada (por jogada)
    const CHANCE_ERRO = { facil: 0.6, medio: 0.25, dificil: 0.2, impossivel: 0 };

    const sortear = (lista, aleatorio) => lista[Math.floor(aleatorio() * lista.length)];

    function escolherPorNivel(avaliadas, vitoriaImediata, nivel, aleatorio = Math.random, chances = CHANCE_ERRO) {
        // Ganhar na hora é óbvio até para o fácil (na maioria das vezes)
        if (vitoriaImediata.length && (nivel !== 'facil' || aleatorio() < 0.75)) {
            return sortear(vitoriaImediata, aleatorio);
        }
        const erro = chances[nivel] ?? 0;
        if (aleatorio() < erro) {
            if (nivel !== 'dificil') return sortear(avaliadas, aleatorio).pos;
            // Erro sutil: só entre as jogadas que não entregam a vitória na hora
            const seguras = avaliadas.filter((a) => !a.entrega);
            return sortear(seguras.length ? seguras : avaliadas, aleatorio).pos;
        }

        const melhorValor = Math.max(...avaliadas.map((a) => a.valor));
        const melhores = avaliadas.filter((a) => a.valor === melhorValor);
        return sortear(melhores, aleatorio).pos;
    }

    const Niveis = { NIVEIS, CHANCE_ERRO, escolherPorNivel };
    raiz.Niveis = Niveis;
    if (typeof module !== 'undefined' && module.exports) module.exports = Niveis;
})(typeof globalThis !== 'undefined' ? globalThis : this);
