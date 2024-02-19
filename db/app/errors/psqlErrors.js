exports.handlePsqlErrors = (err, request, response, next) => {
  if (err.code === "23502"|| err.code === '22P02') {
    response.status(400).send({ msg: "Bad request" });
  } else {
    next(err);
  }
}
