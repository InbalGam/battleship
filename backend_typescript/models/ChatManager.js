"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Result_1 = require("./Result");
const db = require("../db");
class ChatManager {
    constructor(gameId) {
        this.gameId = gameId;
    }
    async getGameChat() {
        try {
            const gameChat = await db.getChatMsgs(this.gameId);
            return new Result_1.Success(gameChat);
        }
        catch (e) {
            return new Result_1.Failure('Server error', 500);
        }
    }
    async postNewGameMsg(reqUserId, message) {
        try {
            const timestamp = new Date(Date.now());
            await db.postMsgToChat(this.gameId, reqUserId, message, timestamp);
            return new Result_1.Success('Sent message');
        }
        catch (e) {
            return new Result_1.Failure('Server error', 500);
        }
    }
}
exports.default = ChatManager;
