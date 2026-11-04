
const MAX_ATTEMPTS = 5;
const WORD_LENGTH = 5;

function OpponentProgress({
    attemptsUsed = 0,
    finished = false,
    solved = false
}) {
    const safeAttempts = Math.min(
        MAX_ATTEMPTS,
        Math.max(0, attemptsUsed)
    );

    let statusMessage = "Your opponent's guesses remain hidden.";

    if (finished && solved) {
        statusMessage = "Opponent solved the word.";
    } else if (finished) {
        statusMessage = "Opponent used all attempts.";
    }

    return (
        <section
            className="wordle-opponent-panel"
            aria-label="Opponent progress"
        >
            <div className="wordle-panel-heading">
                <div>
                    <span className="wordle-section-label">
                        OPPONENT
                    </span>

                    <h2>Progress</h2>
                </div>

                <span className="wordle-attempt-count">
                    {safeAttempts}/{MAX_ATTEMPTS}
                </span>
            </div>

            <div className="wordle-opponent-board">
                {Array.from({ length: MAX_ATTEMPTS }).map(
                    (_, rowIndex) => (
                        <div
                            className="wordle-opponent-row"
                            key={rowIndex}
                        >
                            {Array.from({ length: WORD_LENGTH }).map(
                                (_, colIndex) => (
                                    <div
                                        className={`wordle-opponent-tile ${
                                            rowIndex < safeAttempts
                                                ? "used"
                                                : ""
                                        }`}
                                        key={colIndex}
                                        aria-hidden="true"
                                    />
                                )
                            )}
                        </div>
                    )
                )}
            </div>

            <p className="wordle-opponent-note">
                {statusMessage}
            </p>
        </section>
    );
}

export default OpponentProgress;
