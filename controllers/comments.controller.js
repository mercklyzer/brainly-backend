const {nanoid} = require('nanoid')

const usersRepository = require('../repositories/users.repository')
const questionsRepository = require('../repositories/questions.repository')
const answersRepository = require('../repositories/answers.repository')
const commentsRepository = require('../repositories/comments.repository')

const send = require('./send')

module.exports = (socket) => {
    return {
        getCommentsByQuestionId : (req, res) => {
            console.log("getting comments");
            commentsRepository.getCommentsByQuestionId(req.params.id, Number(req.query.offset))
            .then((comments) => send.sendData(res,200,comments))
            .catch((e) => {
                console.log(e);
                send.sendError(res,400,e.message)
            })
        },

        getCommentsByAnswerId : (req, res) => {
            commentsRepository.getCommentsByAnswerId(req.params.answerId, Number(req.query.offset))
            .then((comments) => send.sendData(res,200,comments))
            .catch((e) => {
                console.log(e);
                send.sendError(res,400,e.message)
            })
        },

        // parent is a string that is either "question" or "answer"
        addComment : (req, res, parent) => {
            let comment = req.body.data
            comment.userId = req.user.userId
            
            const dateNow = new Date().getTime()
            comment.date = dateNow

            if(parent === 'question'){
                comment.questionId = req.params.id
                comment.answerId = null
                comment.parent = 'question'
            }

            else if(parent === 'answer'){
                comment.answerId = req.params.answerId
                comment.questionId = req.params.id
                comment.parent = 'answer'
            }

            // check if question (and answer) exists
            questionsRepository.getQuestionByQuestionId(req.params.id)    
            .then(() => {
                return new Promise((fulfill, reject) => {
                    if(parent === 'answer'){
                        fulfill(answersRepository.getAnswerByAnswerId(req.params.answerId))
                    }
                    else{
                        fulfill()
                    }
                })
            })

            .then(() => usersRepository.getUserByUserId(req.user.userId))
            .then((user) => {
                comment.username = user.username
                comment.commentId = nanoid(30)
                comment.profilePicture = user.profilePicture
                return commentsRepository.addComment(comment)
            })
            .then(() => {
                socket.broadcastNewComment(comment)
                send.sendData(res,200,comment)
            })
            .catch((e) => {
                console.log(e);
                send.sendError(res,e.code,e.message)
            })
        },

        // EDITS a comment 
        // (PUT /questions/:id/comments/:commentId?userId=x)
        // (PUT /questions/:id/answers/:answerId/comments/:commentId?userId=x)
        editComment: (req,res,parent) => {
            if(!req.body.data.newComment){
                send.sendError(res,400,"Incomplete fields.")
            }
            else{
                // get the data from query and params
                const userId        = req.query.userId
                const questionId    = req.params.id
                const answerId      = req.params.answerId
                const commentId     = req.params.commentId
                const newComment    = req.body.data.newComment
                
                let answerObj
                let questionObj
                let commentObj
                
                // get question
                questionsRepository.getQuestionByQuestionId(questionId)
                .then(question => {
                    questionObj = question
                    // get comment
                    return commentsRepository.getCommentByCommentId(commentId)
                })
                
                .then((comment) => {
                    commentObj = comment
                    //checking the validity of question -> answer -> comment or question -> comment
                    return new Promise((fulfill, reject) => {
                        if(commentObj.questionId === questionId){
                            if(commentObj.parent === 'answer'){
                                if(commentObj.answerId === answerId){
                                    fulfill()
                                }
                                else{
                                    reject(new Error('Comment is not a child of this answer.'))
                                }
                            }
                            else{
                                fulfill()
                            }
                        }
                        else{
                            reject(new Error('Comment does not belong to this question or answer.'))
                        }
                    })
                })
                .then(() => {
                    // check if user owns the comment
                    return new Promise((fulfill, reject) => {
                        if(commentObj.userId === userId){
                            fulfill()
                        }
                        else{
                            reject(new Error('User does not own the comment.'))
                        }
                    })
                })
                // edit the comment
                .then(() => {
                    const newCommentObj = {
                        commentId : commentId,
                        newComment : newComment,
                        lastEdited : new Date().getTime()
                    }
                    return commentsRepository.editComment(newCommentObj)
                })
                .then((updatedComment) => send.sendData(res,200,updatedComment))
                .catch((e) => send.sendError(res,404,e.message))
            }
        },
            
        // deletes a comment
        deleteComment : (req,res, parent) => {

            // get the data from query and params
            const userId        = req.query.userId
            const answerId      = req.params.answerId
            const questionId    = req.params.id
            const commentId     = req.params.commentId
            
            let answerObj
            let questionObj
            let commentObj
            
            // get question
            questionsRepository.getQuestionByQuestionId(questionId)
            .then(question => {
                questionObj = question
                // get comment
                return commentsRepository.getCommentByCommentId(commentId)
            })
            
            .then((comment) => {
                commentObj = comment
                //checking the validity of question -> answer -> comment or question -> comment
                return new Promise((fulfill, reject) => {
                    if(commentObj.questionId === questionId){
                        if(commentObj.parent === 'answer'){
                            if(commentObj.answerId === answerId){
                                fulfill()
                            }
                            else{
                                reject(new Error('Comment is not a child of this answer.'))
                            }
                        }
                        else{
                            fulfill()
                        }
                    }
                    else{
                        reject(new Error('Comment does not belong to this question or answer.'))
                    }
                })
            
            })
            .then(() => {
                // check if user owns the comment
                return new Promise((fulfill, reject) => {
                    if(commentObj.userId === userId){
                        fulfill()
                    }
                    else{
                        reject(new Error('User does not own the comment.'))
                    }
                })
            })
            // edit the comment
            .then(() => {
                return commentsRepository.deleteComment(commentId)
            })
            .then((deletedComment) => send.sendData(res,200,deletedComment))
            .catch((e) => send.sendError(res,404,e.message))
        },
    }
}

