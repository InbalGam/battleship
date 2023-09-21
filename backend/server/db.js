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


module.exports = {
  pool
};
