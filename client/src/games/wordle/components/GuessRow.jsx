
function GuessRow({ guess = null, rowIndex = 0 }) {
    const letters = guess?.word?.split("") || [];
    const feedback = guess?.feedback || [];

    return (
        <div
            className="wordle-guess-row"
            aria-label={`Guess ${rowIndex + 1}`}
        >
            {Array.from({ length: 5 }).map((_, index) => {
                const letter = letters[index] || "";
                const status = feedback[index] || "empty";

                return (
                    <div
                        key={index}
                        className={`wordle-tile ${status}`}
                        aria-label={
                            letter
                                ? `${letter}, ${status}`
                                : "Empty tile"
                        }
                    >
                        {letter.toUpperCase()}
                    </div>
                );
            })}
        </div>
    );
}

export default GuessRow;
