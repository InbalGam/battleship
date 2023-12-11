"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertImage = exports.getGameShots = exports.getChatMsgs = exports.postMsgToChat = exports.updateUsersScores = exports.insertIntoShots = exports.getHitsResults = exports.getUserShots = exports.deleteAShip = exports.getShipsData = exports.placeAShip = exports.getShipsSizes = exports.deleteGame = exports.updateGameState = exports.getOtherGamesData = exports.getActiveGameData = exports.getUserScore = exports.createGame = exports.getGameById = exports.updateProfile = exports.getUserById = exports.insertFederatedCredentials = exports.insertToUsers = exports.getUserByUsername = exports.getFromFederatedCredentials = void 0;
const dotenv = require("dotenv");
const Pool = require('pg').Pool;
dotenv.config();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB || 'battleship',
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 60000,
    //ssl: true
});
;
async function getFromFederatedCredentials(issuer, id) {
    const check = await pool.query('SELECT * FROM federated_credentials WHERE provider = $1 AND subject = $2', [issuer, id]);
    return check.rows;
}
exports.getFromFederatedCredentials = getFromFederatedCredentials;
;
async function getUserByUsername(username) {
    const userUsername = await pool.query('select * from users where username = $1', [username]);
    return userUsername.rows[0];
}
exports.getUserByUsername = getUserByUsername;
;
async function insertToUsers(username, nickname, hashedPassword, timestamp) {
    const user = await pool.query('INSERT INTO users (username, nickname, password, created_at) VALUES ($1, $2, $3, $4) returning *', [username, nickname, hashedPassword, timestamp]);
    return user.rows[0];
}
exports.insertToUsers = insertToUsers;
;
async function insertFederatedCredentials(user_id, issuer, profile_id) {
    await pool.query('INSERT INTO federated_credentials (user_id, provider, subject) VALUES ($1, $2, $3)', [user_id, issuer, profile_id]);
}
exports.insertFederatedCredentials = insertFederatedCredentials;
;
async function getUserById(id) {
    const user = await pool.query('select u.*, if.filename as imagename from users u left join image_files if on u.image_id = if.id where u.id = $1', [id]);
    return user.rows[0];
}
exports.getUserById = getUserById;
;
async function updateProfile(id, nickname, imgId, timestamp) {
    const user = await pool.query('update users set nickname = $2, image_id = $3, modified_at = $4 where id = $1 returning *;', [id, nickname, imgId, timestamp]);
    return user.rows[0];
}
exports.updateProfile = updateProfile;
;
async function getGameById(id) {
    const game = await pool.query('select * from games where id = $1', [id]);
    return game.rows[0];
}
exports.getGameById = getGameById;
;
async function createGame(user1Id, user2Id, dimension, state, timestamp) {
    const game = await pool.query('insert into games (user1, user2, dimension, state, created_at) values ($1, $2, $3, $4, $5) returning *', [user1Id, user2Id, dimension, state, timestamp]);
    return game.rows[0];
}
exports.createGame = createGame;
;
async function getUserScore(id) {
    const userStatus = await pool.query('select id, wins, loses from users where id = $1', [id]);
    return userStatus.rows[0];
}
exports.getUserScore = getUserScore;
;
async function getActiveGameData(id, state1, state2) {
    const result = await pool.query(`select g.id as game_id, u.nickname as opponent, dimension as board_dimension, sum(case when s.user_id = $1 and s.hit = true then 1 else 0 end) as hits,
        sum(case when s.user_id <> $1 and s.hit = true then 1 else 0 end) as bombed from games g left join shots s on g.id = s.game_id join users u on (u.id = g.user1 or u.id = g.user2) and u.id <> $1 
        where (user1 = $1 or user2 = $1) and (g.state = $2 or g.state = $3) group by 1,2,3`, [id, state1, state2]);
    return result.rows;
}
exports.getActiveGameData = getActiveGameData;
;
async function getOtherGamesData(id, state1, state2, state3, state4) {
    const result = await pool.query(`select g.id, g.user1, g.user2, u.nickname as opponent, g.dimension, state
        from games g join users u on (u.id = g.user1 or u.id = g.user2) and u.id <> $1 where (user1 = $1 or user2 = $1) and (state = $2 or state = $3 or state = $4 or state = $5) order by g.created_at`, [id, state1, state2, state3, state4]);
    return result.rows;
}
exports.getOtherGamesData = getOtherGamesData;
async function updateGameState(id, state) {
    await pool.query('update games set state = $2 where id = $1;', [id, state]);
}
exports.updateGameState = updateGameState;
;
async function deleteGame(id) {
    await pool.query('delete from games where id = $1;', [id]);
}
exports.deleteGame = deleteGame;
;
async function getShipsSizes(gameId, userId) {
    const sizes = await pool.query('select size from ships where game_id = $1 and user_id = $2', [gameId, userId]);
    return sizes.rows;
}
exports.getShipsSizes = getShipsSizes;
;
async function placeAShip(gameId, userId, ship_size, start_row, start_col, end_row, end_col) {
    await pool.query('insert into ships (game_id, user_id, size, start_row, start_col, end_row, end_col) values ($1, $2, $3, $4, $5, $6, $7)', [gameId, userId, ship_size, start_row, start_col, end_row, end_col]);
}
exports.placeAShip = placeAShip;
;
async function getShipsData(gameId, userId) {
    const result = await pool.query('select * from ships where game_id = $1 and user_id = $2', [gameId, userId]);
    return result.rows;
}
exports.getShipsData = getShipsData;
;
async function deleteAShip(gameId, userId, ship_size, start_row, start_col, end_row, end_col) {
    await pool.query('delete from ships where game_id = $1 and user_id = $2 and size = $3 and start_row = $4 and start_col = $5 and end_row = $6 and end_col = $7', [gameId, userId, ship_size, start_row, start_col, end_row, end_col]);
}
exports.deleteAShip = deleteAShip;
;
async function getUserShots(gameId, userId) {
    const result = await pool.query('select * from shots where game_id = $1 and user_id = $2', [gameId, userId]);
    return result.rows;
}
exports.getUserShots = getUserShots;
;
async function getHitsResults(id, opponent, row, col) {
    const results = await pool.query(`select sum(case when $3 >= start_row and $3 <= end_row and $4 >= start_col and $4 <= end_col then 1 else 0 end) as hits from ships where game_id = $1 and user_id = $2`, [id, opponent, row, col]);
    return results.rows;
}
exports.getHitsResults = getHitsResults;
;
async function insertIntoShots(id, player, row, col, hit, timestamp) {
    await pool.query('insert into shots (game_id, user_id, row, col, hit, performed_at) values ($1, $2, $3, $4, $5, $6)', [id, player, row, col, hit, timestamp]);
}
exports.insertIntoShots = insertIntoShots;
;
async function updateUsersScores(player, opponent) {
    await pool.query('update users set wins = (wins + 1) where id = $1;', [player]);
    await pool.query('update users set loses = (loses + 1) where id = $1;', [opponent]);
}
exports.updateUsersScores = updateUsersScores;
;
async function postMsgToChat(gameId, userId, message, timestamp) {
    await pool.query('insert into chat_messages (game_id, user_id, text, created_at) values ($1, $2, $3, $4)', [gameId, userId, message, timestamp]);
}
exports.postMsgToChat = postMsgToChat;
;
async function getChatMsgs(id) {
    const result = await pool.query('select u.nickname as from, cm.text as message, cm.created_at as date from chat_messages cm join users u on cm.user_id = u.id where cm.game_id = $1 order by cm.created_at desc', [id]);
    return result.rows;
}
exports.getChatMsgs = getChatMsgs;
;
async function getGameShots(id, gameOpponent) {
    const result = await pool.query('select row, col, hit, case when user_id = $2 then 1 else 0 end as opponent_shot from shots where game_id = $1', [id, gameOpponent]);
    return result.rows;
}
exports.getGameShots = getGameShots;
;
async function insertImage(req) {
    const result = await pool.query('insert into image_files (filename, filepath, mimetype, size) values ($1, $2, $3, $4) returning *', [req.file.filename, req.file.path, req.file.mimetype, req.file.size]);
    return result.rows;
}
exports.insertImage = insertImage;
;
