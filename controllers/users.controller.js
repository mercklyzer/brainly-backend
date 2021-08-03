const { nanoid } = require('nanoid')
const usersRepository = require('../repositories/users.repository')
const questionsRepository = require('../repositories/questions.repository')
const answersRepository = require('../repositories/answers.repository')
const commentsRepository = require('../repositories/comments.repository')
const thanksRepository = require('../repositories/thanks.repository')
const jwt = require('../auth/jwt')
const bcrypt = require('bcryptjs');

const send = require('./send')

const userController = {

    getUser: (req, res) => {
        usersRepository.getUserByUserId(req.params.id)
        .then((user) => send.sendData(res,200,user))
        .catch((e) => send.sendError(res,e.code,e.message))
    },
    
    // used in signup
    addUser: (req, res) => {
        let reqBodyCheck = userController.addUserHasMissingField(req)

        if(reqBodyCheck.hasMissingField){
            send.sendError(res, 409, reqBodyCheck.errorMessage)
        }

        else{
            new Promise((fulfill, reject) => {
                usersRepository.getUserByEmail(req.body.data.email)
                .then(() => reject({message: 'Email already taken.', code: 409}))
                .catch(() => fulfill())
            })
            .then(() =>  {
                return new Promise((fulfill, reject) => {
                    usersRepository.getUserByUsername(req.body.data.username)
                    .then(() => reject({message: 'User already taken.', code: 409}))
                    .catch(() => fulfill())
                })
            })
            .then(() => {
                req.body.data = {
                    userId : nanoid(30),
                    ...req.body.data,
                    password: bcrypt.hashSync(req.body.data.password, bcrypt.genSaltSync(10))
                }
                return usersRepository.addUser(req.body.data)
            })
            .then((user) => {               
                const token = jwt.issueJWT(user)
                send.sendData(res,200, {user: user, token: token})
            })
            .catch((e) => {
                send.sendError(res,e.code,e.message)
            })
        }
    },

    addUserHasMissingField : (req) =>{
        let hasMissingField = false
        let errorMessage = ''

        if(!req.body.data.username){
            errorMessage = "Username is required."
            hasMissingField = true
        }
        else if (!req.body.data.email){
            errorMessage = "Email is required."
            hasMissingField = true
        }
        else if(!req.body.data.password){
            errorMessage = "Password is required."
            hasMissingField = true
        }
        else if(!req.body.data.birthday){
            errorMessage = "Birthday is required."
            hasMissingField = true
        }
        else if(!req.body.data.level){
            errorMessage = "Level is required."
            hasMissingField = true
        }

        return {hasMissingField, errorMessage}
    },

    editUser : (req,res) => {

        // change this soon --------------------------------------------------------------------------------------------------------
        if(!req.body.data.newUsername || !req.body.data.newEmail || !req.body.data.newPassword || !req.body.data.newLevel || !req.body.data.newProfilePicture){
            send.sendError(res,400,"Incomplete fields.")
        }

        const dataForTables = {
            userId : req.params.id,
            newUsername: req.body.data.newUsername,
            newProfilePicture: req.body.data.newProfilePicture
        }

        let userObj

        // check if user exists
        usersRepository.getUserByUserId(req.params.id)  //change this to req.user.userID since passport jwt
        .then((user) => {
            userObj = user

            return Promise.all([
                usersRepository.editUser(req.params.id, req.body.data),
                questionsRepository.updateUserQuestions(dataForTables),
                answersRepository.updateUserAnswers(dataForTables),
                commentsRepository.updateUserComments(dataForTables),
                thanksRepository.updateUserThanks(dataForTables)
            ]) 
        })
        .then(() => send.sendData(res,200,{
            ...userObj,
            username: req.body.data.newUsername,
            email: req.body.data.newEmail, 
            password:req.body.data.newPassword,
            level: req.body.data.newLevel,
            profilePicture: req.body.data.newProfilePicture,
        }))
        .catch((e) => send.sendError(res, 400, e.message))
    },

    getUsers: (req, res) => {
        usersRepository.getUsers()
        .then((users) => send.sendData(res,200,users))
        .catch((e) => send.sendError(res,e.code.e.message))
    },

    login: (req, res) => {
        
        // change this soon --------------------------------------------------------------------------------------------------------
        if(!req.body.data.usernameOrEmail || !req.body.data.password){
            send.sendError(res,400,"Incomplete fields.")
        }
        else{                      
            
            usersRepository.getUserByUsernameOrEmail(req.body.data.usernameOrEmail)
            .then((user) => {
                if(bcrypt.compareSync(req.body.data.password, user.password )){
                    const token = jwt.issueJWT(user)
                    send.sendData(res,200, {user: user, token: token})
                }
                else{
                    send.sendError(res,403,"Incorrect password.")
                }
            })
            .catch((e) => {
                send.sendError(res,e.code,e.message)
            })
        }
    },
        
    getAnswersByUser : (req, res) => {
        usersRepository.getUserByUserId(req.params.id)
        .then(() => answersRepository.getAnswersByUser(req.params.id))
        .then((answers) => send.sendData(res,200, answers))
        .catch((e) => send.sendError(res,e.code,e.message))
    },

    getQuestionsByUser : (req, res) => {

        usersRepository.getUserByUserId(req.params.id)
        .then(() => questionsRepository.getQuestionsByUser(req.params.id))
        .then((questions) => send.sendData(res,200, questions))
        .catch((e) => send.sendError(res,e.code,e.message))
    }
}

module.exports = userController
