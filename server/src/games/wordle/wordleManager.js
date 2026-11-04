
const {
    WORD_LENGTH,
    MAX_ATTEMPTS,
    GAME_PHASES,
    LETTER_STATUS,
    MOVE_TYPES
} = require("./constants");

const {
    normalizeWord,
    evaluateGuess,
    isCorrectGuess
} = require("./wordleHelpers");

const { isValidWord } = require("./wordleWords");

// Private server-side storage.
// Never place secret words in room.gameState.
const privateGames = new Map();

// --------------------------------------------------
// PLAYER VALIDATION
// --------------------------------------------------

function getPlayerIds(room) {
    if (
        !room ||
        !Array.isArray(room.players) ||
        room.players.length !== 2
    ) {
        return null;
    }

    const playerIds = room.players.map(
        player => player && player.socketId
    );

    if (
        playerIds.some(
            id => typeof id !== "string" || !id
        ) ||
        playerIds[0] === playerIds[1]
    ) {
        return null;
    }

    return playerIds;
}

function getPrivateGame(room) {
    if (!room || typeof room.id !== "string") {
        return null;
    }

    return privateGames.get(room.id) || null;
}

// --------------------------------------------------
// GAME INITIALIZATION
// --------------------------------------------------

function initializeGame(room) {
    const playerIds = getPlayerIds(room);

    if (!playerIds) {
        throw new Error(
            "Wordle requires exactly two valid players"
        );
    }

    privateGames.set(room.id, {
        secrets: {
            [playerIds[0]]: null,
            [playerIds[1]]: null
        },

        players: {
            [playerIds[0]]: {
                guesses: [],
                solved: false,
                finished: false
            },

            [playerIds[1]]: {
                guesses: [],
                solved: false,
                finished: false
            }
        },

        result: null
    });

    // Only public information belongs in room.gameState.
    return {
        phase: GAME_PHASES.WAITING_FOR_SECRETS,

        progress: {
            [playerIds[0]]: {
                attemptsUsed: 0,
                finished: false,
                solved: false
            },

            [playerIds[1]]: {
                attemptsUsed: 0,
                finished: false,
                solved: false
            }
        },

        result: null
    };
}

// --------------------------------------------------
// GAME LIFECYCLE
// --------------------------------------------------

function canStartGame(room) {
    if (!getPlayerIds(room)) {
        return {
            success: false,
            message: "Wordle requires exactly two players"
        };
    }

    return { success: true };
}

function validateGameState(room) {
    const playerIds = getPlayerIds(room);
    const game = room && room.gameState;

    if (!playerIds || !game) {
        return false;
    }

    if (!Object.values(GAME_PHASES).includes(game.phase)) {
        return false;
    }

    if (!game.progress || typeof game.progress !== "object") {
        return false;
    }

    for (const playerId of playerIds) {
        const progress = game.progress[playerId];

        if (
            !progress ||
            !Number.isInteger(progress.attemptsUsed) ||
            progress.attemptsUsed < 0 ||
            progress.attemptsUsed > MAX_ATTEMPTS ||
            typeof progress.finished !== "boolean" ||
            typeof progress.solved !== "boolean"
        ) {
            return false;
        }
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
        room.gameState.phase !== GAME_PHASES.COMPLETED
    ) {
        return {
            success: false,
            message: "Wordle must be completed before restarting"
        };
    }

    return { success: true };
}

// --------------------------------------------------
// SECRET WORD SUBMISSION
// --------------------------------------------------

function submitSecret(room, socketId, payload, privateGame) {
    if (room.gameState.phase !== GAME_PHASES.WAITING_FOR_SECRETS) {
        return {
            success: false,
            message: "Secret words can no longer be submitted"
        };
    }

    if (privateGame.secrets[socketId] !== null) {
        return {
            success: false,
            message: "Your secret word is already locked"
        };
    }

    const word = normalizeWord(payload.word);

    if (!word) {
        return {
            success: false,
            message: `Secret word must contain exactly ${WORD_LENGTH} letters`
        };
    }

    if (!isValidWord(word)) {
        return {
            success: false,
            message: "Please enter a valid dictionary word"
        };
    }

    privateGame.secrets[socketId] = word;

    const playerIds = getPlayerIds(room);

    const bothSubmitted = playerIds.every(
        playerId => privateGame.secrets[playerId] !== null
    );

    if (bothSubmitted) {
        room.gameState.phase = GAME_PHASES.GUESSING;
    }

    return {
        success: true,
        message: bothSubmitted
            ? "Both secret words are locked. Guessing has started."
            : "Secret word locked. Waiting for your opponent.",
        phase: room.gameState.phase
    };
}

// --------------------------------------------------
// GUESS SUBMISSION
// --------------------------------------------------

function submitGuess(room, socketId, payload, privateGame) {
    if (room.gameState.phase !== GAME_PHASES.GUESSING) {
        return {
            success: false,
            message: "Guessing has not started"
        };
    }

    const player = privateGame.players[socketId];
    const opponentId = getPlayerIds(room).find(
        playerId => playerId !== socketId
    );

    if (!player || player.finished) {
        return {
            success: false,
            message: "You have already finished your attempts"
        };
    }

    if (privateGame.secrets[opponentId] === null) {
        return {
            success: false,
            message: "Opponent's secret word is not available"
        };
    }

    const guess = normalizeWord(payload.word);

    if (!guess) {
        return {
            success: false,
            message: `Guess must contain exactly ${WORD_LENGTH} letters`
        };
    }

    if (!isValidWord(guess)) {
        return {
            success: false,
            message: "Please enter a valid dictionary word"
        };
    }

    const secret = privateGame.secrets[opponentId];
    const feedback = evaluateGuess(secret, guess);

    player.guesses.push({
        word: guess,
        feedback
    });

    const solved = isCorrectGuess(secret, guess);
    const attemptsUsed = player.guesses.length;

    player.solved = solved;
    player.finished = solved || attemptsUsed >= MAX_ATTEMPTS;

    room.gameState.progress[socketId] = {
        attemptsUsed,
        finished: player.finished,
        solved: player.solved
    };

    const allPlayersFinished = getPlayerIds(room).every(
        playerId => privateGame.players[playerId].finished
    );

    if (allPlayersFinished) {
        completeGame(room, privateGame);
    }

    return {
        success: true,
        message: solved
            ? "You solved the word!"
            : player.finished
                ? "You have used all your attempts."
                : "Guess submitted",
        finished: player.finished,
        attemptsUsed,
        phase: room.gameState.phase
    };
}

// --------------------------------------------------
// RESULT CALCULATION
// --------------------------------------------------

function completeGame(room, privateGame) {
    const playerIds = getPlayerIds(room);

    const first = privateGame.players[playerIds[0]];
    const second = privateGame.players[playerIds[1]];

    let winner = null;
    let outcome = "draw";

    if (first.solved && second.solved) {
        if (first.guesses.length < second.guesses.length) {
            winner = playerIds[0];
            outcome = "winner";
        } else if (second.guesses.length < first.guesses.length) {
            winner = playerIds[1];
            outcome = "winner";
        }
    } else if (first.solved) {
        winner = playerIds[0];
        outcome = "winner";
    } else if (second.solved) {
        winner = playerIds[1];
        outcome = "winner";
    }

    privateGame.result = {
        outcome,
        winner,
        attempts: {
            [playerIds[0]]: first.guesses.length,
            [playerIds[1]]: second.guesses.length
        }
    };

    room.gameState.phase = GAME_PHASES.COMPLETED;
    room.gameState.result = privateGame.result;
}

// --------------------------------------------------
// MOVE HANDLER
// --------------------------------------------------

function makeMove(room, socketId, payload) {
    const playerIds = getPlayerIds(room);

    if (!playerIds || !playerIds.includes(socketId)) {
        return {
            success: false,
            message: "You are not a player in this Wordle game"
        };
    }

    if (!validateGameState(room)) {
        return {
            success: false,
            message: "Invalid Wordle game state"
        };
    }

    const privateGame = getPrivateGame(room);

    if (!privateGame) {
        return {
            success: false,
            message: "Wordle game data is unavailable"
        };
    }

    if (payload.type === MOVE_TYPES.SUBMIT_SECRET) {
        return submitSecret(room, socketId, payload, privateGame);
    }

    if (payload.type === MOVE_TYPES.SUBMIT_GUESS) {
        return submitGuess(room, socketId, payload, privateGame);
    }

    return {
        success: false,
        message: "Invalid Wordle move type"
    };
}

// --------------------------------------------------
// PLAYER-SPECIFIC STATE
// --------------------------------------------------

function getPlayerState(room, socketId) {
    const playerIds = getPlayerIds(room);

    if (!playerIds || !playerIds.includes(socketId)) {
        return null;
    }

    const privateGame = getPrivateGame(room);

    if (!privateGame) {
        return null;
    }

    const player = privateGame.players[socketId];
    const opponentId = playerIds.find(
        playerId => playerId !== socketId
    );

    return {
        ...room.gameState,

        ownGuesses: player.guesses,

        ownSecretLocked:
            privateGame.secrets[socketId] !== null,

        opponentSecretLocked:
            privateGame.secrets[opponentId] !== null,

        opponentProgress:
            room.gameState.progress[opponentId],

        ownResult: room.gameState.phase === GAME_PHASES.COMPLETED
            ? privateGame.result
            : null
    };
}

// --------------------------------------------------
// CLEANUP
// --------------------------------------------------

function onPlayerLeave(room) {
    if (room && typeof room.id === "string") {
        privateGames.delete(room.id);
    }
}

module.exports = {
    initializeGame,
    canStartGame,
    canRestartGame,
    makeMove,
    getPlayerState,
    onPlayerLeave
};
