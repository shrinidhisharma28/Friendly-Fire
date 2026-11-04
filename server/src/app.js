const express = require("express");
const cors = require("cors");
const gameConfig = require("./config/games");

const app = express();

app.use(cors());
app.use(express.json());

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
        duration: config.duration || "5 mins",
        rules: config.rules || []
    }));

    res.json(games);
});

module.exports = app;