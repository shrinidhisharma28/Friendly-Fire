
const fs = require("node:fs");
const wordListModule = require("word-list");

// word-list v4 exposes its file path through the default export.
const wordListPath =
    typeof wordListModule === "string"
        ? wordListModule
        : wordListModule.default;

if (!wordListPath) {
    throw new Error("Unable to load the English word list");
}

// Load the dictionary once when the server starts.
const dictionary = new Set(
    fs.readFileSync(wordListPath, "utf8")
        .split(/\r?\n/)
        .map((word) => word.trim().toLowerCase())
        .filter((word) => /^[a-z]{5}$/.test(word))
);

// Validate whether a word exists in the accepted dictionary.
function isValidWord(word) {
    if (typeof word !== "string") {
        return false;
    }

    return dictionary.has(word.trim().toLowerCase());
}

module.exports = {
    isValidWord
};
