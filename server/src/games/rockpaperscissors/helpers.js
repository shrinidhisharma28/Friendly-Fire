const {

    MOVES

}=require("./constants");


function isValidMove(move){

    return Object.values(

        MOVES

    ).includes(move);

}


function determineWinner(

    move1,

    move2

){

    if(

        move1===move2

    ){

        return "draw";

    }


    if(

        (

            move1===MOVES.ROCK &&

            move2===MOVES.SCISSORS

        )

        ||

        (

            move1===MOVES.PAPER &&

            move2===MOVES.ROCK

        )

        ||

        (

            move1===MOVES.SCISSORS &&

            move2===MOVES.PAPER

        )

    ){

        return "player1";

    }


    return "player2";

}


module.exports={

    isValidMove,

    determineWinner

};