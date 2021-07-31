const {nanoid} = require('nanoid')

const usersRepository = require('../repositories/users.repository')
const questionsRepository = require('../repositories/questions.repository')
const answersRepository = require('../repositories/answers.repository')
const commentsRepository = require('../repositories/comments.repository')

const send = require('./send')

const userController = {
    getCommentsByQuestionId : (req, res) => {
        const questionId = req.params.id

        // CHECK IF QUESTION EXISTS
        questionsRepository.getQuestionByQuestionId(questionId)
        .then(() => commentsRepository.getCommentsByQuestionId(questionId))
        .then((comments) => send.sendData(res,200,comments))
        .catch((e) => send.sendError(res,400,e.message))
    },

    getCommentsByAnswerId : (req, res) => {
        const questionId = req.params.id
        const answerId = req.params.answerId

        // CHECK IF QUESTION EXISTS
        questionsRepository.getQuestionByQuestionId(questionId)
        .then(() => commentsRepository.getCommentsByAnswerId(answerId))
        .then((comments) => send.sendData(res,200,comments))
        .catch((e) => send.sendError(res,400,e.message))
    },

    // ADDS a comment to either a question or an answer
    // (POST /questions/:id/comments) to add comment to a question
    // (POST /questions/:id/answers/:answerId/comments) to add comment to an answer
    // parent is a string that is either "question" or "answer"
    // it denotes if the comment is for a question/answer
    addComment : (req, res, parent) => {
        // get the data from query and params
        const userId        = req.user.userId
        const questionId    = req.params.id
        const answerId      = req.params.answerId
        const comment       = req.body.data
        
        // initialize comment
        comment.userId = userId
        
        // initialize date
        const dateNow = new Date().getTime()
        comment.date = dateNow

        // comment to a question
        if(parent === 'question'){
            comment.questionId = questionId
            comment.answerId = null
            comment.parent = 'question'
        }

        // comment to an answer
        else if(parent === 'answer'){
            comment.answerId = answerId
            comment.questionId = questionId
            comment.parent = 'answer'
        }

        // get the question to check if question exists
        questionsRepository.getQuestionByQuestionId(questionId)    
        .then(() => {
            // check if answer exists if parent === answer
            return new Promise((fulfill, reject) => {
                if(parent === 'answer'){
                    fulfill(answersRepository.getAnswerByAnswerId(answerId))
                }
                else{
                    fulfill()
                }
            })
        })         
        .then(() => usersRepository.getUserByUserId(userId))        // get username of userId
        .then((user) => {
            comment.username = user.username                        // save the username
            comment.commentId = nanoid(30)
            comment.profilePicture = user.profilePicture
            return commentsRepository.addComment(comment)           // add Comment
        })

        // send response
        .then((returnComment) => send.sendData(res,200,returnComment))
        .catch((e) => send.sendError(res,404,e.message))
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

module.exports = userController