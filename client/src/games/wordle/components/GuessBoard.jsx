
import GuessRow from "./GuessRow";

const MAX_ATTEMPTS = 5;

function GuessBoard({ guesses = [], maxAttempts = MAX_ATTEMPTS }) {
    return (
        <div
            className="wordle-guess-board"
            aria-label="Your guess board"
        >
            {Array.from({ length: maxAttempts }).map((_, index) => (
                <GuessRow
                    key={index}
                    guess={guesses[index] || null}
                    rowIndex={index}
                />
            ))}
        </div>
    );
}

export default GuessBoard;
