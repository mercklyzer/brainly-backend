var express = require('express');

module.exports = (socket) => {
  const passport = require('passport');
  var router = express.Router();
  const questionController = require('../controllers/questions.controller')(socket)
  const answerController = require('../controllers/answers.controller')(socket)
  const commentController = require('../controllers/comments.controller')(socket)

  /* -------- START OF USING QUESTION CONTROLLER -------- */
  router.get('/', function(req, res, next) {
    questionController.displayAllQuestions(req,res)
  });

  router.post('/', passport.authenticate('jwt', {session:false}),function(req, res, next) {
    questionController.addQuestion(req,res)
  });

  router.get('/:id', passport.authenticate('jwt', {session:false}), (req,res,next) => { 
    questionController.getQuestion(req, res)
  })

  router.put('/:id', passport.authenticate('jwt', {session:false}), (req,res,next) => {
    questionController.editQuestion(req, res)
  })

  router.delete('/:id', passport.authenticate('jwt', {session:false}), (req,res,next) => {
    questionController.deleteQuestion(req, res)
  })
  /* -------- END OF USING QUESTION CONTROLLER -------- */

  /* -------- START OF USING ANSWERS CONTROLLER -------- */
  router.get('/:id/answers', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    answerController.getAnswersByQuestionId(req, res)
  })

  router.post('/:id/answers', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    answerController.addAnswer(req, res)
  })

  router.put('/:id/answers/:answerId', (req, res, next) => {
    answerController.editAnswer(req, res)
  })

  router.delete('/:id/answers/:answerId', (req, res, next) => {
    answerController.deleteAnswer(req, res)
  })

  router.post('/:id/answers/:answerId/brainliest', passport.authenticate('jwt', {session:false}), (req,res,next) => {
    answerController.setBrainliest(req,res)
  })

  router.post('/:id/answers/:answerId/thank', passport.authenticate('jwt', {session:false}), (req,res,next) => {
    answerController.addThank(req,res)
  })
  /* -------- END OF USING ANSWERS CONTROLLER -------- */

  /* -------- START OF USING COMMENTS CONTROLLER -------- */

  // GETS comments of a QUESTION
  router.get('/:id/comments', (req, res, next) => {
    commentController.getCommentsByQuestionId(req, res)
  })

  // GETS comments of an ANSWER
  router.get('/:id/answers/:answerId/comments', (req, res, next) => {
    commentController.getCommentsByAnswerId(req, res)
  })

  // ADDS a comment to a QUESTION
  router.post('/:id/comments', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    commentController.addComment(req, res, 'question')
  })

  // ADDS a comment to an ANSWER
  router.post('/:id/answers/:answerId/comments', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    commentController.addComment(req, res, 'answer')
  })

  // EDITS a comment to a question
  router.put('/:id/comments/:commentId', (req, res, next) => {
    commentController.editComment(req, res, 'question')
  })

  // EDITS a comment to an answer
  router.put('/:id/answers/:answerId/comments/:commentId', (req, res, next) => {
    commentController.editComment(req, res, 'answer')
  })

  // DELETES a comment to a question
  router.delete('/:id/comments/:commentId', (req, res, next) => {
    commentController.deleteComment(req, res, 'question')
  })

  // DELETE a comment to an answer
  router.delete('/:id/answers/:answerId/comments/:commentId', (req, res, next) => {
    commentController.deleteComment(req, res, 'answer')
  })

  return router
  /* -------- END OF USING COMMENTS CONTROLLER -------- */
}

