import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import socket from '../../../services/socket';

function useGameSocket(roomId) {

    const navigate = useNavigate();

    const [room, setRoom] = useState(null);

    useEffect(() => {

        socket.connect();

        socket.emit("get-room", { roomId });

        socket.on("room-data", room => {
            setRoom(room);
        });

        socket.on("game-updated", room => {
            setRoom(room);
        });

        socket.on("left-room", () => {
            navigate("/lobby");
        });

        return () => {
            socket.off("room-data");
            socket.off("game-updated");
            socket.off("left-room");
        };

    }, [roomId, navigate]);


    function leaveRoom() {
        socket.emit("leave-room");
    }


    return {
        room,
        setRoom,
        leaveRoom
    };

}

export default useGameSocket;