import { Result, Success, Failure } from "./Result";
import * as db from '../db';
import GameManager from "./GameManager";

export default class User {
    private id: number;
    private username: string;
    private nickname: string;
    private wins: number;
    private loses: number;
    private imgId: number | null;
    private imgName: string | null;
    private gameManager: GameManager;
    constructor(id: number, username: string, nickname: string, wins: number, loses: number, imgId: number | null, imgName: string | null) {
        this.id = id;
        this.username = username;
        this.nickname = nickname;
        this.wins = wins;
        this.loses = loses;
        this.imgId = imgId;
        this.imgName = imgName;
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

    getWins(): number {
        return this.wins;
    }

    getLoses(): number {
        return this.loses;
    }

    getImgId(): number | null {
        return this.imgId;
    }

    getImgName(): string | null {
        return this.imgName;
    }

    async updateProfile(imgId: number | null, nickname: string): Promise<Result<User>> {
        this.nickname = nickname;
        const timestamp: Date = new Date(Date.now());
        try {
            const user = await db.updateProfile(this.id, this.nickname, imgId, timestamp);
            return new Success(new User(user.id, user.username, user.nickname, user.wins, user.loses, user.image_id, user.imagename));
        } catch(e) {
            return new Failure('Server error', 500);
        }
    }

    getGameManager(): GameManager {
        return this.gameManager;
    }
}

