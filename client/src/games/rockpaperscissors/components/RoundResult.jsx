function RoundResult({

    room,

    socketId

}){

    const game=

        room.gameState;

    let message="";

    if(

        !game.lastRoundWinner

    ){

        message="Round Draw";

    }

    else if(

        game.lastRoundWinner===socketId

    ){

        message="You Won This Round";

    }

    else{

        message=

            room.players.find(

                player=>

                    player.socketId===

                    game.lastRoundWinner

            )?.username+

            " Won This Round";

    }

    return(

        <div className="round-result">

            <h2>

                {message}

            </h2>

        </div>

    );

}

export default RoundResult;