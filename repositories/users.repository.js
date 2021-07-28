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
        const userId = newUser.userId
        const username = newUser.username
        const password = newUser.password
        const email = newUser.email
        const profilePicture = newUser.profilePicture
        const birthday = newUser.birthday
        const level = newUser.level

        return new Promise((fulfill, reject) => {
            knex.raw('CALL add_user(?,?,?,?,?,?,?)', [userId,username, password, email, profilePicture, birthday, level])
            .then((returned) => {
                console.log(returned);
                fulfill(returned[0][0][0])
            })
            .catch((e) => {
                console.log(e);
                reject(new Error('Cannot add user.'))
            })
        })    
    },

    editUser : (userId, updatedUser) => {
        const newUsername = updatedUser.newUsername
        const newEmail = updatedUser.newEmail
        const newPassword = updatedUser.newPassword
        const newLevel = updatedUser.newLevel
        const newProfilePicture = updatedUser.newProfilePicture

        return knex.raw('CALL edit_user(?,?,?,?,?,?)', [userId, newUsername, newEmail, newPassword, newLevel, newProfilePicture])
    },

    getUsers: () => {
        return knex.raw('CALL get_users()')
    },

    // GETS the user based on userId
    getUserByUserId: (userId) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_user_by_user_id(?)', [userId])
            .then((returned) => {
                if(returned[0][0].length > 0){
                    fulfill(returned[0][0][0])
                }
                else{
                    reject(new Error('User does not exist.'))
                }
            })
            .catch(e => reject(e))
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
                    reject(new Error('User does not exist.'))
                }
            })
            .catch(e => reject(e))
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
                    reject(new Error('User does not exist.'))
                }
            })
            .catch(e => reject(e))
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
                .catch(() => {
                    reject(new Error('User does not exist.'))
                })
            })
        })
    },

    updateCurrentPoints : (userId, points) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL update_user_current_points(?,?)', [userId, points])
            .then(() => fulfill())
            .catch((e) => reject(new Error('Error updating the user.')))
        })
    }
}

module.exports = repository