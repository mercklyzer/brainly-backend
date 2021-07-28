const userController = require('./users.controller.js')
const questionController = require('./questions.controller.js')
const answerController = require('./answers.controller.js')
const commentController = require('./comments.controller.js')

const controller = {
    /*          START OF USERS CONTROLLER            */
    getUser:            userController.getUser,                     // GETS a user (GET /users/:id)
    addUser :           userController.addUser,                     // ADDS A USER (POST /signup)
    editUser:           userController.editUser,
    login:              userController.login,                       // CHECKS IF LOGIN CREDENTIALS MATCH (POST /login)
    getAnswersByUser :  userController.getAnswersByUser,            // GETS ALL ANSWERS BY A SPECIFIC USER (GET /users/:userId/answers)
    getQuestionsByUser : userController.getQuestionsByUser,         // GET ALL QUESTIONS BY A SPECIFIC USER (GET /users/:userId/questions)
    getUsers:           userController.getUsers,

    /*          START OF QUESTIONS CONTROLLER       */
    displayAllQuestions:    questionController.displayAllQuestions, // DISPLAY all questions (GET /questions)   
    addQuestion:            questionController.addQuestion,         // ADD a single question (POST /questions)
    getQuestion :           questionController.getQuestion,         // GETS a single question (GET /questions/:id)
    editQuestion :          questionController.editQuestion,        //EDITS a single question (PUT /questions/:id?userId=x)
    deleteQuestion :        questionController.deleteQuestion,      // DELETES a question (DELETE /questions/:id?userId=x)
    getQuestionsBySubject : questionController.getQuestionsBySubject,   //GETS all questions by subject (GET /subjects/:subject/questions)

    /*          START OF ANSWERS CONTROLLER         */
    getAnswersByQuestionId: answerController.getAnswersByQuestionId, 
    addAnswer:      answerController.addAnswer,                     // ANSWERS a question/Adds an answer (POST /questions/:id/answers)
    editAnswer:     answerController.editAnswer,                    // EDITS an answer (PUT /questions/:id/answers/:answerId?userId=x)
    deleteAnswer :  answerController.deleteAnswer,                  // DELETES an answer (DELETE /questions/:id/answers/:answerId?userId=x)
    setBrainliest:  answerController.setBrainliest,                 // SETS a brainliest answer (POST /questions/:id/answers/:answerId/brainliest?userId=x)
    addThank:       answerController.addThank, 

    /*          START OF COMMENTS CONTROLLER        */
    getCommentsByQuestionId: commentController.getCommentsByQuestionId,
    getCommentsByAnswerId: commentController.getCommentsByAnswerId,
    addComment :    commentController.addComment,                   // ADDS a comment to either a question or an answer
    editComment:    commentController.editComment,                  // EDITS a comment 
    deleteComment : commentController.deleteComment,                // DELETES a comment
}

module.exports = controller
