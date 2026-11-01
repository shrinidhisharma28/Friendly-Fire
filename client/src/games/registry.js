import TicTacToePage from "./tictactoe/pages/TicTacToePage";
import Connect4Page from "./connect4/pages/Connect4Page";
import RockPaperScissorsPage from "./rockpaperscissors/pages/RockPaperScissorsPage";

// To add a new game: import its Page and add an entry here.
// The key must match the game's `id` in server/src/config/games.js
const gameRegistry = {
    tictactoe: TicTacToePage,
    connect4: Connect4Page,
    rockpaperscissors: RockPaperScissorsPage
};

export default gameRegistry;
