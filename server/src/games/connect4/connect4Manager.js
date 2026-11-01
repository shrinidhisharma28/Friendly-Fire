function initializeGame(room) {

    return {

        board: Array(6)
            .fill(null)
            .map(() => Array(7).fill(null)),

        currentTurn: "R",

        winner: null,

        draw: false,

        symbols: {

            [room.players[0].socketId]: "R",

            [room.players[1].socketId]: "Y"

        }

    };

}



function checkWinner(board, row, col, symbol) {

    const directions = [

        [0, 1],

        [1, 0],

        [1, 1],

        [1, -1]

    ];


    for (const [dr, dc] of directions) {

        let count = 1;


        let r = row + dr;
        let c = col + dc;


        while (

            r >= 0 &&
            r < 6 &&
            c >= 0 &&
            c < 7 &&
            board[r][c] === symbol

        ) {

            count++;

            r += dr;
            c += dc;

        }


        r = row - dr;
        c = col - dc;


        while (

            r >= 0 &&
            r < 6 &&
            c >= 0 &&
            c < 7 &&
            board[r][c] === symbol

        ) {

            count++;

            r -= dr;
            c -= dc;

        }


        if (count >= 4) {

            return true;

        }

    }


    return false;

}



function makeMove(room, socketId, payload) {

    const column = payload.column;


    if (room.status !== "playing") {

        return {

            success: false,

            message: "Game not started"

        };

    }


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


    let row = -1;


    for (let i = 5; i >= 0; i--) {

        if (game.board[i][column] === null) {

            row = i;

            break;

        }

    }


    if (row === -1) {

        return {

            success: false,

            message: "Column full"

        };

    }


    game.board[row][column] = symbol;


    if (

        checkWinner(

            game.board,

            row,

            column,

            symbol

        )

    ) {

        game.winner = symbol;

    }

    else if (

        game.board.every(

            row =>

                row.every(

                    cell => cell !== null

                )

        )

    ) {

        game.draw = true;

    }

    else {

        game.currentTurn =

            game.currentTurn === "R"

                ? "Y"

                : "R";

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