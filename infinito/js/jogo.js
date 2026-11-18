// Interface do infinito: as regras ficam em motor.js e o bot em bot.js.
// Aqui só tratamos cliques, desenhamos o estado e mostramos o resultado.
let estado = MotorInfinito.novoEstado();
const celulas = document.querySelectorAll('.boxgame .celula');

function jogada(elemento) {
    const pos = parseInt(elemento.getAttribute('data-pos'));
    if (Controle.ehBot(estado.vez)) return; // vez do bot: clique ignorado
    if (!MotorInfinito.ehLegal(estado, pos)) return;
    executar(pos);
}

function executar(pos) {
    estado = MotorInfinito.jogar(estado, pos);
    renderizar();
    if (estado.vencedor) {
        venceu();
        return;
    }
    vezDoBot();
}

function vezDoBot() {
    if (estado.vencedor || !Controle.ehBot(estado.vez)) return;
    const copia = MotorInfinito.clonar(estado);
    AgendaBot.agendar({
        simbolo: estado.vez,
        calcular: () => BotInfinito.escolherJogada(copia, Controle.nivel()),
        aplicar: executar,
    });
}

function hexAlpha(cor, alpha) {
    if (/^#[0-9a-fA-F]{3}$/.test(cor)) {
        cor = '#' + cor[1] + cor[1] + cor[2] + cor[2] + cor[3] + cor[3];
    }
    return cor + alpha;
}

function renderizar() {
    // A peça que vai sumir na próxima jogada do dono fica translúcida
    const someX = MotorInfinito.proximaASumir(estado, 'X');
    const someO = MotorInfinito.proximaASumir(estado, 'O');
    celulas.forEach((celula) => {
        const pos = parseInt(celula.getAttribute('data-pos'));
        const valor = estado.tab[pos];
        let cor = valor === 'X' ? corX : corO;
        if (!estado.vencedor && (pos === someX || pos === someO) && cor) cor = hexAlpha(cor, '55');
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
    estado = MotorInfinito.novoEstado();
    renderizar();
    // Médio, difícil e impossível usam a solução completa do jogo: calcula logo (uma vez só)
    if (Controle.vsBot() && Controle.nivel() !== 'facil') setTimeout(BotInfinito.resolver, 50);
    vezDoBot();
}

function venceu() {
    const v = estado.vencedor;
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
