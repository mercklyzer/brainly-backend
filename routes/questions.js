var express = require('express');
var router = express.Router();
const controller = require('../controllers/main.controller')

// DISPLAY ALL QUESTIONS
router.get('/', function(req, res, next) {
  controller.displayAllQuestions(req,res)
});

// add a single question
router.post('/', function(req, res, next) {
  console.log("ADD");
  controller.addQuestion(req,res)
});

//GETS a single question
router.get('/:id', (req,res,next) => {
  console.log("GET");
  
  controller.getQuestion(req, res)
})

//EDITS a single question
router.put('/:id', (req,res,next) => {
  console.log("EDIT");
  controller.editQuestion(req, res)
})

// DELETES a single question
router.delete('/:id', (req,res,next) => {
  console.log("DELETE");
  controller.deleteQuestion(req, res)
})

// GET ALL ANSWERS of the question Id
router.get('/:id/answers', (req, res, next) => {
  controller.getAnswersByQuestionId(req, res)
})

// ANSWERS a question
router.post('/:id/answers', (req, res, next) => {
  controller.addAnswer(req, res)
})

// EDITS an answer
router.put('/:id/answers/:answerId', (req, res, next) => {
  console.log("EDIT answer");
  controller.editAnswer(req, res)
})

// DELETES an answer
router.delete('/:id/answers/:answerId', (req, res, next) => {
  console.log("DELETE answer");
  controller.deleteAnswer(req, res)
})

// GETS comments of a QUESTION
router.get('/:id/comments', (req, res, next) => {
  console.log("GETS comments of a QUESTION");
  controller.getCommentsByQuestionId(req, res)
})

// ADDS a comment to an ANSWER
router.get('/:id/answers/:answerId/comments', (req, res, next) => {
  console.log("GETS comments of an answer");
  controller.getCommentsByAnswerId(req, res)
})

// ADDS a comment to a QUESTION
router.post('/:id/comments', (req, res, next) => {
  console.log("ADD comment on a question");
  controller.addComment(req, res, 'question')
})

// ADDS a comment to an ANSWER
router.post('/:id/answers/:answerId/comments', (req, res, next) => {
  console.log("ADD comment on an answer");
  controller.addComment(req, res, 'answer')
})

// EDITS a comment to a question
router.put('/:id/comments/:commentId', (req, res, next) => {
  console.log("EDIT comment on a question");
  controller.editComment(req, res, 'question')
})

// EDITS a comment to an answer
router.put('/:id/answers/:answerId/comments/:commentId', (req, res, next) => {
  console.log("EDIT comment on an answer");
  controller.editComment(req, res, 'answer')
})

// DELETES a comment to a question
router.delete('/:id/comments/:commentId', (req, res, next) => {
  console.log("DELETE comment on a question");
  controller.deleteComment(req, res, 'question')
})

// DELETE a comment to an answer
router.delete('/:id/answers/:answerId/comments/:commentId', (req, res, next) => {
  console.log("DELETES comment on an answer");
  controller.deleteComment(req, res, 'answer')
})

// sets a brainliest answer
router.post('/:id/answers/:answerId/brainliest', (req,res,next) => {
  console.log("Sets a brainliest answer");
  controller.setBrainliest(req,res)
})

// adds thanks to an answer
router.post('/:id/answers/:answerId/thank', (req,res,next) => {
  console.log("Adds a thank to an answer");
  controller.addThank(req,res)
})


module.exports = router;
