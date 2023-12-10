"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Failure = exports.Success = exports.Result = void 0;
class Result {
    constructor() { }
}
exports.Result = Result;
class Success extends Result {
    constructor(result) {
        super();
        this.result = result;
    }
}
exports.Success = Success;
class Failure extends Result {
    constructor(msg, status) {
        super();
        this.msg = msg;
        this.status = status;
    }
}
exports.Failure = Failure;
