const { getComments, deleteComment } = require('../controllers/comments.controller')

const commentRouter = require('express').Router()

commentRouter.get('/', getComments)

commentRouter.delete("/:comment_id", deleteComment);

module.exports = commentRouter