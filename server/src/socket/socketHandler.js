
const {
    createRoom,
    joinRoom,
    removePlayerFromRoom,
    startGame,
    restartGame,
    getRoom,
    isRoomPlayer
} = require("./roomManager");

const { makeMove } = require("../services/gameService");

function socketHandler(io) {
    io.on("connection", socket => {
        console.log(`${socket.id} connected`);

        // Centralized error handling for socket events.
        function handleError(eventName, error) {
            console.error(`[${eventName}]`, error);

            socket.emit("server-error", "Something went wrong. Please try again.");
        }

        // CREATE ROOM
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

        // JOIN ROOM
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

                // Avoid duplicate broadcasts when the same player
                // requests to join the room again.
                if (!result.alreadyJoined) {
                    io.to(result.room.id).emit(
                        "room-updated",
                        result.room
                    );
                } else {
                    socket.emit("room-data", result.room);
                }

            } catch (error) {
                handleError("join-room", error);
            }
        });

        // START GAME
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

                io.to(result.room.id).emit(
                    "room-updated",
                    result.room
                );

            } catch (error) {
                handleError("start-game", error);
            }
        });

        // GET ROOM
        socket.on("get-room", data => {
            try {
                if (!data || typeof data !== "object") {
                    socket.emit("room-not-found");
                    return;
                }

                const room = getRoom(data.roomId);

                if (!room) {
                    socket.emit("room-not-found");
                    return;
                }

                // Only existing room members can access room data.
                if (!isRoomPlayer(room.id, socket.id)) {
                    socket.emit("room-not-found");
                    return;
                }

                socket.join(room.id);

                socket.emit("room-data", room);

            } catch (error) {
                handleError("get-room", error);
            }
        });

        // MAKE MOVE
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

                if (!data.payload || typeof data.payload !== "object") {
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

                io.to(room.id).emit(
                    "game-updated",
                    room
                );

            } catch (error) {
                handleError("make-move", error);
            }
        });

        // RESTART GAME
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

                io.to(result.room.id).emit(
                    "game-updated",
                    result.room
                );

            } catch (error) {
                handleError("restart-game", error);
            }
        });

        // LEAVE ROOM
        socket.on("leave-room", () => {
            try {
                const result = removePlayerFromRoom(socket.id);

                if (!result.success) {
                    socket.emit("left-room");
                    return;
                }

                // Remove the socket from the Socket.IO room.
                socket.leave(result.roomId);

                // Notify remaining players if the room still exists.
                if (result.room) {
                    io.to(result.roomId).emit(
                        result.room.status === "playing"
                            ? "game-updated"
                            : "room-updated",
                        result.room
                    );
                }

                socket.emit("left-room");

            } catch (error) {
                handleError("leave-room", error);
            }
        });

        // DISCONNECT
        socket.on("disconnect", reason => {
            try {
                const result = removePlayerFromRoom(socket.id);

                if (result.success && result.room) {
                    io.to(result.roomId).emit(
                        result.room.status === "playing"
                            ? "game-updated"
                            : "room-updated",
                        result.room
                    );
                }

                console.log(`${socket.id} disconnected: ${reason}`);

            } catch (error) {
                handleError("disconnect", error);
            }
        });
    });
}

module.exports = socketHandler;
