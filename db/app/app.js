const express = require("express");

const {
  handleCustomErrors,
  handlePsqlErrors,
  handleServerErrors,
} = require("./controllers/errors.controller.js");

const apiRouter = require("./routers/api.router.js");
const userRouter = require("./routers/users.router.js");
const topicRouter = require("./routers/topics.router.js");
const articleRouter = require("./routers/articles.router.js");
const commentRouter = require("./routers/comments.router.js");

const app = express();

app.use(express.json());

app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.status(200).send({ msg: "Connected to NC News API, please go to /api for available endpoints" });
});

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Page not found" });
});

app.use(handleCustomErrors);

app.use(handlePsqlErrors);

app.use(handleServerErrors);

module.exports = app;
