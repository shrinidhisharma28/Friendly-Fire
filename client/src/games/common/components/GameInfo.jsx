import './GameInfo.css';


function GameInfo({

    title,

    symbol,

    turn

}){


    return(

        <div className="game-info">


            <h1 className="game-title">

                {title}

            </h1>


            <div className="info-row">


                <div className="info-badge">


                    You are :

                    <span

                        className={

                            symbol==="X"

                            ?

                            "x"

                            :

                            "o"

                        }

                    >

                        {" "}{symbol}

                    </span>


                </div>



                <div className="info-badge">


                    Turn :

                    <span

                        className={

                            turn==="X"

                            ?

                            "x"

                            :

                            "o"

                        }

                    >

                        {" "}{turn}

                    </span>


                </div>


            </div>


        </div>

    );

}


export default GameInfo;