const { nanoid } = require('nanoid')
const usersRepository = require('../repositories/users.repository')
const questionsRepository = require('../repositories/questions.repository')
const answersRepository = require('../repositories/answers.repository')
const commentsRepository = require('../repositories/comments.repository')
const thanksRepository = require('../repositories/thanks.repository')

const send = require('./send')

const questionController = {
    // DISPLAY all questions (GET /questions)
    displayAllQuestions: (req, res) => {
        // get all questions from the database
        questionsRepository.getAllQuestions()
        
        // send the response
        .then((questions) => send.sendData(res,200,questions))
        .catch((e) => send.sendError(res,400,e.message))
    },

    // ADD a single question (POST /questions)
    addQuestion: (req, res) => {

        // check for missing details
        if(!req.body.data.question || !req.body.data.subject || !req.body.data.rewardPoints){
            send.sendError(res,400,"Incomplete fields.")
        }
        else{

            const userId = req.user.userId
            // initialize the question
            req.body.data.askerId = userId
            req.body.data.questionId = nanoid(30)

            // GET THE USER
            usersRepository.getUserByUserId(userId)
            .then((user) => {
                // update username in question
                req.body.data.username = user.username
                req.body.data.profilePicture = user.profilePicture
                req.body.data.date = new Date().getTime()

                // CHECK IF THE USER STILL HAS POINTS
                if(user.currentPoints >= req.body.data.rewardPoints){
                    // DEDUCT rewardPoints from the user's currentPoints
                    return usersRepository.updateCurrentPoints(user.userId, user.currentPoints - req.body.data.rewardPoints)
                }
                else{
                    return Promise.reject(new Error('User doesn\'t have enough points.'))
                }
            })
            .then(() => {
                return questionsRepository.addQuestion(req.body.data)                // query INSERT to the database
            })
            // send the response
            // UPDATE THIS, send the entry inserted instead <------------------------------------------------------------------
            .then((question) => send.sendData(res,201,question))
            .catch((e) => send.sendError(res,404,e.message))
            }

        
    },

    // GETS a single question (GET /questions/:id)
    getQuestion : (req, res) => {
        console.log("start");
        const questionId = req.params.id
        const userId = req.user.userId
        console.log("before get question");
        let questionObj

        // get question by question Id
        questionsRepository.getQuestionByQuestionId(questionId)
        .then((question) => {
            questionObj = question 
            console.log(question);
            // check if user already has entry in answers table
            return answersRepository.getAnswerByQuestionIdAndUserId(questionId, userId)
        })
        .then((answers) => {
            if(answers.length > 0){
                questionObj.isUserAnswered = true
            }
            else{
                questionObj.isUserAnswered = false
            }
            send.sendData(res,200,questionObj)
        })
        .catch((e) =>{
            send.sendError(res,e.code,e.message)
        })
    },

    //EDITS a single question (PUT /questions/:id?userId=x)
    editQuestion : (req, res) => {
        if(!req.body.data.newQuestion){
            send.sendError(res,400,"Incomplete fields.")
        }
        else{
            // get the data from params and query
            const userId = req.query.userId
            const questionId = req.params.id
            const newQuestion = {
                questionId: questionId,
                newQuestion: req.body.data.newQuestion,
                lastEdited: new Date().getTime()
            }

            // check if the user is the same with the asker
            questionsRepository.getQuestionByQuestionId(questionId)
            .then(question => {
                return new Promise((fulfill, reject) => {
                    const askerId = question.askerId
                    if(userId === askerId){
                        // edit the question given the questionId and the new question
                        fulfill(questionsRepository.editQuestion(newQuestion))
                    }
                    else{
                        reject(new Error('User does not own the question.'))
                    }
                })
            })
            // send the response
            .then((updatedQuestion) => send.sendData(res,200,updatedQuestion))
            .catch((e) => send.sendError(res,404,e.message))
        }
    },

    // DELETES a question (DELETE /questions/:id?userId=x)
    deleteQuestion : (req,res) => {
        const questionId = req.params.id
        const userId = req.query.userId
        
        answersRepository.deleteAnswersByQuestionId(questionId)
        .then(() => thanksRepository.deleteThanksByQuestionId(questionId))
        .then(() => commentsRepository.deleteCommentsByQuestionId(questionId))
        .then(() => questionsRepository.getQuestionByQuestionId(questionId))
        .then(question => {
            return new Promise((fulfill, reject) => {
                const askerId = question.askerId
                if(userId === askerId){
                    // delete the question given the questionId
                    fulfill(questionsRepository.deleteQuestion(questionId))
                }
                else{
                    reject(new Error('User does not own the question.'))
                }
            })
        })
        // send back the deleted question
        .then((deletedQuestion) => send.sendData(res,200,deletedQuestion))
        .catch((e) => send.sendData(res,404,e.message))
    },

    //GETS all questions by subject (GET /subjects/:subject/questions)
    getQuestionsBySubject : (req,res) => {
        const subject = req.params.subject

        // get the questions with the same subject
        questionsRepository.getQuestionsBySubject(subject)
        // send back the questions to the client
        .then((questions) => send.sendData(res,200,questions))
        .catch((e) => send.sendData(res,404, e.message))
    },
}

module.exports = questionController