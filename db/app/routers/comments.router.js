const {
  getComments,
  deleteComment,
  updateCommentVotes,
} = require("../controllers/comments.controller");

const commentRouter = require("express").Router();

commentRouter.get("/", getComments);

commentRouter
  .route("/:comment_id")
  .patch(updateCommentVotes)
  .delete(deleteComment);
module.exports = commentRouter;
