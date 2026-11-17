// Interface do The Game of Old (9x9): as regras ficam em motor.js e o bot em
// bot.js (rodando num Web Worker). Aqui só tratamos cliques, desenhamos o
// estado e mostramos o resultado.
//
// As divs .modific por cima de cada campo continuam sendo o "bloqueio" visual,
// mas agora quem decide quais campos ficam bloqueados é o motor
// (MotorUltimate.camposLiberados), o mesmo que o bot usa para saber onde pode jogar.
const M = MotorUltimate;
let estado = M.novoEstado();

const casasDom = Array.from(document.querySelectorAll('.tabuleiro [data-pos]')).map((el) => ({
    el,
    casa: M.casaDoDataPos(el.getAttribute('data-pos')),
}));
const overlays = Array.from(document.querySelectorAll('.tabuleiro .modific')); // índice = campo

function jogada(elemento) {
    if (Controle.ehBot(M.simbolo(estado.vez))) return; // vez do bot: clique ignorado
    const casa = M.casaDoDataPos(elemento.getAttribute('data-pos'));
    if (!M.ehLegal(estado, casa)) return;
    executar(casa);
}

function executar(casa) {
    estado = M.jogar(estado, casa);
    renderizar();
    if (estado.vencedor) {
        fimDeJogo();
        return;
    }
    vezDoBot();
}

function vezDoBot() {
    const simbolo = M.simbolo(estado.vez);
    if (estado.vencedor || !Controle.ehBot(simbolo)) return;
    const copia = M.clonar(estado);
    const nivel = Controle.nivel();
    AgendaBot.agendar({
        simbolo,
        calcular: () => pensarBot(copia, nivel),
        aplicar: executar,
    });
}

// --- Bot em Web Worker (com plano B na própria página) ---------------------
let worker = null;
let workerFalhou = false;
let ultimoPedido = 0;
const pedidos = new Map(); // id → { resolver, estado, nivel }

function pensarBot(e, nivel) {
    if (!workerFalhou && !worker) {
        try {
            worker = new Worker('js/bot-worker.js');
            worker.onmessage = (ev) => {
                const p = pedidos.get(ev.data.id);
                if (!p) return;
                pedidos.delete(ev.data.id);
                p.resolver(ev.data.jogada);
            };
            worker.onerror = (ev) => {
                ev.preventDefault?.();
                console.warn('Worker do bot indisponível, pensando na própria página.');
                workerFalhou = true;
                worker.terminate();
                worker = null;
                for (const [id, p] of pedidos) {
                    pedidos.delete(id);
                    p.resolver(BotUltimate.escolherJogada(p.estado, p.nivel));
                }
            };
        } catch {
            workerFalhou = true;
        }
    }
    if (workerFalhou || !worker) return BotUltimate.escolherJogada(e, nivel);
    return new Promise((resolver) => {
        const id = ++ultimoPedido;
        pedidos.set(id, { resolver, estado: e, nivel });
        worker.postMessage({ id, estado: e, nivel });
    });
}

// --- Desenho ---------------------------------------------------------------
function corDe(n) {
    return n === M.X ? corX : corO;
}

function renderizar() {
    const liberados = new Set(M.camposLiberados(estado));
    const linhaFinal = M.linhaVencedora(estado) || [];
    const corMarcacao = marcacoes && marcacoes.checked ? '#8f8f8f9f' : '#8f8f8f00';

    casasDom.forEach(({ el, casa }) => {
        const v = estado.casas[casa];
        if (v) {
            el.innerHTML = M.simbolo(v);
            el.style.color = corDe(v);
            el.style.textShadow = textShadow + corDe(v);
        } else {
            el.innerHTML = el.getAttribute('data-pos'); // marcação da casa
            el.style.color = corMarcacao;
            el.style.textShadow = '';
        }
        el.classList.toggle('ultima', casa === estado.ultima);
    });

    overlays.forEach((ov, campo) => {
        const dono = estado.campos[campo];
        if (dono === M.X || dono === M.O) {
            // Campo ganho: mostra o dono por cima
            const brilho = linhaFinal.includes(campo) ? '0px 0px 16px ' : textShadowG;
            ov.innerHTML = M.simbolo(dono);
            ov.style.display = 'flex';
            ov.style.color = corDe(dono);
            ov.style.textShadow = brilho + corDe(dono);
        } else {
            // Campo cheio, fim de jogo ou campo onde não se pode jogar agora: bloqueado
            ov.innerHTML = '';
            ov.style.display = liberados.has(campo) ? 'none' : 'flex';
        }
    });

    Controle.destacarVez(estado.vencedor ? null : M.simbolo(estado.vez));
}

function reiniciar() {
    AgendaBot.cancelar();
    estado = M.novoEstado();
    renderizar();
    vezDoBot();
}

function fimDeJogo() {
    if (estado.vencedor === M.VELHA) {
        Swal.fire({
            width: 450,
            title: "Deu Velha!!",
            text: "Empatou, joguem novamente",
            color: linhas,
            background: fundo + "ee",
            confirmButtonColor: neutra,
            confirmButtonText: "GG",
        });
        return;
    }
    const v = M.simbolo(estado.vencedor);
    Swal.fire({
        title: v,
        width: 450,
        text: Controle.textoVitoria(v),
        color: corDe(estado.vencedor),
        background: fundo + "ee",
        confirmButtonColor: corDe(estado.vencedor),
        confirmButtonText: "GG",
    });
}

Controle.aoMudar(reiniciar);
reiniciar();
