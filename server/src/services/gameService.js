const games = require("../games/registry");


function getManager(gameName) {

    const game = games[gameName];


    if (

        !game

    ) {

        return null;

    }


    return game.manager;

}



function initializeGame(room) {

    const manager =

        getManager(

            room.game

        );


    if (

        manager

        &&

        manager.initializeGame

    ) {

        room.gameState =

            manager.initializeGame(

                room

            );

    }

}



function makeMove(

    room,

    socketId,

    payload

) {

    const manager =

        getManager(

            room.game

        );


    if (

        !manager

        ||

        !manager.makeMove

    ) {

        return {

            success:false,

            message:

                "Unsupported game"

        };

    }


    return manager.makeMove(

        room,

        socketId,

        payload

    );

}



module.exports = {

    getManager,

    initializeGame,

    makeMove

};