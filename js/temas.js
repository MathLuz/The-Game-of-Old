const root = document.documentElement;
// cores.json fica na pasta do 9x9; o caminho sai da localização deste script,
// então funciona igual no menu e dentro de qualquer jogo.
const URL_CORES = new URL('../9x9/cores.json', document.currentScript.src);
const selectTema = document.getElementById("opcoesTemas");
const selectCores = document.getElementById("opcoesCores");
const marcacoes = document.querySelector('#marcacoes');
const icone = document.querySelector('.marcacoesCheck i');

const savedTema = localStorage.getItem('tema');
const savedCores = localStorage.getItem('cores');
const savedMarcacoes = localStorage.getItem('marcacoes');

if (savedTema) {
    selectTema.value = savedTema;
} else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    selectTema.value = "light";
}
if (savedCores) selectCores.value = savedCores;
if (marcacoes && savedMarcacoes === 'true') marcacoes.checked = true;

let escolhaTema = selectTema.value;
let escolhaCores = selectCores.value;

// Variáveis de tema (var para acesso global por cores.js e jogo.js)
var color, corX, corO, fundo, linhas, neutra, gradient, corBlock;

selectTema.addEventListener('change', () => {
    escolhaTema = selectTema.value;
    localStorage.setItem('tema', escolhaTema);
    aplicarTema();
});
selectCores.addEventListener('change', () => {
    escolhaCores = selectCores.value;
    localStorage.setItem('cores', escolhaCores);
    aplicarTema();
});
if (marcacoes) marcacoes.addEventListener('click', onMarcacoesClick);

aplicarTema();
atualizarIcone();

function onMarcacoesClick() {
    localStorage.setItem('marcacoes', marcacoes.checked);
    atualizarIcone();
}

function atualizarIcone() {
    if (icone && marcacoes) icone.style.color = marcacoes.checked ? "" : "#8f8f8f00";
}

async function aplicarTema() {
    try {
        const res = await fetch(URL_CORES);
        const data = await res.json();

        const tema = data.temas.find(t => t.nome === escolhaTema);
        const cores = data.cores.find(c => c.nome === escolhaCores);

        if (tema) {
            fundo = tema.fundo;
            linhas = tema.linhas;
            gradient = tema.gradient;
            corBlock = tema.corBlock;
            root.style.setProperty('--background', fundo);
            root.style.setProperty('--color', linhas);
            root.style.setProperty('--gradient', gradient);
            root.style.setProperty('--corBlock', corBlock);
        }
        if (cores) {
            corX = cores.corX;
            corO = cores.corO;
            neutra = cores.neutra;
            root.style.setProperty('--corX', corX);
            root.style.setProperty('--corO', corO);
            root.style.setProperty('--neutra', neutra);
        }

        // Hook para extensão de outros scripts (ex: cores.js atualiza peças do jogo)
        if (typeof aoAplicarTema === 'function') aoAplicarTema();
    } catch (e) {
        console.log(e);
    }
}
