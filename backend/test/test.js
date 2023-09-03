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
