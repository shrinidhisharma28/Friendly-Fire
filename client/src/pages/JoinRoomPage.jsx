import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import socket from '../services/socket';
import { useGames } from '../hooks/useGames';
import Button from '../components/Button';
import Input from '../components/Input';
import ColorBends from '../components/ColorBends';

function JoinRoomPage() {
    const [roomId, setRoomId] = useState("");
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { games } = useGames();
    const game = games.find(g => g.id === gameId);

    useEffect(() => {
        socket.connect();
        socket.on("room-updated", room => {
            navigate(`/room/${room.id}`);
        });
        socket.on("join-failed", message => {
            toast.error(message);
        });
        return () => {
            socket.off("room-updated");
            socket.off("join-failed");
        };
    }, []);

    function handleJoin() {
        if (!roomId.trim()) {
            toast.error("Enter Room Code");
            return;
        }
        const username = sessionStorage.getItem("username");
        socket.emit("join-room", {
            roomId: roomId.trim().toUpperCase(),
            username
        });
    }

    return (
        <>
            <ColorBends colors={["#F97316"]} speed={0.4} intensity={1.5} noise={0} rotation={-55} autoRotate={-3} />
            <div className="page">
                <div className="panel">
                    <h1 className="page-title">Join Room</h1>
                    {game && <p className="subtitle">{game.name}</p>}
                    <Input
                        placeholder="Room Code"
                        value={roomId}
                        onChange={e => setRoomId(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleJoin(); }}
                    />
                    <Button onClick={handleJoin}>Join</Button>
                    <Button variant="secondary" onClick={() => navigate(`/game/${gameId}`)}>
                        Back to Menu
                    </Button>
                </div>
            </div>
        </>
    );
}

export default JoinRoomPage;
