import './GameStatus.css';


function GameStatus({

    winner,

    draw,

    disconnected

}){


    if(disconnected){

        return(

            <div className="status-message disconnect">

                ⚠ Opponent Disconnected

            </div>

        );

    }


    if(winner){

        return(

            <div className="status-message winner">

                🏆 Winner : {winner}

            </div>

        );

    }


    if(draw){

        return(

            <div className="status-message draw">

                🤝 Draw

            </div>

        );

    }


    return null;

}


export default GameStatus;