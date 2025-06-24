const db = require("../db/index");

exports.fetchDreamsByUser = (user_id, tag, start_date, end_date, sort) => {
  let queryStr = `SELECT * FROM dreams WHERE user_id = $1`;
  const queryParams = [user_id];
  let paramIndex = 2;

  if (tag) {
    queryStr += ` AND tags @> $${paramIndex}::jsonb`;
    queryParams.push(JSON.stringify([tag]));
    paramIndex++;
  }

  if (start_date && end_date) {
    queryStr += ` AND date_logged BETWEEN $${paramIndex} AND $${
      paramIndex + 1
    }`;
    queryParams.push(start_date, end_date);
    paramIndex += 2;
  }

  if (sort === "date_asc") {
    queryStr += ` ORDER BY date_logged ASC`;
  } else {
    queryStr += ` ORDER BY date_logged DESC`;
  }

  return db.query(queryStr, queryParams).then(({ rows }) => {
    return rows;
  });
};

exports.createNewDream = (user_id, newDream) => {
  const { description, date_logged, tags } = newDream;
  return db
    .query(
      `INSERT INTO dreams (user_id, date_logged, description, tags) VALUES ($1, $2, $3, $4) RETURNING *;`,
      [user_id, date_logged, description, JSON.stringify(tags)]
    )
    .then(({ rows }) => {
      return rows[0];
    })
    .catch((err) => {
      if (err.code === "23502") {
        return Promise.reject({
          status: 400,
          msg: "Must include a description",
        });
      }
    });
};

exports.fetchDreamById = (dream_id) => {
  return db
    .query(`SELECT * FROM dreams WHERE id = $1;`, [dream_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Dream does not exist",
        });
      } else return rows[0];
    });
};

exports.removeDreamById = (dream_id) => {
  return db
    .query(`DELETE FROM dreams WHERE id = $1`, [dream_id])
    .then(({ rows }) => {
      return rows;
    });
};
