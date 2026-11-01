import './GameControls.css';
import Button from '../../../components/Button';

function GameControls({

    canRestart,

    canRestartGame,

    showRestart,

    onRestart,

    onLeave

}){

    return(

        <div className="controls">

            {

                showRestart

                &&

                canRestart

                &&

                <>

                    <Button

                        onClick={onRestart}

                        disabled={!canRestartGame}

                    >

                        Play Again

                    </Button>

                    {

                        !canRestartGame

                        &&

                        <p className="restart-note">

                            Waiting for enough players to restart...

                        </p>

                    }

                </>

            }

            <Button

                variant="danger"

                onClick={onLeave}

            >

                Leave Room

            </Button>

        </div>

    );

}

export default GameControls;