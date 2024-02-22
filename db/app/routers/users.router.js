const {
  getUsers,
  getUserByUsername,
} = require("../controllers/users.controller");

const userRouter = require("express").Router();

userRouter.get("/", getUsers);

userRouter.route("/:username").get(getUserByUsername);
module.exports = userRouter;
