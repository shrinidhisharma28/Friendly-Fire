const { createRoom, joinRoom, leaveRoom, startGame, restartGame, getRoom } = require("./roomManager");
const { makeMove } = require("../services/gameService");

function socketHandler(io) {
    io.on("connection", socket => {
        console.log(`${socket.id} connected`);

        socket.on("create-room", data => {
            try {
                const result = createRoom(data.game, socket.id, data.username);
                if (!result.success) {
                    socket.emit("create-failed", result.message);
                    return;
                }
                socket.join(result.room.id);
                socket.emit("room-created", result.room);
            } catch (err) {
                console.error(err);
                socket.emit("server-error", "Something went wrong.");
            }
        });

        socket.on("join-room", data => {
            try {
                const result = joinRoom(data.roomId, socket.id, data.username);
                if (!result.success) {
                    socket.emit("join-failed", result.message);
                    return;
                }
                socket.join(result.room.id);
                io.to(result.room.id).emit("room-updated", result.room);
            } catch (err) {
                console.error(err);
                socket.emit("server-error", "Something went wrong.");
            }
        });

        socket.on("start-game", data => {
            try {
                const result = startGame(data.roomId, socket.id);
                if (!result.success) {
                    socket.emit("start-failed", result.message);
                    return;
                }
                io.to(data.roomId).emit("room-updated", result.room);
            } catch (err) {
                console.error(err);
                socket.emit("server-error", "Something went wrong.");
            }
        });

        socket.on("get-room", data => {
            try {
                const room = getRoom(data.roomId);
                if (!room) {
                    socket.emit("room-not-found");
                    return;
                }
                socket.join(room.id);
                socket.emit("room-data", room);
            } catch (err) {
                console.error(err);
            }
        });

        socket.on("make-move", data => {
            try {
                const room = getRoom(data.roomId);
                if (!room) {
                    socket.emit("room-not-found");
                    return;
                }
                const result = makeMove(room, socket.id, data.payload);
                if (!result.success) {
                    socket.emit("move-failed", result.message);
                    return;
                }
                io.to(room.id).emit("game-updated", room);
            } catch (err) {
                console.error(err);
            }
        });

        socket.on("restart-game", data => {
            try {
                const result = restartGame(data.roomId, socket.id);
                if (!result.success) {
                    socket.emit("restart-failed", result.message);
                    return;
                }
                io.to(data.roomId).emit("game-updated", result.room);
            } catch (err) {
                console.error(err);
            }
        });

        socket.on("leave-room", () => {
            try {
                const room = leaveRoom(socket.id);
                if (room) {
                    io.to(room.id).emit(
                        room.status === "playing" ? "game-updated" : "room-updated",
                        room
                    );
                }
                socket.emit("left-room");
            } catch (err) {
                console.error(err);
            }
        });

        socket.on("disconnect", () => {
            try {
                const room = leaveRoom(socket.id);
                if (room) {
                    io.to(room.id).emit(
                        room.status === "playing" ? "game-updated" : "room-updated",
                        room
                    );
                }
                console.log(`${socket.id} disconnected`);
            } catch (err) {
                console.error(err);
            }
        });
    });
}

module.exports = socketHandler;
