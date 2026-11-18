// Controle de oponente compartilhado pelos 3 modos: "2 jogadores" ou "vs Bot".
// Lê os <select id="oponente"> e <select id="ladoHumano"> da página, guarda a
// escolha no localStorage (vale para todos os modos) e cuida dos rótulos
// "Jogador 1 / Jogador 2" ↔ "Você / Bot" e do destaque de quem é a vez.
const Controle = (() => {
    const selOponente = document.getElementById('oponente');
    const selLado = document.getElementById('ladoHumano');
    const jogadorX = document.querySelector('.jogadorU');
    const jogadorO = document.querySelector('.jogadorD');
    const ouvintes = [];

    const NIVEIS = ['facil', 'medio', 'dificil'];
    const oponenteSalvo = ler('oponente');
    const ladoSalvo = ler('ladoHumano');
    if (oponenteSalvo && (oponenteSalvo === 'humano' || NIVEIS.includes(oponenteSalvo))) {
        selOponente.value = oponenteSalvo;
    }
    if (ladoSalvo === 'X' || ladoSalvo === 'O') selLado.value = ladoSalvo;

    selOponente.addEventListener('change', mudou);
    selLado.addEventListener('change', mudou);
    atualizarRotulos();

    function ler(chave) {
        try { return localStorage.getItem(chave); } catch { return null; }
    }
    function salvar(chave, valor) {
        try { localStorage.setItem(chave, valor); } catch { /* sem storage */ }
    }

    function mudou() {
        salvar('oponente', selOponente.value);
        salvar('ladoHumano', selLado.value);
        atualizarRotulos();
        ouvintes.forEach((fn) => fn());
    }

    function vsBot() { return selOponente.value !== 'humano'; }
    function nivel() { return vsBot() ? selOponente.value : null; }
    function ladoHumano() { return selLado.value; }
    function ladoBot() { return selLado.value === 'X' ? 'O' : 'X'; }
    function ehBot(simbolo) { return vsBot() && simbolo === ladoBot(); }

    // Troca só o texto antes do <span>X</span>, mantendo o span colorido
    function rotular(elemento, texto) {
        const no = elemento.firstChild;
        if (no && no.nodeType === Node.TEXT_NODE) no.nodeValue = texto + ' - ';
    }

    function atualizarRotulos() {
        selLado.hidden = !vsBot();
        if (!vsBot()) {
            rotular(jogadorX, 'Jogador 1');
            rotular(jogadorO, 'Jogador 2');
        } else {
            rotular(jogadorX, ehBot('X') ? 'Bot' : 'Você');
            rotular(jogadorO, ehBot('O') ? 'Bot' : 'Você');
        }
    }

    // A classe .vez pinta a borda/fundo na cor da peça (pagina-jogo.css)
    function destacarVez(vez) {
        jogadorX.classList.toggle('vez', vez === 'X');
        jogadorO.classList.toggle('vez', vez === 'O');
    }

    function marcarPensando(simbolo, pensando) {
        jogadorX.classList.toggle('pensando', pensando && simbolo === 'X');
        jogadorO.classList.toggle('pensando', pensando && simbolo === 'O');
    }

    // Textos do alerta de fim de jogo
    function textoVitoria(simbolo) {
        if (!vsBot()) return ' É O VENCEDOR!!';
        return ehBot(simbolo) ? 'O BOT VENCEU!!' : 'VOCÊ VENCEU!!';
    }

    return {
        vsBot, nivel, ladoHumano, ladoBot, ehBot,
        destacarVez, marcarPensando, textoVitoria,
        aoMudar: (fn) => ouvintes.push(fn),
    };
})();

// Agenda a jogada do bot com uma pequena pausa (para a jogada não parecer
// instantânea) e cancela se a partida for reiniciada nesse meio tempo.
// `calcular` pode devolver a jogada direto ou uma Promise.
const AgendaBot = (() => {
    let partida = 0;
    return {
        cancelar() {
            partida++;
            Controle.marcarPensando(null, false);
        },
        agendar({ simbolo, calcular, aplicar, pausa = 450 }) {
            const minha = ++partida;
            Controle.marcarPensando(simbolo, true);
            const inicio = Date.now();
            setTimeout(async () => {
                if (minha !== partida) return;
                let jogada;
                try {
                    jogada = await calcular();
                } catch (e) {
                    console.error('Erro no bot:', e);
                }
                // Garante a pausa mínima mesmo se o cálculo for rápido
                const resta = pausa - (Date.now() - inicio);
                if (resta > 0) await new Promise((r) => setTimeout(r, resta));
                if (minha !== partida) return;
                Controle.marcarPensando(simbolo, false);
                if (jogada !== undefined && jogada !== null) aplicar(jogada);
            }, 30);
        },
    };
})();
