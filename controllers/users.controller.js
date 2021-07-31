const { nanoid } = require('nanoid')
const usersRepository = require('../repositories/users.repository')
const questionsRepository = require('../repositories/questions.repository')
const answersRepository = require('../repositories/answers.repository')
const commentsRepository = require('../repositories/comments.repository')
const thanksRepository = require('../repositories/thanks.repository')
const jwt = require('../auth/jwt')

const send = require('./send')

const userController = {
    // gets a user from the database
    getUser: (req, res) => {
        const userId = req.params.id

        usersRepository.getUserByUserId(userId)
        .then((user) => send.sendData(res,200,user))
        .catch((e) => send.sendError(res,404,e.message))
    },
    
    // used in signup
    addUser: (req, res) => {
        // check if there is a missing field
        if(!req.body.data.username || !req.body.data.email || !req.body.data.password || !req.body.data.birthday || !req.body.data.level){
            send.sendError(res,400,"Incomplete fields.")
        }

        else{
            new Promise((fulfill, reject) => {
                // check if email is available
                usersRepository.getUserByEmail(req.body.data.email)
                // .then(() => reject(new Error('Email already taken.')))
                .then(() => reject({message: 'Email already taken.', code: 409}))
                .catch(() => fulfill())
            })                       
            .then(() =>  {
                return new Promise((fulfill, reject) => {
                    // check if username is available
                    usersRepository.getUserByUsername(req.body.data.username)
                    .then(() => reject({message: 'User already taken.', code: 409}))
                    .catch(() => fulfill())
                })
            })
            
            .then(() => {                                                               // initialize user entity and add user
                req.body.data = {
                    userId : nanoid(30),
                    ...req.body.data
                }
                return usersRepository.addUser(req.body.data)
            })
            // send response
            .then((user) => {               
                const token = jwt.issueJWT(user)
                send.sendData(res,200, {user: user, token: token})
            })
            .catch((e) => {
                send.sendError(res,e.code,e.message)
            })
        }
    },

    editUser : (req,res) => {
        const userId = req.params.id

        if(!req.body.data.newUsername || !req.body.data.newEmail || !req.body.data.newPassword || !req.body.data.newLevel || !req.body.data.newProfilePicture){
            send.sendError(res,400,"Incomplete fields.")
        }

        const newUsername = req.body.data.newUsername
        const newProfilePicture = req.body.data.newProfilePicture

        const dataForTables = {
            userId : userId,
            newUsername: newUsername,
            newProfilePicture: newProfilePicture
        }

        // update users table
        usersRepository.editUser(userId, req.body.data)
        // update questions table
        .then(() => questionsRepository.updateUserQuestions(dataForTables))
        // update answers table
        .then(() => answersRepository.updateUserAnswers(dataForTables))
        // update comments table
        .then(() => commentsRepository.updateUserComments(dataForTables))
        // update thanks table
        .then(() => thanksRepository.updateUserThanks(dataForTables))
        .then(() => send.sendData(res,200,{userId: userId, ...req.body.data}))
        .catch((e) => send.sendError(res, 400, e.message))
    },

    getUsers: (req, res) => {
        usersRepository.getUsers()
        .then((data) => {
            send.sendData(res,200,data[0][0])
        })
    },

    // CHECKS IF LOGIN CREDENTIALS MATCH (POST /login)
    login: (req, res) => {
        if(!req.body.data.usernameOrEmail || !req.body.data.password){
            send.sendError(res,400,"Incomplete fields.")
        }
        else{           
            const usernameOrEmail = req.body.data.usernameOrEmail
            const password = req.body.data.password
            
            // get the password given a username if username exists
            usersRepository.getUserByUsernameOrEmail(usernameOrEmail)
            .then((user) => {
                console.log(user);
                if(user.password === password){
                    const token = jwt.issueJWT(user)
                    send.sendData(res,200, {user: user, token: token})
                }
                else{
                    send.sendError(res,401,"Incorrect password.")
                }
            })
            .catch((e) => {
                console.log(e);
                send.sendError(res,e.code,e.message)
            })
        }
    },
        
    // GETS ALL ANSWERS BY A SPECIFIC USER (GET /users/:userId/answers)
    // for every answer, APPEND the questionId, questionString, and subject
    getAnswersByUser : (req, res) => {
        const userId = req.params.id
            
        // check if the user exists given a userId
        usersRepository.getUserByUserId(userId)
        // get all answers of the user given a userId
        .then(() => answersRepository.getAnswersByUser(userId))
        // send response
        .then((answers) => {
            send.sendData(res,200, answers)
        })
        .catch((e) => {
            send.sendError(res,404,e.message)
        })
    },

    // GET ALL QUESTIONS BY A SPECIFIC USER (GET /users/:userId/questions)
    getQuestionsByUser : (req, res) => {
        const userId = req.params.id

        // check if the user exists given a userId
        usersRepository.getUserByUserId(userId)
        // get all answers of the user given a userId
        .then(() => questionsRepository.getQuestionsByUser(userId))
        // send response
        .then((questions) => {
            send.sendData(res,200, questions)
        })
        .catch((e) => {
            send.sendError(res,404,e.message)
        })
    }
}

module.exports = userController
