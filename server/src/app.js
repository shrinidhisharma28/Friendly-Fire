
const express = require("express");
const cors = require("cors");
const gameConfig = require("./config/games");

const app = express();

// Allow frontend origins configured through CLIENT_URL.
// Multiple origins can be separated by commas.
const allowedOrigins = (
    process.env.CLIENT_URL || "http://localhost:5173"
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests without an Origin header, such as Postman
        // and server-to-server requests.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

// Expose game metadata to the frontend.
app.get("/api/games", (req, res) => {
    const games = Object.entries(gameConfig).map(([id, config]) => ({
        id,
        minPlayers: config.minPlayers,
        maxPlayers: config.maxPlayers,
        name: config.name || id,
        description: config.description || "",
        details: config.details || "",
        difficulty: config.difficulty || "Easy",
        duration: config.duration || "5 mins"
    }));

    res.json(games);
});

module.exports = app;
