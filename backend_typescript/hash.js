"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePasswords = exports.passwordHash = void 0;
const bcrypt = require("bcrypt");
const passwordHash = async (password, saltRounds) => {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        return await bcrypt.hash(password, salt);
    }
    catch (err) {
        console.log(err);
    }
    return null;
};
exports.passwordHash = passwordHash;
const comparePasswords = async (password, hash) => {
    try {
        const matchFound = await bcrypt.compare(password, hash);
        return matchFound;
    }
    catch (err) {
        console.log(err);
    }
    return false;
};
exports.comparePasswords = comparePasswords;
