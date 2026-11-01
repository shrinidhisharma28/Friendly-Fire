const games = require("../config/games");
const generateRoomCode = require("../utils/generateRoomCode");
const { initializeGame } = require("../services/gameService");

const rooms = {};

function updateRoomStatus(room) {
    if (room.status === "playing") return;
    room.status = room.players.length >= room.minPlayers ? "ready" : "waiting";
}

function initializeRoomGame(room) {
    initializeGame(room);
}

function createRoom(gameName, socketId, username) {
    const game = games[gameName];
    if (!game) {
        return { success: false, message: "Invalid game" };
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
        hostUsername: username,
        status: "waiting",
        players: [{ socketId, username }],
        gameState: null
    };

    updateRoomStatus(room);
    rooms[roomId] = room;

    return { success: true, room };
}

function joinRoom(roomId, socketId, username) {
    const room = rooms[roomId];

    if (!room) {
        return { success: false, message: "Room not found" };
    }
    if (room.status === "playing") {
        return { success: false, message: "Game already started" };
    }
    if (room.players.length >= room.roomCapacity) {
        return { success: false, message: "Room full" };
    }
    const exists = room.players.some(player => player.username === username);
    if (exists) {
        return { success: false, message: "Username already exists" };
    }

    room.players.push({ socketId, username });
    updateRoomStatus(room);

    return { success: true, room };
}

function leaveRoom(socketId) {
    for (const roomId in rooms) {
        const room = rooms[roomId];
        const index = room.players.findIndex(player => player.socketId === socketId);

        if (index !== -1) {
            room.players.splice(index, 1);

            if (room.hostId === socketId && room.players.length > 0) {
                room.hostId = room.players[0].socketId;
                room.hostUsername = room.players[0].username;
            }

            if (room.players.length === 0) {
                delete rooms[roomId];
                return null;
            }

            updateRoomStatus(room);
            return room;
        }
    }
    return null;
}

function startGame(roomId, socketId) {
    const room = rooms[roomId];

    if (!room) {
        return { success: false, message: "Room not found" };
    }
    if (room.hostId !== socketId) {
        return { success: false, message: "Only host can start" };
    }
    if (room.players.length < room.minPlayers) {
        return { success: false, message: "Not enough players" };
    }

    room.status = "playing";
    initializeRoomGame(room);

    return { success: true, room };
}

function restartGame(roomId, socketId) {
    const room = rooms[roomId];

    if (!room) {
        return { success: false, message: "Room not found" };
    }
    if (room.hostId !== socketId) {
        return { success: false, message: "Only host can restart" };
    }

    initializeRoomGame(room);

    return { success: true, room };
}

function getRoom(roomId) {
    return rooms[roomId] || null;
}

module.exports = {
    rooms,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    restartGame,
    getRoom
};
