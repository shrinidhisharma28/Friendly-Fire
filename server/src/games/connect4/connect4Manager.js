
const ROWS = 6;
const COLUMNS = 7;
const CONNECT_LENGTH = 4;

// --------------------------------------------------
// GAME INITIALIZATION
// --------------------------------------------------

function initializeGame(room) {
    if (!room || !Array.isArray(room.players) || room.players.length !== 2) {
        throw new Error("Connect 4 requires exactly two players");
    }

    return {
        board: Array.from(
            { length: ROWS },
            () => Array(COLUMNS).fill(null)
        ),

        currentTurn: "R",

        winner: null,

        draw: false,

        symbols: {
            [room.players[0].socketId]: "R",
            [room.players[1].socketId]: "Y"
        }
    };
}

// --------------------------------------------------
// GAME LIFECYCLE VALIDATION
// --------------------------------------------------

function canStartGame(room) {
    if (room.players.length !== 2) {
        return {
            success: false,
            message: "Connect 4 requires exactly two players"
        };
    }

    return { success: true };
}

function canRestartGame(room) {
    if (room.players.length !== 2) {
        return {
            success: false,
            message: "Both players must be present to restart"
        };
    }

    const game = room.gameState;

    if (!game || (!game.winner && !game.draw)) {
        return {
            success: false,
            message: "Game must be finished before restarting"
        };
    }

    return { success: true };
}

// --------------------------------------------------
// GAME STATE VALIDATION
// --------------------------------------------------

function validateGameState(game) {
    if (!game || typeof game !== "object") {
        return false;
    }

    if (!Array.isArray(game.board) || game.board.length !== ROWS) {
        return false;
    }

    for (const row of game.board) {
        if (
            !Array.isArray(row) ||
            row.length !== COLUMNS ||
            row.some(cell => cell !== null && cell !== "R" && cell !== "Y")
        ) {
            return false;
        }
    }

    if (!["R", "Y"].includes(game.currentTurn)) {
        return false;
    }

    if (!game.symbols || typeof game.symbols !== "object") {
        return false;
    }

    return true;
}

// --------------------------------------------------
// WINNER DETECTION
// --------------------------------------------------

function checkWinner(board, row, column, symbol) {
    const directions = [
        [0, 1],   // Horizontal
        [1, 0],   // Vertical
        [1, 1],   // Diagonal \
        [1, -1]   // Diagonal /
    ];

    for (const [dr, dc] of directions) {
        let count = 1;

        // Check in the positive direction.
        let r = row + dr;
        let c = column + dc;

        while (
            r >= 0 &&
            r < ROWS &&
            c >= 0 &&
            c < COLUMNS &&
            board[r][c] === symbol
        ) {
            count++;
            r += dr;
            c += dc;
        }

        // Check in the negative direction.
        r = row - dr;
        c = column - dc;

        while (
            r >= 0 &&
            r < ROWS &&
            c >= 0 &&
            c < COLUMNS &&
            board[r][c] === symbol
        ) {
            count++;
            r -= dr;
            c -= dc;
        }

        if (count >= CONNECT_LENGTH) {
            return true;
        }
    }

    return false;
}

// --------------------------------------------------
// MAKE MOVE
// --------------------------------------------------

function makeMove(room, socketId, payload) {
    if (!room || !Array.isArray(room.players)) {
        return {
            success: false,
            message: "Invalid room"
        };
    }

    if (room.status !== "playing") {
        return {
            success: false,
            message: "Game is not currently running"
        };
    }

    const game = room.gameState;

    if (!validateGameState(game)) {
        return {
            success: false,
            message: "Invalid game state"
        };
    }

    if (!room.players.some(player => player.socketId === socketId)) {
        return {
            success: false,
            message: "You are not a player in this room"
        };
    }

    if (
        !payload ||
        typeof payload !== "object" ||
        Array.isArray(payload)
    ) {
        return {
            success: false,
            message: "Invalid move payload"
        };
    }

    const { column } = payload;

    // Validate column index.
    if (
        !Number.isInteger(column) ||
        column < 0 ||
        column >= COLUMNS
    ) {
        return {
            success: false,
            message: "Invalid column"
        };
    }

    // Prevent moves after the game finishes.
    if (game.winner || game.draw) {
        return {
            success: false,
            message: "Game has already finished"
        };
    }

    const symbol = game.symbols[socketId];

    if (symbol !== "R" && symbol !== "Y") {
        return {
            success: false,
            message: "Player symbol not found"
        };
    }

    // Validate player turn.
    if (symbol !== game.currentTurn) {
        return {
            success: false,
            message: "Not your turn"
        };
    }

    // Find the lowest available row in the selected column.
    let targetRow = -1;

    for (let row = ROWS - 1; row >= 0; row--) {
        if (game.board[row][column] === null) {
            targetRow = row;
            break;
        }
    }

    if (targetRow === -1) {
        return {
            success: false,
            message: "Column is full"
        };
    }

    // Apply the move.
    game.board[targetRow][column] = symbol;

    // Check winner.
    if (
        checkWinner(
            game.board,
            targetRow,
            column,
            symbol
        )
    ) {
        game.winner = symbol;
    }

    // Check draw.
    else if (
        game.board.every(row =>
            row.every(cell => cell !== null)
        )
    ) {
        game.draw = true;
    }

    // Switch turns.
    else {
        game.currentTurn = symbol === "R" ? "Y" : "R";
    }

    return {
        success: true,
        room
    };
}

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

module.exports = {
    initializeGame,
    canStartGame,
    canRestartGame,
    checkWinner,
    makeMove
};
