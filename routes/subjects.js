var express = require('express');
var router = express.Router();
const questionsController = require('../controllers/questions.controller')()

router.get('/:subject/questions', (req,res,next) => {
  questionsController.getQuestionsBySubject(req,res)
})

module.exports = router;
