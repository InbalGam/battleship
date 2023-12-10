export default class Game {
    id: number;
    user1: number;
    user2: number;
    dimension: number;
    state: string;
    constructor(id: number, user1: number, user2: number, dimension: number, state: string) {
        this.id = id;
        this.user1 = user1;
        this.user2 = user2;
        this.dimension = dimension;
        this.state = state;
    }

}
