import images from "../assets/images";

function ChoiceCard({

    move,

    selected,

    locked,

    onClick

}){

    return(

        <button

            className={

                `choice-card

                ${selected ? "selected" : ""}

                ${locked ? "locked" : ""}`

            }

            onClick={onClick}

            disabled={locked}

        >

            <div className="choice-image-container">

                <img

                    src={images[move]}

                    alt={move}

                    className="choice-image"

                />

            </div>

            <h3 className="choice-title">

                {

                    move.charAt(0).toUpperCase()

                    +

                    move.slice(1)

                }

            </h3>

            {

                locked &&

                <span className="lock-badge">

                    🔒 Locked

                </span>

            }

        </button>

    );

}

export default ChoiceCard;