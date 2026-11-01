
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import socket from '../../../services/socket';

function useGameSocket(roomId) {
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);

    useEffect(() => {
        function handleRoomData(updatedRoom) {
            setRoom(updatedRoom);
        }

        function handleGameUpdated(updatedRoom) {
            setRoom(updatedRoom);
        }

        function handleLeftRoom() {
            navigate('/lobby', { replace: true });
        }

        function handleRoomNotFound() {
            navigate('/lobby', { replace: true });
        }

        socket.connect();

        socket.on('room-data', handleRoomData);
        socket.on('game-updated', handleGameUpdated);
        socket.on('left-room', handleLeftRoom);
        socket.on('room-not-found', handleRoomNotFound);

        socket.emit('get-room', { roomId });

        return () => {
            socket.off('room-data', handleRoomData);
            socket.off('game-updated', handleGameUpdated);
            socket.off('left-room', handleLeftRoom);
            socket.off('room-not-found', handleRoomNotFound);
        };
    }, [roomId, navigate]);

    function leaveRoom() {
        socket.emit('leave-room');
    }

    return {
        room,
        setRoom,
        leaveRoom
    };
}

export default useGameSocket;
