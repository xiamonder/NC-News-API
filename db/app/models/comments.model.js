const db = require("../../connection");

exports.fetchComments = () => {
  return db.query(`SELECT * FROM comments`).then(({ rows }) => {
    return rows;
  });
};

exports.removeComment = (comment_id) => {
  return db
    .query(`DELETE FROM comments where comment_id = $1`, [comment_id])
    .then(({ rows, rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({ status: 404, msg: "comment not found" });
      }
      return rows;
    });
};

exports.alterCommentVotes = (comment_id, inc_votes = 0) => {
  return db
    .query(
      `UPDATE comments
  SET votes = votes + $1
  WHERE comment_id = $2 RETURNING *;`,
      [inc_votes, comment_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "comment not found" });
      }
      return rows[0];
    });
};
