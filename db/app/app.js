const express = require("express");
const {getTopics} = require('./controllers/topics.controller');
const {
  handleCustomErrors,
  handlePsqlErrors,
  handleServerErrors,
} = require("./errors/index.js");


const app = express();


app.get("/api/topics", getTopics);

app.all("/api/*", (req, res) => {
  res.status(404).send({ msg: "Page not found" });
});

app.use(handleCustomErrors);

app.use(handlePsqlErrors);

app.use(handleServerErrors);


module.exports = app;