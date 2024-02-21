const express = require("express");
const { getTopics } = require("./controllers/topics.controller");
const {
  getArticleById,
  getArticles,
  getArticleComments,
  postComment,
  updateVotes,
} = require("./controllers/articles.controller");
const { getAPI } = require("./controllers/api.controller.js");
const {
  handleCustomErrors,
  handlePsqlErrors,
  handleServerErrors,
} = require("./controllers/errors.controller.js");
const {
  deleteComment,
  getComments,
} = require("./controllers/comments.controller.js");
const { getUsers } = require("./controllers/users.controller.js");

const app = express();

app.use(express.json());

app.get("/api", getAPI);

app.get("/api/topics", getTopics);

app.get("/api/comments", getComments);

app.get("/api/articles", getArticles);

app.get("/api/users", getUsers);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getArticleComments);

app.post("/api/articles/:article_id/comments", postComment);

app.patch("/api/articles/:article_id", updateVotes);

app.delete("/api/comments/:comment_id", deleteComment);

app.all("/api/*", (req, res) => {
  res.status(404).send({ msg: "Page not found" });
});

app.use(handleCustomErrors);

app.use(handlePsqlErrors);

app.use(handleServerErrors);

module.exports = app;
