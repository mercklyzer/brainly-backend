var express = require('express');
var router = express.Router();
const userController = require('../controllers/users.controller')

// verify user if registered
router.post('/', (req, res, next) => {
  userController.login(req, res)
})

module.exports = router;
