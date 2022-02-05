 
module.exports = () => {
    let io

    return {
        initialize: (server) => {
            io = require('socket.io')(server)

            let questions = {}

            io.on('connection', socket => {
                
            console.log('user connected');
            
            //  id can be subject, userId, questionId, answerId
            socket.on('join user', (id) => {
                console.log(`joining ${id}`);
                socket.join(id)
            })
            
            // socket.on('send message', messageObj => {
            //     io.to(messageObj.receiverId).to(messageObj.senderId).emit('receive message', messageObj)
            // })
            
            socket.on('message typing', (messageObj, boolVal) => {
                console.log("message typing: " + boolVal + " " + messageObj.receiverId);
                io.to(messageObj.receiverId).emit('message typing', {threadId: messageObj.threadId, isTyping:boolVal})
            })
            
            // socket.on('update thread', threadObj => {
            //     io.to(threadObj.user1Id).to(threadObj.user2Id).emit('receive thread', threadObj)
            // })
            
            
            socket.on('join question', (questionId) => {
                socket.join(questionId)
            
            if(!questions.hasOwnProperty(questionId)){
                questions[questionId] = {
                questionId: questionId,
                watchers: []
                }
            }
            
            console.log("sending watchers");
            console.log(questionId);
            // io.emit('receive watcher',  questions[questionId])
            io.to(questionId).emit('receive watcher',  questions[questionId])
            })
            
            socket.on('watch question', (questionObj, userObj) => {
            if(!questions[questionObj.questionId]){
                questions[questionObj.questionId] = {
                questionId: questionObj.questionId,
                watchers: [userObj]
                }
                console.log("not yet exist");
            }
            else{
                questions[questionObj.questionId].watchers = [...questions[questionObj.questionId].watchers, userObj] 
                console.log("append");
            }
                
                console.log("watching question");
                console.log(questions[questionObj.questionId]);
                io.to(questionObj.questionId).emit('receive watcher', questions[questionObj.questionId])
            })
            
            socket.on('leave question', (questionId,user) => {
                console.log("leaving question");
                let index = questions[questionId]? questions[questionId].watchers.map(watcher => watcher.userId).indexOf(user.userId) : -1
                
                if(index !== -1){
                    console.log("question exists")
                    questions[questionId].watchers.splice(index, 1)
                    
                    // socket.leave(questionId)
                    io.to(questionId).emit('receive watcher', questions[questionId])
                    console.log("sent");
                }
                console.log(questions[questionId]);
            })
            
            socket.on('join question-answer', (questionId) => {
                socket.join(questionId)
            })
            
            socket.on('typing answer', (questionId, boolVal) => {
                io.to(questionId).emit('update typing answer', boolVal)
            })
                        
            socket.on('join subject', (subject) => {
                socket.join(subject)
            })

            socket.on('leave subject', (subject) => {
                socket.leave(subject)
            })

            socket.on('typing comment', (questionId, answerId, boolVal) => {
                io.to(questionId).emit('update typing comment', {questionId, answerId, isTyping: boolVal})
            })

            
        })},
        broadcastNewQuestion: (question) => {
            console.log("broadcasting question");
            io.to(question.subject).to('all').emit('new question', question)
        },
        broadcastNewAnswer: (answer) => {
            console.log("broadcasting answer");
            io.to(answer.questionId).emit('new answer', answer)
        },
        broadcastUpdateThread: (threadObj) => {
            console.log("update thread");
            io.to(threadObj.user1Id).to(threadObj.user2Id).emit('receive thread', threadObj)
        },
        broadcastNewMessage: (messageObj) => {
            io.to(messageObj.receiverId).to(messageObj.senderId).emit('receive message', messageObj)
        },
        broadcastNewComment: (commentObj) => {
            io.to(commentObj.questionId).emit('new comment', commentObj)
        } 
        // socket.broadcastNewMessage(messageObj)
    }
}

