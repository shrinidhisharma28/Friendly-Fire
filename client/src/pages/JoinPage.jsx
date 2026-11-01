
import { useCallback, useEffect, useState } from 'react';

import { useGames } from '../hooks/useGames';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import GameCard from '../components/GameCard';

import './LobbyPage.css';

const AUTO_SLIDE_INTERVAL = 5000;

function GameLobbyPage() {
    const [search, setSearch] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const { games, loading } = useGames();

    const filteredGames = games.filter(game =>
        game.name.toLowerCase().includes(search.toLowerCase())
    );

    // Keep the active index valid when search results change.
    useEffect(() => {
        setActiveIndex(0);
        setIsPaused(false);
    }, [search]);

    useEffect(() => {
        if (filteredGames.length <= 1 || isPaused) return;

        const interval = setInterval(() => {
            setActiveIndex(current =>
                (current + 1) % filteredGames.length
            );
        }, AUTO_SLIDE_INTERVAL);

        return () => clearInterval(interval);
    }, [filteredGames.length, isPaused]);

    const goToNext = useCallback(() => {
        setActiveIndex(current =>
            filteredGames.length
                ? (current + 1) % filteredGames.length
                : 0
        );
    }, [filteredGames.length]);

    const goToPrevious = useCallback(() => {
        setActiveIndex(current =>
            filteredGames.length
                ? (current - 1 + filteredGames.length) % filteredGames.length
                : 0
        );
    }, [filteredGames.length]);

    // Calculate each card's position relative to the active card.
    const getCardOffset = index => {
        const total = filteredGames.length;

        if (total <= 1) return 0;

        let offset = (index - activeIndex + total) % total;

        if (offset > total / 2) {
            offset -= total;
        }

        // For two games, keep the second card on the right.
        if (total === 2 && offset === 1) {
            return 1;
        }

        return offset;
    };

    return (
        <>
            <Navbar />

            <main className="page lobby-page">
                <header className="lobby-header">
                    <h1 className="lobby-title">
                        Game Lobby
                    </h1>

                    <p className="lobby-subtitle">
                        Choose a game and challenge your friends
                    </p>
                </header>

                <div className="search-wrapper">
                    <SearchBar
                        search={search}
                        setSearch={setSearch}
                    />
                </div>

                {loading ? (
                    <p className="empty-message">
                        Loading games...
                    </p>
                ) : filteredGames.length === 0 ? (
                    <h2 className="empty-message">
                        No Games Found
                    </h2>
                ) : (
                    <section
                        className="game-carousel"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        onFocusCapture={() => setIsPaused(true)}
                        onBlurCapture={event => {
                            if (!event.currentTarget.contains(event.relatedTarget)) {
                                setIsPaused(false);
                            }
                        }}
                        aria-label="Game selection carousel"
                    >
                        <div className="carousel-stage">
                            {filteredGames.map((game, index) => {
                                const offset = getCardOffset(index);

                                return (
                                    <GameCard
                                        key={game.id}
                                        game={game}
                                        offset={offset}
                                        isActive={offset === 0}
                                        onInfoOpen={() => setIsPaused(true)}
                                        onInfoClose={() => setIsPaused(false)}
                                    />
                                );
                            })}
                        </div>

                        {filteredGames.length > 1 && (
                            <div className="carousel-controls">
                                <button
                                    type="button"
                                    className="carousel-arrow"
                                    onClick={goToPrevious}
                                    aria-label="Previous game"
                                >
                                    &#10094;
                                </button>

                                <div className="carousel-indicators">
                                    {filteredGames.map((game, index) => (
                                        <button
                                            key={game.id}
                                            type="button"
                                            className={
                                                index === activeIndex
                                                    ? 'carousel-dot active'
                                                    : 'carousel-dot'
                                            }
                                            onClick={() => setActiveIndex(index)}
                                            aria-label={`Show ${game.name}`}
                                            aria-current={
                                                index === activeIndex ? 'true' : undefined
                                            }
                                        />
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    className="carousel-arrow"
                                    onClick={goToNext}
                                    aria-label="Next game"
                                >
                                    &#10095;
                                </button>
                            </div>
                        )}

                        <p className="carousel-counter">
                            {activeIndex + 1} / {filteredGames.length}
                        </p>
                    </section>
                )}
            </main>
        </>
    );
}

export default GameLobbyPage;
