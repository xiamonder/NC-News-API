const {
  fetchArticleById,
  fetchArticles,
  fetchArticleComments,
  addComment,
  alterArticleVotes,
  addArticle,
} = require("../models/articles.model");
const { fetchTopicBySlug } = require("../models/topics.model");
const { fetchUserByUsername } = require("../models/users.model");

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
  const { topic, sort_by, order } = req.query;
  const promises = [fetchArticles(topic, sort_by, order)];
  if (topic) {
    promises.push(fetchTopicBySlug(topic));
  }
  Promise.all(promises)
    .then((promiseResolutions) => {
      res.status(200).send({ articles: promiseResolutions[0] });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArticle = (req, res, next) => {
  const { author, title, body, topic, article_img_url } = req.body;

  if (!author || !title || !body || !topic) {
    res.status(400).send({ msg: "bad request" });
  } else {
    const promises = [
      fetchUserByUsername(author),
      fetchTopicBySlug(topic),
      addArticle(author, title, body, topic, article_img_url),
    ];
    Promise.all(promises)
      .then((promiseResolutions) => {
        res.status(201).send({ article: promiseResolutions[2] });
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  }
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
      console.log(err)
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

exports.updateArticleVotes = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  alterArticleVotes(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
