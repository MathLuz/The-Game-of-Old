// Como cada nível de dificuldade escolhe entre as jogadas já avaliadas.
// Usado pelos bots do Clássico e do Infinito (o 9x9 usa o tempo de busca do MCTS).
//
// `avaliadas`: [{ pos, valor }] — valor maior = melhor para o bot.
// `vitoriaImediata`: lista de posições que ganham na hora.
(function (raiz) {
    'use strict';

    // Chance de o bot ignorar a melhor jogada e jogar qualquer coisa
    const CHANCE_ERRO = { facil: 0.6, medio: 0.25, dificil: 0 };

    const sortear = (lista, aleatorio) => lista[Math.floor(aleatorio() * lista.length)];

    function escolherPorNivel(avaliadas, vitoriaImediata, nivel, aleatorio = Math.random) {
        // Ganhar na hora é óbvio até para o fácil (na maioria das vezes)
        if (vitoriaImediata.length && (nivel !== 'facil' || aleatorio() < 0.75)) {
            return sortear(vitoriaImediata, aleatorio);
        }
        const erro = CHANCE_ERRO[nivel] ?? 0;
        if (aleatorio() < erro) return sortear(avaliadas, aleatorio).pos;

        const melhorValor = Math.max(...avaliadas.map((a) => a.valor));
        const melhores = avaliadas.filter((a) => a.valor === melhorValor);
        return sortear(melhores, aleatorio).pos;
    }

    const Niveis = { CHANCE_ERRO, escolherPorNivel };
    raiz.Niveis = Niveis;
    if (typeof module !== 'undefined' && module.exports) module.exports = Niveis;
})(typeof globalThis !== 'undefined' ? globalThis : this);
