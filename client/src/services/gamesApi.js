const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Game icon imports (images still live on the frontend)
import ticTacToeImg from "../assets/gameIcons/tictactoe.png";
import connect4Img from "../assets/gameIcons/connect4.jpeg";
import rpsImg from "../assets/gameIcons/rockpaperscissors.png";

const GAME_ICONS = {
    tictactoe: ticTacToeImg,
    connect4: connect4Img,
    rockpaperscissors: rpsImg
};

export async function fetchGames() {
    const res = await fetch(`${API_URL}/api/games`);
    if (!res.ok) throw new Error("Failed to fetch games");
    const games = await res.json();
    return games.map(game => ({
        ...game,
        image: GAME_ICONS[game.id] || null
    }));
}
