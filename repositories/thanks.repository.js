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
    getThankByThankerIdAndAnswerUserId: (thankerId, answerId) => {
        console.log("call");
        return new Promise((fulfill ,reject) => {
            knex.raw('CALL get_thank_by_thanker_id_and_answer_user_id(?,?)', [thankerId, answerId])
            .then((returned) => {
                if(returned[0][0].length > 0){
                    fulfill(returned[0][0][0])
                }
                else{
                    console.log("none");
                    reject(new Error('Thank does not exist.'))
                }
            })
            .catch((e) => {
                reject(e)
            })
        })
    },

    addThank : (thankObj) => {
        const thankId = thankObj.thankId
        const thankerId = thankObj.thankerId
        const thankerUsername = thankObj.thankerUsername
        const thankerProfilePicture = thankObj.thankerProfilePicture
        const questionId = thankObj.questionId
        const answerId = thankObj.answerId
        const answerUserId = thankObj.answerUserId

        return knex.raw('CALL add_thank(?,?,?,?,?,?,?)', [thankId, thankerId, thankerUsername, thankerProfilePicture, questionId, answerId, answerUserId])
    },

    deleteThanksByQuestionId : (questionId) => {
        return knex.raw('CALL delete_thanks_by_question_id(?)', [questionId])
    },

    updateUserThanks : (updatedUser) => {
        const userId = updatedUser.userId
        const username = updatedUser.newUsername
        const profilePicture = updatedUser.newProfilePicture

        return knex.raw('CALL update_user_thanks(?,?,?)', [userId, username, profilePicture])
    }
}

module.exports = repository