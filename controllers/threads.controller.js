const { nanoid } = require('nanoid')

const threadsRepository = require('../repositories/threads.repository')

const send = require('./send')

module.exports = (socket) => {
    return {
        addThread : (req, res) => {

            let user1 = req.user.userId < req.body.data.userId ? req.user : req.body.data
            let user2 = req.user.userId < req.body.data.userId ?  req.body.data : req.user 
            let threadObj

            new Promise((fulfill, reject) => {
                threadsRepository.getThreadByUserIds(user1.userId, user2.userId)
                .then((threadId) => {
                    send.sendData(res, 200, threadId)
                })
                .catch((e) => {
                    // if thread doesn't exist yet
                    if(e.code === 404){
                        console.log("thread doesn't exist yet");
                        fulfill()
                    }
                    else{
                        console.log("error");
                        reject(e)
                    }
                })
            })
            .then(() => {
                console.log("thread does not exist yet");
                threadObj = {
                    threadId: nanoid(30),
                    user1Id: user1.userId,
                    user1Username: user1.username,
                    user1ProfilePicture: user1.profilePicture,
                    user2Id: user2.userId,
                    user2Username: user2.username,
                    user2ProfilePicture: user2.profilePicture,
                    lastSender: '',
                    lastMessage: '',
                    date: new Date().getTime()
                }
                return threadsRepository.addThread(threadObj)
            })
            .then(() => send.sendData(res,200,{threadId :threadObj.threadId}))
            .catch((e) => {
                console.log("sending error", e);
                send.sendError(res,e.code,e.message)
            })
        },

        getThreads : (req,res) => {
            threadsRepository.getThreadsByUserId(req.user.userId)
            .then((threads) => send.sendData(res, 200, threads))
            .catch((e) => send.sendError(res,e.code,e.message))
        },

        getMessages : (req, res) => {
            threadsRepository.getMessagesByThread(req.params.threadId)
            .then((messages) => send.sendData(res, 200, messages))
            .catch((e) => send.sendError(res,e.code,e.message))
        },

        addMessage: (req, res) => {
            let messageObj = {
                messageId: nanoid(30),
                ...req.body.data,
                date: new Date().getTime()
            }

            let threadObj
            
            threadsRepository.updateThread(messageObj.threadId, messageObj.message, messageObj.date)
            .then((updatedThread) => {
                threadObj = updatedThread
                threadsRepository.addMessage(messageObj)
            })
            .then(() => send.sendData(res,200,messageObj))
            .then(() => {
                socket.broadcastNewMessage(messageObj)
                socket.broadcastUpdateThread(threadObj)
            })
            .catch((e) => {
                console.log(e);
                send.sendError(res, e.code, e.message)
            })
        },

        getThreadByThreadId : (req,res) => {
            threadsRepository.getThreadByThreadId(req.params.threadId)
            .then((thread) => send.sendData(res,200,thread))
            .catch((e) => send.sendError(res,e.code,e.message))
        }
    }
}

