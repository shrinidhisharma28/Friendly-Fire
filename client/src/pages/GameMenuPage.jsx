
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import socket from '../services/socket';
import { useGames } from '../hooks/useGames';

import './GameMenuPage.css';

import Button from '../components/Button';
import Navbar from '../components/Navbar';
import ColorBends from '../components/ColorBends';

function GameMenuPage() {
    const { gameId } = useParams();
    const navigate = useNavigate();

    const { games } = useGames();
    const game = games.find(g => g.id === gameId);

    useEffect(() => {
        socket.connect();

        socket.on('room-created', room => {
            navigate(`/room/${room.id}`);
        });

        socket.on('create-failed', message => {
            toast.error(message);
        });

        return () => {
            socket.off('room-created');
            socket.off('create-failed');
        };
    }, [navigate]);

    function handleCreateRoom() {
        const username = sessionStorage.getItem('username');

        socket.emit('create-room', {
            game: gameId,
            username
        });
    }

    function handleBackToLobby() {
        navigate('/lobby');
    }

    function handleJoinRoom() {
        navigate(`/game/${gameId}/join`);
    }

    if (!game) {
        return (
            <h1 style={{ color: 'white', padding: '2rem' }}>
                Game Not Found
            </h1>
        );
    }

    return (
        <>
            <ColorBends colors={['#F97316']} />

            <Navbar />

            <main className="page game-menu-page">
                <div className="panel">

                    {/* Back to Lobby */}
                    <div className="menu-header">
                        <button
                            type="button"
                            className="back-to-lobby"
                            onClick={handleBackToLobby}
                        >
                            <span className="back-arrow">←</span>
                            <span>Game Lobby</span>
                        </button>
                    </div>

                    {/* Game artwork */}
                    <img
                        className="menu-image"
                        src={game.image}
                        alt={game.name}
                    />

                    {/* Game information */}
                    <h1 className="page-title">
                        {game.name}
                    </h1>

                    <p className="subtitle">
                        {game.details}
                    </p>

                    {/* Game metadata */}
                    <div className="badges">
                        <span>
                            Difficulty : {game.difficulty}
                        </span>

                        <span>
                            Duration : {game.duration}
                        </span>
                    </div>

                    {/* Room actions */}
                    <div className="menu-buttons">
                        <Button onClick={handleCreateRoom}>
                            Create Room
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={handleJoinRoom}
                        >
                            Join Room
                        </Button>
                    </div>

                </div>
            </main>
        </>
    );
}

export default GameMenuPage;
