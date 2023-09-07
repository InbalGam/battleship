const expect = require('chai').expect;
const request = require('supertest');

const app = require('../server');
const PORT = process.env.PORT || 4001;

// Authorization tests
describe('Login Authorization tests- local strategy', function() {
    it('should NOT pass auth check for log in', function() {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({username: 'user_gCheck', password: 'bldadala23pppppp99'}) // User doesn't exist
            .redirects(1)
            .expect(401);
    });

    it('should pass auth check for log in', function() {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
            .redirects(1)
            .expect(200);
    });
});


describe('Logout', function() {
    it('should log out', function() {
        const agent = request.agent(app);
        return agent
            .get('/logout')
            .expect(200)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Successfully logged out'});
            });
    });
});


describe('Update profile nickname', function() {
    it('should NOT pass nickname update', function() {
        const agent = request.agent(app);
        return agent
            .post('/login')
            .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
            .redirects(1)
            .then(() => {
                return agent
                .put('/profile')
                .send({nickname: undefined})
                .expect(400)
                .then((response) => {
                    expect(response.body).to.be.deep.equal({msg: 'Nickname must be specified'});
                });
            });
    });

    it('should pass nickname update', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .put('/profile')
            .send({nickname: 'inbalCheck'})
            .expect(200)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Updated user'});
            });
        });
    });
});

describe('Register Authorization tests', function() {
    it('should NOT pass auth check for register - email not valid', function() {
        const agent = request.agent(app);
        return agent
            .post('/register')
            .send({username: 'inbalgmail.com', password: 'dafsd4342', nickname: 'inbi'})
            .expect(400)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Email is not valid'});
            });
    });

    it('should NOT pass auth check for register - password length less than 8', function() {
        const agent = request.agent(app);
        return agent
            .post('/register')
            .send({username: 'inbalg@gmail.com', password: 'da', nickname: 'inbi'})
            .expect(400)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Password needs to be at least 8 characters'});
            });
    });

    it('should NOT pass auth check for register - nickname needs specification', function() {
        const agent = request.agent(app);
        return agent
            .post('/register')
            .send({username: 'inbalg@gmail.com', password: 'dasfsdgfsd', nickname: undefined})
            .expect(400)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Nickname must be specified'});
            });
    });

    it('should NOT pass auth check for register - username already exist', function() {
        const agent = request.agent(app);
        return agent
            .post('/register')
            .send({username: 'inbal@gmail.com', password: 'dafsd4342', nickname: 'inbi'})
            .expect(400)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Email already exist, choose a different email'});
            });
    });

    it('should pass registeration', function() {
        const agent = request.agent(app);
        return agent
            .post('/register')
            .send({username: 'inbalg@gmail.com', password: 'dafsd4342', nickname: 'inbi'})
            .expect(201)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Success creating user'});
            });
    });
});


// Game tests
describe('Create a new game', function() {
    it('should not post a new game- not logged in', function() {
        const agent = request.agent(app);
        return agent
            .post('/games')
            .send({opponent: 'inbalcheck@gmail.com', dimension: 10})
            .expect(401)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'You need to login first'});
            });
    });

    it('should not post a new game- invalid dimension', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .post('/games')
            .send({opponent: 'inbalcheck@gmail.com', dimension: 30})
            .expect(400)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Dimension must be 10 or 20'});
            });
        });
    });

    it('should not post a new game- opponent different than player', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .post('/games')
            .send({opponent: 'inbal@gmail.com', dimension: 10})
            .expect(400)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Opponent must not be you'});
            });
        });
    });

    it('should not post a new game- opponent not exist', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .post('/games')
            .send({opponent: 'inbalfsdfds@gmail.com', dimension: 10})
            .expect(400)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'User does not exists'});
            });
        });
    });

    it('should post a new game', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .post('/games')
            .send({opponent: 'inbalgam@gmail.com', dimension: 10})
            .expect(201)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Game created'});
            });
        });
    });
});


describe('Get all games', function() {
    it('should not get all games- user not exist', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inb54543al@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .get('/games')
            .expect(401)
        });
    });

    it('should get all games', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .get('/games')
            .expect(200)
        });
    });
});



describe('Update a game', function() {
    it('should not update a game- game id invalid', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbalgam@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .put('/games/3')
            .expect(400)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Game does not exist'});
            });
        });
    });


    it('should not update a game- not correct opponent', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .put('/games/5')
            .expect(401)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'You are not the correct opponent player'});
            });
        });
    });


    it('should not update a game- active game', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbalgam@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .put('/games/4')
            .expect(401)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Cannot accept an active game'});
            });
        });
    });

    it('should update a game', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbalgam@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .put('/games/5')
            .expect(200)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'game accepted by opponent'});
            });
        });
    });
});


describe('Delete a game', function() {
    it('should not delete a game- game id invalid', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbalgam@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .delete('/games/3')
            .expect(400)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Game does not exist'});
            });
        });
    });


    it('should not delete a game- not correct opponent', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .delete('/games/6')
            .expect(401)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'You are not the correct opponent player'});
            });
        });
    });


    it('should not delete a game- active game', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbalgam@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .delete('/games/4')
            .expect(401)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Cannot delete an active game'});
            });
        });
    });

    it('should delete a game', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbalgam@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .delete('/games/6')
            .expect(200)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'game deleted by opponent'});
            });
        });
    });
});


describe('Placing ships in game', function() {
    it('should not succeed - invalid ship size', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .post('/games/4/place')
            .send({ship_size: 5, start_row: 1, start_col: 1, end_row: 7, end_col: 1})
            .expect(400)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Ship is not in the correct size'});
            });
        });
    });

    it('should not succeed - invalid ship', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .post('/games/4/place')
            .send({ship_size: 5, start_row: 1, start_col: 1, end_row: 7, end_col: 4})
            .expect(400)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Ship is not valid'});
            });
        });
    });

    it('should not succeed - invalid game state', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .post('/games/1/place')
            .send({ship_size: 5, start_row: 1, start_col: 1, end_row: 5, end_col: 1})
            .expect(400)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Game is not in correct state or user not correct user'});
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
                            .send({ ship_size: 3, start_row: 1, start_col: 2, end_row: 3, end_col: 2 })
                            .expect(400)
                            .then((response) => {
                                expect(response.body).to.be.deep.equal({ msg: 'Ship cannot be next to another ship' });
                            });
                    });
            });
    });

    it('should succeed - place ship', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .post('/games/4/place')
            .send({ship_size: 4, start_row: 3, start_col: 2, end_row: 3, end_col: 5})
            .expect(200)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Placed a ship of size 4, you have 0 more of those to place'});
            });
        });
    });
});

describe('Unplace a ship', function() {
    it('should not succeed - invalid game state', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .delete('/games/1/place')
            .send({ship_size: 4, start_row: 3, start_col: 2, end_row: 3, end_col: 5})
            .expect(400)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Game is not in correct state or user not correct user'});
            });
        });
    });


    it('should not succeed - ship was not placed', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .delete('/games/4/place')
            .send({ship_size: 5, start_row: 2, start_col: 1, end_row: 5, end_col: 1})
            .expect(400)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Ship was not placed cannot be unplaced'});
            });
        });
    });


    it('should unplace a ship', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .delete('/games/4/place')
            .send({ship_size: 4, start_row: 3, start_col: 2, end_row: 3, end_col: 5})
            .expect(200)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Ship deleted'});
            });
        });
    });
});

describe('Game state change to ready', function() {
    it('should not succeed - invalid game state', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .post('/games/1/ready')
            .expect(400)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Game is not in correct state or user not correct user'});
            });
        });
    });


    it('should not succeed - not finished placing ships', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .post('/games/5/ready')
            .expect(400)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'Player did not finish placeing ships'});
            });
        });
    });


    it('should change game state', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .post('/games/4/ready')
            .expect(200)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'game state updated'});
            });
        });
    });
});


describe('Sending a message in chat', function() {
    it('should not succeed - invalid player', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbalNEW@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .post('/games/4/chat')
            .send({message: 'hello'})
            .expect(400)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'User not part of game'});
            });
        });
    });


    it('should send message', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .post('/games/4/chat')
            .send({message: 'hi there'})
            .expect(200)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'sent message'});
            });
        });
    });
});


describe('Getting game chat messages', function() {
    it('should not succeed - invalid player', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbalNEW@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .get('/games/4/chat')
            .expect(400)
            .then((response) => {
                expect(response.body).to.be.deep.equal({msg: 'User not part of game'});
            });
        });
    });


    it('should send message', function() {
        const agent = request.agent(app);
        return agent
        .post('/login')
        .send({username: 'inbal@gmail.com', password: 'dafsd444'}) // User exist
        .redirects(1)
        .then(() => {
            return agent
            .get('/games/4/chat')
            .expect(200)
        });
    });
});


// TODO - testing for a player making a shot - /games/:game_id/shoot
