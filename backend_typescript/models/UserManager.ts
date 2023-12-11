import User from './User';
import { Result, Success, Failure } from './Result';
import * as db from '../db';
import { passwordHash, comparePasswords } from '../hash';
import { validateEmail } from '../utils';

export default class UserManager {
    constructor() {}

    async register(username: string, nickname: string, password: string) : Promise<Result<User>> {
        if (!validateEmail(username)) {
            return new Failure('Email is not valid', 400);
        }
        if (password.length < 8) {
            return new Failure('Password must be at least 8 characters', 400);
        }
        if (!nickname) {
            return new Failure('Nickname must be specified', 400);
        }

        try {
            const check = await db.getUserByUsername(username);
            if (check) {
                if (check.username === username) {
                    return new Failure('Email already exist, choose a different email', 400);
                }
            }
            const hashedPassword = await passwordHash(password, 10);
            const timestamp: Date = new Date(Date.now());
            const user = await db.insertToUsers(username, nickname, hashedPassword, timestamp);
            return new Success(new User(user.id, user.username, user.nickname));
        } catch(e) {
            console.log(e);
            return new Failure('Server error', 500);
        }
    }

    async authenticate(username: string, password: string) : Promise<Result<User>> {
        
        const check = await db.getUserByUsername(username);
        if (!check) {
            return new Failure('User was not found', 400);
        }

        const passwordCheck: boolean = await comparePasswords(password, check.password);
        if (!passwordCheck) {
            return new Failure('Passwords did not match', 401);
        }

        return new Success(new User(check.id, check.username, check.nickname)); 
    }

    async googleAuthenticate(issuer: string, profile_id: string, username: string, nickname: string) : Promise<Result<User>> {
        const check = await db.getFromFederatedCredentials(issuer, profile_id);
        if (check.length === 0) {
            const timestamp: Date = new Date(Date.now());
            const user = await db.insertToUsers(username, nickname, null, timestamp);
            await db.insertFederatedCredentials(user.id, issuer, profile_id);
            return new Success(new User(user.id, user.username, user.nickname));
        } else {
            const user = await db.getUserById(check[0].user_id);
            if (!user) {
                return new Failure('User was not found', 400);
            }
            return new Success(new User(user.id, user.username, user.nickname));
        }
    }

    async getUserById(id: number) : Promise<Result<User>> {
        const user = await db.getUserById(id);
        if (!user) {
            return new Failure('User was not found', 400);
        }
        return new Success(new User(user.id, user.username, user.nickname));
    }
}

