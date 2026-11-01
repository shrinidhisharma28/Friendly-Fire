function GameInfoModal({ game }) {

    return (

        <>

            <h2 className="back-title">

                {game.name}

            </h2>


            <p className="back-description">

                {game.details}

            </p>


            <div className="back-stats">


                <div>

                    🎯 {game.difficulty}

                </div>


                <div>

                    ⏱ {game.duration}

                </div>


                <div>

                    👥

                    {

                        game.minPlayers===game.maxPlayers

                        ?

                        game.minPlayers

                        :

                        `${game.minPlayers}-${game.maxPlayers}`

                    }

                    {" "}Players

                </div>


            </div>


            <p className="back-hint">

                ↩ Click anywhere to return

            </p>


        </>

    );

}

export default GameInfoModal;