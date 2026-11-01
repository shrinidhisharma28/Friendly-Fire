
const games = require("../games/registry");

function getManager(gameName) {
    if (typeof gameName !== "string" || !gameName.trim()) {
        return null;
    }

    const game = games[gameName];
    return game && game.manager ? game.manager : null;
}

function validateRoom(room) {
    if (!room || typeof room !== "object") {
        return { success: false, message: "Invalid room" };
    }

    if (!getManager(room.game)) {
        return { success: false, message: "Unsupported game" };
    }

    if (!Array.isArray(room.players)) {
        return { success: false, message: "Invalid room players" };
    }

    return { success: true };
}

function evaluateLifecycleRule(manager, ruleName, room, defaultMessage) {
    const validation = validateRoom(room);

    if (!validation.success) {
        return validation;
    }

    if (typeof manager[ruleName] !== "function") {
        return { success: true };
    }

    try {
        const decision = manager[ruleName](room);

        if (decision === false) {
            return { success: false, message: defaultMessage };
        }

        if (decision && typeof decision === "object" && decision.success === false) {
            return {
                success: false,
                message: decision.message || defaultMessage
            };
        }

        return { success: true };
    } catch (error) {
        console.error(`[gameService] ${ruleName} failed:`, error);
        return {
            success: false,
            message: "Unable to validate game operation"
        };
    }
}

function initializeGame(room) {
    const validation = validateRoom(room);

    if (!validation.success) {
        return validation;
    }

    const manager = getManager(room.game);

    if (typeof manager.initializeGame !== "function") {
        return {
            success: false,
            message: "Game initialization is not supported"
        };
    }

    try {
        const initialState = manager.initializeGame(room);

        if (
            !initialState ||
            typeof initialState !== "object" ||
            Array.isArray(initialState)
        ) {
            return {
                success: false,
                message: "Game manager returned an invalid initial state"
            };
        }

        room.gameState = initialState;

        return { success: true, room };
    } catch (error) {
        console.error(
            `[gameService] initializeGame failed for ${room.game}:`,
            error
        );

        return {
            success: false,
            message: "Unable to initialize game"
        };
    }
}

function canStartGame(room) {
    const validation = validateRoom(room);

    if (!validation.success) {
        return validation;
    }

    if (room.status === "playing") {
        return {
            success: false,
            message: "Game is already in progress"
        };
    }

    if (
        !Number.isInteger(room.minPlayers) ||
        room.players.length < room.minPlayers
    ) {
        return {
            success: false,
            message: "Not enough players"
        };
    }

    return evaluateLifecycleRule(
        getManager(room.game),
        "canStartGame",
        room,
        "This game cannot be started yet"
    );
}

function canRestartGame(room) {
    const validation = validateRoom(room);

    if (!validation.success) {
        return validation;
    }

    if (room.status !== "playing") {
        return {
            success: false,
            message: "Game is not currently running"
        };
    }

    if (
        !Number.isInteger(room.minPlayers) ||
        room.players.length < room.minPlayers
    ) {
        return {
            success: false,
            message: "Not enough players to restart"
        };
    }

    return evaluateLifecycleRule(
        getManager(room.game),
        "canRestartGame",
        room,
        "This game cannot be restarted yet"
    );
}

function makeMove(room, socketId, payload) {
    const validation = validateRoom(room);

    if (!validation.success) {
        return validation;
    }

    if (room.status !== "playing") {
        return {
            success: false,
            message: "Game has not started"
        };
    }

    if (
        typeof socketId !== "string" ||
        !room.players.some(player => player.socketId === socketId)
    ) {
        return {
            success: false,
            message: "You are not a player in this room"
        };
    }

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return {
            success: false,
            message: "Invalid move payload"
        };
    }

    const manager = getManager(room.game);

    if (typeof manager.makeMove !== "function") {
        return {
            success: false,
            message: "Moves are not supported for this game"
        };
    }

    try {
        return manager.makeMove(room, socketId, payload);
    } catch (error) {
        console.error(
            `[gameService] makeMove failed for ${room.game}:`,
            error
        );

        return {
            success: false,
            message: "Unable to process move"
        };
    }
}

function runPlayerLifecycleHook(room, socketId, hookName) {
    const validation = validateRoom(room);

    if (!validation.success) {
        return validation;
    }

    if (typeof socketId !== "string" || socketId.length === 0) {
        return {
            success: false,
            message: "Invalid player connection"
        };
    }

    const manager = getManager(room.game);

    if (typeof manager[hookName] !== "function") {
        return { success: true };
    }

    try {
        manager[hookName](room, socketId);
        return { success: true };
    } catch (error) {
        console.error(
            `[gameService] ${hookName} failed for ${room.game}:`,
            error
        );

        return {
            success: false,
            message: "Unable to update game player state"
        };
    }
}

function onPlayerJoin(room, socketId) {
    return runPlayerLifecycleHook(room, socketId, "onPlayerJoin");
}

function onPlayerLeave(room, socketId) {
    return runPlayerLifecycleHook(room, socketId, "onPlayerLeave");
}

module.exports = {
    getManager,
    initializeGame,
    makeMove,
    canStartGame,
    canRestartGame,
    onPlayerJoin,
    onPlayerLeave
};
