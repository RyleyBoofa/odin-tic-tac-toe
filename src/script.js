// The Odin Project: Project Tic Tac Toe

const gameBoard = (() => {
    const _board = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
    ];

    function _logBoard() {
        _board.forEach((row) => {
            console.log(row);
        });
    }

    function _checkRows() {
        for (let row of _board) {
            const value = row[0];
            if (value === null) {
                return null;
            } else if (row.every((cell) => cell === value)) {
                return value;
            }
        }
        return null;
    }

    function _checkCols() {
        for (let col = 0; col < 3; col++) {
            const value = _board[0][col];
            if (value === null) {
                return null;
            } else {
                let match = true;
                for (let row of _board) {
                    if (row[col] !== value) {
                        match = false;
                    }
                }
                if (match) return value;
            }
        }
        return null;
    }

    function _checkDiags() {
        // top-left to bottom-right
        const topLeft = _board[0][0];
        if (topLeft === null) {
            return null;
        } else {
            let match = true;
            for (let i = 0; i <= 2; i++) {
                if (_board[i][i] !== topLeft) {
                    match = false;
                }
            }
            if (match) return topLeft;
        }

        // bottom-left to top-right
        const bottomLeft = _board[2][0];
        if (bottomLeft === null) {
            return null;
        } else {
            match = true;
            for (let i = 0; i <= 2; i++) {
                if (_board[2 - i][0 + i] !== bottomLeft) {
                    match = false;
                }
            }
            if (match) return bottomLeft;
        }

        return null;
    }

    function updateCell(row, col, value) {
        let success;

        if (_board[row][col] === null) {
            _board[row][col] = value;
            success = true;
        } else {
            console.warn("This cell is already occupied. Please select an empty cell.");
            success = false;
        }

        _logBoard();
        displayController.renderBoard();

        return success;
    }

    function isBoardFull() {
        return _board.every((row) => row.every((cell) => cell !== null));
    }

    function checkForWinner() {
        return _checkRows() || _checkCols() || _checkDiags() || null;
    }

    function getBoard() {
        return _board;
    }

    return {
        updateCell,
        isBoardFull,
        checkForWinner,
        getBoard,
    };
})();

function createPlayer(marker) {
    function getMarker() {
        return marker;
    }

    function takeTurn(row, col) {
        return gameBoard.updateCell(row, col, marker);
    }

    return {
        getMarker,
        takeTurn,
    };
}

const game = (() => {
    const _players = [createPlayer("X"), createPlayer("O")];
    let _activePlayer = 0;

    let _roundsPlayed = 0;
    const MIN_ROUNDS_TO_WIN = 5;

    function _playRoundRecursive() {
        if (gameBoard.isBoardFull()) {
            console.log("It's a tie");
            return;
        }

        if (_roundsPlayed >= MIN_ROUNDS_TO_WIN) {
            const winner = gameBoard.checkForWinner();
            if (winner !== null) {
                console.log(`Winner: ${winner}`);
                return;
            }
        }

        const player = _players[_activePlayer];
        const playerMarker = player.getMarker();
        console.log(`${playerMarker}'s turn`);

        const row = prompt(`${playerMarker} Enter a row number [0-2]`, 0);
        const col = prompt(`${playerMarker} Enter a column number [0-2]`, 0);

        if (player.takeTurn(row, col)) {
            _activePlayer = 1 - _activePlayer; // toggle between 0-1
            _roundsPlayed++;
        }

        _playRoundRecursive();
    }

    function play() {
        _playRoundRecursive();
        console.log("Gameover");
    }

    function playRound(row, col) {
        if (_players[_activePlayer].takeTurn(row, col)) {
            _activePlayer = 1 - _activePlayer;
            _roundsPlayed++;
        }

        if (gameBoard.isBoardFull()) {
            console.log("It's a tie");
            return;
        }

        if (_roundsPlayed >= MIN_ROUNDS_TO_WIN) {
            const winner = gameBoard.checkForWinner();
            if (winner !== null) {
                console.log(`Winner: ${winner}`);
                return;
            }
        }
    }

    return {
        play,
        playRound,
    };
})();

const displayController = (() => {
    const _board = gameBoard.getBoard();
    const _grid = document.querySelector(".gameboard-container");

    _grid.addEventListener("click", _handleClickEvent);

    function _handleClickEvent(event) {
        const target = event.target;
        const [row, col] = target.getAttribute("data-cell").split("/");
        game.playRound(row, col);
    }

    function _resetGrid() {
        const children = _grid.querySelectorAll("*");
        children.forEach((child) => {
            child.remove();
        });
        _board.forEach((row, rowIndex) => {
            row.forEach((cell, cellIndex) => {
                const div = document.createElement("div");
                div.classList.add("gameboard-cell");
                div.setAttribute("data-cell", `${rowIndex}/${cellIndex}`);
                _grid.appendChild(div);
            });
        });
    }
    _resetGrid();

    function renderBoard() {
        _board.forEach((row, rowIndex) => {
            row.forEach((cell, cellIndex) => {
                if (cell !== null) {
                    const target = document.querySelector(`[data-cell="${rowIndex}/${cellIndex}"]`);
                    target.textContent = cell;
                }
            });
        });
    }

    return {
        renderBoard,
    };
})();
