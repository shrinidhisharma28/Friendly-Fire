function ScoreBoard({

    players,

    scores,

    round

}){

    return(

        <div className="score-board">

            <div className="player-score">

                <h2>

                    {players[0].username}

                </h2>

                <span className="score">

                    {

                        scores[

                            players[0].socketId

                        ]

                    }

                </span>

            </div>

            <div className="round-info">

                <h1>

                    ROUND

                </h1>

                <span>

                    {round} / 5

                </span>

            </div>

            <div className="player-score">

                <h2>

                    {players[1].username}

                </h2>

                <span className="score">

                    {

                        scores[

                            players[1].socketId

                        ]

                    }

                </span>

            </div>

        </div>

    );

}

export default ScoreBoard;