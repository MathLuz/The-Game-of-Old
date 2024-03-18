// cores originais
var corJU = '#ff7f00';
var corJD = '#0ff';
var fundo = '#1f1f22';
var linhas = '#fff';
var neutra = '#400070';

var vez = 'X';
// var escolhaTema = document.getElementById("opcoesTemas");
var escolhaTema = "ori";
var tabelaWin = '';
var color = '';
var jaVenceu = false;
var root = document.documentElement;
var classOri = document.getElementsByClassName('modific');
var houses = document.querySelectorAll('.tabuleiro div div');
var win = [
    document.getElementById('campoUm'),
    document.getElementById('campoDo'),
    document.getElementById('campoTr'),
    document.getElementById('campoQu'),
    document.getElementById('campoCi'),
    document.getElementById('campoSe'),
    document.getElementById('campoSt'),
    document.getElementById('campoOi'),
    document.getElementById('campoNo'),
];
var tabuleiro = [
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],

    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],

    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '']
];
var cheio = [0, 0, 0, 0, 0, 0, 0, 0, 0];

corTema();
function jogada(elemento) {

    var conteudo = elemento.innerHTML;
    if (conteudo == 'X' || conteudo == 'O') {
        // Tag inválida, nada acontece
    } else {
        elemento.innerHTML = vez;

        atualizar(elemento);

        campoCheio();

        modificacoes(elemento);

        vencedor();

        block(elemento);

        winner();

        velha();

        vez == 'X' ? vez = 'O' : vez = 'X'; // Muda o jogador a cada jogada
    }
}
// Muda a cor e mostra o próximo a jogar
function modificacoes(elemento) {
    // Mudar a cor conforme de quem é a vez
    color = vez == 'X' ? corJU : corJD;

    // Mostra quem é o próximo
    let jogadorU = document.getElementsByClassName('jogadorU')[0];
    let jogadorD = document.getElementsByClassName('jogadorD')[0];
    let corBorda = '#7f7f7f55';
    if (vez == 'O') {
        jogadorU.style.backgroundColor = corBorda;
        jogadorD.style.backgroundColor = '';
    } else {
        jogadorD.style.backgroundColor = corBorda;
        jogadorU.style.backgroundColor = '';
    }
    // Coloca cor no que jogou
    elemento.style.color = color;
}
// Função chamada para atualizar o estado do tabuleiro com base na jogada realizada
function atualizar(elemento) {
    // Obtém a posição do elemento no formato 'a1', 'b2', etc.
    let posicao = elemento.getAttribute('data-pos');

    // Converte a letra da coluna para um índice numérico (0 para 'a', 1 para 'b', etc.)
    let coluna = posicao.charCodeAt(0) - 'a'.charCodeAt(0);

    // Obtém o número da linha (subtraindo 1, pois os índices começam em 0 no JavaScript)
    let linha = parseInt(posicao[1]) - 1;

    // Atualiza o estado do tabuleiro na posição correspondente com o valor da vez atual (X ou O)
    tabuleiro[linha][coluna] = vez;
}
// Confere o campo vencedor
function vencedor() {
    for (let i = 0; i < 9; i++) {
        // Verificar verticais
        if (tabuleiro[i][1] != '' && tabuleiro[i][0] == vez && tabuleiro[i][1] == vez && tabuleiro[i][2] == vez) {
            tabelaWin = (i >= 0 && i <= 2) ? win[0] : (i >= 3 && i <= 5) ? win[3] : win[6];
            tabelaWin.innerHTML = vez;
            tabelaWin.style.cssText = 'display: flex; color:' + color;
        }
        if (tabuleiro[i][4] != '' && tabuleiro[i][3] == vez && tabuleiro[i][4] == vez && tabuleiro[i][5] == vez) {
            tabelaWin = (i >= 0 && i <= 2) ? win[1] : (i >= 3 && i <= 5) ? win[4] : win[7];
            tabelaWin.innerHTML = vez;
            tabelaWin.style.cssText = 'display: flex; color:' + color;
        }
        if (tabuleiro[i][7] != '' && tabuleiro[i][6] == vez && tabuleiro[i][7] == vez && tabuleiro[i][8] == vez) {
            tabelaWin = (i >= 0 && i <= 2) ? win[2] : (i >= 3 && i <= 5) ? win[5] : win[8];
            tabelaWin.innerHTML = vez;
            tabelaWin.style.cssText = 'display: flex; color:' + color;
        }

        // Verificar horizontais
        if (tabuleiro[1][i] != '' & tabuleiro[0][i] == vez & tabuleiro[1][i] == vez & tabuleiro[2][i] == vez) {
            tabelaWin = (i >= 0 && i <= 2) ? win[0] : (i >= 3 && i <= 5) ? win[1] : win[2];
            tabelaWin.innerHTML = vez;
            tabelaWin.style.cssText = 'display: flex; color:' + color;
        }
        if (tabuleiro[4][i] != '' & tabuleiro[3][i] == vez & tabuleiro[4][i] == vez & tabuleiro[5][i] == vez) {
            tabelaWin = (i >= 0 && i <= 2) ? win[3] : (i >= 3 && i <= 5) ? win[4] : win[5];
            tabelaWin.innerHTML = vez;
            tabelaWin.style.cssText = 'display: flex; color:' + color;
        }
        if (tabuleiro[7][i] != '' & tabuleiro[6][i] == vez & tabuleiro[7][i] == vez & tabuleiro[8][i] == vez) {
            tabelaWin = (i >= 0 && i <= 2) ? win[6] : (i >= 3 && i <= 5) ? win[7] : win[8];
            tabelaWin.innerHTML = vez;
            tabelaWin.style.cssText = 'display: flex; color:' + color;
        }
    }
    // Vencedor diagonais
    for (let i = 1; i <= 7; i += 3) {

        let j = i == 1 ? 4 : i == 4 ? 7 : 1;
        let k = i == 1 ? 7 : i == 4 ? 1 : 4;
        let ia = i - 1;
        let id = i + 1;
        let ja = j - 1;
        let jd = j + 1;
        let ka = k - 1;
        let kd = k + 1;

        if (
            // Verifica [1][1] / [4][4] / [7][7]
            (tabuleiro[i][i] != '' && tabuleiro[ia][ia] == vez && tabuleiro[i][i] == vez && tabuleiro[id][id] == vez) ||
            (tabuleiro[i][i] != '' && tabuleiro[id][ia] == vez && tabuleiro[i][i] == vez && tabuleiro[ia][id] == vez)
        ) {
            tabelaWin = (i == 1) ? win[0] : (i == 4) ? win[4] : win[8];
            tabelaWin.innerHTML = vez;
            tabelaWin.style.cssText = 'display: flex; color:' + color;
        }
        if (
            // Verifica [1][4] / [4][7] / [7][1]
            (tabuleiro[i][j] != '' && tabuleiro[ia][ja] == vez && tabuleiro[i][j] == vez && tabuleiro[id][jd] == vez) ||
            (tabuleiro[i][j] != '' && tabuleiro[id][ja] == vez && tabuleiro[i][j] == vez && tabuleiro[ia][jd] == vez)
        ) {
            tabelaWin = (i == 1) ? win[1] : (i == 4) ? win[5] : win[6];
            tabelaWin.innerHTML = vez;
            tabelaWin.style.cssText = 'display: flex; color:' + color;
        }
        if (
            // Verifica [1][7] / [4][1] / [7][4]
            (tabuleiro[i][k] != '' && tabuleiro[ia][ka] == vez && tabuleiro[i][k] == vez && tabuleiro[id][kd] == vez) ||
            (tabuleiro[i][k] != '' && tabuleiro[id][ka] == vez && tabuleiro[i][k] == vez && tabuleiro[ia][kd] == vez)
        ) {
            tabelaWin = (i == 1) ? win[2] : (i == 4) ? win[3] : win[7];
            tabelaWin.innerHTML = vez;
            tabelaWin.style.cssText = 'display: flex; color:' + color;
        }
    };
}
// Bloqueia os campos em cada jogada
function block(elemento) {
    let uc = elemento.getAttribute('data-pos'); // Verifica o último campo clicado
    let veri = ''; // Para verificar se alguém já ganhou no campo
    let ultCampo = 0
    for (let i = 1; i <= 3; i++) {
        let j = i + 3;
        let k = i + 6;
        if (uc == 'a' + i || uc == 'a' + j || uc == 'a' + k || uc == 'd' + i || uc == 'd' + j || uc == 'd' + k || uc == 'g' + i || uc == 'g' + j || uc == 'g' + k) {
            for (let i = 0; i <= 8; i++) { classOri[i].style.display = 'flex'; }
            if (i == 1) {
                win[0].style.display = 'none';
                veri = win[0].innerHTML;
                ultCampo = 0;
            } else if (i == 2) {
                win[3].style.display = 'none';
                veri = win[3].innerHTML;
                ultCampo = 1;
            } else {
                win[6].style.display = 'none';
                veri = win[6].innerHTML;
                ultCampo = 2;
            }
        } else if (uc == 'b' + i || uc == 'b' + j || uc == 'b' + k || uc == 'e' + i || uc == 'e' + j || uc == 'e' + k || uc == 'h' + i || uc == 'h' + j || uc == 'h' + k) {
            for (let i = 0; i <= 8; i++) { classOri[i].style.display = 'flex'; }
            if (i == 1) {
                win[1].style.display = 'none';
                veri = win[1].innerHTML;
                ultCampo = 3;
            } else if (i == 2) {
                win[4].style.display = 'none';
                veri = win[4].innerHTML;
                ultCampo = 4;
            } else {
                win[7].style.display = 'none';
                veri = win[7].innerHTML;
                ultCampo = 5;
            }
        } else if (uc == 'c' + i || uc == 'c' + j || uc == 'c' + k || uc == 'f' + i || uc == 'f' + j || uc == 'f' + k || uc == 'i' + i || uc == 'i' + j || uc == 'i' + k) {
            for (let i = 0; i <= 8; i++) { classOri[i].style.display = 'flex'; }
            if (i == 1) {
                win[2].style.display = 'none';
                veri = win[2].innerHTML;
                ultCampo = 6;
            } else if (i == 2) {
                win[5].style.display = 'none';
                veri = win[5].innerHTML;
                ultCampo = 7;
            } else {
                win[8].style.display = 'none';
                veri = win[8].innerHTML;
                ultCampo = 8;
            }
        }
    }
    for (let i = 0; i <= 8; i++) {

        if (veri != '' || cheio[ultCampo] == 9) {
            classOri[i].style.display = 'none';
        }

        if (classOri[i].innerHTML != '' || cheio[i] == 9) {
            win[i].style.display = 'flex';
        }
    }
}
// Verifica se alguém venceu o jogo
function winner() {
    // Horizontais
    for (let i = 0; i <= 6; i += 3) {
        let j = i + 1;
        let k = i + 2;
        if (classOri[i].innerHTML != '' && classOri[i].innerHTML == vez && classOri[j].innerHTML == vez && classOri[k].innerHTML == vez) {
            venceu();
        }
    }
    // Verticais 
    for (let i = 0; i <= 2; i += 1) {
        let j = i + 3;
        let k = i + 6;
        if (classOri[i].innerHTML != '' && classOri[i].innerHTML == vez && classOri[j].innerHTML == vez && classOri[k].innerHTML == vez) {
            venceu();
        }
    }
    // Diagonais
    if (classOri[4].innerHTML != '' && classOri[0].innerHTML == vez && classOri[4].innerHTML == vez && classOri[8].innerHTML == vez) {
        venceu();
    }
    if (classOri[4].innerHTML != '' && classOri[6].innerHTML == vez && classOri[4].innerHTML == vez && classOri[2].innerHTML == vez) {
        venceu();
    }
}
// Verifica os campos que estão cheios para serem bloqueados em block()
function campoCheio() {
    for (let i = 0; i <= 8; i++) {
        cheio[i] = 0;
    }
    console.clear();
    for (let i = 0; i <= 8; i++) {
        for (let j = 0; j <= 8; j++) {
            console.clear();
            // Primeiro campo
            if (i <= 2 && j <= 2 && tabuleiro[i][j] != '') { cheio[0]++ }
            console.log('1º campo ' + cheio[0]);
            // Segundo campo
            if (i <= 2 && j >= 3 && j <= 5 && tabuleiro[i][j] != '') { cheio[1]++ }
            console.log('2º campo ' + cheio[1]);
            // Terceiro campo
            if (i <= 2 && j >= 6 && tabuleiro[i][j] != '') { cheio[2]++ }
            console.log('3º campo ' + cheio[2]);

            // Quarto campo
            if (i >= 3 && i <= 5 && j <= 2 && tabuleiro[i][j] != '') { cheio[3]++ }
            console.log('4º campo ' + cheio[3]);
            // Quinto campo
            if (i >= 3 && i <= 5 && j >= 3 && j <= 5 && tabuleiro[i][j] != '') { cheio[4]++ }
            console.log('5º campo ' + cheio[4]);
            // Sexto campo
            if (i >= 3 && i <= 5 && j >= 6 && tabuleiro[i][j] != '') { cheio[5]++ }
            console.log('6º campo ' + cheio[5]);

            // Sétimo campo
            if (i >= 6 && j <= 2 && tabuleiro[i][j] != '') { cheio[6]++ }
            console.log('7º campo ' + cheio[6]);
            // Oitavo campo
            if (i >= 6 && j >= 3 && j <= 5 && tabuleiro[i][j] != '') { cheio[7]++ }
            console.log('8º campo ' + cheio[7]);
            // Nono campo
            if (i >= 6 && j >= 6 && tabuleiro[i][j] != '') { cheio[8]++ }
            console.log('9º campo ' + cheio[8]);
        }
    }
}
// O que acontece quando alguém ganha
function venceu() {
    Swal.fire({
        title: vez,
        width: 450,
        text: " É O VENCEDOR!!",
        color: vez == 'X' ? corJU : corJD,
        background: fundo,
        confirmButtonColor: vez == 'X' ? corJU : corJD,
        confirmButtonText: "GG",
        // timer: 6000,
        // showConfirmButton: false,
    });
    for (let i = 0; i <= 8; i++) {
        win[i].style.display = 'flex';
    }
    jaVenceu = true;
}
// Função para contar as tags com a classe e display flex
function velha() {
    var contaFlex = document.getElementsByClassName('modific');
    var contagem = 0;

    // VErifica cada classe
    for (let i = 0; i < contaFlex.length; i++) {
        let estilo = window.getComputedStyle(contaFlex[i]);
        // Verifica se a class possui display flex
        if (estilo.display == 'flex') { contagem++; }
    }

    console.log('Campos Bloquados: ' + contagem);

    if (contagem >= 9 && jaVenceu == false) {
        Swal.fire({
            width: 450,
            title: "Deu Velha!!",
            text: "Empatou, joguem novamente",
            color: linhas,
            background: fundo,
            confirmButtonColor: neutra,
            confirmButtonText: "GG",
            // timer: 6000,
            // showConfirmButton: false
        });
    }
}
// Mudar tema
function corTema() {
    if (escolhaTema == "ori") {
        corJU = '#ff7f00';
        corJD = '#0ff';
        fundo = '#1f1f22';
        linhas = '#fff';
        neutra = '#400070';
    }
    if (escolhaTema == "white") {
        corJU = '#ff7f00';
        corJD = '#0079ff';
        fundo = '#ddd';
        linhas = '#222';
        neutra = '#00f';
    }

    root.style.setProperty('--background', fundo);
    root.style.setProperty('--color', linhas);
    root.style.setProperty('--corJU', corJU);
    root.style.setProperty('--corJD', corJD);
    houses.forEach(function (div) {
        div.style.backgroundColor = fundo;
        if (div.innerHTML === "X") {
            div.style.color = corJU;
        } else if (div.innerHTML === "O") {
            div.style.color = corJD;
        }
    });
}