import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from './Button';
import GameInfoModal from './GameInfoModal';

import './GameCard.css';

function GameCard({ game }) {

    const [flipped, setFlipped] = useState(false);

    const navigate = useNavigate();

    return (

        <div className="game-card">

            <div
                className={
                    flipped
                        ? "card-inner flipped"
                        : "card-inner"
                }
            >

                <div className="game-front">

                    <div className="game-image">

                        <img
                            src={game.image}
                            alt={game.name}
                        />

                    </div>


                    <div className="game-details">

                        <div className="title-row">

                            <h2 className="game-title">

                                {game.name}

                            </h2>

                            <button
                                className="info-btn"
                                onClick={() => {
                                    setFlipped(true);
                                }}
                            >
                                ⓘ
                            </button>

                        </div>


                        <div className="players-row">

                            <p className="players">

                                Players :

                                {

                                    game.minPlayers === game.maxPlayers

                                        ?

                                        game.minPlayers

                                        :

                                        `${game.minPlayers}-${game.maxPlayers}`

                                }

                            </p>

                        </div>


                        <div className="button-row">

                            <Button

                                onClick={() => {

                                    navigate(

                                        `/game/${game.id}`

                                    );

                                }}

                            >

                                Play

                            </Button>

                        </div>

                    </div>

                </div>


                <div
                    className="game-back"
                    onClick={() => {
                        setFlipped(false);
                    }}
                >

                    <GameInfoModal
                        game={game}
                    />

                </div>

            </div>

        </div>

    );

}

export default GameCard;