
const {
    createRoom,
    joinRoom,
    removePlayerFromRoom,
    startGame,
    restartGame,
    getRoom,
    isRoomPlayer
} = require("./roomManager");

const {
    makeMove,
    getPlayerState
} = require("../services/gameService");

// Games requiring player-specific state instead of public room broadcasts.
const PRIVATE_STATE_GAMES = new Set(["wordle"]);

// --------------------------------------------------
// ROOM DATA HELPERS
// --------------------------------------------------

function createPlayerRoomData(room, socketId) {
    if (!room) {
        return null;
    }

    // Non-private games use normal room data.
    if (!PRIVATE_STATE_GAMES.has(room.game)) {
        return room;
    }

    // Wordle waiting rooms do not have private game state yet.
    if (room.status !== "playing") {
        return room;
    }

    // During gameplay, return only the requesting player's state.
    const playerGameState = getPlayerState(room, socketId);

    if (!playerGameState) {
        return null;
    }

    return {
        ...room,
        gameState: playerGameState
    };
}

// Send room data to one player.
function sendPlayerRoomData(socket, room, eventName = "room-data") {
    const roomData = createPlayerRoomData(room, socket.id);

    if (!roomData) {
        socket.emit("room-not-found");
        return;
    }

    socket.emit(eventName, roomData);
}

// Broadcast game updates.
function broadcastGameUpdate(io, room) {
    if (!room) {
        return;
    }

    if (!PRIVATE_STATE_GAMES.has(room.game)) {
        io.to(room.id).emit("game-updated", room);
        return;
    }

    for (const player of room.players) {
        const playerRoomData = createPlayerRoomData(
            room,
            player.socketId
        );

        if (playerRoomData) {
            io.to(player.socketId).emit(
                "game-updated",
                playerRoomData
            );
        }
    }
}

// Broadcast waiting-room updates.
function broadcastRoomUpdate(io, room) {
    if (!room) {
        return;
    }

    if (PRIVATE_STATE_GAMES.has(room.game)) {
        for (const player of room.players) {
            const playerRoomData = createPlayerRoomData(
                room,
                player.socketId
            );

            if (playerRoomData) {
                io.to(player.socketId).emit(
                    "room-updated",
                    playerRoomData
                );
            }
        }

        return;
    }

    io.to(room.id).emit("room-updated", room);
}

// Notify the remaining player when their opponent leaves an active game.
function notifyOpponentLeft(io, room, roomId, reason) {
    if (!room || room.status !== "playing") {
        return;
    }

    for (const player of room.players) {
        io.to(player.socketId).emit("opponent-left", {
            roomId,
            message: "Your opponent left the game.",
            reason
        });
    }

    console.log(
        `[opponent-left] Room ${roomId}: opponent ${reason}`
    );
}

// --------------------------------------------------
// SOCKET HANDLER
// --------------------------------------------------

function socketHandler(io) {
    io.on("connection", socket => {
        console.log(`${socket.id} connected`);

        function handleError(eventName, error) {
            console.error(`[${eventName}]`, error);

            socket.emit(
                "server-error",
                "Something went wrong. Please try again."
            );
        }

        // --------------------------------------------------
        // CREATE ROOM
        // --------------------------------------------------

        socket.on("create-room", data => {
            try {
                if (!data || typeof data !== "object") {
                    socket.emit("create-failed", "Invalid request");
                    return;
                }

                const result = createRoom(
                    data.game,
                    socket.id,
                    data.username
                );

                if (!result.success) {
                    socket.emit("create-failed", result.message);
                    return;
                }

                socket.join(result.room.id);

                socket.emit("room-created", result.room);

            } catch (error) {
                handleError("create-room", error);
            }
        });

        // --------------------------------------------------
        // JOIN ROOM
        // --------------------------------------------------

        socket.on("join-room", data => {
            try {
                if (!data || typeof data !== "object") {
                    socket.emit("join-failed", "Invalid request");
                    return;
                }

                const result = joinRoom(
                    data.roomId,
                    socket.id,
                    data.username
                );

                if (!result.success) {
                    socket.emit("join-failed", result.message);
                    return;
                }

                socket.join(result.room.id);

                if (!result.alreadyJoined) {
                    broadcastRoomUpdate(io, result.room);
                } else {
                    sendPlayerRoomData(socket, result.room);
                }

            } catch (error) {
                handleError("join-room", error);
            }
        });

        // --------------------------------------------------
        // START GAME
        // --------------------------------------------------

        socket.on("start-game", data => {
            try {
                if (!data || typeof data !== "object") {
                    socket.emit("start-failed", "Invalid request");
                    return;
                }

                const result = startGame(
                    data.roomId,
                    socket.id
                );

                if (!result.success) {
                    socket.emit("start-failed", result.message);
                    return;
                }

                if (PRIVATE_STATE_GAMES.has(result.room.game)) {
                    broadcastGameUpdate(io, result.room);
                } else {
                    io.to(result.room.id).emit(
                        "room-updated",
                        result.room
                    );
                }

            } catch (error) {
                handleError("start-game", error);
            }
        });

        // --------------------------------------------------
        // GET ROOM
        // --------------------------------------------------

        socket.on("get-room", data => {
            try {
                if (!data || typeof data !== "object") {
                    socket.emit("room-not-found");
                    return;
                }

                const room = getRoom(data.roomId);

                if (!room || !isRoomPlayer(room.id, socket.id)) {
                    socket.emit("room-not-found");
                    return;
                }

                socket.join(room.id);

                sendPlayerRoomData(socket, room);

            } catch (error) {
                handleError("get-room", error);
            }
        });

        // --------------------------------------------------
        // MAKE MOVE
        // --------------------------------------------------

        socket.on("make-move", data => {
            try {
                if (!data || typeof data !== "object") {
                    socket.emit("move-failed", "Invalid request");
                    return;
                }

                const room = getRoom(data.roomId);

                if (!room) {
                    socket.emit("room-not-found");
                    return;
                }

                if (!isRoomPlayer(room.id, socket.id)) {
                    socket.emit(
                        "move-failed",
                        "You are not a member of this room"
                    );
                    return;
                }

                if (
                    !data.payload ||
                    typeof data.payload !== "object" ||
                    Array.isArray(data.payload)
                ) {
                    socket.emit("move-failed", "Invalid move payload");
                    return;
                }

                const result = makeMove(
                    room,
                    socket.id,
                    data.payload
                );

                if (!result.success) {
                    socket.emit("move-failed", result.message);
                    return;
                }

                if (PRIVATE_STATE_GAMES.has(room.game)) {
                    broadcastGameUpdate(io, room);
                } else {
                    io.to(room.id).emit("game-updated", room);
                }

            } catch (error) {
                handleError("make-move", error);
            }
        });

        // --------------------------------------------------
        // RESTART GAME
        // --------------------------------------------------

        socket.on("restart-game", data => {
            try {
                if (!data || typeof data !== "object") {
                    socket.emit("restart-failed", "Invalid request");
                    return;
                }

                const result = restartGame(
                    data.roomId,
                    socket.id
                );

                if (!result.success) {
                    socket.emit("restart-failed", result.message);
                    return;
                }

                broadcastGameUpdate(io, result.room);

            } catch (error) {
                handleError("restart-game", error);
            }
        });

        // --------------------------------------------------
        // LEAVE ROOM
        // --------------------------------------------------

        socket.on("leave-room", () => {
            try {
                const result = removePlayerFromRoom(socket.id);

                if (!result.success) {
                    socket.emit("left-room");
                    return;
                }

                socket.leave(result.roomId);

                if (result.room) {
                    if (result.room.status === "playing") {
                        // Notify the remaining player.
                        // Do not broadcast game state after a player leaves.
                        notifyOpponentLeft(
                            io,
                            result.room,
                            result.roomId,
                            "left"
                        );
                    } else {
                        // Waiting-room player departure.
                        broadcastRoomUpdate(io, result.room);
                    }
                }

                socket.emit("left-room");

            } catch (error) {
                handleError("leave-room", error);
            }
        });

        // --------------------------------------------------
        // DISCONNECT
        // --------------------------------------------------

        socket.on("disconnect", reason => {
            try {
                const result = removePlayerFromRoom(socket.id);

                if (result.success && result.room) {
                    if (result.room.status === "playing") {
                        // Notify the remaining player after disconnection.
                        // Do not send deleted private game state.
                        notifyOpponentLeft(
                            io,
                            result.room,
                            result.roomId,
                            "disconnected"
                        );
                    } else {
                        broadcastRoomUpdate(io, result.room);
                    }
                }

                console.log(
                    `${socket.id} disconnected: ${reason}`
                );

            } catch (error) {
                handleError("disconnect", error);
            }
        });
    });
}

module.exports = socketHandler;
