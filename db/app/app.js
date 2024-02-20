const express = require("express");
const { getTopics } = require("./controllers/topics.controller");
const { getArticleById, getArticles } = require("./controllers/articles.controller");
const { getAPI } = require("./controllers/api.controller.js");
const {
  handleCustomErrors,
  handlePsqlErrors,
  handleServerErrors,
} = require("./controllers/errors.controller.js");

const app = express();

app.get("/api/topics", getTopics);

app.get("/api", getAPI);

app.get('/api/articles', getArticles)

app.get("/api/articles/:article_id", getArticleById);

app.all("/api/*", (req, res) => {
  res.status(404).send({ msg: "Page not found" });
});

app.use(handleCustomErrors);

app.use(handlePsqlErrors);

app.use(handleServerErrors);

module.exports = app;
