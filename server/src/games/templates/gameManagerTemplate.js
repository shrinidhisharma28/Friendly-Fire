function initializeGame(room){

    return {

        // Initial game state

    };

}


function makeMove(

    room,

    socketId,

    payload

){

    return {

        success:false,

        message:"Not implemented"

    };

}


function canStartGame(room){

    return true;

}


function canRestartGame(room){

    return true;

}


function onPlayerJoin(

    room,

    socketId

){

}


function onPlayerLeave(

    room,

    socketId

){

}


module.exports={

    initializeGame,

    makeMove,

    canStartGame,

    canRestartGame,

    onPlayerJoin,

    onPlayerLeave

};