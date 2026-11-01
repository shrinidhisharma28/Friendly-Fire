import images from "../assets/images";

function HandDisplay({

    move,

    username,

    revealed

}){

    return(

        <div className="hand-display">

            <h2 className="player-name">

                {username}

            </h2>

            <div className="hand-container">

                <img

                    src={

                        revealed

                        ?

                        images[move]

                        :

                        images.rock

                    }

                    alt={

                        revealed

                        ?

                        move

                        :

                        "Hidden"

                    }

                    className={`hand-image ${revealed ? "revealed" : "hidden"}`}

                />

            </div>

        </div>

    );

}

export default HandDisplay;