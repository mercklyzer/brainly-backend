const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : 'db_server',
      user : 'root',
      password : 'password',
      database : 'mydb'
    }
})

const repository = {
    // adds a user to the users object
    addUser: (newUser) => {
        return new Promise((fulfill, reject) => {
            knex.raw(
                'CALL add_user(?,?,?,?,?,?,?)', 
                [newUser.userId,newUser.username, newUser.password, newUser.email, newUser.profilePicture, newUser.birthday, newUser.level]
            )
            .then((returned) => fulfill(returned[0][0][0]))
            .catch(() => reject({message: 'Cannot add user.', code: 500}))
        })    
    },

    editUser : (userId, updatedUser) => {
        return new Promise((fulfill,reject) => {
            knex.raw(
                'CALL edit_user(?,?,?,?,?,?)', 
                [userId, updatedUser.newUsername, updatedUser.newEmail, updatedUser.newPassword, updatedUser.newLevel, updatedUser.newProfilePicture]
            )
            .then(() => fulfill())
            .catch(() => reject({message: "Error on editing the user.", code: 500}))
        })
    },

    getUsers: () => {
        return new Promise((fulfill,reject) => {
            knex.raw('CALL get_users()')
            .then((returned) => fulfill(returned[0][0]))
            .catch(() => reject({message: 'Error on getting user', code:500}))
        })
    },

    // GETS the user based on userId
    getUserByUserId: (userId) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_user_by_user_id(?)', [userId])
            .then((returned) => {
                if(returned[0][0].length > 0){
                    console.log(returned[0][0][0]);
                    fulfill(returned[0][0][0])
                }
                else{
                    reject({message: 'User does not exist.', code: 404})
                }
            })
            .catch(() => reject({message: 'Error getting the user', code: 500}))
        })
    },

    getUserByUsername : (username) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_user_by_username(?)', [username])
            .then((returned) => {
                if(returned[0][0].length > 0){
                    fulfill(returned[0][0][0])
                }
                else{
                    reject({message: 'User does not exist.', code:404})
                }
            })
            .catch(() => reject({message: 'Error getting the user', code: 500}))
        })
    },

    getUserByEmail : (email) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_user_by_email(?)', [email])
            .then((returned) => {
                if(returned[0][0].length > 0){
                    fulfill(returned[0][0][0])
                }
                else{
                    reject({message: 'User does not exist.', code:404})
                }
            })
            .catch(() => reject({message: 'Error getting the user', code: 500}))
        })
    },

    getUserByUsernameOrEmail : (usernameOrEmail) => {
        return new Promise((fulfill, reject) => {
            repository.getUserByUsername(usernameOrEmail)
            .then((user) => {
                fulfill(user)
            })
            .catch(() => {
                repository.getUserByEmail(usernameOrEmail)
                .then((user) => fulfill(user))
                .catch(() => reject({message: 'User does not exist.', code:404}))
            })
        })
    },

    updateCurrentPoints : (userId, points) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL update_user_current_points(?,?)', [userId, points])
            .then(() => fulfill())
            .catch(() => reject({message:'Error updating the user.', code: 500}))
        })
    }
}

module.exports = repository