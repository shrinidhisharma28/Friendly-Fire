import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import JoinPage from './pages/JoinPage';
import LobbyPage from './pages/LobbyPage';
import GameMenuPage from './pages/GameMenuPage';
import JoinRoomPage from './pages/JoinRoomPage';
import WaitingRoomPage from './pages/WaitingRoomPage';
import GamePlayRouter from './pages/GamePlayRouter';

import './App.css';

function App() {
    return (
        <BrowserRouter>
            <ToastContainer position="top-right" theme="dark" />
            <Routes>
                <Route path="/" element={<JoinPage />} />
                <Route path="/lobby" element={<LobbyPage />} />
                <Route path="/game/:gameId" element={<GameMenuPage />} />
                <Route path="/game/:gameId/waiting" element={<WaitingRoomPage />} />
                <Route path="/game/:gameId/join" element={<JoinRoomPage />} />
                <Route path="/room/:roomId" element={<WaitingRoomPage />} />
                {/* Dynamic play route — resolves to correct game page via gameRegistry */}
                <Route path="/game/:gameId/play/:roomId" element={<GamePlayRouter />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
