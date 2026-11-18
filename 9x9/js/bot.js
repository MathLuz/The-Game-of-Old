// Bot do 9x9: MCTS (Monte Carlo Tree Search).
// O 9x9 tem jogadas demais para calcular tudo, então o bot simula milhares de
// partidas aleatórias a partir de cada jogada candidata e vai concentrando as
// simulações nas que mais deram certo (fórmula UCT). No fim joga a mais explorada.
// Mais tempo/simulações = bot mais forte; é assim que os níveis funcionam.
(function (raiz) {
    'use strict';
    const Motor = raiz.MotorUltimate || require('./motor.js');

    const NIVEIS = {
        facil: { simulacoes: 300, tempoMs: 300 },
        medio: { simulacoes: 4000, tempoMs: 900 },
        dificil: { simulacoes: Infinity, tempoMs: 2000 },
        impossivel: { simulacoes: Infinity, tempoMs: 5000 },
    };
    const EXPLORACAO = Math.SQRT2;

    function novoNo(pai, jogada, jogador, estado) {
        return {
            pai, jogada,
            jogador, // quem fez `jogada` (as vitórias do nó contam para ele)
            filhos: [],
            naoTestadas: Motor.jogadasLegais(estado),
            visitas: 0,
            pontos: 0, // vitória = 1, velha = 0.5
        };
    }

    function melhorFilhoUCT(no) {
        const logN = Math.log(no.visitas);
        let melhor = null, melhorValor = -Infinity;
        for (const f of no.filhos) {
            const v = f.pontos / f.visitas + EXPLORACAO * Math.sqrt(logN / f.visitas);
            if (v > melhorValor) {
                melhorValor = v;
                melhor = f;
            }
        }
        return melhor;
    }

    // Joga aleatoriamente até o fim, mas sempre aproveita uma vitória imediata
    // do jogo inteiro (deixa as simulações bem mais realistas e custa pouco).
    function simular(e, aleatorio) {
        while (!e.vencedor) {
            const legais = Motor.jogadasLegais(e);
            let escolhida = -1;
            if (legais.length <= 12) {
                for (const casa of legais) {
                    const teste = Motor.aplicar(Motor.clonar(e), casa);
                    if (teste.vencedor === e.vez) {
                        escolhida = casa;
                        break;
                    }
                }
            }
            if (escolhida === -1) escolhida = legais[Math.floor(aleatorio() * legais.length)];
            Motor.aplicar(e, escolhida);
        }
        return e.vencedor;
    }

    function escolherJogada(estado, nivel, aleatorio = Math.random) {
        const legais = Motor.jogadasLegais(estado);
        if (!legais.length) return null;
        if (legais.length === 1) return legais[0];

        // Vitória imediata: nem precisa pensar
        for (const casa of legais) {
            if (Motor.jogar(estado, casa).vencedor === estado.vez) return casa;
        }

        const cfg = NIVEIS[nivel] || NIVEIS.medio;
        const raizArvore = novoNo(null, -1, Motor.outro(estado.vez), estado);
        const fim = Date.now() + cfg.tempoMs;

        for (let i = 0; i < cfg.simulacoes; i++) {
            if ((i & 63) === 0 && Date.now() > fim) break;
            const e = Motor.clonar(estado);
            let no = raizArvore;

            // 1) Seleção: desce pela árvore enquanto o nó já foi todo expandido
            while (no.naoTestadas.length === 0 && no.filhos.length > 0) {
                no = melhorFilhoUCT(no);
                Motor.aplicar(e, no.jogada);
            }
            // 2) Expansão: testa uma jogada nova
            if (no.naoTestadas.length > 0 && !e.vencedor) {
                const k = Math.floor(aleatorio() * no.naoTestadas.length);
                const jogada = no.naoTestadas.splice(k, 1)[0];
                const jogador = e.vez;
                Motor.aplicar(e, jogada);
                const filho = novoNo(no, jogada, jogador, e);
                no.filhos.push(filho);
                no = filho;
            }
            // 3) Simulação
            const vencedor = simular(e, aleatorio);
            // 4) Retropropagação
            for (let n = no; n; n = n.pai) {
                n.visitas++;
                if (vencedor === n.jogador) n.pontos += 1;
                else if (vencedor === Motor.VELHA) n.pontos += 0.5;
            }
        }

        let melhor = raizArvore.filhos[0];
        for (const f of raizArvore.filhos) if (f.visitas > melhor.visitas) melhor = f;
        return melhor ? melhor.jogada : legais[0];
    }

    const Bot = { NIVEIS, escolherJogada };
    raiz.BotUltimate = Bot;
    if (typeof module !== 'undefined' && module.exports) module.exports = Bot;
})(typeof globalThis !== 'undefined' ? globalThis : this);
