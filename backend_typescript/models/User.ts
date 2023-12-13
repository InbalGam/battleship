import { Result, Success, Failure } from "./Result";
import * as db from '../db';
import GameManager from "./GameManager";

export default class User {
    id: number;
    username: string;
    nickname: string;
    private gameManager: GameManager;
    constructor(id: number, username: string, nickname: string) {
        this.id = id;
        this.username = username;
        this.nickname = nickname;
        this.gameManager = new GameManager(this.id);
    }

    getUserId(): number {
        return this.id;
    }

    getUsername(): string {
        return this.username;
    }

    getNickname(): string {
        return this.nickname;
    }

    async updateProfile(imgId: number | null, nickname: string): Promise<Result<User>> {
        if (!nickname) {
            return new Failure('Nickname must be specified', 400);
        }
        this.nickname = nickname;
        const timestamp: Date = new Date(Date.now());
        try {
            const user = await db.updateProfile(this.id, this.nickname, imgId, timestamp);
            return new Success(new User(user.id, user.username, user.nickname));
        } catch(e) {
            return new Failure('Server error', 500);
        }
    }

    getGameManager(): GameManager {
        return this.gameManager;
    }
}
