# Jogos da velha

## The Game of Old

### `Regras do jogo`
2 jogadores locais ou você contra o bot (Fácil, Médio, Difícil ou Impossível), jogando de X ou de O;<br>
O tabuleiro é composto por 9 campos com 9 casas em cada, cada campo um jogo da velha;<br>
A posição da casa jogada é relativa ao campo que o outro jogador terá que jogar;<br>
Por exemplo, se o jogador 1 jogar na casa superior direita do campo central, o jogador 2 terá que jogar no campo superior direito;<br>
O campo completo ou que possui um vencedor é bloqueado e finalizado, caso seja o que deverá ser jogado, todos os outros não finalizados, ficaram livres;<br>
Ganha o jogo quem traçar uma reta de 3 campos, ganha o campo quem traçar uma reta de 3 casas.
### Boa sorte!
### [`Jogar`](https://the-game-of-old.vercel.app/)

---

## Clássico

### `Regras do jogo`
2 jogadores locais ou você contra o bot (Fácil, Médio, Difícil ou Impossível), jogando de X ou de O;<br>
Jogo da velha 3x3 tradicional;<br>
Vence quem completar uma linha, coluna ou diagonal com 3 peças;<br>
Ao vencer, o tabuleiro fica bloqueado exibindo o resultado final — use o botão ↻ para reiniciar quando quiser.<br>
Empate quando todas as casas forem preenchidas sem vencedor.
### Boa sorte!

---

## Infinito

### `Regras do jogo`
2 jogadores locais ou você contra o bot (Fácil, Médio, Difícil ou Impossível), jogando de X ou de O;<br>
Jogo da velha 3x3 sem empate possível;<br>
Cada jogador pode ter no máximo 3 peças no tabuleiro ao mesmo tempo;<br>
Ao colocar a 4ª peça, a mais antiga desaparece automaticamente;<br>
A peça que irá sumir na próxima jogada fica translúcida como aviso;<br>
A peça que desaparece não conta para formar uma linha — a vitória precisa ser formada pelas peças que permanecem no tabuleiro.<br>
Vence quem completar uma linha, coluna ou diagonal.
### Boa sorte!

---

## Contra o bot

Os bots não usam IA/LLM: são algoritmos clássicos que rodam no próprio navegador (funcionam offline e respondem na hora).<br>
Cada modo tem um **motor de regras puro** (`js/motor.js`), usado tanto pela tela quanto pelo bot, então os dois seguem exatamente as mesmas regras.

| Modo | Algoritmo | Impossível |
|---|---|---|
| Clássico | Minimax completo | Imbatível (no máximo, empate) |
| Infinito | Análise retrógrada: resolve todas as ~116 mil posições possíveis | Perfeito: só dá para vencer jogando de X sem errar nada (o X tem vitória forçada começando numa borda!) |
| The Game of Old (9x9) | MCTS (Monte Carlo Tree Search) num Web Worker | Pensa ~5s por jogada (muito forte, mas não imbatível) |

No Clássico e no Infinito:
- **Fácil** e **Médio** às vezes jogam qualquer coisa (até deixam você ganhar na hora);
- **Difícil** joga a melhor jogada quase sempre e nunca deixa passar uma vitória ou uma ameaça direta, mas de vez em quando cai numa armadilha (garfo): dá para vencer, desde que você planeje;
- **Impossível** nunca erra.

No 9x9 os níveis mudam o tempo que o bot pensa (0,3s, 0,9s, 2s e 5s).

### Testes
```
node --test testes/motores.test.js
```
