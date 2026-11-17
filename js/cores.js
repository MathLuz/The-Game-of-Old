const textShadow = "0px 0px 3px ";
const textShadowG = "0px 0px 8px ";

// Hook chamado por aplicarTema() após atualizar as variáveis de cor:
// redesenha o tabuleiro com as cores novas.
function aoAplicarTema() {
    if (typeof renderizar === 'function') renderizar();
}

// Mostrar/esconder as marcações (a1, b2...) nas casas vazias.
// O listener padrão de temas.js já salva a escolha e ajusta o ícone.
if (marcacoes) {
    marcacoes.addEventListener('click', () => {
        if (typeof renderizar === 'function') renderizar();
    });
}
