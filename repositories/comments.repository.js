const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : 'brainly_mysql',
      user : 'root',
      password : 'password',
      database : 'mydb'
    }
});


const repository = {
    getCommentByCommentId : (commentId) => {
        return new Promise((fulfill, reject) => {
        
            knex.raw('CALL get_comment_by_comment_id(?)', [commentId])
            .then((returned) => {
                if(returned[0][0].length > 0){
                    fulfill(returned[0][0][0])
                }
                else{
                    reject(new Error('Comment does not exist.'))
                }
            })
            .catch((e) => {
                console.log(e);
                reject(new Error('Cannot get comment.'))
            })
 
        })
    },

    // get_comments_by_question_id only returns parent = "question"
    getCommentsByQuestionId : (questionId, offset) => {
        return new Promise((fulfill, reject) => {
        
            knex.raw('CALL get_comments_by_question_id(?,?)', [questionId, offset])
            .then((returned) => {
                    // returns an array of comments
                    fulfill(returned[0][0])
            })
            .catch((e) => {
                console.log(e);
                reject(new Error('Cannot get comments.'))
            })
 
        })
    },

    // get_comments_by_answer_id only returns parent = "answer" (which is default since answerId = null when parent = "question")
    getCommentsByAnswerId : (answerId,offset) => {
        return new Promise((fulfill, reject) => {
            console.log("getting comments");
            knex.raw('CALL get_comments_by_answer_id(?,?)', [answerId,offset])
            .then((returned) => {
                    // returns an array of comments
                    fulfill(returned[0][0])
            })
            .catch((e) => {
                console.log(e);
                reject({message: 'Cannot get comments in mysql.',code:500})
            })
 
        })
    },

    addComment : (comment) => {
        const commentId = comment.commentId
        const commentString = comment.comment
        const userId = comment.userId
        const username = comment.username
        const profilePicture = comment.profilePicture
        const questionId = comment.questionId? comment.questionId : null
        const answerId = comment.answerId? comment.answerId : null
        const parent = comment.parent
        const date = comment.date

        return new Promise((fulfill, reject) => {
            knex.raw('CALL add_comment(?,?,?,?,?,?,?,?,?)', [commentId,commentString, userId, username, profilePicture, questionId, answerId, parent, date])
            .then(() => {
                fulfill()
            })
            .catch(() => {
                reject({message: 'Error adding the comment.', code: 500})
            })
        })    
    },

    // EDITS A COMMENT BASED ON COMMENTID
    editComment: (newCommentObj) => {
        const commentId = newCommentObj.commentId 
        const newComment = newCommentObj.newComment
        const lastEdited = newCommentObj.lastEdited
        return new Promise((fulfill, reject) => {
            knex.raw('CALL edit_comment(?,?,?)', [commentId,newComment,lastEdited])
            .then((returned) => {
                console.log(returned[0][0][0]);
                fulfill(returned[0][0][0])
            })
            .catch((e) => reject(e))
        })
    },

    // DELETES a comment
    deleteComment : (commentId) => {
        return new Promise((fulfill, reject) => {
            let commentObj
            // GET THE QUESTION FIRST TO BE RETURNED
            repository.getCommentByCommentId(commentId)
            .then((comment) => {
                commentObj = comment
                return knex.raw('CALL delete_comment_by_comment_id(?)', [commentId])
            })
            .then(() => fulfill(commentObj))
            .catch((e) => reject(e))
        })
    },

    deleteCommentsByAnswerId : (answerId) => {
        return knex.raw('CALL delete_comments_by_answer_id(?)', [answerId])
    },

    deleteCommentsByQuestionId : (questionId) => {
        return new Promise((fulfill,reject) => {
            knex.raw('CALL delete_comments_by_question_id(?)', [questionId])
            .then(() => fulfill())
            .catch(() => reject({message: 'Error deleting comments by question id', code: 500}))
        })
    },

    updateUserComments : (updatedUser) => {
        const userId = updatedUser.userId
        const username = updatedUser.newUsername
        const profilePicture = updatedUser.newProfilePicture

        return knex.raw('CALL update_user_comments(?,?,?)', [userId, username, profilePicture])
    }
    
}

module.exports = repository