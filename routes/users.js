var express = require('express');
var router = express.Router();
const userController = require('../controllers/users.controller')

router.get('/:id', (req,res, next) => {
  userController.getUser(req, res)
})

router.put('/:id', (req,res, next) => {
  userController.editUser(req, res)
})

router.get('/:id/answers', (req,res, next) => {
  userController.getAnswersByUser(req, res)
})

router.get('/:id/questions', (req,res, next) => {
  userController.getQuestionsByUser(req,res)
})

router.get('/', (req,res, next) => {
  userController.getUsers(req,res)
})

module.exports = router;
