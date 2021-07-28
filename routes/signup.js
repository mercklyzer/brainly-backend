var express = require('express');
var router = express.Router();
const controller = require('../controllers/main.controller')

/* default if not POST */
router.get('/', function(req, res, next) {
    // render signup form
  res.send('send a POST request to signup');
});

router.post('/', (req, res, next) => {
    controller.addUser(req,res)
})

module.exports = router;
