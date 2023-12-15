import { Failure, Result, Success } from "./Result";
import * as db from '../db';


export default class ChatManager {
    private gameId: number;
    constructor(gameId: number) {
        this.gameId = gameId;
    }

    async getGameChat(): Promise<Result<db.Chat[]>> {
        try {
            const gameChat = await db.getChatMsgs(this.gameId);
            return new Success(gameChat);
        } catch (e) {
            return new Failure('Server error', 500);
        }
    }

    async postNewGameMsg(reqUserId: number, message: string): Promise<Result<string>> {
        if (!message) {
            return new Failure('Cannot send an empty message', 400);
        }
        
        try {
            const timestamp = new Date(Date.now());
            await db.postMsgToChat(this.gameId, reqUserId, message, timestamp);
            return new Success('Sent message');
        } catch (e) {
            return new Failure('Server error', 500);
        }
    }
}