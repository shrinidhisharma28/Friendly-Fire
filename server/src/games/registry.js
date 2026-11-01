module.exports = {

    tictactoe: {

        name: "Tic Tac Toe",

        manager:

            require(

                "./tictactoe/tictactoeManager"

            )

    },


    connect4: {

        name: "Connect 4",

        manager:

            require(

                "./connect4/connect4Manager"

            )

    },

    rockpaperscissors:{

    name:"Rock Paper Scissors",

    manager:

        require(

            "./rockpaperscissors/rpsManager"

        )

    }



};