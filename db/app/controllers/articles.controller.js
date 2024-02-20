const {
  fetchArticleById,
  fetchArticles,
  fetchArticleComments,
} = require("../models/articles.model");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  fetchArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;
  const promises = [
    fetchArticleComments(article_id),
    fetchArticleById(article_id),
  ];
  Promise.all(promises)
    .then((promiseResolutions) => {
      console.log(promiseResolutions);
      res.status(200).send({ comments: promiseResolutions[0] });
    })
    .catch((err) => {
      next(err);
    });
};
