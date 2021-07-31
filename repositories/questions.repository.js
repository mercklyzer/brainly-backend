const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : 'db_server',
      user : 'root',
      password : 'password',
      database : 'mydb'
    }
});

// TO ACCESS RETURNED OF GET METHOD, USE [0][0][0]

let repository = {
    // GETS ALL QUESTIONS
    getAllQuestions: () => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_all_questions()')
            .then((returned) => {
                // returns an array of questions
                fulfill(returned[0][0])
            })
            .catch((e) => reject(e))
        })
    },

    // GET ALL QUESTIONS THAT MATCH THE SUBJECT
    getQuestionsBySubject: (subject) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_questions_by_subject(?)', [subject])
            .then((returned) => {
                // returns an array of questions
                fulfill(returned[0][0])
            })
            .catch(() => reject({message: 'Error getting the questions by subject', code: 500}))
        })
    
    },

    // ADDS A SINGLE QUESTION
    addQuestion: (question) => {
        return new Promise((fulfill, reject) => {
            const questionId = question.questionId
            const questionString = question.question
            const subject = question.subject
            const image = question.image
            const rewardPoints = question.rewardPoints
            const askerId = question.askerId
            const username = question.username
            const profilePicture = question.profilePicture
            const date = question.date

            knex.raw('CALL add_question(?,?,?,?,?,?,?,?,?)', [questionId,questionString,subject,image,rewardPoints,askerId,username, profilePicture,date])
            .then(() => fulfill())
            .catch(() => reject({message:'Error adding the question', code:500}))
        })
    },

    // GETS A SINGLE QUESTION BASED ON ID
    getQuestionByQuestionId : (questionId) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_question_by_question_id(?)', [questionId])
            .then((returned) => {
                if(returned[0][0].length > 0){
                    fulfill(returned[0][0][0])
                }
                else{
                    reject({message: "Question does not exist.", code: 404})
                }
            })
            .catch(() => reject({message: "Error getting the question.", code: 500}))
        })
    },

    // EDITS A SINGLE QUESTION BASED ON ID
    editQuestion: (question) => {
        const questionId = question.questionId
        const newQuestion = question.newQuestion
        const lastEdited = question.lastEdited
        return new Promise((fulfill, reject) => {
            knex.raw('CALL edit_question(?,?,?)', [questionId,newQuestion,lastEdited])
            .then(() => fulfill())
            .catch(() => reject({message: 'Error editing the question.', code: 500}))
        })
    },

    // DELETES a question
    deleteQuestion : (questionId) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL delete_question(?)', [questionId])
            .then(() => fulfill())
            .catch(() => reject({message: 'Error deleting the question.', code: 500}))
        })
    },

    // GET all QUESTIONS of a specific user
    getQuestionsByUser : (userId) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_questions_by_user_id(?)', [userId])
            .then((returned) => fulfill(returned[0][0]))
            .catch(() => reject({message: 'Error getting the questions of the user.', code: 500}))
        })
    },

    // updates information about who has the brainliest answer
    updateUserBrainliest : (questionId, userId) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL update_question_user_brainliest(?,?)', [questionId, userId])
            .then(() => fulfill())
            .catch(() => reject({message: 'Error updating the question\'s brainliest.', code: 500}))
        })
    },

    updateUserQuestions : (updatedUser) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL update_user_questions(?,?,?)', [updatedUser.userId, updatedUser.newUsername, updatedUser.newProfilePicture])
            .then(() => fulfill())
            .catch(() =>  reject({message: 'Error updating the questions of a user', code: 500}))
        })
    }

}

module.exports = repository