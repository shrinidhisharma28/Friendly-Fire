import { useState, useEffect } from "react";
import { fetchGames } from "../services/gamesApi";
import { games as fallbackGames } from "../data/games";

export function useGames() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        fetchGames()
            .then(data => {
                if (!cancelled) {
                    setGames(data);
                    setLoading(false);
                }
            })
            .catch(err => {
                if (!cancelled) {
                    console.warn("Could not fetch games from server, using fallback:", err);
                    setGames(fallbackGames);
                    setLoading(false);
                    setError(err);
                }
            });
        return () => { cancelled = true; };
    }, []);

    return { games, loading, error };
}
