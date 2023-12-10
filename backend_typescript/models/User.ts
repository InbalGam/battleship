export default class User {
    id: number;
    username: string;
    constructor(id: number, username: string) {
        this.id = id;
        this.username = username;
    }

    getUserId(): number {
        return this.id;
    }

    getUsername(): string {
        return this.username;
    }
}

