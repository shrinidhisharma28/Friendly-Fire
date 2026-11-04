
const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 5;

const GAME_PHASES = Object.freeze({
    WAITING_FOR_SECRETS: "waiting_for_secrets",
    GUESSING: "guessing",
    COMPLETED: "completed"
});

const LETTER_STATUS = Object.freeze({
    CORRECT: "correct",
    PRESENT: "present",
    ABSENT: "absent"
});

const MOVE_TYPES = Object.freeze({
    SUBMIT_SECRET: "submit_secret",
    SUBMIT_GUESS: "submit_guess"
});

module.exports = {
    WORD_LENGTH,
    MAX_ATTEMPTS,
    GAME_PHASES,
    LETTER_STATUS,
    MOVE_TYPES
};
