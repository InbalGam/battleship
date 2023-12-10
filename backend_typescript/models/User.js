"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Result_1 = require("./Result");
const db = require("../db");
const GameManager_1 = require("./GameManager");
class User {
    constructor(id, username, nickname) {
        this.id = id;
        this.username = username;
        this.nickname = nickname;
        this.gameManager = new GameManager_1.default(this.id);
    }
    getUserId() {
        return this.id;
    }
    getUsername() {
        return this.username;
    }
    getNickname() {
        return this.nickname;
    }
    async updateProfile(imgId, nickname) {
        if (!nickname) {
            return new Result_1.Failure('Nickname must be specified', 400);
        }
        this.nickname = nickname;
        const timestamp = new Date(Date.now());
        try {
            const user = await db.updateProfile(this.id, this.nickname, imgId, timestamp);
            return new Result_1.Success(new User(user.id, user.username, user.nickname));
        }
        catch (e) {
            return new Result_1.Failure('Server error', 500);
        }
    }
    getGameManager() {
        return this.gameManager;
    }
}
exports.default = User;
