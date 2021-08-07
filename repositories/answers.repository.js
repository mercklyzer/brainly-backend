const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : 'db_server',
      user : 'root',
      password : 'password',
      database : 'mydb'
    }
});

const Redis = require('ioredis')
const redis = new Redis({host: 'redis'})


const repository = {
    // gets an answer by answerId
    getAnswerByAnswerId : (answerId) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_answer_by_answer_id(?)', [answerId])
            .then((returned) => {
                if(returned[0][0].length > 0){
                    fulfill(returned[0][0][0])
                }
                else{
                    reject({message: 'Answer does not exist.',code: 404})
                }
            })
            .catch((e) => reject({message: 'Cannot get the answer by answerId.',code: 500}))
        })
    },

    // ADDS an answer
    addAnswer: (answer) => {
        return new Promise((fulfill, reject) => {
            const answerId = answer.answerId
            const answerString = answer.answer
            const questionId = answer.questionId
            const questionString = answer.question
            const subject = answer.subject
            const userId = answer.userId
            const username = answer.username
            const profilePicture = answer.profilePicture
            const date = answer.date

            knex.raw('CALL add_answer(?,?,?,?,?,?,?,?,?)', [answerId,answerString,questionId,questionString,subject,userId,username,profilePicture,date])
            .then(() => fulfill())
            .catch((e) => reject(e))
        })
    },

    // GET answers of a specific question
    getAllAnswers: (questionId) => {
        return new Promise((fulfill, reject) => {
            try{
                let retrievedAnswers =[]
                
                // push all questions that match the questionId
                for(let i = 0; i < answers.length; i++){
                    console.log(answers[i].questionId);
                    if(answers[i].questionId === questionId){
                        retrievedAnswers.push(answers[i])
                    }
                }
                fulfill(retrievedAnswers)
                console.log(retrievedAnswers);
            }
            catch{
                reject(new Error("Error loading the answers for this question."))
            }
        })
    },

    getAnswerByQuestionIdAndUserId : (questionId, userId) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_answer_by_question_id_and_user_id(?,?)', [questionId, userId])
            .then((returned) => {
                // returned contains[0][0] is a list of answers
                fulfill(returned[0][0])
            })
            .catch((e) => reject(e))
        })
    },

    // GET all answers of a specific questionId
    getAnswersByQuestionId : (questionId, userId, offset) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_answers_by_question_id(?,?,?)', [questionId, userId, offset])
            .then((returned) => {
                console.log(returned);
                // returned contains[0][0] is a list of answers
                fulfill(returned[0][0])
            })
            .catch((e) => {
                console.log(e);
                reject({message: 'Error getting the answers for this question.', code: 500})
            })
        })
    },

    // GET all answers of a specific user
    getAnswersByUser : (userId, offset) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_answers_by_user_id(?,?)', [userId, offset])
            .then((returned) => {
                fulfill(returned[0][0])
            })
            .catch((e) => reject({message: 'Error getting answers of a user', code: 500}))
        })
    },

    // EDITS AN ANSWER BASED ON ANSWERID
    editAnswer: (newAnswerObj) => {
        const answerId = newAnswerObj.answerId
        const newAnswer = newAnswerObj.newAnswer
        const lastEdited = newAnswerObj.lastEdited

        return new Promise((fulfill, reject) => {
            knex.raw('CALL edit_answer(?,?,?)', [answerId,newAnswer,lastEdited])
            .then((returned) => {
                fulfill(returned[0][0][0])
            })
            .catch((e) => reject(e))
        })
    },

    // DELETES an answer
    deleteAnswer : (answerId) => {
        return new Promise((fulfill, reject) => {
            let answerObj
            // GET THE QUESTION FIRST TO BE RETURNED
            repository.getAnswerByAnswerId(answerId)
            .then((answer) => {
                answerObj = answer
                return knex.raw('CALL delete_answer(?)', [answerId])
            })
            .then(() => fulfill(answerObj))
            .catch((e) => reject(e))
        })
    },
    
    deleteAnswersByQuestionId : (questionId) => {
        return new Promise((fulfill,reject) => {
            knex.raw('CALL delete_answers_by_question_id(?)', [questionId])
            .then(() => fulfill())
            .catch(() => reject({message: 'Error deleting answers by question id', code: 500}))
        })
    },

    updateIsBrainliest : (answerId) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL update_answer_brainliest(?)', [answerId])
            .then(() => {
                fulfill()
            })
            .catch((e) => reject({message: 'Cannot update the answer to be brainliest.', code: 500}))
        })
    },

    updateUserAnswers : (updatedUser) => {
        const userId = updatedUser.userId
        const username = updatedUser.newUsername
        const profilePicture = updatedUser.newProfilePicture

        return knex.raw('CALL update_user_answers(?,?,?)', [userId, username, profilePicture])
    },

    updateAnswersQuestion : (questionId, question) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL update_answers_question(?,?)', [questionId, question])
            .then(() => fulfill())
            .catch(() => reject({message: 'Error updating the question in answers table', code: 500}))
        })
    },

    incerementThanksCtr : (answerId) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL increment_answer_thanksCtr(?)', [answerId])
            .then(() => fulfill())
            .catch(() => reject({message: 'Error updating answer\'s thanksCtr in mysql', code: 500}))
        })
    }
}

module.exports = repository