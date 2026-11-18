// Testes dos motores de regras e dos bots. Rodar com:  node --test testes/
const test = require('node:test');
const assert = require('node:assert/strict');

const MC = require('../classico/js/motor.js');
const BC = require('../classico/js/bot.js');
const MI = require('../infinito/js/motor.js');
const BI = require('../infinito/js/bot.js');
const MU = require('../9x9/js/motor.js');
const BU = require('../9x9/js/bot.js');

// Gerador aleatório com semente (para os testes serem repetíveis)
function rng(semente) {
    let s = semente >>> 0;
    return () => {
        s = (s + 0x6D2B79F5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function jogarSequencia(Motor, jogadas) {
    return jogadas.reduce((e, p) => Motor.jogar(e, p), Motor.novoEstado());
}

// ---------------------------------------------------------------- CLÁSSICO
test('clássico: vitória, velha e jogada inválida', () => {
    const v = jogarSequencia(MC, [0, 3, 1, 4, 2]);
    assert.equal(v.vencedor, 'X');
    assert.deepEqual(v.linha, [0, 1, 2]);
    assert.deepEqual(MC.jogadasLegais(v), []);

    const velha = jogarSequencia(MC, [0, 1, 2, 4, 3, 5, 7, 6, 8]);
    assert.equal(velha.vencedor, 'velha');

    assert.throws(() => MC.jogar(MC.novoEstado(), 9));
    assert.throws(() => MC.jogar(jogarSequencia(MC, [4]), 4));
});

test('clássico: bot impossível nunca perde (todas as respostas possíveis do humano)', () => {
    for (const ladoBot of ['X', 'O']) {
        const aleatorio = rng(1);
        let partidas = 0;
        (function explorar(e) {
            if (e.vencedor) {
                partidas++;
                assert.ok(e.vencedor === ladoBot || e.vencedor === 'velha', `bot ${ladoBot} perdeu: ${e.tab.join('')}`);
                return;
            }
            if (e.vez === ladoBot) explorar(MC.jogar(e, BC.escolherJogada(e, 'impossivel', aleatorio)));
            else for (const p of MC.jogadasLegais(e)) explorar(MC.jogar(e, p));
        })(MC.novoEstado());
        assert.ok(partidas > 50);
    }
});

test('clássico: bot ganha quando pode e bloqueia quando precisa', () => {
    // X: 0,1  O: 3,4  → vez de X, 2 ganha
    assert.equal(BC.escolherJogada(jogarSequencia(MC, [0, 3, 1, 4]), 'impossivel'), 2);
    // X: 0,1  O: 4  → vez de O, precisa bloquear em 2
    assert.equal(BC.escolherJogada(jogarSequencia(MC, [0, 4, 1]), 'impossivel'), 2);
});

test('clássico: difícil sempre ganha na hora e bloqueia, mas é possível vencê-lo', () => {
    for (let semente = 0; semente < 30; semente++) {
        const aleatorio = rng(semente);
        assert.equal(BC.escolherJogada(jogarSequencia(MC, [0, 3, 1, 4]), 'dificil', aleatorio), 2);
        assert.equal(BC.escolherJogada(jogarSequencia(MC, [0, 4, 1]), 'dificil', aleatorio), 2);
    }
    // Jogador perfeito contra o difícil: às vezes vence, nunca perde
    const aleatorio = rng(21);
    let vitoriasHumano = 0;
    for (let partida = 0; partida < 300; partida++) {
        const ladoBot = partida % 2 === 0 ? 'X' : 'O';
        let e = MC.novoEstado();
        while (!e.vencedor) {
            e = MC.jogar(e, BC.escolherJogada(e, e.vez === ladoBot ? 'dificil' : 'impossivel', aleatorio));
        }
        assert.notEqual(e.vencedor, ladoBot);
        if (e.vencedor !== 'velha') vitoriasHumano++;
    }
    assert.ok(vitoriasHumano >= 15, 'vitórias do humano: ' + vitoriasHumano);
});

// ---------------------------------------------------------------- INFINITO
test('infinito: a 4ª peça remove a mais antiga e a vitória conta depois disso', () => {
    let e = jogarSequencia(MI, [0, 3, 1, 4, 8, 6]); // X: 0,1,8  O: 3,4,6
    assert.equal(MI.proximaASumir(e, 'X'), 0);
    assert.throws(() => MI.jogar(e, 0)); // casa ainda ocupada pela peça que vai sumir
    e = MI.jogar(e, 2); // X joga 2 → some o 0 → X: 1,8,2 (sem linha)
    assert.equal(e.tab[0], '');
    assert.deepEqual(e.filas.X, [1, 8, 2]);
    assert.equal(e.vencedor, null);

    // O: 3,4,6 → joga 5: some o 3, fica 4,6,5 (sem linha: 3 sumiu)
    e = MI.jogar(e, 5);
    assert.equal(e.vencedor, null);
    assert.equal(e.tab[3], '');
});

// Busca independente (sem a tabela) para conferir a análise retrógrada
function forcaVitoria(e, jogadas) {
    if (jogadas <= 0) return false;
    for (const p of MI.jogadasLegais(e)) {
        const n = MI.jogar(e, p);
        if (n.vencedor) return true;
        if (jogadas > 1 && perdeForcado(n, jogadas - 1)) return true;
    }
    return false;
}
function perdeForcado(e, jogadasDoOutro) {
    return MI.jogadasLegais(e).every((p) => forcaVitoria(MI.jogar(e, p), jogadasDoOutro));
}

test('infinito: solução retrógrada confere com busca independente', () => {
    const s = BI.resolver();
    assert.ok(s.filhos.length > 100000);
    const aleatorio = rng(7);
    let conferidas = 0;
    for (let i = 0; i < 400 && conferidas < 60; i++) {
        // posição aleatória alcançável
        let e = MI.novoEstado();
        const passos = 4 + Math.floor(aleatorio() * 10);
        for (let k = 0; k < passos && !e.vencedor; k++) {
            const legais = MI.jogadasLegais(e);
            e = MI.jogar(e, legais[Math.floor(aleatorio() * legais.length)]);
        }
        if (e.vencedor) continue;
        const r = BI.resultadoDa(e);
        const avaliadas = BI.avaliar(e);
        const melhor = Math.max(...avaliadas.map((a) => a.valor));
        if (r === 'vitoria') {
            const d = 1000 - melhor + 1; // jogadas (meias-jogadas) até vencer
            if (d > 7) continue; // mantém a busca independente rápida
            assert.ok(forcaVitoria(e, Math.ceil(d / 2)), 'vitória não confirmada');
            if (d > 2) assert.ok(!forcaVitoria(e, Math.ceil(d / 2) - 1), 'vitória mais rápida existia');
        } else {
            assert.ok(!forcaVitoria(e, 3), `posição ${r} mas existe vitória forçada curta`);
        }
        conferidas++;
    }
    assert.ok(conferidas >= 30, 'poucas posições conferidas: ' + conferidas);
});

test('infinito: X tem vitória forçada; impossível x impossível termina com X vencendo', () => {
    assert.equal(BI.resultadoDa(MI.novoEstado()), 'vitoria');
    const aleatorio = rng(3);
    for (let partida = 0; partida < 5; partida++) {
        let e = MI.novoEstado();
        for (let k = 0; k < 60 && !e.vencedor; k++) e = MI.jogar(e, BI.escolherJogada(e, 'impossivel', aleatorio));
        assert.equal(e.vencedor, 'X');
    }
});

test('infinito: impossível (como O) nunca perde para jogadas aleatórias que não sejam perfeitas', () => {
    const aleatorio = rng(11);
    let derrotas = 0, vitorias = 0;
    for (let partida = 0; partida < 40; partida++) {
        let e = MI.novoEstado();
        for (let k = 0; k < 120 && !e.vencedor; k++) {
            const p = e.vez === 'O'
                ? BI.escolherJogada(e, 'impossivel', aleatorio)
                : MI.jogadasLegais(e)[Math.floor(aleatorio() * MI.jogadasLegais(e).length)];
            e = MI.jogar(e, p);
        }
        if (e.vencedor === 'X') derrotas++;
        if (e.vencedor === 'O') vitorias++;
    }
    assert.equal(derrotas, 0);
    assert.ok(vitorias >= 35, 'vitórias: ' + vitorias);
});

test('infinito: difícil (como X) às vezes perde para quem joga perfeitamente', () => {
    const aleatorio = rng(17);
    let derrotas = 0;
    for (let partida = 0; partida < 60; partida++) {
        let e = MI.novoEstado();
        for (let k = 0; k < 80 && !e.vencedor; k++) {
            e = MI.jogar(e, BI.escolherJogada(e, e.vez === 'X' ? 'dificil' : 'impossivel', aleatorio));
        }
        if (e.vencedor === 'O') derrotas++;
    }
    assert.ok(derrotas >= 3, 'derrotas: ' + derrotas);
});

// ---------------------------------------------------------------- 9x9
test('9x9: conversão data-pos ↔ casa', () => {
    assert.equal(MU.casaDoDataPos('a1'), 0);
    assert.equal(MU.casaDoDataPos('b1'), 1);
    assert.equal(MU.casaDoDataPos('a2'), 3);
    assert.equal(MU.casaDoDataPos('d1'), 9);  // campo 1, célula 0
    assert.equal(MU.casaDoDataPos('a4'), 27); // campo 3, célula 0
    assert.equal(MU.casaDoDataPos('i9'), 80);
    for (let c = 0; c < 81; c++) assert.equal(MU.casaDoDataPos(MU.dataPosDaCasa(c)), c);
});

test('9x9: a célula jogada define o campo do adversário', () => {
    const e = MU.jogar(MU.novoEstado(), MU.casaDoDataPos('b1')); // campo 0, célula 1
    assert.equal(e.proximo, 1);
    assert.deepEqual(MU.camposLiberados(e), [1]);
    assert.ok(MU.jogadasLegais(e).every((c) => Math.floor(c / 9) === 1));
    assert.equal(MU.ehLegal(e, MU.casaDoDataPos('a1')), false);
});

// Monta um estado direto (sem passar pelas regras) para testar situações específicas
function estadoCom({ casas = {}, vez = MU.X, proximo = -1 }) {
    const e = MU.novoEstado();
    for (const [casa, p] of Object.entries(casas)) {
        e.casas[+casa] = p;
        e.ocupadas[Math.floor(+casa / 9)]++;
    }
    e.vez = vez;
    e.proximo = proximo;
    return e;
}

test('9x9: mandado para campo GANHO → joga em qualquer campo aberto', () => {
    // X ganhou o campo 1; X agora joga na célula 1 do campo 4 → O seria mandado ao campo 1
    let e = estadoCom({ casas: { 9: MU.X, 10: MU.X, 11: MU.X }, proximo: 4 });
    e.campos[1] = MU.X;
    e = MU.jogar(e, 4 * 9 + 1);
    assert.equal(e.proximo, -1);
    assert.deepEqual(MU.camposLiberados(e), [0, 2, 3, 4, 5, 6, 7, 8]);
});

test('9x9: mandado para campo CHEIO sem vencedor → joga em qualquer campo aberto (bug antigo)', () => {
    // Campo 1 cheio e empatado: X O X / X O O / O X X
    const velha = [1, 2, 1, 1, 2, 2, 2, 1, 1];
    const casas = {};
    velha.forEach((p, i) => { casas[9 + i] = p; });
    let e = estadoCom({ casas, proximo: 0 });
    e.campos[1] = MU.VELHA;
    e = MU.jogar(e, 1); // X joga b1 (campo 0, célula 1) → O mandado ao campo 1 (cheio)
    assert.equal(e.proximo, -1);
    assert.ok(MU.jogadasLegais(e).length > 0);
    assert.equal(e.vencedor, MU.VAZIO); // no código antigo isso virava "Deu Velha"
});

test('9x9: campo vira VELHA quando enche sem vencedor', () => {
    // Campo 0 com 8 casas, falta a 8 (célula 8) e ninguém faz linha com ela
    const quase = [1, 2, 1, 1, 2, 2, 2, 1];
    const casas = {};
    quase.forEach((p, i) => { casas[i] = p; });
    let e = estadoCom({ casas, proximo: 0, vez: MU.X });
    e = MU.jogar(e, 8);
    assert.equal(e.campos[0], MU.VELHA);
});

test('9x9: vitória no tabuleiro grande', () => {
    let e = estadoCom({ casas: { 9: 1, 10: 1, 11: 1, 18: 1, 19: 1, 20: 1, 0: 1, 1: 1 }, proximo: 0 });
    e.campos[1] = MU.X;
    e.campos[2] = MU.X;
    e = MU.jogar(e, 2); // fecha a linha do campo 0 → campos 0,1,2 de X
    assert.equal(e.campos[0], MU.X);
    assert.equal(e.vencedor, MU.X);
    assert.deepEqual(MU.linhaVencedora(e), [0, 1, 2]);
    assert.deepEqual(MU.jogadasLegais(e), []);
});

test('9x9: partidas aleatórias sempre terminam e só com jogadas legais', () => {
    const aleatorio = rng(5);
    const resultados = { 1: 0, 2: 0, 3: 0 };
    for (let partida = 0; partida < 300; partida++) {
        let e = MU.novoEstado();
        let n = 0;
        while (!e.vencedor) {
            const legais = MU.jogadasLegais(e);
            assert.ok(legais.length > 0, 'sem jogadas e sem fim de jogo');
            const c = legais[Math.floor(aleatorio() * legais.length)];
            assert.ok(MU.ehLegal(e, c));
            e = MU.jogar(e, c);
            assert.ok(++n <= 81);
        }
        resultados[e.vencedor]++;
    }
    assert.ok(resultados[1] > 0 && resultados[2] > 0);
});

test('9x9: bot sempre devolve jogada legal e aproveita vitória imediata', () => {
    let e = estadoCom({ casas: { 9: 1, 10: 1, 11: 1, 18: 1, 19: 1, 20: 1, 0: 1, 1: 1 }, proximo: 0 });
    e.campos[1] = MU.X;
    e.campos[2] = MU.X;
    assert.equal(BU.escolherJogada(e, 'facil'), 2);

    const aleatorio = rng(9);
    e = MU.novoEstado();
    while (!e.vencedor) {
        const c = BU.escolherJogada(e, 'facil', aleatorio);
        assert.ok(MU.ehLegal(e, c));
        e = MU.jogar(e, c);
    }
});

test('9x9: bot fácil vence jogadas aleatórias quase sempre', () => {
    const aleatorio = rng(13);
    let vitorias = 0;
    const partidas = 8;
    for (let p = 0; p < partidas; p++) {
        let e = MU.novoEstado();
        const ladoBot = p % 2 === 0 ? MU.X : MU.O;
        while (!e.vencedor) {
            const legais = MU.jogadasLegais(e);
            const c = e.vez === ladoBot
                ? BU.escolherJogada(e, 'facil', aleatorio)
                : legais[Math.floor(aleatorio() * legais.length)];
            e = MU.jogar(e, c);
        }
        if (e.vencedor === ladoBot) vitorias++;
    }
    assert.ok(vitorias >= partidas - 1, `venceu ${vitorias} de ${partidas}`);
});
