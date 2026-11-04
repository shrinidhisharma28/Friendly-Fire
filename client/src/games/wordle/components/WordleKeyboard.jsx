
const KEYBOARD_ROWS = [
    "QWERTYUIOP",
    "ASDFGHJKL",
    "ZXCVBNM"
];

const STATUS_PRIORITY = {
    correct: 3,
    present: 2,
    absent: 1
};

function WordleKeyboard({
    letterStatuses = {},
    onKeyPress,
    onBackspace,
    onEnter,
    disabled = false
}) {
    function getLetterStatus(letter) {
        return letterStatuses[letter] || "unused";
    }

    function handleKeyClick(key) {
        if (disabled) {
            return;
        }

        if (key === "ENTER") {
            onEnter?.();
        } else if (key === "BACKSPACE") {
            onBackspace?.();
        } else {
            onKeyPress?.(key);
        }
    }

    return (
        <div
            className="wordle-keyboard"
            aria-label="On-screen keyboard"
        >
            {KEYBOARD_ROWS.map((row, rowIndex) => (
                <div
                    className="wordle-keyboard-row"
                    key={rowIndex}
                >
                    {row.split("").map(letter => {
                        const status = getLetterStatus(letter);

                        return (
                            <button
                                type="button"
                                className={`wordle-key ${status}`}
                                key={letter}
                                onClick={() => handleKeyClick(letter)}
                                disabled={disabled}
                                aria-label={letter}
                            >
                                {letter}
                            </button>
                        );
                    })}

                    {rowIndex === 2 && (
                        <>
                            <button
                                type="button"
                                className="wordle-key wordle-key-action"
                                onClick={() => handleKeyClick("ENTER")}
                                disabled={disabled}
                            >
                                ENTER
                            </button>

                            <button
                                type="button"
                                className="wordle-key wordle-key-action"
                                onClick={() => handleKeyClick("BACKSPACE")}
                                disabled={disabled}
                                aria-label="Backspace"
                            >
                                ⌫
                            </button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

export default WordleKeyboard;
