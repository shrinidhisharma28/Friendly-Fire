import { useParams } from 'react-router-dom';

import socket from '../../../services/socket';

import useGameSocket from '../../common/hooks/useGameSocket';

import GameInfo from '../../common/components/GameInfo';
import GameStatus from '../../common/components/GameStatus';
import GameControls from '../../common/components/GameControls';
import Loading from '../../../components/Loading';

import Board from '../components/Board';
import ColorBends from '../../../components/ColorBends';


function Connect4Page() {

    const { roomId } = useParams();

    


    const {

        room,

        leaveRoom

    }

    =

    useGameSocket(roomId);


    if (

        !room ||

        !room.gameState

    ) {

        return(

        <Loading/>

        );

    }


    const game = room.gameState;


    const isHost =

        room.hostId === socket.id;


    const mySymbol=

        game.symbols[socket.id]==="R"

        ?

        "🔴"

        :

        "🟡";


    const opponentDisconnected =

        room.players.length < 2;

    const canRestartGame =room.players.length >= room.minPlayers;


    function makeMove(column) {

        socket.emit(

            "make-move",

            {

                roomId,

                payload: {

                    column

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
            <ColorBends
                colors={["#F97316"]}
                intensity={0.9}
                noise={0}
            />

            <GameInfo

                title="Connect 4"

                symbol={mySymbol}

                turn={

                    game.currentTurn==="R"

                        ?

                        "🔴"

                        :

                        "🟡"

                    }

            />


            <GameStatus

                winner={

                    game.winner==="R"

                    ?

                    "🔴"

                    :

                    game.winner==="Y"

                    ?

                    "🟡"

                    :

                    null

                }

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

        </>

    );

}


export default Connect4Page;