
const { randomInt } = require("crypto");

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const DEFAULT_LENGTH = 6;

function generateRoomCode(length = DEFAULT_LENGTH) {
    if (!Number.isInteger(length) || length <= 0) {
        throw new Error("Room code length must be a positive integer");
    }

    let code = "";

    for (let i = 0; i < length; i++) {
        const index = randomInt(0, CHARACTERS.length);
        code += CHARACTERS[index];
    }

    return code;
}

module.exports = generateRoomCode;
