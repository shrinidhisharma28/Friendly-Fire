
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const socketHandler = require("./socket/socketHandler");

const server = http.createServer(app);

const allowedOrigins = (
    process.env.CLIENT_URL || "http://localhost:5173"
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }
});

socketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Allowed frontend origins: ${allowedOrigins.join(", ")}`);
});

server.on("error", (error) => {
    console.error("Server startup error:", error);
    process.exit(1);
});
