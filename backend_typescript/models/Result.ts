export class Result <T> {
    constructor() {}
}

export class Success <T> extends Result <T> {
    result: T;
    constructor(result: T) {
        super();
        this.result = result;
    }
}

export class Failure <T> extends Result <T> {
    msg: string;
    status: number;
    constructor(msg: string, status: number) {
        super();
        this.msg = msg;
        this.status = status;
    }
}
