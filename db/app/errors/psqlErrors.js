const e = require("express");

exports.handlePsqlErrors = (err, request, response, next) => {
  if (
    err.code === "23502" ||
    err.code === "22P02" ||
    err.code === "42703" ||
    err.code === "23503"
  ) {
    response.status(400).send({ msg: "bad request" });
  } else {
    next(err);
  }
};
