// Bot do infinito: resolve o jogo INTEIRO por análise retrógrada.
// Como cada jogador tem no máximo 3 peças, existem poucas posições possíveis
// (algumas dezenas de milhares). O bot gera todas elas uma vez e descobre, de
// trás pra frente, quais são vitória, derrota ou empate infinito (ninguém
// consegue forçar a vitória). Com isso o impossível joga perfeitamente.
(function (raiz) {
    'use strict';
    const Motor = raiz.MotorInfinito || require('./motor.js');
    const Niveis = raiz.Niveis || require('../../js/niveis.js');

    // Resultado para quem tem a vez na posição
    const VITORIA = 1, DERROTA = -1, EMPATE = 0;

    let solucao = null; // { idDe, resultado, distancia, filhos }

    // --- Representação compacta usada só na resolução ---------------------
    // Cada posição vira um número: as filas de X e O (mais antiga primeiro)
    // escritas como dígitos (casa + 1) e a vez no último bit.
    // Ex.: X = [4, 0], O = [8], vez O  →  ((51 * 1000) + 9) * 2 + 1
    const MASCARAS_LINHAS = Motor.LINHAS.map((l) => l.reduce((m, i) => m | (1 << i), 0));
    const CODIGO_MAX = 999999 * 2 + 2;

    function codificar(filaX, filaO, vez) {
        let x = 0, o = 0;
        for (const p of filaX) x = x * 10 + p + 1;
        for (const p of filaO) o = o * 10 + p + 1;
        return (x * 1000 + o) * 2 + (vez === 'X' ? 0 : 1);
    }

    function digitos(n) {
        const r = [];
        while (n > 0) {
            r.unshift((n % 10) - 1);
            n = Math.floor(n / 10);
        }
        return r;
    }

    function decodificar(cod) {
        const vez = cod % 2 === 0 ? 'X' : 'O';
        const resto = Math.floor(cod / 2);
        return { filaX: digitos(Math.floor(resto / 1000)), filaO: digitos(resto % 1000), vez };
    }

    const mascara = (fila) => fila.reduce((m, p) => m | (1 << p), 0);
    const formaLinha = (m) => MASCARAS_LINHAS.some((l) => (m & l) === l);

    function resolver() {
        if (solucao) return solucao;

        // 1) Gera todas as posições alcançáveis a partir do início
        const idDe = new Int32Array(CODIGO_MAX).fill(-1);
        const codigos = [codificar([], [], 'X')];
        idDe[codigos[0]] = 0;
        const filhos = []; // por posição: ids das posições seguintes (-1 = jogada que vence na hora)
        for (let id = 0; id < codigos.length; id++) {
            const { filaX, filaO, vez } = decodificar(codigos[id]);
            const ocupadas = mascara(filaX) | mascara(filaO);
            const minha = vez === 'X' ? filaX : filaO;
            const lista = [];
            for (let pos = 0; pos < 9; pos++) {
                if (ocupadas & (1 << pos)) continue;
                const nova = minha.concat(pos);
                if (nova.length > Motor.MAX_PECAS) nova.shift();
                if (formaLinha(mascara(nova))) {
                    lista.push(-1);
                    continue;
                }
                const cod = vez === 'X'
                    ? codificar(nova, filaO, 'O')
                    : codificar(filaX, nova, 'X');
                let filho = idDe[cod];
                if (filho === -1) {
                    filho = codigos.length;
                    idDe[cod] = filho;
                    codigos.push(cod);
                }
                lista.push(filho);
            }
            filhos.push(lista);
        }

        // 2) Análise retrógrada: distância = nº de meias-jogadas até o fim
        const total = filhos.length;
        const resultado = new Int8Array(total); // EMPATE (0) = ainda não resolvido / empate
        const distancia = new Int16Array(total);
        const resolvido = new Uint8Array(total);
        const restantes = new Uint8Array(total); // filhos que ainda não se sabe se são vitória do adversário

        // Lista de predecessores (quem chega em cada posição), em arrays planos
        const qtdPais = new Int32Array(total + 1);
        for (let id = 0; id < total; id++) {
            for (const f of filhos[id]) if (f !== -1) qtdPais[f + 1]++;
        }
        for (let i = 0; i < total; i++) qtdPais[i + 1] += qtdPais[i];
        const pais = new Int32Array(qtdPais[total]);
        const preenchido = qtdPais.slice(0, total);
        for (let id = 0; id < total; id++) {
            restantes[id] = filhos[id].length;
            for (const f of filhos[id]) if (f !== -1) pais[preenchido[f]++] = id;
        }

        // Começa pelas posições que vencem na hora e "volta" a partir delas.
        // A fila é processada em ordem crescente de distância, então:
        // vitória = resolvida pelo primeiro filho perdedor (o mais rápido) e
        // derrota = resolvida quando o último filho vira vitória (a mais demorada).
        const fila = new Int32Array(total);
        let ini = 0, fim = 0;
        for (let id = 0; id < total; id++) {
            if (filhos[id].includes(-1)) {
                resultado[id] = VITORIA;
                distancia[id] = 1;
                resolvido[id] = 1;
                fila[fim++] = id;
            }
        }
        while (ini < fim) {
            const f = fila[ini++];
            for (let k = qtdPais[f]; k < qtdPais[f + 1]; k++) {
                const p = pais[k];
                if (resolvido[p]) continue;
                if (resultado[f] === DERROTA) {
                    resultado[p] = VITORIA;
                } else if (--restantes[p] === 0) {
                    resultado[p] = DERROTA;
                } else {
                    continue;
                }
                distancia[p] = distancia[f] + 1;
                resolvido[p] = 1;
                fila[fim++] = p;
            }
        }
        // O que sobrou sem resolver é empate: dá pra fugir da derrota para sempre

        solucao = { idDe, resultado, distancia, filhos };
        return solucao;
    }

    const idDoEstado = (s, e) => s.idDe[codificar(e.filas.X, e.filas.O, e.vez)];

    // Quanto vale, para quem joga agora, fazer `pos`. Maior = melhor.
    //  ~ +1000: vence (mais rápido vale mais)
    //  0..100 : empate (bônus para jogadas que dão ao adversário chances de errar)
    //  ~ -1000: perde (perder mais tarde vale mais)
    function valorDaJogada(e, pos) {
        const s = resolver();
        const n = Motor.jogar(e, pos);
        if (n.vencedor) return 1000;
        const id = idDoEstado(s, n);
        const r = s.resultado[id];
        const d = s.distancia[id];
        if (r === DERROTA) return 1000 - d; // adversário perde
        if (r === VITORIA) return -1000 + d; // adversário ganha
        // Empate: conta quantas respostas do adversário o fariam perder
        const respostas = s.filhos[id];
        let armadilhas = 0;
        for (const f of respostas) {
            if (f !== -1 && s.resultado[f] === VITORIA) armadilhas++;
        }
        return Math.round((100 * armadilhas) / respostas.length);
    }

    // Depois de `pos`, o adversário consegue vencer na jogada seguinte?
    function entrega(e, pos) {
        const n = Motor.jogar(e, pos);
        return !n.vencedor && Motor.jogadasLegais(n).some((p) => Motor.jogar(n, p).vencedor === n.vez);
    }

    function avaliar(e) {
        return Motor.jogadasLegais(e).map((pos) => ({ pos, valor: valorDaJogada(e, pos), entrega: entrega(e, pos) }));
    }

    // As partidas do infinito são longas (o bot joga muitas vezes), então o
    // difícil erra menos por jogada que no clássico para não ficar fácil demais.
    const CHANCE_ERRO = { ...Niveis.CHANCE_ERRO, dificil: 0.1 };

    function escolherJogada(e, nivel, aleatorio = Math.random) {
        const legais = Motor.jogadasLegais(e);
        if (!legais.length) return null;
        const vitoria = legais.filter((pos) => Motor.jogar(e, pos).vencedor === e.vez);
        // O fácil não precisa da solução completa
        const avaliadas = nivel === 'facil'
            ? legais.map((pos) => ({ pos, valor: 0 }))
            : avaliar(e);
        return Niveis.escolherPorNivel(avaliadas, vitoria, nivel, aleatorio, CHANCE_ERRO);
    }

    // Resultado da posição para quem tem a vez: 'vitoria' | 'derrota' | 'empate'
    function resultadoDa(e) {
        const s = resolver();
        const r = s.resultado[idDoEstado(s, e)];
        return r === VITORIA ? 'vitoria' : r === DERROTA ? 'derrota' : 'empate';
    }

    const Bot = { escolherJogada, avaliar, resolver, resultadoDa };
    raiz.BotInfinito = Bot;
    if (typeof module !== 'undefined' && module.exports) module.exports = Bot;
})(typeof globalThis !== 'undefined' ? globalThis : this);
