const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const socketHandler = require("./socket/socketHandler");

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

socketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
