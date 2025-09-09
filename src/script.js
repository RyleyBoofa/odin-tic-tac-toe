// The Odin Project: Project Tic Tac Toe

const gameBoard = (() => {
    const _board = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
    ];

    let _result = null;

    function _logBoard() {
        _board.forEach((row) => {
            console.log(row);
        });
    }

    function _checkRows() {
        for (let row of _board) {
            const value = row[0];
            if (value === null) {
                return false;
            } else if (row.every((cell) => cell === value)) {
                _result = {
                    winner: value,
                    cells: `row:${_board.indexOf(row)}`,
                };
                return true;
            }
        }
        return false;
    }

    function _checkCols() {
        for (let col = 0; col < 3; col++) {
            const value = _board[0][col];
            if (value === null) {
                return false;
            } else {
                let match = true;
                for (let row of _board) {
                    if (row[col] !== value) {
                        match = false;
                    }
                }
                if (match) {
                    _result = {
                        winner: value,
                        cells: `col:${col}`,
                    };
                    return true;
                }
            }
        }
        return false;
    }

    function _checkDiags() {
        // top-left to bottom-right
        const topLeft = _board[0][0];
        if (topLeft === null) {
            return false;
        } else {
            let match = true;
            for (let i = 0; i <= 2; i++) {
                if (_board[i][i] !== topLeft) {
                    match = false;
                }
            }
            if (match) {
                _result = {
                    winner: topLeft,
                    cells: "diag:TL",
                };
                return true;
            }
        }

        // bottom-left to top-right
        const bottomLeft = _board[2][0];
        if (bottomLeft === null) {
            return false;
        } else {
            match = true;
            for (let i = 0; i <= 2; i++) {
                if (_board[2 - i][0 + i] !== bottomLeft) {
                    match = false;
                }
            }
            if (match) {
                _result = {
                    winner: bottomLeft,
                    cells: "diag:BL",
                };
                return true;
            }
        }

        return false;
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

        return success;
    }

    function isBoardFull() {
        if (_board.every((row) => row.every((cell) => cell !== null))) {
            _result = {
                winner: "tie",
            };
            return true;
        }
        return false;
    }

    function checkForWinner() {
        return _checkRows() || _checkCols() || _checkDiags() || false;
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

    function getResult() {
        return _result;
    }

    return {
        updateCell,
        isBoardFull,
        checkForWinner,
        getBoard,
        resetBoard,
        getResult,
    };
})();

const game = (() => {
    let _players;
    let _activePlayer = 0;

    let _roundsPlayed = 0;
    const MIN_ROUNDS_TO_WIN = 5;

    let _running = true;

    function _createPlayer(name, marker) {
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

    function init(p1, p2) {
        _players = [_createPlayer(p1, "X"), _createPlayer(p2, "O")];
    }

    function playRound(row, col) {
        if (_players[_activePlayer].takeTurn(row, col)) {
            _activePlayer = 1 - _activePlayer; // toggle between 0-1
            _roundsPlayed++;
        }

        if (_roundsPlayed >= MIN_ROUNDS_TO_WIN) {
            if (gameBoard.checkForWinner() || gameBoard.isBoardFull()) {
                _running = false;
                return gameBoard.getResult();
            }
        }
    }

    function getIsRunning() {
        return _running;
    }

    function getActivePlayer() {
        return _players[_activePlayer];
    }

    return {
        init,
        playRound,
        getIsRunning,
        getActivePlayer,
    };
})();

const displayController = (() => {
    const _gameBoard = gameBoard.getBoard();
    const _playBtn = document.querySelector("#play-btn");
    const _confirmBtn = document.querySelector("#confirm-btn");
    const _formDialog = document.querySelector(".form-dialog");
    const _mainContent = document.querySelector(".main > .content");
    const _buttonsContainer = document.querySelector(".buttons-container");
    const _pageHeading = document.querySelector(".page-heading");

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

        _pageHeading.textContent = `${game.getActivePlayer().getMarker()}'s turn`;
    }

    function _updateGridCell(event) {
        if (!game.getIsRunning()) {
            return;
        }
        const target = event.target;
        const [row, col] = target.getAttribute("data-cell").split("/");
        const result = game.playRound(row, col);
        _renderBoard(result);
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

    function _renderBoard(result) {
        if (result) {
            console.log(result);

            if (result.winner === "tie") {
                _pageHeading.textContent = "It's a tie!";
            } else {
                _pageHeading.textContent = `${result.winner} wins!`;
            }
        } else {
            _pageHeading.textContent = `${game.getActivePlayer().getMarker()}'s turn`;
        }

        _gameBoard.forEach((row, rowIndex) => {
            row.forEach((cell, cellIndex) => {
                if (cell !== null) {
                    const target = document.querySelector(`[data-cell="${rowIndex}/${cellIndex}"]`);
                    target.textContent = cell;
                }
            });
        });
    }
})();
