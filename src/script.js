// The Odin Project: Project Tic Tac Toe

const gameBoard = (() => {
    //// BOARD STATE ////
    const _board = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
    ];

    const _result = {
        winner: null,
        cells: null,
    };

    //// WIN CHECKS ////
    function _checkRows() {
        for (let row of _board) {
            const value = row[0];

            if (value !== null) {
                if (row.every((cell) => cell === value)) {
                    const rowIndex = _board.indexOf(row);
                    _result.winner = value;
                    _result.cells = [`${rowIndex}/0`, `${rowIndex}/1`, `${rowIndex}/2`];
                    return true;
                }
            }
        }
    }

    function _checkCols() {
        for (let col = 0; col < 3; col++) {
            const value = _board[0][col];

            if (value !== null) {
                let match = true;

                for (let row of _board) {
                    if (row[col] !== value) {
                        match = false;
                    }
                }

                if (match) {
                    _result.winner = value;
                    _result.cells = [`0/${col}`, `1/${col}`, `2/${col}`];
                    return true;
                }
            }
        }
    }

    function _checkDiagTopLeft() {
        const topLeft = _board[0][0];
        if (topLeft === null) {
            return false;
        }

        let match = true;

        for (let i = 0; i <= 2; i++) {
            if (_board[i][i] !== topLeft) {
                match = false;
            }
        }

        if (match) {
            _result.winner = topLeft;
            _result.cells = ["0/0", "1/1", "2/2"];
            return true;
        }
    }

    function _checkDiagBottomLeft() {
        const bottomLeft = _board[2][0];
        if (bottomLeft === null) {
            return false;
        }

        let match = true;

        for (let i = 0; i <= 2; i++) {
            if (_board[2 - i][0 + i] !== bottomLeft) {
                match = false;
            }
        }

        if (match) {
            _result.winner = bottomLeft;
            _result.cells = ["2/0", "1/1", "0/2"];
            return true;
        }
    }

    //// BOARD INTERACTION ////
    function updateCell(row, col, value) {
        let success = false;

        if (_board[row][col] === null) {
            _board[row][col] = value;
            success = true;
        }

        return success;
    }

    function isBoardFull() {
        if (_board.every((row) => row.every((cell) => cell !== null))) {
            _result.winner = "tie";
            return true;
        }
        return false;
    }

    function checkForWinner() {
        return (
            _checkRows() || _checkCols() || _checkDiagTopLeft() || _checkDiagBottomLeft() || false
        );
    }

    function resetBoard() {
        _board.forEach((row) => {
            row.forEach((_, cellIndex) => {
                row[cellIndex] = null;
            });
        });
    }

    //// GETTERS ////
    function getBoard() {
        return _board;
    }

    function getResult() {
        return _result;
    }

    //// PUBLIC ////
    return {
        updateCell,
        isBoardFull,
        checkForWinner,
        resetBoard,
        getBoard,
        getResult,
    };
})();

const game = (() => {
    //// GAME STATE ////
    let _running = true;
    let _roundsPlayed = 0;
    const MIN_ROUNDS_TO_WIN = 5;

    //// PLAYERS ////
    let _players;
    let _activePlayer = 0;

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

    //// SETUP ////
    function init(p1, p2) {
        _players = [_createPlayer(p1, "X"), _createPlayer(p2, "O")];
    }

    function reset(winner) {
        _running = true;
        _roundsPlayed = 0;
        _players.forEach((player) => {
            if (player.getMarker() === winner) {
                _activePlayer = _players.indexOf(player);
            }
        });
    }

    //// GAMEPLAY ////
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

    //// GETTERS ////
    function getIsRunning() {
        return _running;
    }

    function getActivePlayer() {
        return _players[_activePlayer];
    }

    //// PUBLIC ////
    return {
        init,
        reset,
        playRound,
        getIsRunning,
        getActivePlayer,
    };
})();

const displayController = (() => {
    //// PARSE DOM ////
    const _gameBoard = gameBoard.getBoard();
    const _playBtn = document.querySelector("#play-btn");
    const _confirmBtn = document.querySelector("#confirm-btn");
    const _formDialog = document.querySelector(".form-dialog");
    const _mainContent = document.querySelector(".main > .content");
    const _buttonsContainer = document.querySelector(".buttons-container");
    const _pageHeading = document.querySelector(".page-heading");

    //// BIND EVENTS ////
    _playBtn.addEventListener("click", _showFormDialog);
    _confirmBtn.addEventListener("click", _initGame);

    //// EVENT HANDLERS ////
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

        _render(result);
    }

    function _resetGame() {
        game.reset(gameBoard.getResult().winner);
        gameBoard.resetBoard();

        const grid = document.querySelector(".gameboard-container");
        grid.remove();

        const newBtn = document.querySelector("#new-game-btn");
        newBtn.remove();

        _buildGrid();
    }

    function _newGame() {
        // show form dialog
        // reset everything
        // init new game
    }

    //// BUILD GUI ////
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

    function _buildNewGameButton() {
        const newBtn = document.createElement("button");
        newBtn.setAttribute("type", "button");
        newBtn.classList.add("button");
        newBtn.id = "new-game-btn";
        newBtn.textContent = "NEW GAME";
        newBtn.addEventListener("click", _newGame);

        _buttonsContainer.appendChild(newBtn);
    }

    //// RENDER GUI ////
    function _render(result) {
        _renderGameBoard();

        if (result) {
            _buildNewGameButton();

            if (result.winner === "tie") {
                _pageHeading.textContent = "It's a tie!";
            } else {
                _pageHeading.textContent = `${result.winner} wins!`;
                result.cells.forEach((cell) => {
                    const [row, col] = cell.split("/");
                    const target = document.querySelector(`[data-cell="${row}/${col}"]`);
                    target.classList.add("winning-cell");
                });
            }
            return;
        }

        _pageHeading.textContent = `${game.getActivePlayer().getMarker()}'s turn`;
    }

    function _renderGameBoard() {
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
