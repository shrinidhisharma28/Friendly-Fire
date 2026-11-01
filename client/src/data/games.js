// DEPRECATED: Static game list kept only as a fallback.
// The app now fetches games from /api/games via fetchGames().
// Do NOT add new games here — add them in server/src/config/games.js instead.
import ticTacToeImg from "../assets/gameIcons/tictactoe.png";
import connect4Img from "../assets/gameIcons/connect4.jpeg";
import rpsImg from "../assets/gameIcons/rockpaperscissors.png";

export const games = [
    {
        id: "tictactoe",
        name: "Tic Tac Toe",
        description: "Classic 3x3 strategy game.",
        details: "Place three symbols in a row before your opponent.",
        difficulty: "Easy",
        duration: "2 mins",
        image: ticTacToeImg,
        minPlayers: 2,
        maxPlayers: 2
    },
    {
        id: "connect4",
        name: "Connect 4",
        description: "Connect your spots to win.",
        details: "Drop discs into columns and connect four to win.",
        difficulty: "Easy",
        duration: "5 mins",
        image: connect4Img,
        minPlayers: 2,
        maxPlayers: 2
    },
    {
        id: "rockpaperscissors",
        name: "Rock Paper Scissors",
        description: "Classic hand battle.",
        details: "First player to reach 5 points wins.",
        difficulty: "Easy",
        duration: "3 mins",
        image: rpsImg,
        minPlayers: 2,
        maxPlayers: 2
    }
];
