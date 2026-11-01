import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import socket from '../services/socket';

import './WaitingRoomPage.css';

import Button from '../components/Button';
import Loading from '../components/Loading';
import ColorBends from '../components/ColorBendsbg';

function WaitingRoomPage() {

    const { roomId } = useParams();

    const navigate = useNavigate();

    const [room, setRoom] = useState(null);


    useEffect(() => {

        socket.connect();

        socket.emit(
            "get-room",
            { roomId }
        );


        socket.on(
            "room-data",
            data => {
                setRoom(data);
            }
        );


        socket.on(
            "room-updated",
            updated => {

                setRoom(updated);

                if (updated.status === "playing") {

                    navigate(
                        `/game/${updated.game}/play/${updated.id}`
                    );

                }

            }
        );


        socket.on(
            "room-not-found",
            () => {
                navigate("/lobby");
            }
        );


        socket.on(
            "left-room",
            () => {
                navigate("/lobby");
            }
        );


        return () => {

            socket.off("room-data");
            socket.off("room-updated");
            socket.off("room-not-found");
            socket.off("left-room");

        };

    }, [roomId, navigate]);


    if (!room) {

        return <Loading />;

    }


    const isHost = room.hostId === socket.id;


    const gameName =
        room.game === "tictactoe"
            ? "Tic Tac Toe"
            : room.game === "connect4"
            ? "Connect 4"
            : room.game;


    function startGame() {

        socket.emit(
            "start-game",
            {
                roomId
            }
        );

    }


    function leaveRoom() {

        socket.emit(
            "leave-room"
        );

    }


    async function copyRoomCode() {

        await navigator.clipboard.writeText(room.id);

        toast.success("Copied!");

    }


    return (

        <>

            <ColorBends />

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

                            📋 Copy Code

                        </Button>

                    </div>


                    <div className="status">

                        <h3>

                            Status

                        </h3>

                        <span
                            className={`badge ${room.status}`}
                        >

                            {room.status.toUpperCase()}

                        </span>

                    </div>


                    <div className="capacity">

                        <h3>

                            Capacity

                        </h3>

                        <p>

                            {room.players.length}

                            /

                            {room.roomCapacity}

                        </p>

                    </div>


                    <div className="players">

                        <h3>

                            Players

                        </h3>

                        {

                            room.players.map(player => (

                                <div
                                    key={player.socketId}
                                    className="player"
                                >

                                    <span>

                                        {player.username}

                                    </span>

                                    {

                                        player.username === room.hostUsername && (

                                            <span>

                                                👑

                                            </span>

                                        )

                                    }

                                </div>

                            ))

                        }

                    </div>


                    <div className="buttons">

                        {

                            isHost &&
                            room.status === "ready" && (

                                <Button
                                    onClick={startGame}
                                >

                                    Start Game

                                </Button>

                            )

                        }

                        <Button
                            variant="danger"
                            onClick={leaveRoom}
                        >

                            Leave Room

                        </Button>

                    </div>

                </div>

            </div>

        </>

    );

}

export default WaitingRoomPage;