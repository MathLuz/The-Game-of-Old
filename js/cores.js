let color
let corX;
let corO;
let fundo;
let linhas;
let neutra;
let gradient;
let corBlock;
const root = document.documentElement;
const classOri = document.getElementsByClassName('modific');
const houses = document.querySelectorAll('.tabuleiro div div');
const textShadow = "0px 0px 3px ";
const textShadowG = "0px 0px 8px ";
const selectTema = document.getElementById("opcoesTemas");
const selectCores = document.getElementById("opcoesCores");
let escolhaTema = selectTema.value;
let escolhaCores = selectCores.value;
const marcacoes = document.querySelector('#marcacoes');
const icone = document.querySelector('.marcacoesCheck i')

const temaLight = window.matchMedia("(prefers-color-scheme: light)").matches
if (temaLight) {
    console.log(selectTema.value)
    selectTema.value = "light"
}

selectTema.addEventListener('change', () => {
    escolhaTema = selectTema.value
    corTema();
})
selectCores.addEventListener('change', () => {
    escolhaCores = selectCores.value
    corTema();
})

corTema();
async function definirCores() {
    await conectaTemasECores();
}
async function corTema() {
    filtSelect();
    await definirCores();

    root.style.setProperty('--corX', corX);
    root.style.setProperty('--corO', corO);
    root.style.setProperty('--background', fundo);
    root.style.setProperty('--color', linhas);
    root.style.setProperty('--neutra', neutra);
    root.style.setProperty('--gradient', gradient);
    root.style.setProperty('--corBlock', corBlock);

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
function filtSelect() {
    const options = document.querySelectorAll('option');
    options.forEach((elemento) => {
        if (elemento.selected) {
            elemento.style.display = "none"
        } else {
            elemento.style.display = "block"
        }
    })
}

async function conectaTemasECores() {
    try {
        const api = await fetch("db.json");
        const apiJson = await api.json();
        apiJson.temas.forEach((tema) => {
            if (tema.nome === escolhaTema) {
                fundo = tema.fundo;
                linhas = tema.linhas;
                gradient = tema.gradient;
                corBlock = tema.corBlock;
            }
        })
        apiJson.cores.forEach((cor) => {
            if (cor.nome === escolhaCores) {
                corX = cor.corX;
                corO = cor.corO;
                neutra = cor.neutra;
            }
        })
    }
    catch (erro) {
        console.log("Eita \n" + erro);
        // setTimeout(window.location.reload(),1000);
    }
}

alternarMarcacoes();
marcacoes.addEventListener('click', alternarMarcacoes)
function alternarMarcacoes(){
    let corMarcacao;
    if (marcacoes.checked) {
        corMarcacao = "#8f8f8f9f"
        icone.style.color = linhas
    } else {
        corMarcacao = "#8f8f8f00"
        icone.style.color = corMarcacao
    }
    houses.forEach((casa) => {
        casa.style.color = corMarcacao
    })
    corTema()
}