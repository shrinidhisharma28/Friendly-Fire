
function ScoreBoard({ players, scores, round }) {
    if (!players || players.length !== 2) {
        return null;
    }

    const player1 = players[0];
    const player2 = players[1];

    return (
        <section className="score-board">

            {/* Player 1 */}
            <div className="player-score">
                <h2 title={player1.username}>
                    {player1.username}
                </h2>

                <span className="score">
                    {scores[player1.socketId] ?? 0}
                </span>
            </div>

            {/* Round information */}
            <div className="round-info">
                <h1>ROUND</h1>
                <span>{round} / 5</span>
            </div>

            {/* Player 2 */}
            <div className="player-score">
                <h2 title={player2.username}>
                    {player2.username}
                </h2>

                <span className="score">
                    {scores[player2.socketId] ?? 0}
                </span>
            </div>

        </section>
    );
}

export default ScoreBoard;
