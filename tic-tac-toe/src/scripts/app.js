// JavaScript code for Tic-Tac-Toe game logic with a 3-piece limit per player

const cells = document.querySelectorAll('.cell');
const resetButton = document.getElementById('reset-button');

let gameActive = true;
let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];
let playerPieces = { X: [], O: [] }; // Track positions of each player's pieces

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function handleCellClick(clickedCell, clickedCellIndex) {
    if (gameState[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    // Add the current player's piece to the board
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    playerPieces[currentPlayer].push(clickedCellIndex);

    // Remove the oldest piece if the player exceeds the 3-piece limit
    if (playerPieces[currentPlayer].length > 3) {
        const oldestPieceIndex = playerPieces[currentPlayer].shift();
        gameState[oldestPieceIndex] = '';
        cells[oldestPieceIndex].textContent = '';
    }

    checkResult();
}

function checkResult() {
    let roundWon = false;

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') {
            continue;
        }
        if (gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        alert(`Player ${currentPlayer} has won!`);
        gameActive = false;
        return;
    }

    if (!gameState.includes('')) {
        alert('It\'s a draw!');
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

function handleResetGame() {
    gameActive = true;
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    playerPieces = { X: [], O: [] };

    cells.forEach(cell => {
        cell.textContent = '';
    });
}

cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(cell, index));
});

resetButton.addEventListener('click', handleResetGame);