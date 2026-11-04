
import TicTacToePage from "./tictactoe/pages/TicTacToePage";
import Connect4Page from "./connect4/pages/Connect4Page";
import RockPaperScissorsPage from "./rockpaperscissors/pages/RockPaperScissorsPage";
import WordlePage from "./wordle/pages/WordlePage";

// The key must match the game's ID in the backend configuration.
const gameRegistry = {
    tictactoe: TicTacToePage,
    connect4: Connect4Page,
    rockpaperscissors: RockPaperScissorsPage,
    wordle: WordlePage
};

export default gameRegistry;
