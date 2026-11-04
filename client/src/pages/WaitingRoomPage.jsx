
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import socket from '../services/socket';
import './WaitingRoomPage.css';

import Button from '../components/Button';
import Loading from '../components/Loading';

function WaitingRoomPage() {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);

    useEffect(() => {
        function handleRoomData(data) {
            setRoom(data);

            if (data.status === 'playing') {
                navigate(`/game/${data.game}/play/${data.id}`);
            }
        }

        function handleRoomUpdated(updated) {
            setRoom(updated);

            if (updated.status === 'playing') {
                navigate(`/game/${updated.game}/play/${updated.id}`);
            }
        }

        function handleRoomNotFound() {
            navigate('/lobby', { replace: true });
        }

        function handleLeftRoom() {
            navigate('/lobby', { replace: true });
        }

        socket.connect();

        socket.on('room-data', handleRoomData);
        socket.on('room-updated', handleRoomUpdated);
        socket.on('game-updated', handleRoomUpdated);
        socket.on('room-not-found', handleRoomNotFound);
        socket.on('left-room', handleLeftRoom);

        socket.emit('get-room', { roomId });

        return () => {
            socket.off('room-data', handleRoomData);
            socket.off('room-updated', handleRoomUpdated);
            socket.off('game-updated', handleRoomUpdated);
            socket.off('room-not-found', handleRoomNotFound);
            socket.off('left-room', handleLeftRoom);
        };
    }, [roomId, navigate]);

    if (!room) {
        return <Loading />;
    }

    const isHost = room.hostId === socket.id;
    const gameName = room.gameName || room.game;

    function startGame() {
        socket.emit('start-game', { roomId });
    }

    function leaveRoom() {
        socket.emit('leave-room');
    }

    async function copyRoomCode() {
        try {
            await navigator.clipboard.writeText(room.id);
            toast.success('Copied!');
        } catch {
            toast.error('Unable to copy room code');
        }
    }

    return (
        <div className="waiting-room">
            <div className="room-card">
                <div className="room-header">
                    <div>
                        <h1 className="room-title">
                            Room {room.id}
                        </h1>

                        <p className="room-game">
                            {gameName}
                        </p>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={copyRoomCode}
                    >
                        Copy Code
                    </Button>
                </div>

                <div className="status">
                    <h3>Status</h3>

                    <span className={`badge ${room.status}`}>
                        {room.status.toUpperCase()}
                    </span>
                </div>

                <div className="capacity">
                    <h3>Capacity</h3>
                    <p>
                        {room.players.length}/{room.roomCapacity}
                    </p>
                </div>

                <div className="players">
                    <h3>Players</h3>

                    {room.players.map(player => (
                        <div
                            key={player.socketId}
                            className="player"
                        >
                            <span>{player.username}</span>

                            {player.socketId === room.hostId && (
                                <span>👑</span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="buttons">
                    {isHost && room.status === 'ready' && (
                        <Button onClick={startGame}>
                            Start Game
                        </Button>
                    )}

                    <Button
                        variant="danger"
                        onClick={leaveRoom}
                    >
                        Leave Room
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default WaitingRoomPage;
