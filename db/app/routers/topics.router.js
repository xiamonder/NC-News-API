const { getTopics } = require("../controllers/topics.controller");

const topicRouter = require("express").Router();

topicRouter.get("/", getTopics);

module.exports = topicRouter;
