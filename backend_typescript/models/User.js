"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(id, username) {
        this.id = id;
        this.username = username;
    }
    getUserId() {
        return this.id;
    }
    getUsername() {
        return this.username;
    }
}
exports.default = User;
