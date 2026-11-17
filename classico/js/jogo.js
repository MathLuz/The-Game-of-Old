// Interface do clássico: as regras ficam em motor.js e o bot em bot.js.
// Aqui só tratamos cliques, desenhamos o estado e mostramos o resultado.
let estado = MotorClassico.novoEstado();
const celulas = document.querySelectorAll('.boxgame .celula');

function jogada(elemento) {
    const pos = parseInt(elemento.getAttribute('data-pos'));
    if (Controle.ehBot(estado.vez)) return; // vez do bot: clique ignorado
    if (!MotorClassico.ehLegal(estado, pos)) return;
    executar(pos);
}

function executar(pos) {
    estado = MotorClassico.jogar(estado, pos);
    renderizar();
    if (estado.vencedor) {
        fimDeJogo();
        return;
    }
    vezDoBot();
}

function vezDoBot() {
    if (estado.vencedor || !Controle.ehBot(estado.vez)) return;
    const copia = MotorClassico.clonar(estado);
    AgendaBot.agendar({
        simbolo: estado.vez,
        calcular: () => BotClassico.escolherJogada(copia, Controle.nivel()),
        aplicar: executar,
    });
}

function renderizar() {
    celulas.forEach((celula) => {
        const pos = parseInt(celula.getAttribute('data-pos'));
        const valor = estado.tab[pos];
        const cor = valor === 'X' ? corX : corO;
        celula.innerHTML = valor;
        celula.style.color = valor ? cor : '';
        const brilho = estado.linha && estado.linha.includes(pos) ? textShadowG : textShadow;
        celula.style.textShadow = valor ? brilho + cor : '';
        celula.classList.toggle('ultima', pos === estado.ultima);
    });
    Controle.destacarVez(estado.vencedor ? null : estado.vez);
}

function reiniciar() {
    AgendaBot.cancelar();
    estado = MotorClassico.novoEstado();
    renderizar();
    vezDoBot();
}

function fimDeJogo() {
    const v = estado.vencedor;
    if (v === 'velha') {
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
    Swal.fire({
        title: v,
        width: 450,
        text: Controle.textoVitoria(v),
        color: v === 'X' ? corX : corO,
        background: fundo + "ee",
        confirmButtonColor: v === 'X' ? corX : corO,
        confirmButtonText: "GG",
    });
}

Controle.aoMudar(reiniciar);
reiniciar();
