const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : 'db_server',
      user : 'root',
      password : 'password',
      database : 'mydb'
    }
});

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
                    reject(new Error('Answer does not exist.'))
                }
            })
            .catch((e) => reject(e))
        })
    },

    getAnswersByQuestionId : (questionId) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_answers_by_question_id(?)', [questionId])
            .then((returned) => {
                fulfill(returned[0][0])
            })
            .catch((e) => reject(e))
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
    getAnswersByQuestionId : (questionId) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_answers_by_question_id(?)', [questionId])
            .then((returned) => {
                // returned contains[0][0] is a list of answers
                fulfill(returned[0][0])
            })
            .catch((e) => reject(e))
        })
    },

    // GET all answers of a specific user
    getAnswersByUser : (userId) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_answers_by_user_id(?)', [userId])
            .then((returned) => {
                fulfill(returned[0][0])
            })
            .catch((e) => reject(e))
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
        return knex.raw('CALL delete_answers_by_question_id(?)', [questionId])
    },

    updateIsBrainliest : (answerId) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL update_answer_brainliest(?)', [answerId])
            .then(() => {
                fulfill()
            })
            .catch((e) => reject(e))
        })
    },

    updateUserAnswers : (updatedUser) => {
        const userId = updatedUser.userId
        const username = updatedUser.newUsername
        const profilePicture = updatedUser.newProfilePicture

        return knex.raw('CALL update_user_answers(?,?,?)', [userId, username, profilePicture])
    }
}

module.exports = repository