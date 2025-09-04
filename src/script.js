// The Odin Project: Project Tic Tac Toe

const game = (() => {
    const createPlayer = (marker) => {
        const getMarker = () => marker;

        const takeTurn = (row, col) => {
            return gameBoard.updateCell(row, col, marker);
        };

        return {
            getMarker,
            takeTurn,
        };
    };

    const players = [createPlayer("X"), createPlayer("O")];
    let activePlayer = 0;

    const gameBoard = (() => {
        const board = [
            [null, null, null],
            [null, null, null],
            [null, null, null],
        ];

        const logBoard = () => {
            board.forEach((row) => {
                console.log(row);
            });
        };

        const updateCell = (row, col, value) => {
            let success;

            if (board[row][col] === null) {
                board[row][col] = value;
                success = true;
            } else {
                console.warn("This cell is already occupied. Please select an empty cell.");
                success = false;
            }

            logBoard();

            return success;
        };

        const isBoardFull = () => {
            return board.every((row) => row.every((cell) => cell !== null));
        };

        return {
            logBoard,
            updateCell,
            isBoardFull,
        };
    })();

    const playRoundRecursive = () => {
        if (gameBoard.isBoardFull()) {
            return;
        }

        const player = players[activePlayer];
        const playerMarker = player.getMarker();
        console.log(`${playerMarker}'s turn`);

        const row = prompt(`${playerMarker} Enter a row number [0-2]`, 0);
        const col = prompt(`${playerMarker} Enter a column number [0-2]`, 0);

        if (player.takeTurn(row, col)) {
            activePlayer = 1 - activePlayer; // toggle between 0-1
        }

        playRoundRecursive();
    };

    const play = () => {
        playRoundRecursive();
        console.log("Gameover");
    };

    return {
        play,
    };
})();
