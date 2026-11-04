const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Game artwork stays in the frontend.
// Descriptive metadata comes from the backend API.
import ticTacToeImg from "../assets/gameIcons/tictactoe.png";
import connect4Img from "../assets/gameIcons/connect4.jpeg";
import rpsImg from "../assets/gameIcons/rockpaperscissors.png";
import wordleImg from "../assets/gameIcons/wordle.svg";

const GAME_ICONS = {
    tictactoe: ticTacToeImg,
    connect4: connect4Img,
    rockpaperscissors: rpsImg,
    wordle: wordleImg
};

export async function fetchGames() {
    const response = await fetch(`${API_URL}/api/games`);

    if (!response.ok) {
        throw new Error("Failed to fetch games");
    }

    const games = await response.json();

    return games.map(game => ({
        ...game,
        image: GAME_ICONS[game.id] || null
    }));
}