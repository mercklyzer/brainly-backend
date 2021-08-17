var express = require('express');


module.exports = (socket) => {
    const passport = require('passport');
    var router = express.Router();
    const threadController = require('../controllers/threads.controller')(socket)
    router.get('/', passport.authenticate('jwt', {session:false}),(req, res, next) => {
        threadController.getThreads(req, res)
    })

    router.post('/', passport.authenticate('jwt', {session:false}),(req, res, next) => {
        threadController.addThread(req, res)
    })

    router.get('/:threadId', passport.authenticate('jwt', {session:false}),(req, res, next) => {
        threadController.getThreadByThreadId(req, res)
    })

    router.get('/:threadId/messages', passport.authenticate('jwt', {session:false}),(req, res, next) => {
        threadController.getMessages(req, res)
    })

    router.post('/:threadId/messages', passport.authenticate('jwt', {session:false}),(req, res, next) => {
        threadController.addMessage(req, res)
    })

    return router
}