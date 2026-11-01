import { useParams } from 'react-router-dom';

import socket from '../../../services/socket';
import Board from '../components/Board';
import GameInfo from '../../common/components/GameInfo';
import GameStatus from '../../common/components/GameStatus';
import GameControls from '../../common/components/GameControls';
import Loading from '../../../components/Loading';

import useGameSocket from '../../common/hooks/useGameSocket';

import './TicTacToePage.css';


function TicTacToePage() {

    const { roomId } = useParams();

    const {

        room,

        leaveRoom

    } = useGameSocket(roomId);


    if (!room || !room.gameState) {

        return(

            <Loading/>

        );

    }


    const game = room.gameState;

    const isHost = room.hostId === socket.id;

    const mySymbol = game.symbols[socket.id];

    const opponentDisconnected = room.players.length < 2;

    const canRestartGame =room.players.length >= room.minPlayers;


    function makeMove(index) {

        socket.emit(

            "make-move",

            {

                roomId,

                payload: {

                    index

                }

            }

        );

    }



    function restartGame() {

        socket.emit(

            "restart-game",

            {

                roomId

            }

        );

    }



    return (
        <>
        <div className="ttt-page">

            <GameInfo

                title="Tic Tac Toe"

                symbol={mySymbol}

                turn={game.currentTurn}

            />


            <GameStatus

                winner={game.winner}

                draw={game.draw}

                disconnected={opponentDisconnected}

            />


            <Board

                board={game.board}

                makeMove={makeMove}

            />


            <GameControls

                canRestart={isHost}

                canRestartGame={canRestartGame}

                showRestart={

                    game.winner ||

                    game.draw

                }

                onRestart={restartGame}

                onLeave={leaveRoom}

            />

        </div>
        </>

    );

}


export default TicTacToePage;