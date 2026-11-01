function initializeGame(room) {

    return {

        board: Array(9).fill(null),

        currentTurn: "X",

        winner: null,

        draw: false,

        symbols: {

            [room.players[0].socketId]: "X",

            [room.players[1].socketId]: "O"

        }

    };

}



function checkWinner(board) {

    const combinations = [

        [0, 1, 2],

        [3, 4, 5],

        [6, 7, 8],

        [0, 3, 6],

        [1, 4, 7],

        [2, 5, 8],

        [0, 4, 8],

        [2, 4, 6]

    ];


    for (const [a, b, c] of combinations) {

        if (

            board[a] &&

            board[a] === board[b] &&

            board[b] === board[c]

        ) {

            return board[a];

        }

    }


    return null;

}



function makeMove(room, socketId, payload) {

    const index = payload.index;


    const game = room.gameState;


    if (game.winner || game.draw) {

        return {

            success: false,

            message: "Game finished"

        };

    }


    const symbol = game.symbols[socketId];


    if (symbol !== game.currentTurn) {

        return {

            success: false,

            message: "Not your turn"

        };

    }


    if (game.board[index]) {

        return {

            success: false,

            message: "Cell occupied"

        };

    }


    game.board[index] = symbol;


    const winner =

        checkWinner(

            game.board

        );


    if (winner) {

        game.winner = winner;

    }

    else if (

        game.board.every(

            cell => cell

        )

    ) {

        game.draw = true;

    }

    else {

        game.currentTurn =

            game.currentTurn === "X"

                ? "O"

                : "X";

    }


    return {

        success: true,

        room

    };

}



module.exports = {

    initializeGame,

    makeMove

};