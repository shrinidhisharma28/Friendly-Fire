const {

    PHASES,

    WIN_SCORE

} = require("./constants");

const {

    determineWinner,

    isValidMove

}=require("./helpers");


function initializeGame(room){

    return{

        phase:PHASES.CHOOSING,

        round:1,

        winner:null,

        lastRoundWinner:null,

        scores:{

            [room.players[0].socketId]:0,

            [room.players[1].socketId]:0

        },

        choices:{

            [room.players[0].socketId]:null,

            [room.players[1].socketId]:null

        },

        locked:{

            [room.players[0].socketId]:false,

            [room.players[1].socketId]:false

        }

    };

}


function makeMove(

    room,

    socketId,

    payload

){

    const game=

        room.gameState;


    if(

        game.phase===PHASES.GAME_OVER

    ){

        return{

            success:false,

            message:"Game already finished"

        };

    }


    if(

        payload.action==="select"

    ){

        if(

            game.locked[socketId]

        ){

            return{

                success:false,

                message:"Choice already locked"

            };

        }


        game.choices[socketId]=

            payload.move;


        return{

            success:true,

            room

        };

    }


    if(

        payload.action==="lock"

    ){

        if(

            !game.choices[socketId]

        ){

            return{

                success:false,

                message:"Select a move first"

            };

        }


        game.locked[socketId]=true;


        const players=

            room.players.map(

                player=>player.socketId

            );


        const bothLocked=

            players.every(

                id=>game.locked[id]

            );


        if(

            bothLocked

        ){

            game.phase=

                PHASES.REVEALING;


            const result=

                determineWinner(

                    game.choices[players[0]],

                    game.choices[players[1]]

                );


            if(

                result==="draw"

            ){

                game.lastRoundWinner=null;

            }

            else if(

                result==="player1"

            ){

                game.scores[players[0]]++;

                game.lastRoundWinner=

                    players[0];

            }

            else{

                game.scores[players[1]]++;

                game.lastRoundWinner=

                    players[1];

            }

        }


        return{

            success:true,

            room

        };

    }


    if(

        payload.action==="continue"

    ){

        const players=

            room.players.map(

                player=>player.socketId

            );


        if(

            game.scores[players[0]]>=WIN_SCORE

        ){

            game.phase=

                PHASES.GAME_OVER;

            game.winner=

                players[0];

            return{

                success:true,

                room

            };

        }


        if(

            game.scores[players[1]]>=WIN_SCORE

        ){

            game.phase=

                PHASES.GAME_OVER;

            game.winner=

                players[1];

            return{

                success:true,

                room

            };

        }


        game.phase=

            PHASES.CHOOSING;


        game.round++;


        players.forEach(id=>{

            game.choices[id]=null;

            game.locked[id]=false;

        });


        game.lastRoundWinner=null;


        return{

            success:true,

            room

        };

    }


    return{

        success:false,

        message:"Invalid action"

    };

}


module.exports={

    initializeGame,

    makeMove

};