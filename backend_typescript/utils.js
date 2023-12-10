"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compare = exports.validateWebURL = exports.validateEmail = void 0;
function validateEmail(inputField) {
    const isValid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(inputField);
    return isValid;
}
exports.validateEmail = validateEmail;
;
function validateWebURL(inputField) {
    const isValid = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/.test(inputField);
    return isValid;
}
exports.validateWebURL = validateWebURL;
;
function compare(a, b) {
    if (a.wordsAmount > b.wordsAmount) {
        return -1;
    }
    if (a.wordsAmount < b.wordsAmount) {
        return 1;
    }
    return 0;
}
exports.compare = compare;
;
