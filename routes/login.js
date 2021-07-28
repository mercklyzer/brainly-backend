var express = require('express');
var router = express.Router();
const controller = require('../controllers/main.controller')

// verify user if registered
router.post('/', (req, res, next) => {
  controller.login(req, res)
})

module.exports = router;
