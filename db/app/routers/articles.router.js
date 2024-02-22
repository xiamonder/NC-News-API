const {
  getArticles,
  getArticleById,
  getArticleComments,
  postComment,
  updateArticleVotes,
} = require("../controllers/articles.controller");

const articleRouter = require("express").Router();

articleRouter.get("/", getArticles);

articleRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(updateArticleVotes);

articleRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postComment);

module.exports = articleRouter;
