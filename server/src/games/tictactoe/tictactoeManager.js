
const BOARD_SIZE = 9;

const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// --------------------------------------------------
// GAME INITIALIZATION
// --------------------------------------------------

function initializeGame(room) {
    if (!room || !Array.isArray(room.players) || room.players.length !== 2) {
        throw new Error("Tic Tac Toe requires exactly two players");
    }

    return {
        board: Array(BOARD_SIZE).fill(null),

        currentTurn: "X",

        winner: null,

        draw: false,

        symbols: {
            [room.players[0].socketId]: "X",
            [room.players[1].socketId]: "O"
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
            message: "Tic Tac Toe requires exactly two players"
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
// WINNER DETECTION
// --------------------------------------------------

function checkWinner(board) {
    for (const [a, b, c] of WINNING_COMBINATIONS) {
        if (
            board[a] !== null &&
            board[a] === board[b] &&
            board[b] === board[c]
        ) {
            return board[a];
        }
    }

    return null;
}

// --------------------------------------------------
// GAME STATE VALIDATION
// --------------------------------------------------

function validateGameState(game) {
    if (!game || typeof game !== "object") {
        return false;
    }

    if (!Array.isArray(game.board) || game.board.length !== BOARD_SIZE) {
        return false;
    }

    if (!game.symbols || typeof game.symbols !== "object") {
        return false;
    }

    if (!["X", "O"].includes(game.currentTurn)) {
        return false;
    }

    if (
        game.board.some(
            cell => cell !== null && cell !== "X" && cell !== "O"
        )
    ) {
        return false;
    }

    return true;
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

    if (
        !room.players.some(player => player.socketId === socketId)
    ) {
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

    const { index } = payload;

    // Validate board position.
    if (!Number.isInteger(index) || index < 0 || index >= BOARD_SIZE) {
        return {
            success: false,
            message: "Invalid board position"
        };
    }

    // Prevent moves after the game ends.
    if (game.winner || game.draw) {
        return {
            success: false,
            message: "Game has already finished"
        };
    }

    const symbol = game.symbols[socketId];

    // Validate player symbol.
    if (symbol !== "X" && symbol !== "O") {
        return {
            success: false,
            message: "Player symbol not found"
        };
    }

    // Validate turn.
    if (symbol !== game.currentTurn) {
        return {
            success: false,
            message: "Not your turn"
        };
    }

    // Prevent overwriting occupied cells.
    if (game.board[index] !== null) {
        return {
            success: false,
            message: "Cell already occupied"
        };
    }

    // Apply move.
    game.board[index] = symbol;

    // Check winner.
    const winner = checkWinner(game.board);

    if (winner) {
        game.winner = winner;
    } else if (game.board.every(cell => cell !== null)) {
        game.draw = true;
    } else {
        game.currentTurn = symbol === "X" ? "O" : "X";
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
