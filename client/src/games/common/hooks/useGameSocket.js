
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import socket from '../../../services/socket';

function useGameSocket(roomId) {
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [moveError, setMoveError] = useState(null);
    const [opponentLeft, setOpponentLeft] = useState(false);
    const [opponentLeftMessage, setOpponentLeftMessage] = useState('');

    useEffect(() => {
        if (!roomId) {
            navigate('/lobby', { replace: true });
            return;
        }

        function handleRoomData(updatedRoom) {
            setRoom(updatedRoom);
            setMoveError(null);
        }

        function handleRoomUpdated(updatedRoom) {
            setRoom(updatedRoom);
        }

        function handleGameUpdated(updatedRoom) {
            setRoom(updatedRoom);
            setMoveError(null);
        }

        function handleMoveFailed(message) {
            setMoveError(message);
        }

        function handleOpponentLeft(data) {
            if (data?.roomId && data.roomId !== roomId) {
                return;
            }

            setOpponentLeft(true);
            setOpponentLeftMessage(
                data?.message || 'Your opponent left the game.'
            );
        }

        function handleLeftRoom() {
            navigate('/lobby', { replace: true });
        }

        function handleRoomNotFound() {
            navigate('/lobby', { replace: true });
        }

        socket.connect();

        socket.on('room-data', handleRoomData);
        socket.on('room-updated', handleRoomUpdated);
        socket.on('game-updated', handleGameUpdated);
        socket.on('move-failed', handleMoveFailed);
        socket.on('opponent-left', handleOpponentLeft);
        socket.on('left-room', handleLeftRoom);
        socket.on('room-not-found', handleRoomNotFound);

        socket.emit('get-room', { roomId });

        return () => {
            socket.off('room-data', handleRoomData);
            socket.off('room-updated', handleRoomUpdated);
            socket.off('game-updated', handleGameUpdated);
            socket.off('move-failed', handleMoveFailed);
            socket.off('opponent-left', handleOpponentLeft);
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
        leaveRoom,
        moveError,
        opponentLeft,
        opponentLeftMessage
    };
}

export default useGameSocket;
