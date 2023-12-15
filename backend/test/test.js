"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const expect = require('chai').expect;
const request = require('supertest');
const db = require("../db");
const app = require('../server');
const PORT = process.env.PORT || 4001;
/*
// UserManager tests
describe('Register users', () => {
    it('should NOT register- not a valid email', async () => {
        const userManager = new UserManager();
        const result = await userManager.register('inbgmail.com', 'inbal', 'checking123');
        expect(result).to.be.an.instanceof(Failure);
        expect(result).to.have.property("msg").to.equal('Email is not valid');
        expect(result).to.have.property("status").to.equal(400);
    });

    it('should NOT register- not a valid password', async () => {
        const userManager = new UserManager();
        const result = await userManager.register('inbalJustChecking@gmail.com', 'inbal', 'che23');
        expect(result).to.be.an.instanceof(Failure);
        expect(result).to.have.property("msg").to.equal('Password must be at least 8 characters');
        expect(result).to.have.property("status").to.equal(400);
    });

    it('should NOT register- email already exist', async () => {
        const userManager = new UserManager();
        const result = await userManager.register('inbal@gmail.com', 'inbal', 'checking123');
        expect(result).to.be.an.instanceof(Failure);
        expect(result).to.have.property("msg").to.equal('Email already exist, choose a different email');
        expect(result).to.have.property("status").to.equal(400);
    });

    it('should register user', async () => {
        const userManager = new UserManager();
        const result = await userManager.register('inbalJustChecking@gmail.com', 'Inbal', 'fdsfschecking123');
        expect(result).to.be.an.instanceof(Success);
    });
});


describe('Login Authorization tests- local strategy', () => {
    it('should NOT pass auth check for log in - user not found', async () => {
        const userManager = new UserManager();
        const result = await userManager.authenticate('inbalSTAM@gmail.com', 'checking123');
        expect(result).to.be.an.instanceof(Failure);
        expect(result).to.have.property("msg").to.equal('User was not found');
        expect(result).to.have.property("status").to.equal(400);
    });

    it('should NOT pass auth check for log in- passwords do not match', async () => {
        const userManager = new UserManager();
        const result = await userManager.authenticate('inbal@gmail.com', 'cddschecking123');
        expect(result).to.be.an.instanceof(Failure);
        expect(result).to.have.property("msg").to.equal('Passwords did not match');
        expect(result).to.have.property("status").to.equal(401);
    });

    it('should pass auth check for log in', async () => {
        const userManager = new UserManager();
        const result = await userManager.authenticate('inbalJustChecking@gmail.com', 'fdsfschecking123');
        expect(result).to.be.an.instanceof(Success);
        expect(result).to.have.property("result").to.have.property("id").to.equal(10);
        expect(result).to.have.property("result").to.have.property("username").to.equal('inbalJustChecking@gmail.com');
    });
});


describe('Login Authorization tests- google strategy', () => {
    it('should pass auth check for log in', async () => {
        const userManager = new UserManager();
        const result = await userManager.googleAuthenticate('google', 'just12checking34', 'inbalStam@gmail.com', 'Inbal');
        expect(result).to.be.an.instanceof(Success);
        expect(result).to.have.property("result").to.have.property("id").to.equal(11);
        expect(result).to.have.property("result").to.have.property("username").to.equal('inbalStam@gmail.com');
    });
});


describe('Get user by ID', () => {
    it('should NOT get user- wrong ID', async () => {
        const userManager = new UserManager();
        const result = await userManager.getUserById(400);
        expect(result).to.be.an.instanceof(Failure);
        expect(result).to.have.property("msg").to.equal('User was not found');
        expect(result).to.have.property("status").to.equal(400);
    });

    it('should get user', async () => {
        const userManager = new UserManager();
        const result = await userManager.getUserById(1);
        expect(result).to.be.an.instanceof(Success);
        expect(result).to.have.property("result").to.have.property("id").to.equal(1);
        expect(result).to.have.property("result").to.have.property("username").to.equal('inbal@gmail.com');
    });
});


// User tests
describe('Get user information', () => {
    it('should get user Id', () => {
        const user = new User(1, 'inbal@gmail.com', 'inbal', 2, 0, null, null);
        const result = user.getUserId();
        expect(result).to.be.a("number");
        expect(result).to.equal(1);
    });

    it('should get username', () => {
        const user = new User(1, 'inbal@gmail.com', 'inbal', 2, 0, null, null);
        const result = user.getUsername();
        expect(result).to.equal('inbal@gmail.com');
    });

    it('should get nickname', () => {
        const user = new User(1, 'inbal@gmail.com', 'inbal', 2, 0, null, null);
        const result = user.getNickname();
        expect(result).to.equal('inbal');
    });
});

describe('Get user game manager', () => {
    it('should get game manager', () => {
        const user = new User(1, 'inbal@gmail.com', 'inbal', 2, 0, null, null);
        const result = user.getGameManager();
        expect(result).to.be.an.instanceof(GameManager);
    });
});


describe('Update user profile', () => {
    it('should update profile', async () => {
        const user = new User(1, 'inbal@gmail.com', 'inbal', 2, 0, null, null);
        const result = await user.updateProfile(null, 'InbalNew');
        const final = (result as Success<User>).result;
        expect(final).to.be.an.instanceof(User);
        expect(final).to.have.property("nickname").to.equal('InbalNew');
    });
});


// GameManager tests
describe('Check GameManager functionality', () => {
    it('should NOT get user games- user not exists', async () => {
        const gameManager = new GameManager(500);
        const games = await gameManager.getUserGames();
        expect(games).to.be.an.instanceof(Failure);
        expect(games).to.have.property("msg").to.equal('User does not exists');
        expect(games).to.have.property("status").to.equal(400);
    });

    it('should get user games', async () => {
        const gameManager = new GameManager(1);
        const games = await gameManager.getUserGames();
        console.log(games);
        expect(games).to.be.an.instanceof(Success);
    });

    it('should NOT get game- wrong id', async () => {
        const gameManager = new GameManager(1);
        const games = await gameManager.getGameById(100, 1);
        expect(games).to.be.an.instanceof(Failure);
        expect(games).to.have.property("msg").to.equal('Game does not exists');
        expect(games).to.have.property("status").to.equal(400);
    });

    it('should get game by Id', async () => {
        const gameManager = new GameManager(1);
        const game = await gameManager.getGameById(1, 1);
        const final = (game as Success<Game>).result;
        expect(final).to.be.an.instanceof(Game);
        expect(final).to.have.property("id").to.equal(1);
    });

    it ('should create new game', async () => {
        const gameManager = new GameManager(1);
        const newGame = await gameManager.createGame('inbalgam@gmail.com', 10, 'inbal@gmail.com');
        const final = (newGame as Success<Game>).result;
        expect(final).to.be.an.instanceof(Game);
        expect(final).to.have.property("id").to.equal(23);
    });
});


// Game tests
describe('Check Game class getGameInfo function', () => {
    it('should NOT get game info- state invited', async () => {
        const game = new Game(1, 1, 2, 10, 'invited');
        const gameInfo = await game.getGameInfo(1);
        expect(gameInfo).to.be.an.instanceof(Failure);
        expect(gameInfo).to.have.property("msg").to.equal('Game is in state invited');
        expect(gameInfo).to.have.property("status").to.equal(400);
    });

    it('should get game info- Waiting phase', async () => {
        const game = new Game(7, 1, 3, 10, 'user1_ready');
        const gameInfo = await game.getGameInfo(1);
        const result = gameInfo as Success<Waiting>
        expect(gameInfo).to.be.an.instanceof(Success);
        expect(result.result).to.have.property("phase").to.equal('waiting_for_other_player');
    });

    it('should get game info- Winner phase', async () => {
        const game = new Game(14, 4, 1, 10, 'user2_won');
        const gameInfo = await game.getGameInfo(4);
        const result = gameInfo as Success<Winner>
        expect(gameInfo).to.be.an.instanceof(Success);
        expect(result.result).to.have.property("phase").to.equal('finished');
        expect(result.result).to.have.property("i_won").to.equal(false);
    });

    it('should get game info- Placing pieces', async () => {
        const game = new Game(5, 1, 3, 10, 'accepted');
        const gameInfo = await game.getGameInfo(1);
        const result = gameInfo as Success<PlacingShips>
        expect(gameInfo).to.be.an.instanceof(Success);
        expect(result.result).to.have.property("phase").to.equal('placing_pieces');
    });

    it('should get game info- Placing pieces', async () => {
        const game = new Game(2, 1, 2, 10, 'user2_turn');
        const gameInfo = await game.getGameInfo(1);
        const result = gameInfo as Success<GamePlay>
        expect(gameInfo).to.be.an.instanceof(Success);
        expect(result.result).to.have.property("phase").to.equal('gamePlay');
        expect(result.result).to.have.property("my_turn").to.equal(false);
    });
});


describe('Check Game general funcs', () => {
    it('should get game constructor data', () => {
        const game = new Game(2, 1, 2, 10, 'user2_turn');
        const gameId = game.getGameId();
        const gamePlayer = game.getPlayerId();
        const gameOpponent = game.getOpponentId();
        const gameState = game.getState();
        const gameDimension = game.getDimension();
        expect(gameId).to.equal(2);
        expect(gamePlayer).to.equal(1);
        expect(gameOpponent).to.equal(2);
        expect(gameState).to.equal('user2_turn');
        expect(gameDimension).to.equal(10);
    });
});


describe('Check Delete game', () => {
    it('should delete game', async () => {
        const game = new Game(1, 1, 2, 10, 'invited');
        const result = await game.deleteGame(2);
        expect(result).to.be.an.instanceof(Success);
        expect(result).to.have.property("result").to.equal('Game deleted');
    });
});


describe('Check Game update state funcs', () => {
    it('should accept game', async () => {
        const game = new Game(18, 8, 5, 10, 'invited');
        const response = await game.acceptGame(5);
        const result = response as Success<Game>;
        console.log(result);
        expect(response).to.be.an.instanceof(Success);
        expect(result.result).to.have.property("state").to.equal('accepted');
    });
});


describe('Check User shoot', () => {
    it('should NOT perform shot - wrong game state', async () => {
        const game = new Game(5, 1, 3, 10, 'accepted');
        const result = await game.userShoot(1, 3, 4);
        expect(result).to.be.an.instanceof(Failure);
        expect(result).to.have.property("msg").to.equal('Game is not in correct state or user not correct user');
        expect(result).to.have.property("status").to.equal(400);
    });

    it('should NOT perform shot - shot outside of board', async () => {
        const game = new Game(4, 1, 3, 10, 'user1_turn');
        const result = await game.userShoot(1, 13, 4);
        expect(result).to.be.an.instanceof(Failure);
        expect(result).to.have.property("msg").to.equal('The shot is outside of the game board');
        expect(result).to.have.property("status").to.equal(400);
    });

    it('should NOT perform shot - cell already chot', async () => {
        const game = new Game(4, 1, 3, 10, 'user1_turn');
        const result = await game.userShoot(1, 5, 2);
        expect(result).to.be.an.instanceof(Failure);
        expect(result).to.have.property("msg").to.equal('This cell was already shot');
        expect(result).to.have.property("status").to.equal(400);
    });

    it('should perform a shot', async () => {
        const game = new Game(4, 1, 3, 10, 'user1_turn');
        const result = await game.userShoot(1, 8, 9);
        expect(result).to.be.an.instanceof(Success);
        expect(result).to.have.property("result").to.equal('Player performed a shot');
    });
});


// ChatManager tests
describe('Check ChatManager functionality', () => {
    it('should get game chat', async () => {
        const game = new Game(4, 1, 3, 10, 'user1_turn');
        const chatManager = game.getGameChatManager();
        const result = await chatManager.getGameChat();
        expect(result).to.be.an.instanceof(Success);
    });

    it('should post new message to game chat', async () => {
        const game = new Game(4, 1, 3, 10, 'user1_turn');
        const chatManager = game.getGameChatManager();
        const result = await chatManager.postNewGameMsg(3, 'That was a good shot');
        expect(result).to.be.an.instanceof(Success);
        expect(result).to.have.property('result').to.equal('Sent message');
    });
});



// ShipManager tests
describe('Check ShipManager', () => {
    it('should get user ships', async () => {
        const game = new Game(5, 1, 3, 10, 'accepted');
        const shipManager  = game.getGameShipManager(1);
        if (shipManager instanceof ShipManager) {
            const result = await shipManager.getUserShips();
            expect(result).to.be.an.instanceof(Success);
        }
    });
});


describe('Check ShipManager place a ship', () => {
    it('should NOT place a ship- not correct size', async () => {
        const game = new Game(5, 1, 3, 10, 'accepted');
        const shipManager  = game.getGameShipManager(1);
        if (shipManager instanceof ShipManager) {
            const result = await shipManager.placeShip(1, 3, 6, 6, 1, 5);
            expect(result).to.be.an.instanceof(Failure);
            expect(result).to.have.property("msg").to.equal('Ship is not in the correct size');
            expect(result).to.have.property("status").to.equal(400);
        }
    });

    it('should NOT place a ship- user not a player in the game', async () => {
        const game = new Game(5, 1, 3, 10, 'accepted');
        const shipManager  = game.getGameShipManager(9);
        if (shipManager instanceof ShipManager) {
            const result = await shipManager.placeShip(9, 3, 6, 8, 10, 10);
            expect(result).to.be.an.instanceof(Failure);
            expect(result).to.have.property("msg").to.equal('User is not a player in the game');
            expect(result).to.have.property("status").to.equal(400);
        }
    });

    it('should NOT place a ship- not inside borders', async () => {
        const game = new Game(5, 1, 3, 10, 'accepted');
        const shipManager  = game.getGameShipManager(1);
        if (shipManager instanceof ShipManager) {
            const result = await shipManager.placeShip(1, 3, 6, 6, 9, 11);
            expect(result).to.be.an.instanceof(Failure);
            expect(result).to.have.property("msg").to.equal('Ship is not inside board borders');
            expect(result).to.have.property("status").to.equal(400);
        }
    });

    it('should NOT place a ship- no more ships of this size', async () => {
        const game = new Game(5, 1, 3, 10, 'accepted');
        const shipManager  = game.getGameShipManager(1);
        if (shipManager instanceof ShipManager) {
            const result = await shipManager.placeShip(1, 2, 6, 6, 9, 10);
            expect(result).to.be.an.instanceof(Failure);
            expect(result).to.have.property("msg").to.equal('There are no more ships of this size to place');
            expect(result).to.have.property("status").to.equal(400);
        }
    });

    it('should NOT place a ship- close to another ship', async () => {
        const game = new Game(5, 1, 3, 10, 'accepted');
        const shipManager  = game.getGameShipManager(1);
        if (shipManager instanceof ShipManager) {
            const result = await shipManager.placeShip(1, 3, 7, 9, 1, 1);
            expect(result).to.be.an.instanceof(Failure);
            expect(result).to.have.property("msg").to.equal('Ship cannot be next to another ship');
            expect(result).to.have.property("status").to.equal(400);
        }
    });

    it('should place a ship', async () => {
        const game = new Game(5, 1, 3, 10, 'accepted');
        const shipManager  = game.getGameShipManager(1);
        if (shipManager instanceof ShipManager) {
            const result = await shipManager.placeShip(1, 3, 10, 10, 4, 6);
            expect(result).to.be.an.instanceof(Success);
            expect(result).to.have.property("result").to.equal('Placed a ship of size 3');
        }
    });
});


describe('Check ShipManager Unplace a ship', () => {
    it('should NOT place a ship- close to another ship', async () => {
        const game = new Game(5, 1, 3, 10, 'accepted');
        const shipManager  = game.getGameShipManager(1);
        if (shipManager instanceof ShipManager) {
            const result = await shipManager.unplaceShip(1, 5, 1, 1, 5, 9);
            expect(result).to.be.an.instanceof(Failure);
            expect(result).to.have.property("msg").to.equal('Ship was not placed cannot be unplaced');
            expect(result).to.have.property("status").to.equal(400);
        }
    });

    it('should Unplace a ship', async () => {
        const game = new Game(5, 1, 3, 10, 'accepted');
        const shipManager  = game.getGameShipManager(1);
        if (shipManager instanceof ShipManager) {
            const result = await shipManager.unplaceShip(1, 3, 10, 10, 4, 6);
            expect(result).to.be.an.instanceof(Success);
            expect(result).to.have.property("result").to.equal('Ship deleted');
        }
    });
});
*/
// API tests
// Authorization tests
describe('Login Authorization tests- local strategy', function () {
    it('should NOT pass auth check for log in', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'user_gCheck', password: 'bldadala23pppppp99' }) // User doesn't exist
            .redirects(1)
            .expect(401);
    });
    it('should pass auth check for log in', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .expect(200);
    });
});
describe('Logout', function () {
    it('should log out', function () {
        const agent = request.agent(app);
        return agent
            .get('/logout')
            .expect(200)
            .then((response) => {
            expect(response.body).to.be.deep.equal({ msg: 'Successfully logged out' });
        });
    });
});
describe('Update profile nickname', function () {
    it('should NOT pass nickname update', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .put('/profile')
                .send({ nickname: undefined })
                .expect(400)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Nickname must be specified' });
            });
        });
    });
    it('should pass nickname update', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .put('/profile')
                .send({ nickname: 'inbalCheck' })
                .expect(200)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Updated user' });
            });
        });
    });
});
describe('Register Authorization tests', function () {
    it('should NOT pass auth check for register - email not valid', function () {
        const agent = request.agent(app);
        return agent
            .post('/register')
            .send({ username: 'inbalgmail.com', password: 'dafsd4342', nickname: 'inbi' })
            .expect(400)
            .then((response) => {
            expect(response.body).to.be.deep.equal({ msg: 'Email is not valid' });
        });
    });
    it('should NOT pass auth check for register - password length less than 8', function () {
        const agent = request.agent(app);
        return agent
            .post('/register')
            .send({ username: 'inbalg@gmail.com', password: 'da', nickname: 'inbi' })
            .expect(400)
            .then((response) => {
            expect(response.body).to.be.deep.equal({ msg: 'Password must be at least 8 characters' });
        });
    });
    it('should NOT pass auth check for register - nickname needs specification', function () {
        const agent = request.agent(app);
        return agent
            .post('/register')
            .send({ username: 'inbalg@gmail.com', password: 'dasfsdgfsd', nickname: undefined })
            .expect(400)
            .then((response) => {
            expect(response.body).to.be.deep.equal({ msg: 'Nickname must be specified' });
        });
    });
    it('should NOT pass auth check for register - username already exist', function () {
        const agent = request.agent(app);
        return agent
            .post('/register')
            .send({ username: 'inbal@gmail.com', password: 'dafsd4342', nickname: 'inbi' })
            .expect(400)
            .then((response) => {
            expect(response.body).to.be.deep.equal({ msg: 'Email already exist, choose a different email' });
        });
    });
    it('should pass registeration', function () {
        const agent = request.agent(app);
        return agent
            .post('/register')
            .send({ username: 'inbalg@gmail.com', password: 'dafsd4342', nickname: 'inbi' })
            .expect(201)
            .then((response) => {
            expect(response.body).to.be.deep.equal({ msg: 'Success creating user' });
        });
    });
});
// Game tests
describe('Create a new game', function () {
    it('should not post a new game- not logged in', function () {
        const agent = request.agent(app);
        return agent
            .post('/games')
            .send({ opponent: 'inbalcheck@gmail.com', dimension: 10 })
            .expect(401)
            .then((response) => {
            expect(response.body).to.be.deep.equal({ msg: 'You need to login first' });
        });
    });
    it('should not post a new game- invalid dimension', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .post('/games')
                .send({ opponent: 'inbalcheck@gmail.com', dimension: 30 })
                .expect(400)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Dimension must be 10 or 20' });
            });
        });
    });
    it('should not post a new game- opponent different than player', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .post('/games')
                .send({ opponent: 'inbal@gmail.com', dimension: 10 })
                .expect(400)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Opponent must not be you' });
            });
        });
    });
    it('should not post a new game- opponent not exist', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .post('/games')
                .send({ opponent: 'inbalfsdfds@gmail.com', dimension: 10 })
                .expect(400)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'User does not exists' });
            });
        });
    });
    it('should post a new game', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .post('/games')
                .send({ opponent: 'inbalgam@gmail.com', dimension: 10 })
                .expect(201)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Game created' });
            });
        });
    });
});
describe('Get all games', function () {
    it('should not get all games- user not exist', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inb54543al@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .get('/games')
                .expect(401);
        });
    });
    it('should get all games', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .get('/games')
                .expect(200);
        });
    });
});
describe('Update a game', function () {
    it('should not update a game- game id invalid', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbalgam@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .put('/games/3')
                .expect(400)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Game does not exists' });
            });
        });
    });
    it('should not update a game- not correct opponent', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .put('/games/5')
                .expect(400)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'You are not the correct opponent player' });
            });
        });
    });
    it('should not update a game- active game', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbalgam@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .put('/games/4')
                .expect(400)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Cannot accept or delete an active game' });
            });
        });
    });
    it('should update a game', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbalgam@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .put('/games/23')
                .expect(200)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'game accepted by opponent' });
            });
        });
    });
});
describe('Delete a game', function () {
    it('should not delete a game- game id invalid', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbalgam@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .delete('/games/3')
                .expect(400)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Game does not exists' });
            });
        });
    });
    it('should not delete a game- not correct opponent', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .delete('/games/6')
                .expect(400)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'You are not the correct opponent player' });
            });
        });
    });
    it('should not delete a game- active game', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbalgam@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .delete('/games/4')
                .expect(400)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Cannot accept or delete an active game' });
            });
        });
    });
    /////////////////////////////////////////////////////////////////////////////////////////////////
    // for creation of game for next test-
    it('should post a new game', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .post('/games')
                .send({ opponent: 'inbalgam@gmail.com', dimension: 20 })
                .expect(201)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Game created' });
            });
        });
    });
    /////////////////////////////////////////////////////////////////////////////////////////////////
    it('should delete a game', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbalgam@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .delete('/games/24')
                .expect(200)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'game deleted by opponent' });
            });
        });
    });
});
describe('Placing ships in game', function () {
    it('should not succeed - invalid ship size', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .post('/games/5/place')
                .send({ ship_size: 5, start_row: 1, start_col: 1, end_row: 7, end_col: 1 })
                .expect(400)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Ship is not in the correct size' });
            });
        });
    });
    it('should not succeed - invalid ship', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .post('/games/5/place')
                .send({ ship_size: 5, start_row: 1, start_col: 1, end_row: 7, end_col: 4 })
                .expect(400)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Ship is not in the correct size' });
            });
        });
    });
    it('should not succeed - invalid game state', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .post('/games/1/place')
                .send({ ship_size: 5, start_row: 1, start_col: 1, end_row: 5, end_col: 1 })
                .expect(400)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Game is not in correct state to get ShipManager' });
            });
        });
    });
    it('should not succeed - close ships', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .post('/games/5/place')
                .send({ ship_size: 5, start_row: 1, start_col: 1, end_row: 5, end_col: 1 })
                .then(() => {
                return agent
                    .post('/games/5/place')
                    .send({ ship_size: 3, start_row: 7, start_col: 2, end_row: 7, end_col: 4 })
                    .expect(400)
                    .then((response) => {
                    expect(response.body).to.be.deep.equal({ msg: 'Ship cannot be next to another ship' });
                });
            });
        });
    });
    it('should succeed - place ship', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .post('/games/5/place')
                .send({ ship_size: 5, start_row: 9, start_col: 2, end_row: 9, end_col: 6 })
                .expect(200)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Placed a ship of size 5' });
            });
        });
    });
});
describe('Unplace a ship', function () {
    it('should not succeed - invalid game state', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .delete('/games/1/place')
                .send({ ship_size: 4, start_row: 3, start_col: 2, end_row: 3, end_col: 5 })
                .expect(400)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Game is not in correct state to get ShipManager' });
            });
        });
    });
    it('should not succeed - ship was not placed', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .delete('/games/5/place')
                .send({ ship_size: 5, start_row: 2, start_col: 1, end_row: 5, end_col: 1 })
                .expect(400)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Ship was not placed cannot be unplaced' });
            });
        });
    });
    it('should unplace a ship', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .delete('/games/5/place')
                .send({ ship_size: 5, start_row: 9, start_col: 2, end_row: 9, end_col: 6 })
                .expect(200)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Ship deleted' });
            });
        });
    });
});
describe('Game state change to ready', function () {
    it('should not succeed - invalid game state', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .post('/games/1/ready')
                .expect(400)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Game is not in correct state or user not correct user' });
            });
        });
    });
    it('should not succeed - not finished placing ships', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .post('/games/12/ready')
                .expect(400)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Player did not finish placeing ships' });
            });
        });
    });
    // for the test to succeed-
    it('should succeed - place ship', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .post('/games/5/place')
                .send({ ship_size: 5, start_row: 9, start_col: 2, end_row: 9, end_col: 6 })
                .expect(200);
        });
    });
    it('should succeed - place ship', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .post('/games/5/place')
                .send({ ship_size: 3, start_row: 7, start_col: 7, end_row: 7, end_col: 9 })
                .expect(200);
        });
    });
    ///////////////////////
    it('should change game state', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .post('/games/5/ready')
                .expect(200)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'game state updated' });
            });
        });
    });
});
describe('Performing a shot', function () {
    it('should not succeed - invalid player', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbalNEW@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .post('/games/4/shoot')
                .send({ row: 3, col: 4 })
                .expect(401)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'User not part of game' });
            });
        });
    });
    it('should not succeed - cell was shot', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(async () => {
            await db.updateGameState(4, 'user1_turn');
            return agent
                .post('/games/4/shoot')
                .send({ row: 1, col: 7 })
                .expect(400)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'This cell was already shot' });
            });
        });
    });
    it('should succeed - false hit', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(async () => {
            await db.updateGameState(4, 'user1_turn');
            return agent
                .post('/games/4/shoot')
                .send({ row: 9, col: 8 })
                .expect(200)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Player performed a shot' });
            });
        });
    });
    it('should succeed - true hit', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbalgam@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(async () => {
            await db.updateGameState(4, 'user2_turn');
            return agent
                .post('/games/4/shoot')
                .send({ row: 3, col: 2 })
                .expect(200)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Player performed a shot' });
            });
        });
    });
});
describe('Sending a message in chat', function () {
    it('should not succeed - invalid player', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbalNEW@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .post('/games/4/chat')
                .send({ message: 'hello' })
                .expect(401)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'User not part of game' });
            });
        });
    });
    it('should send message', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .post('/games/4/chat')
                .send({ message: 'hi there' })
                .expect(200)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Sent message' });
            });
        });
    });
});
describe('Getting game chat messages', function () {
    it('should not succeed - invalid player', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbalNEW@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .get('/games/4/chat')
                .expect(401)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'User not part of game' });
            });
        });
    });
    it('should get messages', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .get('/games/4/chat')
                .expect(200);
        });
    });
});
describe('Getting game info', function () {
    it('should not succeed - invalid player', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbalNEW@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .get('/games/4')
                .expect(401)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'User not part of game' });
            });
        });
    });
    it('should not succeed - invalid game state', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .get('/games/1')
                .expect(400)
                .then((response) => {
                expect(response.body).to.be.deep.equal({ msg: 'Game is in state invited' });
            });
        });
    });
    it('should succeed - user1_ready, waiting for others', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .get('/games/7')
                .expect(200)
                .then((response) => {
                expect(response.body.phase).to.be.deep.equal('waiting_for_other_player');
            });
        });
    });
    it('should succeed - user1_won, winner', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .get('/games/6')
                .expect(200)
                .then((response) => {
                expect(response.body.phase).to.be.deep.equal('finished');
            });
        });
    });
    it('should succeed - placing_pieces', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .get('/games/23')
                .expect(200)
                .then((response) => {
                expect(response.body.phase).to.be.deep.equal('placing_pieces');
            });
        });
    });
    it('should succeed - user1_turn, gamePlay', function () {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({ username: 'inbal@gmail.com', password: 'dafsd444' }) // User exist
            .redirects(1)
            .then(() => {
            return agent
                .get('/games/2')
                .expect(200)
                .then((response) => {
                expect(response.body.phase).to.be.deep.equal('gamePlay');
            });
        });
    });
});
