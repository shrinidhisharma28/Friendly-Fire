
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from './pages/LobbyPage';
import GameLobbyPage from './pages/JoinPage';
import GameMenuPage from './pages/GameMenuPage';
import JoinRoomPage from './pages/JoinRoomPage';
import WaitingRoomPage from './pages/WaitingRoomPage';
import GamePlayRouter from './pages/GamePlayRouter';

import ShapeGrid from './components/ShapeGrid';
import ColorBends from './components/ColorBends';

import './App.css';

function RequireUsername({ children }) {
    const username = sessionStorage.getItem('username');

    if (!username || !username.trim()) {
        return <Navigate to="/" replace />;
    }

    return children;
}

function App() {
    return (
        <BrowserRouter>
            {/* Global background effects */}
            <div className="app-background">

                {/* Animated color gradient */}
                <ColorBends
                    colors={["#F97316"]}
                    speed={0.4}
                    intensity={0.7}
                    noise={0}
                    rotation={-55}
                    autoRotate={-3}
                />

                {/* Animated geometric grid */}
                <ShapeGrid
                    shape="square"
                    direction="diagonal"
                    lineColor="#2a2734"
                    hoverColor="#ffffff"
                    hoverFillColor="#ffffff"
                    fillOpacity={0.15}
                    cellSize={40}
                    speed={0.5}
                    tiltX={0}
                    tiltY={0}
                    rainbow={false}
                    lineWidth={1}
                    radius={1.5}
                    trail={0.5}
                    glow={0.35}
                    twinkle={0}
                    fade={1}
                    clickCascade
                    intro
                />
            </div>

            {/* Application content */}
            <div className="app-content">
                <ToastContainer position="top-right" theme="dark" />

                <Routes>
                    <Route path="/" element={<LoginPage />} />

                    <Route
                        path="/lobby"
                        element={
                            <RequireUsername>
                                <GameLobbyPage />
                            </RequireUsername>
                        }
                    />

                    <Route
                        path="/game/:gameId"
                        element={
                            <RequireUsername>
                                <GameMenuPage />
                            </RequireUsername>
                        }
                    />

                    <Route
                        path="/game/:gameId/waiting"
                        element={
                            <RequireUsername>
                                <WaitingRoomPage />
                            </RequireUsername>
                        }
                    />

                    <Route
                        path="/game/:gameId/join"
                        element={
                            <RequireUsername>
                                <JoinRoomPage />
                            </RequireUsername>
                        }
                    />

                    <Route
                        path="/room/:roomId"
                        element={
                            <RequireUsername>
                                <WaitingRoomPage />
                            </RequireUsername>
                        }
                    />

                    <Route
                        path="/game/:gameId/play/:roomId"
                        element={
                            <RequireUsername>
                                <GamePlayRouter />
                            </RequireUsername>
                        }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
