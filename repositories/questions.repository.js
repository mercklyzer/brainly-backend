const knex = require('./knex')

let repository = {
    // GETS ALL QUESTIONS
    getAllQuestions: (offset) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_all_questions(?)', [offset])
            .then((returned) => {
                // returns an array of questions
                fulfill(returned[0][0])
            })
            .catch((e) => reject(e))
        })
    },

    // GET ALL QUESTIONS THAT MATCH THE SUBJECT
    getQuestionsBySubject: (subject, offset) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_questions_by_subject(?,?)', [subject, offset])
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
            console.log(question);
            knex.raw('CALL add_question(?,?,?,?,?,?,?,?)', [
                question.questionId,question.question,question.subject,question.rewardPoints,
                question.askerId,question.username, question.profilePicture,question.date
            ])
            .then(() => fulfill())
            .catch((e) => {
                console.log(e);
                reject({message:'Error adding the question in mysql', code:500})
            })
        })    
        
        // const questionObj = {
        //     ...question,
        //     hasBrainliest: 0,
        //     answers: ''
        // }

        // const questionRedis = new Promise((fulfill,reject) => {
        //     redis.hmset(`questions:${question.questionId}`, questionObj)
        //     .then((res) => {
        //         console.log(res);
        //         fulfill(res)
        //     })
        //     .catch(() => reject({message: 'Cannot add question in redis', code: 500}))
        // })

        // return Promise.all([questionMysql, questionRedis]).then((res) => console.log(res))
    },

    // GETS A SINGLE QUESTION BASED ON ID
    getQuestionByQuestionId : (questionId) => {
        console.log("inside repo");
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
            .catch((e) => {
                console.log(e);
                reject({message: "Error getting the question.", code: 500})
            })



            // redis.hgetall(`questions:${questionId}`)
            // .then((question) => {
            //     console.log(question);
            //     if(JSON.stringify(question) === '{}'){
            //         reject({message: "Question does not exist.", code: 404})
            //     }
            //     else{
            //         console.log(typeof question);
            //         fulfill(question)
            //     }
            // })
            // .then(() => reject({message: "Error getting the question.", code: 500}))
        })
    },

    // EDITS A SINGLE QUESTION BASED ON ID
    editQuestion: (question) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL edit_question(?,?,?)', [question.questionId,question.newQuestion,question.lastEdited])
            .then(() => fulfill())
            .catch(() => reject({message: 'Error editing the question.', code: 500}))
        })

        const updatedFields = {
            question: question.newQuestion,
            lastEdited: question.lastEdited
        }

        const questionRedis = new Promise((fulfill, reject) => {
            redis.hmset(`questions:${question.questionId}`,updatedFields)
            .then(() => fulfill())
            .catch(() => reject({message: 'Error editing the question.', code: 500}))
        })

        return Promise.all([questionMysql, questionRedis])
    },

    // DELETES a question
    deleteQuestion : (questionId) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL delete_question(?)', [questionId])
            .then(() => fulfill())
            .catch(() => reject({message: 'Error deleting the question in mysql.', code: 500}))
        })

        const questionRedis = new Promise((fulfill, reject) => {
            redis.del(`questions:${questionId}`)
            .then(() => fulfill())
            .catch(() => reject({message: 'Error deleting the question in redis.', code: 500}))
        })

        return Promise.all([questionMysql, questionRedis])
    },

    // GET all QUESTIONS of a specific user
    getQuestionsByUser : (userId, offset) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_questions_by_user_id(?,?)', [userId, offset])
            .then((returned) => fulfill(returned[0][0]))
            .catch(() => reject({message: 'Error getting the questions of the user.', code: 500}))
        })
    },

    // updates information about who has the brainliest answer
    updateHasBrainliest : (questionId) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL update_question_user_brainliest(?)', [questionId])
            .then(() => fulfill())
            .catch((e) => {
                console.log(e);
                reject({message: 'Error updating the question\'s brainliest in mysql.', code: 500})
            })
        })

        const brainliestRedis = new Promise((fulfill, reject) => {
            redis.hset(`questions:${questionId}`, 'hasBrainliest', 1)
            .then(() => fulfill())
            .catch(() =>  reject({message: 'Error updating the question\'s brainliest in redis.', code: 500}))
        })

        return Promise.all([brainliestMysql, brainliestRedis])
    },

    updateUserQuestions : (updatedUser) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL update_user_questions(?,?,?)', [updatedUser.userId, updatedUser.newUsername, updatedUser.newProfilePicture])
            .then(() => fulfill())
            .catch(() =>  reject({message: 'Error updating the questions of a user', code: 500}))
        })
    },

    updateQuestionAnswers : (questionId, userId) => {
        return new Promise((fulfill, reject) => {

            redis.hget(`questions:${questionId}`, 'answers')
            .then((answers) => {
                let updatedAnswers = answers+userId+','
                redis.hset(`questions:${questionId}`, 'answers', updatedAnswers)
                .then(() => fulfill())
                .catch((e) => {
                    console.log(e);
                    reject(e)
                })
            })
            .catch((e) => {
                console.log(e);
                reject(e)
            })


        })
    }

}

module.exports = repository