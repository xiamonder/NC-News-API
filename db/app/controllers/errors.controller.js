const { handleCustomErrors } = require("../errors/customErrors");

const { handlePsqlErrors } = require("../errors/psqlErrors");

const handleServerErrors = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal Server Error" });
};

module.exports = { handleCustomErrors, handlePsqlErrors, handleServerErrors };
