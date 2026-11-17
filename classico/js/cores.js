const textShadow = "0px 0px 3px ";
const textShadowG = "0px 0px 8px ";

// Hook chamado por aplicarTema() após atualizar as variáveis de cor:
// redesenha o tabuleiro com as cores novas.
function aoAplicarTema() {
    if (typeof renderizar === 'function') renderizar();
}
