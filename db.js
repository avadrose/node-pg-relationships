/** Database setup for BizTime. */

const { Client } = require("pg");

const db = new Client({
  user: "postgres",
  password: "1234",
  host: "localhost",
  port: 5432,
  database: "biztime"
});

db.connect();

module.exports = db;