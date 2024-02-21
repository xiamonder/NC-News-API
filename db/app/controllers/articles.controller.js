const {
  fetchArticleById,
  fetchArticles,
  fetchArticleComments,
  addComment,
  alterVotes,
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
  const {topic} = req.query
  fetchArticles(topic)
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
      res.status(200).send({ comments: promiseResolutions[0] });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const comment = req.body;
  const promises = [
    fetchArticleById(article_id),
    addComment(article_id, comment),
  ];
  Promise.all(promises)
    .then((promiseResolutions) => {
      const comment = promiseResolutions[1];
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.updateVotes = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  alterVotes(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
