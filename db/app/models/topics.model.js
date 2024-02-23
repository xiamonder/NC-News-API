const db = require("../../connection");
const format = require("pg-format");

exports.fetchTopics = () => {
  return db.query(`SELECT * FROM topics`).then(({ rows }) => {
    return rows;
  });
};

exports.fetchTopicBySlug = (topic) => {
  return db
    .query(`SELECT * FROM topics WHERE slug = $1`, [topic])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "topic not found" });
      }
      return rows[0];
    });
};

exports.addTopic = (slug, description) => {
  const queryString = format(
    `INSERT INTO topics (slug, description) VALUES %L RETURNING *;`,
    [[slug, description]]
  );
  return db
    .query(queryString)
    .then(({ rows }) => {
      return rows[0];
    })
    .catch((err) => {
      if (err.code === "23505") {
        return Promise.reject({ status: 400, msg: "topic already exists" });
      } else return Promise.reject(err);
    });
};
