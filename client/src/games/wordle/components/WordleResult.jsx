
function WordleResult({
    result,
    mySocketId,
    opponentSocketId
}) {
    if (!result) {
        return null;
    }

    const myAttempts = result.attempts?.[mySocketId] ?? 0;
    const opponentAttempts = result.attempts?.[opponentSocketId] ?? 0;

    let title = "It's a draw!";
    let description = "Both players finished with the same outcome.";

    if (result.outcome === "winner") {
        if (result.winner === mySocketId) {
            title = "You won!";
            description = "You solved the word in fewer attempts.";
        } else {
            title = "You lost!";
            description = "Your opponent solved the word in fewer attempts.";
        }
    }

    return (
        <section
            className="wordle-result-panel"
            aria-live="polite"
        >
            <span className="wordle-section-label">
                MATCH RESULT
            </span>

            <h2>{title}</h2>

            <p>{description}</p>

            <div className="wordle-result-stats">
                <div>
                    <span>Your attempts</span>
                    <strong>{myAttempts}/5</strong>
                </div>

                <div>
                    <span>Opponent attempts</span>
                    <strong>{opponentAttempts}/5</strong>
                </div>
            </div>
        </section>
    );
}

export default WordleResult;
