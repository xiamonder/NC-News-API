const {
  getArticles,
  getArticleById,
  getArticleComments,
  postComment,
  updateArticleVotes,
  postArticle,
} = require("../controllers/articles.controller");

const articleRouter = require("express").Router();

articleRouter.route("/").get(getArticles).post(postArticle);

articleRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(updateArticleVotes);

articleRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postComment);

module.exports = articleRouter;
