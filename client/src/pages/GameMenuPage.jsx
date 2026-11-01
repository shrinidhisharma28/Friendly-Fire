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
        socket.on("room-created", room => {
            navigate(`/room/${room.id}`);
        });
        socket.on("create-failed", message => {
            toast.error(message);
        });
        return () => {
            socket.off("room-created");
            socket.off("create-failed");
        };
    }, [navigate]);

    function handleCreateRoom() {
        const username = sessionStorage.getItem("username");
        socket.emit("create-room", { game: gameId, username });
    }

    if (!game) {
        return <h1 style={{ color: "white", padding: "2rem" }}>Game Not Found</h1>;
    }

    return (
        <>
            <ColorBends colors={["#F97316"]} />
            <Navbar />
            <div className="page">
                <div className="panel">
                    <img className="menu-image" src={game.image} alt={game.name} />
                    <h1 className="page-title">{game.name}</h1>
                    <p className="subtitle">{game.details}</p>
                    <div className="badges">
                        <span>Difficulty : {game.difficulty}</span>
                        <span>Duration : {game.duration}</span>
                    </div>
                    <div className="menu-buttons">
                        <Button onClick={handleCreateRoom}>Create Room</Button>
                        <Button variant="secondary" onClick={() => navigate(`/game/${gameId}/join`)}>
                            Join Room
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default GameMenuPage;
