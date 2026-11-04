
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import socket from '../../../services/socket';
import useGameSocket from '../../common/hooks/useGameSocket';

import Loading from '../../../components/Loading';

import GameInfo from '../../common/components/GameInfo';
import GameControls from '../../common/components/GameControls';

import ScoreBoard from '../components/ScoreBoard';
import HandDisplay from '../components/HandDisplay';
import ChoiceSelector from '../components/ChoiceSelector';
import RoundResult from '../components/RoundResult';

import './RockPaperScissors.css';

function RockPaperScissorsPage() {
    const { roomId } = useParams();

    const {
        room,
        leaveRoom,
        opponentLeft,
        opponentLeftMessage
    } = useGameSocket(roomId);

    const [selectedMove, setSelectedMove] = useState(null);

    if (!room) {
        return <Loading />;
    }

    // Do not show an infinite loading screen after the opponent leaves.
    if (opponentLeft) {
        return (
            <div className="rps-page">
                <div className="rps-container">
                    <div
                        role="alert"
                        style={{
                            padding: '16px 20px',
                            marginBottom: '20px',
                            border: '1px solid #b45309',
                            borderRadius: '10px',
                            background: 'rgba(180, 83, 9, 0.15)',
                            color: '#fcd34d',
                            textAlign: 'center',
                            fontWeight: 700
                        }}
                    >
                        {opponentLeftMessage}
                    </div>

                    <GameControls
                        canRestart={false}
                        canRestartGame={false}
                        showRestart={false}
                        onRestart={() => {}}
                        onLeave={leaveRoom}
                    />
                </div>
            </div>
        );
    }

    if (!room.gameState || !socket.id) {
        return <Loading />;
    }

    if (
        !Array.isArray(room.players) ||
        room.players.length !== 2
    ) {
        return <Loading />;
    }

    const game = room.gameState;
    const myId = socket.id;

    const player1 = room.players[0];
    const player2 = room.players[1];

    const isHost = room.hostId === myId;

    const canRestartGame =
        room.players.length >= room.minPlayers;

    function selectMove(move) {
        if (game.locked[myId]) return;

        setSelectedMove(move);

        socket.emit('make-move', {
            roomId,
            payload: {
                action: 'select',
                move
            }
        });
    }

    function lockChoice() {
        socket.emit('make-move', {
            roomId,
            payload: {
                action: 'lock'
            }
        });
    }

    function continueGame() {
        socket.emit('make-move', {
            roomId,
            payload: {
                action: 'continue'
            }
        });

        setSelectedMove(null);
    }

    function restartGame() {
        socket.emit('restart-game', { roomId });
        setSelectedMove(null);
    }

    const revealed =
        game.phase === 'revealing' ||
        game.phase === 'game_over';

    const isGameOver = game.phase === 'game_over';

    return (
        <div className="rps-page">
            <div className="rps-container">

                <GameInfo title="Rock Paper Scissors" />

                <ScoreBoard
                    players={room.players}
                    scores={game.scores}
                    round={game.round}
                />

                <section className="battle-section">

                    <HandDisplay
                        username={player1.username}
                        move={game.choices[player1.socketId]}
                        revealed={revealed}
                    />

                    <div className="battle-center">
                        <h1>VS</h1>
                    </div>

                    <HandDisplay
                        username={player2.username}
                        move={game.choices[player2.socketId]}
                        revealed={revealed}
                    />

                </section>

                {game.phase === 'choosing' && (
                    <section className="selector-section">
                        <ChoiceSelector
                            selectedMove={selectedMove}
                            locked={game.locked[myId]}
                            onSelect={selectMove}
                            onLock={lockChoice}
                        />
                    </section>
                )}

                {game.phase !== 'choosing' && (
                    <section className="result-section">
                        <RoundResult
                            room={room}
                            socketId={myId}
                        />
                    </section>
                )}

                {game.phase === 'revealing' && isHost && (
                    <div className="action-row">
                        <button
                            className="continue-btn"
                            onClick={continueGame}
                        >
                            Next Round
                        </button>
                    </div>
                )}

                <GameControls
                    canRestart={isHost}
                    canRestartGame={canRestartGame}
                    showRestart={isGameOver}
                    onRestart={restartGame}
                    onLeave={leaveRoom}
                />

            </div>
        </div>
    );
}

export default RockPaperScissorsPage;
