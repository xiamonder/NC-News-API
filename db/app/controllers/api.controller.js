const { fetchAPI } = require("../models/api.models");

exports.getAPI = (req, res, next) => {
  fetchAPI()
    .then((apiDetails) => {
      res.status(200).send({ apiDetails });
    })
    .catch(next);
};
