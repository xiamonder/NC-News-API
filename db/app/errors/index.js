const { handleCustomErrors } = require("./customErrors");

const { handlePsqlErrors } = require("./psqlErrors");

const handleServerErrors = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal Server Error" });
};


module.exports = {handleCustomErrors, handlePsqlErrors, handleServerErrors}