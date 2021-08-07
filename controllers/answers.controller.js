const { nanoid } = require('nanoid')

const usersRepository = require('../repositories/users.repository')
const questionsRepository = require('../repositories/questions.repository')
const answersRepository = require('../repositories/answers.repository')
const commentsRepository = require('../repositories/comments.repository')
const thanksRepository = require('../repositories/thanks.repository')

const send = require('./send')

const answerController = {
    getAnswersByQuestionId : (req,res) => {

        questionsRepository.getQuestionByQuestionId(req.params.id)
        .then(() => answersRepository.getAnswersByQuestionId(req.params.id, req.user.userId, Number(req.query.offset)))
        .then((answers) => {
            send.sendData(res,200,answers)
        })
        .catch((e) => send.sendError(res,e.code,e.message))
    },

    addAnswer: (req, res) => {
        if(!req.body.data.answer){
            send.sendError(res,400,'Updated answer is required.')
        }
        else{
            let answer = req.body.data
            let questionObj
            let userObj
    
            questionsRepository.getQuestionByQuestionId(req.params.id)
            .then((question) => {
                questionObj = question
                const isUserAnswered = questionObj.answers.includes(req.user.userId) || questionObj.askerId === req.user.userId
                
                return new Promise((fulfill,reject) => {
                    if(isUserAnswered){
                        reject({message: 'Either user owns the question or user already answered this question.', code: 409})
                    }
                    else{
                        fulfill()
                    }
                })
            })
            .then(() => usersRepository.getUserByUserId(req.user.userId))
            .then((user) => {
                userObj = user
                const updateCurrentPoints = usersRepository.updateCurrentPoints(userObj.userId, Number(userObj.currentPoints) + Number(questionObj.rewardPoints))
                const incrementAnswersCtr = usersRepository.incrementAnswersCtr(userObj.userId)
                const updateQuestionAnswers = questionsRepository.updateQuestionAnswers(req.params.id, userObj.userId)
                return Promise.all([updateCurrentPoints, incrementAnswersCtr, updateQuestionAnswers])
            })
            .then(() => {           
                answer = {
                    answerId: nanoid(30),
                    questionId : req.params.id,
                    question: questionObj.question,
                    subject: questionObj.subject,
                    userId : req.user.userId,
                    username : userObj.username,
                    profilePicture: userObj.profilePicture,
                    date: new Date().getTime(),
                    ...answer,
                }
                return answersRepository.addAnswer(answer)
            })
            .then(() => send.sendData(res,200,answer))
            .catch(e => send.sendError(res,e.code,e.message))
        }

    },

    // EDITS an answer (PUT /questions/:id/answers/:answerId?userId=x)
    editAnswer: (req,res) => {
        if(!req.body.data.newAnswer){
            send.sendError(res,400,"Incomplete fields.")
        }
        else{
            // get the data from query and params
            const userId = req.query.userId
            const answerId = req.params.answerId
            const questionId = req.params.id
            const newAnswer = req.body.data.newAnswer
            const lastEdited = new Date().getTime()

            const newAnswerObj = {
                answerId: answerId,
                newAnswer: newAnswer,
                lastEdited: lastEdited
            }
            
            let answerObj

            // GET THE ANSWER
            answersRepository.getAnswerByAnswerId(answerId, questionId)
            .then((answer) => {
                // CHECK if question has the specific answer
                return new Promise((fulfill, reject) => {
                    answerObj = answer
                    // CHECK if user has the authority to edit an answer
                    if(answerObj.questionId === questionId && answerObj.userId === userId){
                        fulfill()
                    }
                    else{
                        reject(new Error('Either question does not have this answer or user has no authority to edit.'))
                    }
                })
            })
            
            // EDIT answer given the answerId and the new answer
            .then(() => answersRepository.editAnswer(newAnswerObj))              
            
            // send response
            .then(updatedAnswer => send.sendData(res,200,updatedAnswer))
            .catch(e => send.sendError(res,404,e.message))
        }
    },

    // DELETES an answer (DELETE /questions/:id/answers/:answerId?userId=x)
    deleteAnswer : (req,res) => {
        // get the data from query and params
        const userId = req.query.userId
        const answerId = req.params.answerId
        const questionId = req.params.id
        
        let answerObj
        let userObj

        // GET THE ANSWER
        answersRepository.getAnswerByAnswerId(answerId, questionId)
        .then((answer) => {
            // CHECK if question has the specific answer
            return new Promise((fulfill, reject) => {
                answerObj = answer
                // CHECK if user has the authority to edit an answer
                console.log(answerObj);
                if(answerObj.questionId === questionId && answerObj.userId === userId){
                    fulfill()
                }
                else{
                    reject(new Error('Either question does not have this answer or user has no authority to edit.'))
                }
            })
        })
        
        // delete all comments of this answer
        .then(() => commentsRepository.deleteCommentsByAnswerId(answerId))

        // delete thanks
        .then(() => thanksRepository.deleteThanksByQuestionId(questionId))

        // EDIT answer given the answerId and the new answer
        .then(() => answersRepository.deleteAnswer(answerId))              
        
        // send response
        .then(deletedAnswer => send.sendData(res,200,deletedAnswer))
        .catch(e => send.sendError(res,404,e.message))
    },

    setBrainliest : (req, res) => {
        let questionObj
        let answerObj

        questionsRepository.getQuestionByQuestionId(req.params.id)
        .then((question) => {
            questionObj = question
            return answersRepository.getAnswerByAnswerId(req.params.answerId)
        })

        .then((answer) => {
            answerObj = answer

            return new Promise((fulfill, reject) => {
                let errorMessage

                if(answerObj.questionId !== questionObj.questionId){
                    console.log(answerObj.questionId);
                    console.log(questionObj.questionId);
                    errorMessage = 'Question does not own this answer.'
                }

                else if(questionObj.askerId === answerObj.userId){
                    errorMessage = 'Asker cannot set provide own answer or even set its own answer as brainliest.'
                }

                else if(questionObj.userBrainliest){
                    console.log(questionObj.userBrainliest);
                    errorMessage = 'Question has already its brainliest answer.'
                }

                else if(questionObj.askerId !== req.user.userId){
                    errorMessage = 'User does not own the question.'
                }

                if(errorMessage){
                    reject({message: errorMessage, code: 401})
                }
                else{
                    fulfill()
                }
            })
        })
        .then(() => {
            Promise.all([
                questionsRepository.updateHasBrainliest(req.params.id), 
                answersRepository.updateIsBrainliest(req.params.answerId),
                usersRepository.incrementBrainliestCtr(answerObj.userId)
            ])
            .then(() => send.sendData(res,200,"Question has just set its brainliest answer."))
            .catch((e) => send.sendError(res,e.code,e.message))
        })
        .catch((e) => send.sendError(res,e.code,e.message))
    },


    addThank: (req,res) => {

        let answerObj
        let thankObj

        answersRepository.getAnswerByAnswerId(req.params.answerId)
        .then((answer) => {
            answerObj = answer
            return new Promise((fulfill, reject) => {
                if(answerObj.questionId === req.params.id){
                    fulfill()
                }
                else{
                    reject({message: 'Question does not own the answer.', code:404})
                }
            })
        })
        .then(() => {
            return new Promise((fulfill, reject) => {
                if(answerObj.userId !== req.user.userId){
                    fulfill()
                }
                else{
                    reject({message: 'User cannot thank his own answer.', code:403})
                }
            })
        })
        .then(() => {
            return new Promise((fulfill, reject) => {
                thanksRepository.getThankByThankerIdAndAnswerUserId(req.user.userId, answerObj.answerId)
                .then(() => {
                    reject({message: "User already thanked this answer.", code:403})
                })
                .catch(() => fulfill())
            })
        })
        .then(() => {
            
            return Promise.all[
                usersRepository.incrementThanksCtr(answerObj.userId),
                answersRepository.incerementThanksCtr(answerObj.answerId)
            ]
        })
        .then(() => {
            thankObj = {
                thankId: nanoid(30),
                thankerId: req.user.userId,
                thankerUsername: req.user.username,
                thankerProfilePicture: req.user.profilePicture,
                questionId: req.params.id,
                answerId : answerObj.answerId,
                answerUserId : answerObj.userId
            }

            return thanksRepository.addThank(thankObj)
        })
        .then(() => send.sendData(res,200,thankObj))
        .catch((e) => send.sendError(res,e.code,e.message))
    }
}

module.exports = answerController