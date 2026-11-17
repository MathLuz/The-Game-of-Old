// Roda o bot do 9x9 fora da thread da página, para a tela não travar
// enquanto ele pensa. Recebe { id, estado, nivel } e devolve { id, jogada }.
importScripts('motor.js', 'bot.js');

self.onmessage = (evento) => {
    const { id, estado, nivel } = evento.data;
    const jogada = BotUltimate.escolherJogada(estado, nivel);
    self.postMessage({ id, jogada });
};
