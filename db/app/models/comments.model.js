const db = require("../../connection");
const format = require("pg-format");

exports.fetchComments = () => {
  return db.query(`SELECT * FROM comments`).then(({ rows }) => {
    return rows;
  });
};

exports.removeComment = (comment_id) => {
  return db
    .query(`DELETE FROM comments where comment_id = $1`, [comment_id])
    .then(({rows, rowCount}) => {
      if(rowCount ===0){return Promise.reject({status:404, msg: 'comment not found'})}
      return rows;
    });
};
