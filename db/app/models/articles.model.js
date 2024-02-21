const db = require("../../connection");
const format = require("pg-format");

exports.fetchArticleById = (articleId) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [articleId])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "article not found" });
      }
      return rows[0];
    });
};

exports.fetchArticles = (topic) => {
  let queryString = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT (comments.comment_id) as comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id`;
  const queryValues = [];

  if (topic) {
    queryString += ` WHERE topic = $1`;
    queryValues.push(topic);
  }

  queryString += ` GROUP BY articles.article_id ORDER BY created_at DESC;`;
  return db.query(queryString, queryValues).then(({ rows }) => {
    return rows;
  });
};

exports.fetchArticleComments = (article_id) => {
  return db
    .query(`SELECT * FROM comments WHERE article_id = $1`, [article_id])
    .then(({ rows }) => {
      return rows;
    });
};

exports.addComment = (article_id, comment) => {
  const queryString = format(
    `INSERT INTO comments (article_id, author, body) VALUES %L RETURNING *;`,
    [[article_id, comment.username, comment.body]]
  );
  return db
    .query(queryString)
    .then(({ rows }) => {
      return rows[0];
    })
    .catch((err) => {
      if (err.code === "23503") {
        return Promise.reject({ status: 404, msg: "username not found" });
      } else return Promise.reject(err);
    });
};

exports.alterVotes = (article_id, inc_votes = 0) => {
  return db
    .query(
      `UPDATE articles
  SET votes = votes + $1
  WHERE article_id = $2 RETURNING *;`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "article not found" });
      }
      return rows[0];
    });
};
