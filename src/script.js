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

    function resetBoard() {
        _board.forEach((row) => {
            row.forEach((_, cellIndex) => {
                row[cellIndex] = null;
            });
        });
        _logBoard();
    }

    return {
        updateCell,
        isBoardFull,
        checkForWinner,
        getBoard,
        resetBoard,
    };
})();

function createPlayer(name, marker) {
    function getName() {
        return name;
    }

    function getMarker() {
        return marker;
    }

    function takeTurn(row, col) {
        return gameBoard.updateCell(row, col, marker);
    }

    return {
        getName,
        getMarker,
        takeTurn,
    };
}

const game = (() => {
    let _players;
    let _activePlayer = 0;

    let _roundsPlayed = 0;
    const MIN_ROUNDS_TO_WIN = 5;

    function init(p1, p2) {
        _players = [createPlayer(p1, "X"), createPlayer(p2, "O")];
    }

    function playRound(row, col) {
        if (_players[_activePlayer].takeTurn(row, col)) {
            _activePlayer = 1 - _activePlayer; // toggle between 0-1
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
        init,
        playRound,
    };
})();

const displayController = (() => {
    const _gameBoard = gameBoard.getBoard();
    const _playBtn = document.querySelector("#play-btn");
    const _confirmBtn = document.querySelector("#confirm-btn");
    const _formDialog = document.querySelector(".form-dialog");
    const _mainContent = document.querySelector(".main > .content");
    const _buttonsContainer = document.querySelector(".buttons-container");

    _playBtn.addEventListener("click", _showFormDialog);
    _confirmBtn.addEventListener("click", _initGame);

    function _showFormDialog() {
        _formDialog.showModal();
    }

    function _initGame() {
        const p1 = document.querySelector("#p1-name").value;
        const p2 = document.querySelector("#p2-name").value;
        game.init(p1, p2);

        _buildGrid();
        _buildResetButton();

        _playBtn.remove();
        _formDialog.close();
    }

    function _updateGridCell(event) {
        const target = event.target;
        const [row, col] = target.getAttribute("data-cell").split("/");
        game.playRound(row, col);
    }

    function _resetGame() {
        gameBoard.resetBoard();
        const grid = document.querySelector(".gameboard-container");
        Array.from(grid.children).forEach((child) => {
            child.remove();
        });
        _buildGridCells(grid);
    }

    function _buildGrid() {
        const grid = document.createElement("div");
        grid.classList.add("gameboard-container");
        grid.addEventListener("click", _updateGridCell);
        _mainContent.appendChild(grid);
        _buildGridCells(grid);
    }

    function _buildGridCells(grid) {
        _gameBoard.forEach((row, rowIndex) => {
            row.forEach((_, cellIndex) => {
                const div = document.createElement("div");
                div.classList.add("gameboard-cell");
                div.setAttribute("data-cell", `${rowIndex}/${cellIndex}`);
                grid.appendChild(div);
            });
        });
    }

    function _buildResetButton() {
        const resetBtn = document.createElement("button");
        resetBtn.setAttribute("type", "button");
        resetBtn.classList.add("button");
        resetBtn.id = "reset-btn";
        resetBtn.textContent = "RESET";
        resetBtn.addEventListener("click", _resetGame);
        _buttonsContainer.appendChild(resetBtn);
    }

    function renderBoard() {
        _gameBoard.forEach((row, rowIndex) => {
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
