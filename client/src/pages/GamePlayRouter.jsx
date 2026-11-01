import { useParams } from "react-router-dom";
import gameRegistry from "../games/registry";

function GamePlayRouter() {
    const { gameId } = useParams();
    const GamePage = gameRegistry[gameId];

    if (!GamePage) {
        return (
            <div style={{ color: "white", padding: "2rem", textAlign: "center" }}>
                <h1>Game Not Found</h1>
                <p>No game registered for id: <code>{gameId}</code></p>
            </div>
        );
    }

    return <GamePage />;
}

export default GamePlayRouter;
