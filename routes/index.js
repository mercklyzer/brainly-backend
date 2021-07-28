var express = require('express');
var router = express.Router();
const controller = require('../controllers/main.controller')

// assuming that user is logged in, display all questions
// router.get('/', (req, res, next) => {
//   controller.displayAllQuestions(req, res)
// })

module.exports = router;
