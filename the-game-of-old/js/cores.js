const classOri = document.getElementsByClassName('modific');
const houses = document.querySelectorAll('.tabuleiro div div');
const textShadow = "0px 0px 3px ";
const textShadowG = "0px 0px 8px ";

// Substitui o listener padrão pelo comportamento específico do jogo
marcacoes.removeEventListener('click', onMarcacoesClick);
marcacoes.addEventListener('click', alternarMarcacoes);

// Hook chamado por aplicarTema() após atualizar as variáveis de cor
function aoAplicarTema() {
    houses.forEach((div) => {
        div.style.backgroundColor = fundo;
        if (div.innerHTML === "X") {
            div.style.color = corX;
            div.style.textShadow = textShadow + corX;
        } else if (div.innerHTML === "O") {
            div.style.color = corO;
            div.style.textShadow = textShadow + corO;
        }
    });
    for (let i = 0; i < classOri.length; i++) {
        if (classOri[i].innerHTML === "X") {
            classOri[i].style.color = corX;
            classOri[i].style.textShadow = textShadow + corX;
        } else if (classOri[i].innerHTML === "O") {
            classOri[i].style.color = corO;
            classOri[i].style.textShadow = textShadow + corO;
        }
    }
}

alternarMarcacoes();
function alternarMarcacoes() {
    const corMarcacao = marcacoes.checked ? "#8f8f8f9f" : "#8f8f8f00";
    icone.style.color = marcacoes.checked ? (linhas || "") : corMarcacao;
    localStorage.setItem('marcacoes', marcacoes.checked);
    houses.forEach((casa) => {
        casa.style.color = corMarcacao;
    });
    aplicarTema();
}