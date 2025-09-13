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
        const value = _board[0][0];
        if (value === null) {
            return false;
        }

        let match = true;

        for (let i = 1; i <= 2; i++) {
            if (_board[i][i] !== value) {
                match = false;
            }
        }

        if (match) {
            _result.winner = value;
            _result.cells = ["0/0", "1/1", "2/2"];
            return true;
        }
    }

    function _checkDiagBottomLeft() {
        const value = _board[2][0];
        if (value === null) {
            return false;
        }

        let match = true;

        for (let i = 1; i <= 2; i++) {
            if (_board[2 - i][0 + i] !== value) {
                match = false;
            }
        }

        if (match) {
            _result.winner = value;
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

    function reset() {
        _result.winner = null;
        _result.cells = null;
        _resetBoard();
    }

    function _resetBoard() {
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
        reset,
        getBoard,
        getResult,
    };
})();

const game = (() => {
    //// GAME STATE ////
    let _running;
    let _roundsPlayed;
    const MIN_ROUNDS_TO_WIN = 5;

    //// PLAYERS ////
    let _players;
    let _activePlayer;

    function _createPlayer(name, marker) {
        let _score = 0;

        function addScore() {
            _score++;
        }

        function getScore() {
            return _score;
        }

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
            addScore,
            getScore,
            getName,
            getMarker,
            takeTurn,
        };
    }

    //// SETUP ////
    function init(p1, p2) {
        _players = [_createPlayer(p1, "X"), _createPlayer(p2, "O")];
        reset();
    }

    function reset(winner) {
        _running = true;
        _roundsPlayed = 0;
        if (winner) {
            _activePlayer = _players.findIndex((player) => player.getMarker() === winner);
        } else {
            _activePlayer = 0;
        }
    }

    //// GAMEPLAY ////
    function playRound(row, col) {
        if (_players[_activePlayer].takeTurn(row, col)) {
            _activePlayer = 1 - _activePlayer; // toggle between 0-1
            _roundsPlayed++;
        }

        if (_roundsPlayed >= MIN_ROUNDS_TO_WIN) {
            if (gameBoard.checkForWinner() || gameBoard.isBoardFull()) {
                const result = gameBoard.getResult();
                if (result.winner !== "tie") {
                    getPlayer(result.winner).addScore();
                }
                _running = false;
                return result;
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

    function getPlayer(marker) {
        return _players.find((player) => player.getMarker() === marker);
    }

    function getScores() {
        const p1Score = _players[0].getScore();
        const p2Score = _players[1].getScore();
        if (p1Score === p2Score) {
            return `It's all tied up! ${p1Score}-${p2Score}`;
        } else {
            const sorted = _players.toSorted((a, b) => b.getScore() - a.getScore());
            return `${sorted[0].getName()} is winning ${sorted[0].getScore()}-${sorted[1].getScore()}`;
        }
    }

    //// PUBLIC ////
    return {
        init,
        reset,
        playRound,
        getIsRunning,
        getActivePlayer,
        getPlayer,
        getScores,
    };
})();

const displayController = (() => {
    //// PARSE DOM ////
    const _confirmBtn = document.querySelector("#confirm-btn");
    const _formDialog = document.querySelector(".form-dialog");
    const _playerForms = document.querySelectorAll(".player-form");
    const _p1Input = document.querySelector("#p1-name");
    const _p2Input = document.querySelector("#p2-name");
    const _gridContainer = document.querySelector(".grid-container");
    const _buttonsContainer = document.querySelector(".buttons-container");
    const _pageHeading = document.querySelector(".page-heading");

    //// INIT GUI ////
    _showFormDialog();

    //// BIND EVENTS ////
    _confirmBtn.addEventListener("click", _initGame);

    //// EVENT HANDLERS ////
    function _initGame() {
        const p1 = _p1Input.value.trim();
        const p2 = _p2Input.value.trim();

        if (p1 === "" || p2 === "") {
            alert("Please fill in player names");
            return;
        }

        game.init(p1, p2);

        _buildGrid();
        _buildButton("reset-btn", "RESET", _resetGame);

        _formDialog.close();

        _renderHeading(`${game.getActivePlayer().getName()}'s turn`);
    }

    function _updateGridCell(event) {
        if (!game.getIsRunning()) {
            return;
        }

        const target = event.target;
        const [row, col] = target.getAttribute("data-cell").split("/");
        const result = game.playRound(row, col);
        target.classList.remove("clickable");

        _render(result);
    }

    function _resetGame() {
        game.reset(gameBoard.getResult().winner);
        gameBoard.reset();

        _clearGrid();

        const newBtn = document.querySelector("#new-game-btn");
        if (newBtn) {
            newBtn.remove();
        }

        _renderHeading(`${game.getActivePlayer().getName()}'s turn`);
    }

    function _newGame() {
        game.reset();
        gameBoard.reset();
        _resetGUI();
        _showFormDialog();
        _renderHeading();
    }

    //// GUI ////
    function _showFormDialog() {
        _formDialog.showModal();
        _playerForms.forEach((form) => {
            form.reset();
        });
    }

    function _buildGrid() {
        const grid = document.createElement("div");
        grid.classList.add("gameboard-container");
        grid.addEventListener("click", _updateGridCell);

        _gridContainer.appendChild(grid);

        _buildGridCells(grid);
    }

    function _buildGridCells(grid) {
        gameBoard.getBoard().forEach((row, rowIndex) => {
            row.forEach((_, cellIndex) => {
                const div = document.createElement("div");
                div.classList.add("gameboard-cell");
                div.classList.add("clickable");
                div.setAttribute("data-cell", `${rowIndex}/${cellIndex}`);
                grid.appendChild(div);
            });
        });
    }

    function _clearGrid() {
        const cells = document.querySelectorAll(".gameboard-cell");
        cells.forEach((cell) => {
            cell.textContent = "";
            cell.classList.remove("winning-cell");
            cell.classList.add("clickable");
        });
    }

    function _buildButton(id, text, handler) {
        const button = document.createElement("button");
        button.setAttribute("type", "button");
        button.classList.add("button");
        button.classList.add("clickable");

        button.id = id;
        button.textContent = text;
        button.addEventListener("click", handler);

        _buttonsContainer.appendChild(button);
    }

    function _resetGUI() {
        const grid = document.querySelector(".gameboard-container");
        grid.remove();

        const buttons = document.querySelectorAll(".buttons-container > button");
        buttons.forEach((button) => button.remove());
    }

    //// RENDER GUI ////
    function _render(result) {
        _renderGameBoard();

        if (result) {
            _renderHeading(game.getScores());
            _buildButton("new-game-btn", "NEW GAME", _newGame);

            if (result.winner !== "tie") {
                result.cells.forEach((cell) => {
                    const [row, col] = cell.split("/");
                    const target = document.querySelector(`[data-cell="${row}/${col}"]`);
                    target.classList.add("winning-cell");
                });
            }
        } else {
            _renderHeading(`${game.getActivePlayer().getName()}'s turn`);
        }
    }

    function _renderGameBoard() {
        gameBoard.getBoard().forEach((row, rowIndex) => {
            row.forEach((cell, cellIndex) => {
                if (cell !== null) {
                    const target = document.querySelector(`[data-cell="${rowIndex}/${cellIndex}"]`);
                    target.textContent = cell;
                }
            });
        });
    }

    function _renderHeading(text) {
        if (text) {
            _pageHeading.textContent = text;
        } else {
            _pageHeading.textContent = "Odin Tic Tac Toe";
        }
    }
})();
