import ChoiceCard from "./ChoiceCard";
import Button from "../../../components/Button";

import { MOVE_LIST } from "../constants";

function ChoiceSelector({

    selectedMove,

    locked,

    onSelect,

    onLock

}){

    return(

        <div className="choice-selector">

            <h2 className="selector-title">

                Choose Your Move

            </h2>

            <div className="choice-grid">

                {

                    MOVE_LIST.map(

                        move=>

                            <ChoiceCard

                                key={move}

                                move={move}

                                selected={

                                    selectedMove===move

                                }

                                locked={locked}

                                onClick={()=>onSelect(move)}

                            />

                    )

                }

            </div>

            <Button

                onClick={onLock}

                disabled={

                    locked ||

                    !selectedMove

                }

            >

                {

                    locked

                    ?

                    "Choice Locked"

                    :

                    "Lock Choice"

                }

            </Button>

        </div>

    );

}

export default ChoiceSelector;