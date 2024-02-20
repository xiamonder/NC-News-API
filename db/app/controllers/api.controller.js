const { fetchAPI } = require("../models/api.models");

exports.getAPI = (req, res, next) => {
  fetchAPI()
    .then((apiData) => {
      res.status(200).send({ apiData });
    })
    .catch((err) => {
      next(err);
    });
};
