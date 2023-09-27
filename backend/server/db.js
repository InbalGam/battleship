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
  ssl: true
});



async function getFromFederatedCredentials(issuer, id) {
  const check = await pool.query('SELECT * FROM federated_credentials WHERE provider = $1 AND subject = $2', [issuer, id]);
  return check.rows;
};


async function getUsername(username) {
  const userUsername = await pool.query('select * from users where username = $1', [username]);
  return userUsername.rows;
};


async function insertToUsers(username, nickname, hashedPassword, timestamp) {
  const user = await pool.query('INSERT INTO users (username, nickname, password, created_at) VALUES ($1, $2, $3, $4) returning *', [username, nickname, hashedPassword, timestamp]);
  return user.rows;
};


async function getUser(id) {
  const user = await pool.query('select u.*, if.filename as imagename from users u left join image_files if on u.image_id = if.id where u.id = $1', [id]);
  return user.rows;
};


async function updateUsername(id, nickname, imgId, timestamp) {
  await pool.query('update users set nickname = $2, image_id = $3, modified_at = $4 where id = $1;', [id, nickname, imgId, timestamp]);
};


async function getGameById(id) {
  const game = await pool.query('select * from games where id = $1', [id]);
  return game.rows;
};


async function createGame(user1Id, user2Id, dimension, state, timestamp) {
  await pool.query('insert into games (user1, user2, dimension, state, created_at) values ($1, $2, $3, $4, $5) returning *', [user1Id, user2Id, dimension, state, timestamp]);
};


async function getUserScore(id) {
  const userStatus = await pool.query('select wins, loses from users where id = $1', [id]);
  return userStatus.rows;
};



async function getActiveGameData(id, state1, state2) {
  const result = await pool.query(`select g.id as game_id, u.nickname as opponent, dimension as board_dimension, sum(case when s.user_id = $1 and s.hit = true then 1 else 0 end) as hits,
        sum(case when s.user_id <> $1 and s.hit = true then 1 else 0 end) as bombed from games g left join shots s on g.id = s.game_id join users u on (u.id = g.user1 or u.id = g.user2) and u.id <> $1 
        where (user1 = $1 or user2 = $1) and (g.state = $2 or g.state = $3) group by 1,2,3`,
        [id, state1, state2]);
  return result.rows;
};


async function getOtherGamesData(id, state1, state2, state3, state4) {
  const result = await pool.query(`select g.id, g.user1, g.user2, u.nickname as opponent, g.dimension, state
        from games g join users u on (u.id = g.user1 or u.id = g.user2) and u.id <> $1 where (user1 = $1 or user2 = $1) and (state = $2 or state = $3 or state = $4 or state = $5) order by g.created_at`,
        [id, state1, state2, state3, state4]);
  return result.rows;
}


async function updateGameState(id, state) {
  await pool.query('update games set state = $2 where id = $1;', [id, state]);
};


async function deleteGame(id) {
  await pool.query('delete from games where id = $1;', [id]);
};


async function getShipsSizes(gameId, userId) {
  const sizes = await pool.query('select size from ships where game_id = $1 and user_id = $2', [gameId, userId]);
  return sizes.rows;
};


async function placeAShip(gameId, userId, ship_size, start_row, start_col, end_row, end_col) {
  await pool.query('insert into ships (game_id, user_id, size, start_row, start_col, end_row, end_col) values ($1, $2, $3, $4, $5, $6, $7)', 
  [gameId, userId, ship_size, start_row, start_col, end_row, end_col]);
};


async function getShipsData(gameId, userId) {
  const result = await pool.query('select * from ships where game_id = $1 and user_id = $2', [gameId, userId]);
  return result.rows;
};


async function deleteAShip(gameId, userId, ship_size, start_row, start_col, end_row, end_col) {
  await pool.query('delete from ships where game_id = $1 and user_id = $2 and size = $3 and start_row = $4 and start_col = $5 and end_row = $6 and end_col = $7', 
                [gameId, userId, ship_size, start_row, start_col, end_row, end_col]);
};


async function getUserShots(gameId, userId) {
  const result = await pool.query('select * from shots where game_id = $1 and user_id = $2', [gameId, userId]);
  return result.rows;
};


async function getHitsResults(id, opponent, row, col) {
  const results = await pool.query(`select sum(case when $3 >= start_row and $3 <= end_row and $4 >= start_col and $4 <= end_col then 1 else 0 end) as hits from ships where game_id = $1 and user_id = $2`,
    [id, opponent, row, col]);
  return results.rows;
};


async function insertIntoShots(id, player, row, col, hit, timestamp) {
  await pool.query('insert into shots (game_id, user_id, row, col, hit, performed_at) values ($1, $2, $3, $4, $5, $6)', [id, player, row, col, hit, timestamp]);
};


async function updateUsersScores(player, opponent) {
  await pool.query('update users set wins = (wins + 1) where id = $1;', [player]);
  await pool.query('update users set loses = (loses + 1) where id = $1;', [opponent]);
};


async function postMsgToChat(gameId, userId, message, timestamp) {
  await pool.query('insert into chat_messages (game_id, user_id, text, created_at) values ($1, $2, $3, $4)', [gameId, userId, message, timestamp]);
};


async function getChatMsgs(id) {
  const result = await pool.query('select u.nickname as from, cm.text as message, cm.created_at as date from chat_messages cm join users u on cm.user_id = u.id where cm.game_id = $1 order by cm.created_at desc', [id]);
  return result.rows;
};


async function getGameShots(id, gameOpponent) {
  const result = await pool.query('select row, col, hit, case when user_id = $2 then 1 else 0 end as opponent_shot from shots where game_id = $1', [id, gameOpponent]);
  return result.rows;
};


async function insertImage(req) {
  const result =  await pool.query('insert into image_files (filename, filepath, mimetype, size) values ($1, $2, $3, $4) returning *', [req.file.filename, req.file.path, req.file.mimetype, req.file.size]);
  return result.rows;
};


module.exports = {
  getFromFederatedCredentials,
  getUsername,
  insertToUsers,
  getUser,
  updateUsername,
  getGameById,
  createGame,
  getUserScore,
  getActiveGameData,
  getOtherGamesData,
  updateGameState,
  deleteGame,
  getShipsSizes,
  placeAShip,
  getShipsData,
  deleteAShip,
  getUserShots,
  getHitsResults,
  insertIntoShots,
  updateUsersScores,
  postMsgToChat,
  getChatMsgs,
  getGameShots,
  insertImage
};
