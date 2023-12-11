"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("./User");
const Result_1 = require("./Result");
const db = require("../db");
const hash_1 = require("../hash");
const utils_1 = require("../utils");
class UserManager {
    constructor() { }
    async register(username, nickname, password) {
        if (!(0, utils_1.validateEmail)(username)) {
            return new Result_1.Failure('Email is not valid', 400);
        }
        if (password.length < 8) {
            return new Result_1.Failure('Password must be at least 8 characters', 400);
        }
        if (!nickname) {
            return new Result_1.Failure('Nickname must be specified', 400);
        }
        try {
            const check = await db.getUserByUsername(username);
            if (check) {
                if (check.username === username) {
                    return new Result_1.Failure('Email already exist, choose a different email', 400);
                }
            }
            const hashedPassword = await (0, hash_1.passwordHash)(password, 10);
            const timestamp = new Date(Date.now());
            const user = await db.insertToUsers(username, nickname, hashedPassword, timestamp);
            return new Result_1.Success(new User_1.default(user.id, user.username, user.nickname));
        }
        catch (e) {
            console.log(e);
            return new Result_1.Failure('Server error', 500);
        }
    }
    async authenticate(username, password) {
        const check = await db.getUserByUsername(username);
        if (!check) {
            return new Result_1.Failure('User was not found', 400);
        }
        const passwordCheck = await (0, hash_1.comparePasswords)(password, check.password);
        if (!passwordCheck) {
            return new Result_1.Failure('Passwords did not match', 401);
        }
        return new Result_1.Success(new User_1.default(check.id, check.username, check.nickname));
    }
    async googleAuthenticate(issuer, profile_id, username, nickname) {
        const check = await db.getFromFederatedCredentials(issuer, profile_id);
        if (check.length === 0) {
            const timestamp = new Date(Date.now());
            const user = await db.insertToUsers(username, nickname, null, timestamp);
            await db.insertFederatedCredentials(user.id, issuer, profile_id);
            return new Result_1.Success(new User_1.default(user.id, user.username, user.nickname));
        }
        else {
            const user = await db.getUserById(check[0].user_id);
            if (!user) {
                return new Result_1.Failure('User was not found', 400);
            }
            return new Result_1.Success(new User_1.default(user.id, user.username, user.nickname));
        }
    }
    async getUserById(id) {
        const user = await db.getUserById(id);
        if (!user) {
            return new Result_1.Failure('User was not found', 400);
        }
        return new Result_1.Success(new User_1.default(user.id, user.username, user.nickname));
    }
}
exports.default = UserManager;
