const { nanoid } = require('nanoid')
const usersRepository = require('../repositories/users.repository')
const questionsRepository = require('../repositories/questions.repository')
const answersRepository = require('../repositories/answers.repository')
const commentsRepository = require('../repositories/comments.repository')
const thanksRepository = require('../repositories/thanks.repository')

const send = require('./send')

const questionController = {
    displayAllQuestions: (req, res) => {
        questionsRepository.getAllQuestions()
        .then((questions) => send.sendData(res,200,questions))
        .catch((e) => send.sendError(res,400,e.message))
    },

    addQuestion: (req, res) => {

        // change this soon ----------------------------------------------------------------------------------------------
        if(!req.body.data.question || !req.body.data.subject || !req.body.data.rewardPoints){
            send.sendError(res,400,"Incomplete fields.")
        }
        else{

            req.body.data.askerId = req.user.userId
            req.body.data.questionId = nanoid(30)

            usersRepository.getUserByUserId(req.user.userId)
            .then((user) => {

                req.body.data.username = user.username
                req.body.data.profilePicture = user.profilePicture
                req.body.data.date = new Date().getTime()

                if(user.currentPoints >= req.body.data.rewardPoints){
                    return usersRepository.updateCurrentPoints(user.userId, user.currentPoints - req.body.data.rewardPoints)
                }
                else{
                    return Promise.reject({message:'User doesn\'t have enough points.',code:400})
                }
            })
            .then(() => questionsRepository.addQuestion(req.body.data))
            .then(() => send.sendData(res,201,req.body.data))
            .catch((e) => send.sendError(res,404,e.message))
            }

        
    },

    getQuestion : (req, res) => {

        let questionObj

        questionsRepository.getQuestionByQuestionId(req.params.id)
        .then((question) => {
            questionObj = question 

            return answersRepository.getAnswerByQuestionIdAndUserId(req.params.id, req.user.userId)
        })
        .then((answers) => {
            // check if user already has entry in answers table
            if(answers.length > 0){
                questionObj.isUserAnswered = true
            }
            else{
                questionObj.isUserAnswered = false
            }
            send.sendData(res,200,questionObj)
        })
        .catch((e) => send.sendError(res,e.code,e.message))
    },

    editQuestion : (req, res) => {
        // change this soon -------------------------------------------------------------------------------------
        if(!req.body.data.newQuestion){
            send.sendError(res,400,"Incomplete fields.")
        }
        else{
            const newQuestion = {
                questionId: req.params.id,
                newQuestion: req.body.data.newQuestion,
                lastEdited: new Date().getTime()
            }

            questionsRepository.getQuestionByQuestionId(req.params.id)
            .then(question => {
                // need to update question in answers table and comments table ########################## IMPORTANT
                return new Promise((fulfill, reject) => {
                    if(req.user.userId === question.askerId){
                        // update here <----------------------------
                        fulfill(questionsRepository.editQuestion(newQuestion))
                    }
                    else{
                        reject({message: 'User does not own the question.', code: 401})
                    }
                })
            })
            .then((updatedQuestion) => send.sendData(res,200,updatedQuestion))
            .catch((e) => send.sendError(res,e.code,e.message))
        }
    },

    deleteQuestion : (req,res) => {
        const questionId = req.params.id
        
        let questionObj
        
        questionsRepository.getQuestionByQuestionId(questionId)
        .then((question) => {
            questionObj = question

            if(questionObj.askerId === req.user.userId){
                console.log("check if owner");
                return Promise.all([
                    answersRepository.deleteAnswersByQuestionId(questionId),
                    thanksRepository.deleteThanksByQuestionId(questionId),
                    commentsRepository.deleteCommentsByQuestionId(questionId),
                    questionsRepository.deleteQuestion(questionId)
                ])
            }
            else{
                return Promise.reject({message: 'User does not own the question.', code: 404})
            }
        })
        .then(() => send.sendData(res,200,questionObj))
        .catch((e) => send.sendData(res,e.code,e.message))
    },

    getQuestionsBySubject : (req,res) => {
        questionsRepository.getQuestionsBySubject(req.params.subject)
        .then((questions) => send.sendData(res,200,questions))
        .catch((e) => send.sendData(res,e.code, e.message))
    },
}

module.exports = questionController