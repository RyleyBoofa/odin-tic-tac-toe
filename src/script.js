// The Odin Project: Project Tic Tac Toe

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
        if (board[row][col] === null) {
            board[row][col] = value;
        } else {
            console.warn("This cell is already occupied. Please select an empty cell.");
        }
        logBoard();
    };

    return {
        logBoard,
        updateCell,
    };
})();
