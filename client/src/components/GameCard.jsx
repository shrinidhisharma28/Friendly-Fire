
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from './Button';
import GameInfoModal from './GameInfoModal';

import './GameCard.css';

function GameCard({
    game,
    offset = 0,
    isActive = false,
    onInfoOpen,
    onInfoClose
}) {
    const [flipped, setFlipped] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isActive && flipped) {
            setFlipped(false);
            onInfoClose?.();
        }
    }, [isActive, flipped, onInfoClose]);

    const handleInfoOpen = (event) => {
        event.stopPropagation();

        if (!isActive) return;

        setFlipped(true);
        onInfoOpen?.();
    };

    const handleInfoClose = () => {
        setFlipped(false);
        onInfoClose?.();
    };

    const handlePlay = () => {
        if (!isActive || flipped) return;

        navigate(`/game/${game.id}`);
    };

    return (
        <article
            className={`game-card ${isActive ? 'active-card' : 'side-card'}`}
            style={{ '--card-offset': offset }}
            aria-hidden={Math.abs(offset) > 1}
        >
            <div className={`card-inner ${flipped ? 'flipped' : ''}`}>

                {/* Front side */}
                <div className="game-front">

                    <div className="game-image">
                        <img
                            src={game.image}
                            alt={game.name}
                            draggable="false"
                        />
                    </div>

                    <div className="game-details">

                        <div className="title-row">
                            <h2
                                className="game-title"
                                title={game.name}
                            >
                                {game.name}
                            </h2>

                            <button
                                type="button"
                                className="info-btn"
                                onClick={handleInfoOpen}
                                disabled={!isActive}
                                aria-label={`Information about ${game.name}`}
                            >
                                ⓘ
                            </button>
                        </div>

                        <div className="players-row">
                            <p className="players">
                                <span>PLAYERS</span>

                                {game.minPlayers === game.maxPlayers
                                    ? game.minPlayers
                                    : `${game.minPlayers} - ${game.maxPlayers}`}
                            </p>
                        </div>

                        <div className="button-row">
                            <Button onClick={handlePlay}>
                                Play
                            </Button>
                        </div>

                    </div>
                </div>

                {/* Back side */}
                <div
                    className="game-back"
                    onClick={handleInfoClose}
                >
                    <GameInfoModal game={game} />
                </div>

            </div>
        </article>
    );
}

export default GameCard;
