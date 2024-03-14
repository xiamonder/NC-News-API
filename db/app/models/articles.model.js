const db = require("../../connection");
const format = require("pg-format");

exports.fetchArticles = (
  topic,
  sort_by = "created_at",
  order = "DESC",
  limit = 10,
  p = 1
) => {
  if (
    ![
      "author",
      "title",
      "article_id",
      "topic",
      "created_at",
      "votes",
      "comment_count",
    ].includes(sort_by.toLowerCase())
  ) {
    return Promise.reject({ status: 400, msg: "invalid sort query" });
  }

  if (!["ASC", "DESC"].includes(order.toUpperCase())) {
    return Promise.reject({ status: 400, msg: "invalid order query" });
  }

  if (isNaN(Number(limit))) {
    return Promise.reject({ status: 400, msg: "invalid limit request" });
  }

  if (isNaN(Number(p))) {
    return Promise.reject({ status: 400, msg: "invalid page request" });
  }

  const offset = p * limit - limit;

  let queryString = `WITH processedArticles AS ( SELECT
    articles.author,
    articles.title,
    articles.article_id,
    articles.topic,
    articles.created_at,
    articles.votes,
    articles.article_img_url,
    COUNT(comments.comment_id) AS comment_count
  FROM
    articles
  LEFT JOIN comments ON articles.article_id = comments.article_id`;

  const queryValues = [];

  if (topic) {
    queryString += ` WHERE articles.topic = $1`;
    queryValues.push(topic);
  }

  queryString += ` GROUP BY articles.article_id) SELECT *, ROW_NUMBER() OVER (ORDER BY ${sort_by} ${order}) AS result, COUNT (*) OVER() AS total_results FROM processedArticles LIMIT ${limit} OFFSET ${offset}`;

  return db.query(queryString, queryValues).then(({ rows }) => {
    return rows;
  });
};

exports.fetchArticleById = (articleId) => {
  return db
    .query(
      `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.body, articles.created_at, articles.votes, articles.article_img_url, COUNT (comments.comment_id) as comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id`,
      [articleId]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "article not found" });
      }
      return rows[0];
    });
};

exports.addArticle = (author, title, body, topic, article_img_url) => {
  const queryString = format(
    `INSERT INTO articles (author, title, body,topic,article_img_url) VALUES %L RETURNING *;`,
    [[author, title, body, topic, article_img_url]]
  );
  return db.query(queryString).then(({ rows }) => {
    const article_id = rows[0].article_id;
    return db
      .query(
        `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.body, articles.created_at, articles.votes, articles.article_img_url, COUNT (comments.comment_id) as comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id`,
        [article_id]
      )
      .then(({ rows }) => {
        return rows[0];
      });
  });
};

exports.fetchArticleComments = (article_id, limit = 10, p = 1) => {
  if (isNaN(Number(limit))) {
    return Promise.reject({ status: 400, msg: "invalid limit request" });
  }

  if (isNaN(Number(p))) {
    return Promise.reject({ status: 400, msg: "invalid page request" });
  }

  const offset = p * limit - limit;

  return db
    .query(
      `SELECT *, ROW_NUMBER() OVER () AS result, COUNT(*) OVER() AS total_results FROM comments WHERE article_id = $1 LIMIT ${limit} OFFSET ${offset}`,
      [article_id]
    )
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

exports.alterArticleVotes = (article_id, inc_votes = 0) => {
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

exports.removeArticle = (article_id) => {
  return db
    .query(`DELETE FROM articles where article_id = $1`, [article_id])
    .then(({ rows, rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({ status: 404, msg: "article not found" });
      }
      return rows;
    });
};
