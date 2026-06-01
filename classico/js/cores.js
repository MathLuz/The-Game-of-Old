const textShadow = "0px 0px 3px ";
const textShadowG = "0px 0px 8px ";

// Hook chamado por aplicarTema() após atualizar as variáveis de cor
function aoAplicarTema() {
    document.querySelectorAll('.boxgame .celula').forEach((celula) => {
        celula.style.backgroundColor = fundo;
        if (celula.innerHTML === 'X') {
            celula.style.color = corX;
            celula.style.textShadow = textShadow + corX;
        } else if (celula.innerHTML === 'O') {
            celula.style.color = corO;
            celula.style.textShadow = textShadow + corO;
        }
    });
}
