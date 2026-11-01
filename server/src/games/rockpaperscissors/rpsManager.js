
const {
    PHASES,
    WIN_SCORE
} = require("./constants");

const {
    determineWinner,
    isValidMove
} = require("./helpers");

// --------------------------------------------------
// PLAYER VALIDATION
// --------------------------------------------------

function getPlayerIds(room) {
    if (!room || !Array.isArray(room.players) || room.players.length !== 2) {
        return null;
    }

    const playerIds = room.players.map(player => player && player.socketId);

    if (
        playerIds.some(id => typeof id !== "string" || id.length === 0) ||
        playerIds[0] === playerIds[1]
    ) {
        return null;
    }

    return playerIds;
}

// --------------------------------------------------
// GAME INITIALIZATION
// --------------------------------------------------

function initializeGame(room) {
    const players = getPlayerIds(room);

    if (!players) {
        throw new Error(
            "Rock Paper Scissors requires exactly two valid players"
        );
    }

    return {
        phase: PHASES.CHOOSING,
        round: 1,
        winner: null,
        lastRoundWinner: null,

        scores: {
            [players[0]]: 0,
            [players[1]]: 0
        },

        choices: {
            [players[0]]: null,
            [players[1]]: null
        },

        locked: {
            [players[0]]: false,
            [players[1]]: false
        }
    };
}

// --------------------------------------------------
// GAME LIFECYCLE
// --------------------------------------------------

function canStartGame(room) {
    if (!getPlayerIds(room)) {
        return {
            success: false,
            message: "Rock Paper Scissors requires exactly two valid players"
        };
    }

    return { success: true };
}

function validateGameState(room) {
    const players = getPlayerIds(room);

    if (!players) return false;

    const game = room.gameState;

    if (!game || typeof game !== "object" || Array.isArray(game)) {
        return false;
    }

    if (!Object.values(PHASES).includes(game.phase)) return false;

    if (!Number.isInteger(game.round) || game.round < 1) {
        return false;
    }

    if (!game.scores || !game.choices || !game.locked) {
        return false;
    }

    for (const playerId of players) {
        if (
            !Number.isInteger(game.scores[playerId]) ||
            game.scores[playerId] < 0
        ) {
            return false;
        }

        if (
            game.choices[playerId] !== null &&
            !isValidMove(game.choices[playerId])
        ) {
            return false;
        }

        if (typeof game.locked[playerId] !== "boolean") {
            return false;
        }
    }

    if (
        game.winner !== null &&
        !players.includes(game.winner)
    ) {
        return false;
    }

    if (
        game.lastRoundWinner !== null &&
        !players.includes(game.lastRoundWinner)
    ) {
        return false;
    }

    return true;
}

function canRestartGame(room) {
    if (!getPlayerIds(room)) {
        return {
            success: false,
            message: "Both players must be present to restart"
        };
    }

    if (
        !validateGameState(room) ||
        room.gameState.phase !== PHASES.GAME_OVER
    ) {
        return {
            success: false,
            message: "Rock Paper Scissors must be finished before restarting"
        };
    }

    return { success: true };
}

// --------------------------------------------------
// REQUEST VALIDATION
// --------------------------------------------------

function getPlayerContext(room, socketId, payload) {
    if (!room || room.status !== "playing") {
        return {
            success: false,
            message: "Game is not currently running"
        };
    }

    const players = getPlayerIds(room);

    if (!players) {
        return {
            success: false,
            message: "Rock Paper Scissors requires both players"
        };
    }

    if (!players.includes(socketId)) {
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

    if (!validateGameState(room)) {
        return {
            success: false,
            message: "Invalid game state"
        };
    }

    return {
        success: true,
        players,
        game: room.gameState
    };
}

// --------------------------------------------------
// SELECT MOVE
// --------------------------------------------------

function selectMove(room, socketId, payload, context) {
    const { game } = context;

    if (game.phase !== PHASES.CHOOSING) {
        return {
            success: false,
            message: "You can only select a move during the choosing phase"
        };
    }

    if (game.locked[socketId]) {
        return {
            success: false,
            message: "Choice already locked"
        };
    }

    if (!isValidMove(payload.move)) {
        return {
            success: false,
            message: "Invalid choice. Select rock, paper, or scissors"
        };
    }

    game.choices[socketId] = payload.move;

    return { success: true, room };
}

// --------------------------------------------------
// LOCK CHOICE
// --------------------------------------------------

function lockChoice(room, socketId, context) {
    const { players, game } = context;

    if (game.phase !== PHASES.CHOOSING) {
        return {
            success: false,
            message: "Choices can only be locked during the choosing phase"
        };
    }

    if (game.locked[socketId]) {
        return {
            success: false,
            message: "Your choice is already locked"
        };
    }

    if (!isValidMove(game.choices[socketId])) {
        return {
            success: false,
            message: "Select a valid move before locking your choice"
        };
    }

    game.locked[socketId] = true;

    const bothLocked = players.every(
        playerId => game.locked[playerId]
    );

    if (!bothLocked) {
        return { success: true, room };
    }

    // The round is scored only once, when both players lock.
    const result = determineWinner(
        game.choices[players[0]],
        game.choices[players[1]]
    );

    if (result === "draw") {
        game.lastRoundWinner = null;
    } else if (result === "player1") {
        game.scores[players[0]] += 1;
        game.lastRoundWinner = players[0];
    } else if (result === "player2") {
        game.scores[players[1]] += 1;
        game.lastRoundWinner = players[1];
    } else {
        game.locked[socketId] = false;

        return {
            success: false,
            message: "Unable to determine the round result"
        };
    }

    game.phase = PHASES.REVEALING;

    return { success: true, room };
}

// --------------------------------------------------
// CONTINUE ROUND
// --------------------------------------------------

function continueRound(room, socketId, context) {
    const { players, game } = context;

    if (socketId !== room.hostId) {
        return {
            success: false,
            message: "Only the host can continue to the next round"
        };
    }

    if (game.phase !== PHASES.REVEALING) {
        return {
            success: false,
            message: "The round is not ready to continue"
        };
    }

    const winningPlayer = players.find(
        playerId => game.scores[playerId] >= WIN_SCORE
    );

    // End the match if a player reaches the winning score.
    if (winningPlayer) {
        game.phase = PHASES.GAME_OVER;
        game.winner = winningPlayer;

        return { success: true, room };
    }

    // Prepare the next round.
    game.phase = PHASES.CHOOSING;
    game.round += 1;
    game.lastRoundWinner = null;

    for (const playerId of players) {
        game.choices[playerId] = null;
        game.locked[playerId] = false;
    }

    return { success: true, room };
}

// --------------------------------------------------
// MAKE MOVE — MAIN ENTRY POINT
// --------------------------------------------------

function makeMove(room, socketId, payload) {
    const context = getPlayerContext(room, socketId, payload);

    if (!context.success) {
        return context;
    }

    switch (payload.action) {
        case "select":
            return selectMove(room, socketId, payload, context);

        case "lock":
            return lockChoice(room, socketId, context);

        case "continue":
            return continueRound(room, socketId, context);

        default:
            return {
                success: false,
                message: "Invalid action"
            };
    }
}

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

module.exports = {
    initializeGame,
    canStartGame,
    canRestartGame,
    makeMove
};
