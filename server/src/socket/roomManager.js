
const games = require("../config/games");
const generateRoomCode = require("../utils/generateRoomCode");

const {
    initializeGame,
    canStartGame,
    canRestartGame,
    onPlayerJoin,
    onPlayerLeave
} = require("../services/gameService");

const rooms = Object.create(null);

const ROOM_ID_LENGTH = 6;
const USERNAME_MAX_LENGTH = 20;

// --------------------------------------------------
// VALIDATION HELPERS
// --------------------------------------------------

function normalizeRoomId(roomId) {
    if (typeof roomId !== "string") return null;

    const normalized = roomId.trim().toUpperCase();

    if (!new RegExp(`^[A-Z0-9]{${ROOM_ID_LENGTH}}$`).test(normalized)) {
        return null;
    }

    return normalized;
}

function normalizeUsername(username) {
    if (typeof username !== "string") return null;

    const normalized = username.trim();

    if (
        normalized.length === 0 ||
        normalized.length > USERNAME_MAX_LENGTH
    ) {
        return null;
    }

    return normalized;
}

function getPlayerRoomId(socketId) {
    if (typeof socketId !== "string" || !socketId) {
        return null;
    }

    return Object.keys(rooms).find(roomId =>
        rooms[roomId].players.some(
            player => player.socketId === socketId
        )
    ) || null;
}

function getRoom(roomId) {
    const normalizedRoomId = normalizeRoomId(roomId);

    return normalizedRoomId
        ? rooms[normalizedRoomId] || null
        : null;
}

function isRoomPlayer(roomId, socketId) {
    const room = getRoom(roomId);

    return Boolean(
        room &&
        typeof socketId === "string" &&
        room.players.some(player => player.socketId === socketId)
    );
}

function updateRoomStatus(room) {
    if (room.status === "playing") return;

    room.status = room.players.length >= room.minPlayers
        ? "ready"
        : "waiting";
}

function validatePlayerCount(room) {
    return (
        Number.isInteger(room.minPlayers) &&
        Number.isInteger(room.roomCapacity) &&
        room.minPlayers >= 1 &&
        room.roomCapacity >= room.minPlayers
    );
}

// --------------------------------------------------
// ROOM CREATION
// --------------------------------------------------

function createRoom(gameName, socketId, username) {
    const game = games[gameName];
    const normalizedUsername = normalizeUsername(username);

    if (!game) {
        return { success: false, message: "Invalid game" };
    }

    if (typeof socketId !== "string" || !socketId) {
        return {
            success: false,
            message: "Invalid player connection"
        };
    }

    if (!normalizedUsername) {
        return {
            success: false,
            message: `Username must contain between 1 and ${USERNAME_MAX_LENGTH} characters`
        };
    }

    if (getPlayerRoomId(socketId)) {
        return {
            success: false,
            message: "You are already a member of another room"
        };
    }

    const roomConfiguration = {
        minPlayers: game.minPlayers,
        roomCapacity: game.maxPlayers
    };

    if (!validatePlayerCount(roomConfiguration)) {
        return {
            success: false,
            message: "Invalid game player configuration"
        };
    }

    let roomId;

    do {
        roomId = generateRoomCode();
    } while (rooms[roomId]);

    const room = {
        id: roomId,
        game: gameName,
        gameName: game.name || gameName,
        minPlayers: game.minPlayers,
        roomCapacity: game.maxPlayers,
        hostId: socketId,
        hostUsername: normalizedUsername,
        status: "waiting",
        players: [
            {
                socketId,
                username: normalizedUsername
            }
        ],
        gameState: null
    };

    rooms[roomId] = room;
    updateRoomStatus(room);

    // Notify the game manager about the initial player.
    const lifecycleResult = onPlayerJoin(room, socketId);

    if (!lifecycleResult.success) {
        delete rooms[roomId];

        return lifecycleResult;
    }

    return { success: true, room };
}

// --------------------------------------------------
// JOIN ROOM
// --------------------------------------------------

function joinRoom(roomId, socketId, username) {
    const normalizedRoomId = normalizeRoomId(roomId);
    const normalizedUsername = normalizeUsername(username);

    if (!normalizedRoomId) {
        return {
            success: false,
            message: "Invalid room code"
        };
    }

    if (typeof socketId !== "string" || !socketId) {
        return {
            success: false,
            message: "Invalid player connection"
        };
    }

    if (!normalizedUsername) {
        return {
            success: false,
            message: `Username must contain between 1 and ${USERNAME_MAX_LENGTH} characters`
        };
    }

    const room = rooms[normalizedRoomId];

    if (!room) {
        return {
            success: false,
            message: "Room not found"
        };
    }

    const currentRoomId = getPlayerRoomId(socketId);

    if (currentRoomId) {
        if (currentRoomId === normalizedRoomId) {
            return {
                success: true,
                room,
                alreadyJoined: true
            };
        }

        return {
            success: false,
            message: "Leave your current room before joining another"
        };
    }

    if (room.status === "playing") {
        return {
            success: false,
            message: "Game already started"
        };
    }

    if (room.players.length >= room.roomCapacity) {
        return {
            success: false,
            message: "Room full"
        };
    }

    const usernameExists = room.players.some(
        player =>
            player.username.toLowerCase() ===
            normalizedUsername.toLowerCase()
    );

    if (usernameExists) {
        return {
            success: false,
            message: "Username already exists"
        };
    }

    const player = {
        socketId,
        username: normalizedUsername
    };

    room.players.push(player);

    const lifecycleResult = onPlayerJoin(room, socketId);

    if (!lifecycleResult.success) {
        room.players.pop();

        return lifecycleResult;
    }

    updateRoomStatus(room);

    return {
        success: true,
        room,
        alreadyJoined: false
    };
}

// --------------------------------------------------
// PLAYER REMOVAL
// --------------------------------------------------

function removePlayerFromRoom(socketId) {
    const roomId = getPlayerRoomId(socketId);

    if (!roomId) {
        return {
            success: false,
            roomId: null,
            room: null,
            deleted: false
        };
    }

    const room = rooms[roomId];

    const playerIndex = room.players.findIndex(
        player => player.socketId === socketId
    );

    if (playerIndex === -1) {
        return {
            success: false,
            roomId: null,
            room: null,
            deleted: false
        };
    }

    // Call the game lifecycle hook before removing the player.
    // The manager may need the player's existing game state.
    const lifecycleResult = onPlayerLeave(room, socketId);

    if (!lifecycleResult.success) {
        console.error(
            "[roomManager] Player leave hook failed:",
            lifecycleResult.message
        );
    }

    room.players.splice(playerIndex, 1);

    // Transfer host privileges.
    if (room.hostId === socketId && room.players.length > 0) {
        room.hostId = room.players[0].socketId;
        room.hostUsername = room.players[0].username;
    }

    // Delete empty rooms.
    if (room.players.length === 0) {
        delete rooms[roomId];

        return {
            success: true,
            roomId,
            room: null,
            deleted: true
        };
    }

    updateRoomStatus(room);

    return {
        success: true,
        roomId,
        room,
        deleted: false
    };
}

// Backward-compatible wrapper.
function leaveRoom(socketId) {
    return removePlayerFromRoom(socketId).room;
}

// --------------------------------------------------
// START GAME
// --------------------------------------------------

function startGame(roomId, socketId) {
    const room = getRoom(roomId);

    if (!room) {
        return {
            success: false,
            message: "Room not found"
        };
    }

    if (!isRoomPlayer(room.id, socketId)) {
        return {
            success: false,
            message: "You are not a member of this room"
        };
    }

    if (room.hostId !== socketId) {
        return {
            success: false,
            message: "Only host can start"
        };
    }

    if (room.status === "playing") {
        return {
            success: false,
            message: "Game is already in progress"
        };
    }

    // Ask the game service to validate game-specific start conditions.
    const startPermission = canStartGame(room);

    if (!startPermission.success) {
        return startPermission;
    }

    // Initialize before changing room status.
    const initialization = initializeGame(room);

    if (!initialization.success) {
        return initialization;
    }

    room.status = "playing";

    return {
        success: true,
        room
    };
}

// --------------------------------------------------
// RESTART GAME
// --------------------------------------------------

function restartGame(roomId, socketId) {
    const room = getRoom(roomId);

    if (!room) {
        return {
            success: false,
            message: "Room not found"
        };
    }

    if (!isRoomPlayer(room.id, socketId)) {
        return {
            success: false,
            message: "You are not a member of this room"
        };
    }

    if (room.hostId !== socketId) {
        return {
            success: false,
            message: "Only host can restart"
        };
    }

    const restartPermission = canRestartGame(room);

    if (!restartPermission.success) {
        return restartPermission;
    }

    const initialization = initializeGame(room);

    if (!initialization.success) {
        return initialization;
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
    rooms,
    createRoom,
    joinRoom,
    leaveRoom,
    removePlayerFromRoom,
    getPlayerRoomId,
    isRoomPlayer,
    startGame,
    restartGame,
    getRoom
};
