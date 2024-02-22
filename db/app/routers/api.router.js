const { getAPI } = require("../controllers/api.controller");
const articleRouter = require("./articles.router");
const commentRouter = require("./comments.router");
const topicRouter = require("./topics.router");
const userRouter = require("./users.router");

const apiRouter = require("express").Router(); 

apiRouter.get("/", getAPI);

apiRouter.use("/topics", topicRouter);

apiRouter.use("/comments", commentRouter);

apiRouter.use("/articles", articleRouter);

apiRouter.use("/users", userRouter);

apiRouter.all("/*", (req, res) => {
  res.status(404).send({ msg: "Page not found" });
});

module.exports= apiRouter