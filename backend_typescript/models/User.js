"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Result_1 = require("./Result");
const db = require("../db");
const GameManager_1 = require("./GameManager");
class User {
    constructor(id, username, nickname, wins, loses, imgId, imgName) {
        this.id = id;
        this.username = username;
        this.nickname = nickname;
        this.wins = wins;
        this.loses = loses;
        this.imgId = imgId;
        this.imgName = imgName;
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
        this.nickname = nickname;
        const timestamp = new Date(Date.now());
        try {
            const user = await db.updateProfile(this.id, this.nickname, imgId, timestamp);
            return new Result_1.Success(new User(user.id, user.username, user.nickname, user.wins, user.loses, user.image_id, user.imagename));
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
