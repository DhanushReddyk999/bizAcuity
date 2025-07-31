const mysql = require("mysql2");
const config = require('./config');

const db = mysql.createConnection({
  host: config.DATABASE.HOST,
  user: config.DATABASE.USER,
  database: config.DATABASE.DATABASE,
  password: config.DATABASE.PASSWORD,
  multipleStatements: config.DATABASE.MULTIPLE_STATEMENTS,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to the database");
});

module.exports = db; 