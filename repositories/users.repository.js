const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : 'brainly_db',
      user : 'root',
      password : 'password',
      database : 'brainly_db'
    }
});

const Redis = require('ioredis')
var redis = new Redis({
    port: 6379,
    host: "brainly_redis",
    password: "Password123"
});

const repository = {
    // adds a user to the users object
    addUser: (newUser) => {
        const userMysql = new Promise((fulfill, reject) => {
            knex.raw(
                'CALL add_user(?,?,?,?,?,?)', 
                [newUser.userId,newUser.username, newUser.password, newUser.email, newUser.profilePicture, newUser.currentPoints]
            )
            .then(() => fulfill())
            .catch((e) => {
                console.log("error");
                console.log(e.message);
                reject({message: e.message, code: 500})
            })
        })    
        
        const userObj = {
            userId: newUser.userId,
            username: newUser.username,
            profilePicture: newUser.profilePicture,
            currentPoints: newUser.currentPoints,
            level: newUser.level,
            birthday: newUser.birthday,
            thanksCtr: newUser.thanksCtr,
            answersCtr: newUser.answersCtr,
            brainliestCtr: newUser.brainliestCtr
        }

        const userRedis = new Promise((fulfill,reject) => {
            redis.hmset(`users:${newUser.userId}`, userObj)
            .then((res) => {
                fulfill(res)
            })
            .catch(() => reject({message: 'Cannot add user in redis', code: 500}))
        })

        return Promise.all([userMysql, userRedis]).then((res) => console.log(res))
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
            redis.hgetall(`users:${userId}`)
            .then((res) => {
                if(JSON.stringify(res) === '{}'){
                    reject({message: 'User does not exist.', code: 404})
                }
                else{
                    fulfill(res)
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
        const userMysql = new Promise((fulfill,reject) => {
            knex.raw('CALL update_user_current_points(?,?)', [userId, points])
            .then(() => fulfill())
            .catch((e) => reject({message: 'Error updating user\'s current points in mysql.', code: 500}))
        })

        const updatedFields = {
            currentPoints: points
        }

        const userRedis =  new Promise((fulfill, reject) => {
            redis.hmset(`users:${userId}`, updatedFields)
            .then(() => fulfill())
            .catch((e) => {
                reject({message:'Error updating the user in redis.', code: 500})
            })
        })

        return Promise.all([userMysql, userRedis])
    },

    incrementAnswersCtr : (userId) => {
        return new Promise((fulfill, reject) => {
            redis.hincrby(`users:${userId}`, 'answersCtr', 1)
            .then(() => {
                fulfill()
            })
            .catch((e) => {
                reject({message: 'Error updating user\'s answersCtr in redis.', code: 500})
            })
        })
    },

    incrementBrainliestCtr : (userId) => {
        return new Promise((fulfill, reject) => {
            redis.hincrby(`users:${userId}`, 'brainliestCtr', 1)
            .then((res) => {
                fulfill()
            })
            .catch((e) => {
                reject({message: 'Error updating user\'s brainliestCtr in redis.', code: 500})
            })
        })
    },

    incrementThanksCtr : (userId) => {
        return new Promise((fulfill, reject) => {
            redis.hincrby(`users:${userId}`, 'thanksCtr', 1)
            .then((res) => {
                fulfill()
            })
            .catch((e) => {
                reject({message: 'Error updating user\'s thanksCtr in redis.', code: 500})
            })
        })
    }
}

module.exports = repository