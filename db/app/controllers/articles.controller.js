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
      res.status(200).send({ comments: promiseResolutions[0] });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const comment = req.body;
  fetchArticleById(article_id)
    .then(() => {
      return addComment(article_id, comment)
        .then((results) => {
            const comment = results[0]
          res.status(201).send({ comment });
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};


/*
Below was my original solution but I kept having an issue with 
test --should respond with 404 for valid but non existent article--
as it shared the error code 23503 with other tests which should return 400 errors. I switchted to the solution above but later realised that if i swap the promise array order then below should work. It does but which solution is better practice? 
 */


// exports.postComment = (req, res, next) => {
//   const { article_id } = req.params;
//   const comment = req.body;
//   const promises = [
//       fetchArticleById(article_id),
//       addComment(article_id, comment),
//   ];
//   Promise.all(promises)
//     .then((promiseResolutions) => {
//       const comment = promiseResolutions[1][0];
//       res.status(201).send({ comment });
//     })
//     .catch((err) => {
//       next(err);
//     });
// };


exports.updateVotes =(req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  const promises = [
    alterVotes(article_id, inc_votes),
    fetchArticleById(article_id)
  ];
  Promise.all(promises)
    .then((promiseResolutions) => {
      res.status(200).send({ article: promiseResolutions[0][0] });
    })
    .catch((err) => {
      next(err);
    });
};
