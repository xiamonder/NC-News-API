const {
  getArticles,
  getArticleById,
  getArticleComments,
  postComment,
  updateVotes,
} = require("../controllers/articles.controller");

const articleRouter = require("express").Router();

articleRouter.get("/", getArticles);

articleRouter.route("/:article_id").get(getArticleById).patch(updateVotes);

articleRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postComment);

module.exports = articleRouter;