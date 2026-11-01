import { useState } from "react";
import { useParams } from "react-router-dom";

import socket from "../../../services/socket";
import useGameSocket from "../../common/hooks/useGameSocket";

import Loading from "../../../components/Loading";
import ColorBends from "../../../components/ColorBendsbg";

import ScoreBoard from "../components/ScoreBoard";
import HandDisplay from "../components/HandDisplay";
import ChoiceSelector from "../components/ChoiceSelector";
import RoundResult from "../components/RoundResult";

import GameControls from "../../common/components/GameControls";

import "./RockPaperScissors.css";

function RockPaperScissorsPage() {

    const { roomId } = useParams();

    const {
        room,
        leaveRoom
    } = useGameSocket(roomId);

    const [
        selectedMove,
        setSelectedMove
    ] = useState(null);

    if (!room || !room.gameState) {

        return <Loading />;

    }

    const game = room.gameState;

    const myId = socket.id;

    const opponent =
        room.players.find(
            player => player.socketId !== myId
        );

    const isHost =
        room.hostId === myId;

    const canRestartGame =
        room.players.length >= room.minPlayers;

    function selectMove(move) {

        if (game.locked[myId]) return;

        setSelectedMove(move);

        socket.emit(
            "make-move",
            {
                roomId,
                payload: {
                    action: "select",
                    move
                }
            }
        );

    }

    function lockChoice() {

        socket.emit(
            "make-move",
            {
                roomId,
                payload: {
                    action: "lock"
                }
            }
        );

    }

    function continueGame() {

        socket.emit(
            "make-move",
            {
                roomId,
                payload: {
                    action: "continue"
                }
            }
        );

        setSelectedMove(null);

    }

    function restartGame() {

        socket.emit(
            "restart-game",
            {
                roomId
            }
        );

        setSelectedMove(null);

    }

    const revealed =
        game.phase === "revealing" ||
        game.phase === "game_over";

    return (

        <>
            <ColorBends />

            <div className="rps-page">

                <div className="rps-container">

                    <ScoreBoard
                        players={room.players}
                        scores={game.scores}
                        round={game.round}
                    />

                    <section className="battle-section">

                        <HandDisplay
                            username={room.players[0].username}
                            move={
                                game.choices[
                                    room.players[0].socketId
                                ]
                            }
                            revealed={revealed}
                        />

                        <div className="battle-center">

                            <h1>VS</h1>

                        </div>

                        <HandDisplay
                            username={opponent.username}
                            move={
                                game.choices[
                                    opponent.socketId
                                ]
                            }
                            revealed={revealed}
                        />

                    </section>

                    {

                        game.phase === "choosing" &&

                        <section className="selector-section">

                            <ChoiceSelector
                                selectedMove={selectedMove}
                                locked={game.locked[myId]}
                                onSelect={selectMove}
                                onLock={lockChoice}
                            />

                        </section>

                    }

                    {

                        game.phase !== "choosing" &&

                        <section className="result-section">

                            <RoundResult
                                room={room}
                                socketId={myId}
                            />

                        </section>

                    }

                    {

                        game.phase === "revealing" &&
                        isHost &&

                        <div className="action-row">

                            <button
                                className="continue-btn"
                                onClick={continueGame}
                            >
                                Next Round
                            </button>

                        </div>

                    }

                    {

                        game.phase === "game_over" &&

                        <GameControls
                            canRestart={isHost}
                            canRestartGame={canRestartGame}
                            showRestart={true}
                            onRestart={restartGame}
                            onLeave={leaveRoom}
                        />

                    }

                </div>

            </div>

        </>

    );

}

export default RockPaperScissorsPage;