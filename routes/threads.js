var express = require('express');
const passport = require('passport');
var router = express.Router();
const threadController = require('../controllers/threads.controller')

router.get('/', passport.authenticate('jwt', {session:false}),(req, res, next) => {
    console.log("threads get");
    threadController.getThreads(req, res)
})

router.post('/', passport.authenticate('jwt', {session:false}),(req, res, next) => {
    console.log("threads route");
    threadController.addThread(req, res)
})

router.get('/:threadId', passport.authenticate('jwt', {session:false}),(req, res, next) => {
    console.log("getting a thread");
    threadController.getThreadByThreadId(req, res)
})

router.get('/:threadId/messages', passport.authenticate('jwt', {session:false}),(req, res, next) => {
    threadController.getMessages(req, res)
})

router.post('/:threadId/messages', passport.authenticate('jwt', {session:false}),(req, res, next) => {
    console.log("adding a message");
    threadController.addMessage(req, res)
})


module.exports = router;
