const { removeComment, fetchComments } = require("../models/comments.model")


exports.getComments = (req, res, next) => {
  fetchComments()
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};
exports.deleteComment = (req, res, next) => {
    const {comment_id} = req.params
   
    removeComment(comment_id).then(()=>{
    res.status(204).send()
    })
    .catch((err) =>{
        next(err)
    })
}