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


export interface UserDb {
  id: number;
  username: string;
  password: string;
  nickname: string;
  wins: number;
  loses: number;
  created_at: Date;
  modified_at: Date;
  image_id: number;
  imagename: string | null;
}


export interface UserScore {
  id: number;
  wins: number;
  loses: number;
}


interface FederatedCredentialsInfo {
  user_id: number;
  provider: string;
  subject: string;
};


export interface ActiveGames {
  game_id: number;
  opponent: string;
  board_dimension: number;
  hits: number;
  bombed: number;
}


export interface OtherGames {
  id: number;
  user1: number;
  user2: number;
  opponent: string;
  dimension: number;
  state: string;
}


export interface Game {
  id: number;
  user1: number;
  user2: number;
  dimension: number;
  state: string;
  created_at: Date;
}


export interface Ship {
  gameId: number;
  userId: number;
  size: number;
  start_row: number;
  start_col: number;
  end_row: number;
  end_col: number;
}


export interface Shot {
  gameId: number;
  userId: number;
  row: number;
  col: number;
  hit: boolean;
  opponent_shot: number;
}


export interface Chat {
  gameId: number;
  userId: number;
  text: string;
  created_at: Date;
}

interface ShipSize {
  size: number;
}


interface Hits {
  hits: string;
}


export interface Img {
  id: number;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
}

export async function getFromFederatedCredentials(issuer: string, id: string): Promise<FederatedCredentialsInfo[]> {
  const check = await pool.query('SELECT * FROM federated_credentials WHERE provider = $1 AND subject = $2', [issuer, id]);
  return check.rows;
};


export async function getUserByUsername(username: string): Promise<UserDb> {
  const userUsername = await pool.query('select * from users where username = $1', [username]);
  return userUsername.rows[0];
};


export async function insertToUsers(username: string, nickname: string, hashedPassword: string | null, timestamp: Date): Promise<UserDb> {
  const user = await pool.query('INSERT INTO users (username, nickname, password, created_at) VALUES ($1, $2, $3, $4) returning *', [username, nickname, hashedPassword, timestamp]);
  return user.rows[0];
};


export async function insertFederatedCredentials(user_id: number, issuer: string, profile_id: string) {
  await pool.query('INSERT INTO federated_credentials (user_id, provider, subject) VALUES ($1, $2, $3)', [user_id, issuer, profile_id]);
};

export async function getUserById(id: number): Promise<UserDb> {
  const user = await pool.query('select u.*, if.filename as imagename from users u left join image_files if on u.image_id = if.id where u.id = $1', [id]);
  return user.rows[0];
};


export async function updateProfile(id: number, nickname: string, imgId: number | null, timestamp: Date): Promise<UserDb> {
  const user = await pool.query('update users set nickname = $2, image_id = $3, modified_at = $4 where id = $1 returning *;', [id, nickname, imgId, timestamp]);
  return user.rows[0];
};


export async function getGameById(id: number): Promise<Game> {
  const game = await pool.query('select * from games where id = $1', [id]);
  return game.rows[0];
};


export async function createGame(user1Id: number, user2Id: number, dimension: number, state: string, timestamp: Date): Promise<Game> {
  const game = await pool.query('insert into games (user1, user2, dimension, state, created_at) values ($1, $2, $3, $4, $5) returning *', [user1Id, user2Id, dimension, state, timestamp]);
  return game.rows[0];
};


export async function getUserScore(id: number): Promise<UserScore> {
  const userStatus = await pool.query('select id, wins, loses from users where id = $1', [id]);
  return userStatus.rows[0];
};



export async function getActiveGameData(id: number, state1: string, state2: string): Promise<ActiveGames[]> {
  const result = await pool.query(`select g.id as game_id, u.nickname as opponent, dimension as board_dimension, sum(case when s.user_id = $1 and s.hit = true then 1 else 0 end) as hits,
        sum(case when s.user_id <> $1 and s.hit = true then 1 else 0 end) as bombed from games g left join shots s on g.id = s.game_id join users u on (u.id = g.user1 or u.id = g.user2) and u.id <> $1 
        where (user1 = $1 or user2 = $1) and (g.state = $2 or g.state = $3) group by 1,2,3`,
        [id, state1, state2]);
  return result.rows;
};


export async function getOtherGamesData(id: number, state1: string, state2: string, state3: string, state4: string): Promise<OtherGames[]> {
  const result = await pool.query(`select g.id, g.user1, g.user2, u.nickname as opponent, g.dimension, state
        from games g join users u on (u.id = g.user1 or u.id = g.user2) and u.id <> $1 where (user1 = $1 or user2 = $1) and (state = $2 or state = $3 or state = $4 or state = $5) order by g.created_at`,
        [id, state1, state2, state3, state4]);
  return result.rows;
}


export async function updateGameState(id: number, state: string): Promise<Game> {
  const updatedGame = await pool.query('update games set state = $2 where id = $1 returning *;', [id, state]);
  return updatedGame.rows[0];
};


export async function deleteGame(id: number) {
  await pool.query('delete from games where id = $1;', [id]);
};


export async function getShipsSizes(gameId: number, userId: number): Promise<ShipSize[]> {
  const sizes = await pool.query('select size from ships where game_id = $1 and user_id = $2', [gameId, userId]);
  return sizes.rows;
};


export async function placeAShip(gameId: number, userId: number, ship_size: number, start_row: number, start_col: number, end_row: number, end_col: number) {
  await pool.query('insert into ships (game_id, user_id, size, start_row, start_col, end_row, end_col) values ($1, $2, $3, $4, $5, $6, $7)', 
  [gameId, userId, ship_size, start_row, start_col, end_row, end_col]);
};


export async function getShipsData(gameId: number, userId: number): Promise<Ship[]> {
  const result = await pool.query('select * from ships where game_id = $1 and user_id = $2', [gameId, userId]);
  return result.rows;
};


export async function deleteAShip(gameId: number, userId: number, ship_size: number, start_row: number, start_col: number, end_row: number, end_col: number) {
  await pool.query('delete from ships where game_id = $1 and user_id = $2 and size = $3 and start_row = $4 and start_col = $5 and end_row = $6 and end_col = $7', 
                [gameId, userId, ship_size, start_row, start_col, end_row, end_col]);
};


export async function getUserShots(gameId: number, userId: number): Promise<Shot[]> {
  const result = await pool.query('select * from shots where game_id = $1 and user_id = $2', [gameId, userId]);
  return result.rows;
};


export async function getHitsResults(id: number, opponent: number, row: number, col: number): Promise<Hits> {
  const results = await pool.query(`select sum(case when $3 >= start_row and $3 <= end_row and $4 >= start_col and $4 <= end_col then 1 else 0 end) as hits from ships where game_id = $1 and user_id = $2`,
    [id, opponent, row, col]);
  return results.rows[0];
};


export async function insertIntoShots(id: number, player: number, row: number, col: number, hit: boolean, timestamp: Date) {
  await pool.query('insert into shots (game_id, user_id, row, col, hit, performed_at) values ($1, $2, $3, $4, $5, $6)', [id, player, row, col, hit, timestamp]);
};


export async function updateUsersScores(player: number, opponent: number) {
  await pool.query('update users set wins = (wins + 1) where id = $1;', [player]);
  await pool.query('update users set loses = (loses + 1) where id = $1;', [opponent]);
};


export async function postMsgToChat(gameId: number, userId: number, message: string, timestamp: Date) {
  await pool.query('insert into chat_messages (game_id, user_id, text, created_at) values ($1, $2, $3, $4)', [gameId, userId, message, timestamp]);
};


export async function getChatMsgs(id: number): Promise<Chat[]> {
  const result = await pool.query('select u.nickname as from, cm.text as message, cm.created_at as date from chat_messages cm join users u on cm.user_id = u.id where cm.game_id = $1 order by cm.created_at desc', [id]);
  return result.rows;
};


export async function getGameShots(id: number, gameOpponent: number): Promise<Shot[]> {
  const result = await pool.query('select row, col, hit, case when user_id = $2 then 1 else 0 end as opponent_shot from shots where game_id = $1', [id, gameOpponent]);
  return result.rows;
};


export async function insertImage(filename: string, path: string, mimetype: string, size: number): Promise<Img> {
  const result =  await pool.query('insert into image_files (filename, filepath, mimetype, size) values ($1, $2, $3, $4) returning *', [filename, path, mimetype, size]);
  return result.rows[0];
};

