import { BrowserRouter, Routes, Route } from 'react-router-dom';

import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import JoinPage from './pages/JoinPage';
import LobbyPage from './pages/LobbyPage';
import GameMenuPage from './pages/GameMenuPage';
import JoinRoomPage from './pages/JoinRoomPage';
import WaitingRoomPage from './pages/WaitingRoomPage';

import TicTacToePage from './games/tictactoe/pages/TicTacToePage';
import Connect4Page from './games/connect4/pages/Connect4Page';
import RockPaperScissorsPage from "./games/rockpaperscissors/pages/RockPaperScissorsPage";

import './App.css';


function App() {

    return (

        <BrowserRouter>

          

          <ToastContainer

            position="top-right"

            theme="light"

            />

            <Routes>

                <Route
                    path="/"
                    element={<JoinPage />}
                />


                <Route
                    path="/lobby"
                    element={<LobbyPage />}
                />


                <Route
                    path="/game/:gameId"
                    element={<GameMenuPage />}
                />


                <Route
                    path="/game/:gameId/waiting"
                    element={<WaitingRoomPage/>}
                    />

                <Route
                    path="/game/:gameId/join"
                    element={<JoinRoomPage />}
                />


                <Route
                    path="/room/:roomId"
                    element={<WaitingRoomPage />}
                />


                <Route
                    path="/game/tictactoe/play/:roomId"
                    element={<TicTacToePage />}
                />


                <Route
                    path="/game/connect4/play/:roomId"
                    element={<Connect4Page />}
                />

                <Route
                    path="/game/rockpaperscissors/play/:roomId"
                    element={<RockPaperScissorsPage/>}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;