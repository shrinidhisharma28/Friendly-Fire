
const {
    WORD_LENGTH,
    LETTER_STATUS
} = require("./constants");

// Normalize and validate the basic format of a word.
function normalizeWord(word) {
    if (typeof word !== "string") {
        return null;
    }

    const normalized = word.trim().toLowerCase();

    if (
        normalized.length !== WORD_LENGTH ||
        !/^[a-z]{5}$/.test(normalized)
    ) {
        return null;
    }

    return normalized;
}

// Evaluate a guess using standard Wordle duplicate-letter rules.
function evaluateGuess(secretWord, guessWord) {
    const secret = normalizeWord(secretWord);
    const guess = normalizeWord(guessWord);

    if (!secret || !guess) {
        throw new Error("Invalid secret word or guess");
    }

    const feedback = Array(WORD_LENGTH).fill(
        LETTER_STATUS.ABSENT
    );

    const remainingLetters = {};

    // First pass: identify exact-position matches.
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guess[i] === secret[i]) {
            feedback[i] = LETTER_STATUS.CORRECT;
        } else {
            remainingLetters[secret[i]] =
                (remainingLetters[secret[i]] || 0) + 1;
        }
    }

    // Second pass: identify letters in incorrect positions.
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (feedback[i] === LETTER_STATUS.CORRECT) {
            continue;
        }

        const letter = guess[i];

        if (remainingLetters[letter] > 0) {
            feedback[i] = LETTER_STATUS.PRESENT;
            remainingLetters[letter]--;
        }
    }

    return feedback;
}

// Check whether the guess completely solves the word.
function isCorrectGuess(secretWord, guessWord) {
    const secret = normalizeWord(secretWord);
    const guess = normalizeWord(guessWord);

    return Boolean(secret && guess && secret === guess);
}

module.exports = {
    normalizeWord,
    evaluateGuess,
    isCorrectGuess
};
