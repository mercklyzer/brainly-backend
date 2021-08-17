var express = require('express');
var router = express.Router();

const userController = require('../controllers/users.controller')

router.post('/',  (req, res, next) => {
    userController.addUser(req,res)
})

module.exports = router;
