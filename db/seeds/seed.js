const db = require("../index.js");
const { hashUsersData } = require("./utils.js");
const format = require("pg-format");

const seed = ({ dreamsData, usersData }) => {
  return db
    .query(`DROP TABLE IF EXISTS dreams;`)
    .then(() => db.query(`DROP TABLE IF EXISTS users;`))
    .then(() =>
      db.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password TEXT NOT NULL
        );
      `)
    )
    .then(() =>
      db.query(`
        CREATE TABLE dreams (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(id) ON DELETE CASCADE,
          date_logged DATE DEFAULT (CURRENT_DATE),
          description VARCHAR NOT NULL,
          tags JSONB
        );
      `)
    )
    .then(() => hashUsersData(usersData))
    .then((hashedUsersData) => {
      const insertUsersString = format(
        "INSERT INTO users (username, email, password) VALUES %L RETURNING *;",
        hashedUsersData
      );
      return db.query(insertUsersString);
    })
    .then(() => {
      const dreamsRows = dreamsData.map(
        ({ user_id, date_logged, description, tags }) => [
          user_id,
          date_logged,
          description,
          JSON.stringify(tags),
        ]
      );
      const insertDreamsString = format(
        "INSERT INTO dreams (user_id, date_logged, description, tags) VALUES %L RETURNING *;",
        dreamsRows
      );
      return db.query(insertDreamsString);
    });
};

module.exports = seed;
