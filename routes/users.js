var express = require('express');
var router = express.Router();
const controller = require('../controllers/main.controller')

// VIEWS user
router.get('/:id', (req,res, next) => {
  controller.getUser(req, res)
})

// EDITS user information
router.put('/:id', (req,res, next) => {
  controller.editUser(req, res)
})

// DISPLATS ALL ANSWERS
router.get('/:id/answers', (req,res, next) => {
  controller.getAnswersByUser(req, res)
})

// DISPLAYS ALL QUESTIONS
router.get('/:id/questions', (req,res, next) => {
  controller.getQuestionsByUser(req,res)
})

// DISPLAYS ALL QUESTIONS
router.get('/', (req,res, next) => {
  controller.getUsers(req,res)
})

module.exports = router;
