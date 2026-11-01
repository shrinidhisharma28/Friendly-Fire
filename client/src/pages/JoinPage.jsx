import { useState } from 'react';
import { useGames } from '../hooks/useGames';
import './Lobbypage.css';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import GameCard from '../components/GameCard';
import ColorBends from '../components/ColorBends';

function LobbyPage() {
    const [search, setSearch] = useState("");
    const { games, loading } = useGames();

    const filteredGames = games.filter(game =>
        game.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <ColorBends
                colors={["#F97316"]}
                speed={0.4}
                intensity={0.7}
                noise={0}
                rotation={-55}
                autoRotate={-3}
            />
            <Navbar />
            <div className="page">
                <h1 className="page-title">Game Lobby</h1>
                <p className="subtitle">Choose a game and challenge your friends</p>
                <div className="search-wrapper">
                    <SearchBar search={search} setSearch={setSearch} />
                </div>
                {loading ? (
                    <p style={{ color: "white", textAlign: "center" }}>Loading games...</p>
                ) : filteredGames.length === 0 ? (
                    <h2 className="empty-message">No Games Found</h2>
                ) : (
                    <div className="games-grid">
                        {filteredGames.map(game => (
                            <GameCard key={game.id} game={game} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default LobbyPage;
