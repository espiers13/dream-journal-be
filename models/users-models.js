const db = require("../db/index");
const bcrypt = require("bcrypt");

const saltRounds = 10;

exports.loginUser = (username, password) => {
  return db
    .query(
      `SELECT id, username, email, password
       FROM users
       WHERE username = $1;`,
      [username]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 401, msg: "User not found" });
      }

      const { password: hashedPassword, ...safeUser } = rows[0];

      return bcrypt.compare(password, hashedPassword).then((isMatch) => {
        if (!isMatch) {
          return Promise.reject({ status: 401, msg: "Invalid password" });
        }
        return safeUser;
      });
    });
};

exports.postUser = (newUser) => {
  const { username, email, password } = newUser;

  return bcrypt.hash(password, saltRounds).then((hashedPassword) => {
    const queryStr = `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email`;
    const values = [username, email, hashedPassword];

    return db
      .query(queryStr, values)
      .then(({ rows }) => {
        return rows[0];
      })
      .catch((err) => {
        if (err.code === "23505" && err.constraint === "users_username_key") {
          return Promise.reject({
            status: 409,
            msg: "Username already exists",
          });
        }
        if (err.code === "23505" && err.constraint === "users_email_key") {
          return Promise.reject({
            status: 409,
            msg: "Email already exists",
          });
        }
      });
  });
};

exports.removeUser = (id) => {
  return db
    .query(`DELETE FROM users WHERE id = $1 RETURNING *;`, [id])
    .then(({ rows }) => {
      return rows;
    });
};
