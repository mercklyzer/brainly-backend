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
    getThreadByUserIds : (user1Id, user2Id) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_thread_by_user_ids(?,?)', [user1Id,user2Id])
            .then((returned) => {
                console.log(returned);
                if(returned[0][0].length > 0){
                    fulfill(returned[0][0][0])
                }
                else{
                    reject({message: 'Thread does not exist yet in mysql', code: 404})
                }
            })
            .catch((e) => reject({message: 'Error getting thread from mysql', code: 500}))
        })
    },

    addThread : (thread) => {

        return new Promise((fulfill, reject) => {
            knex.raw('CALL add_thread(?,?,?,?,?,?,?,?,?,?)', [
                thread.threadId,
                thread.user1Id, thread.user1Username, thread.user1ProfilePicture,
                thread.user2Id, thread.user2Username, thread.user2ProfilePicture,
                thread.lastSender,
                thread.lastMessage,
                thread.date
            ])
            .then(() => fulfill())
            .catch((e) => {
                console.log(e);
                reject({message: 'Error adding thread in mysql', code:  500})
            })
        })
    },

    getThreadsByUserId : (userId) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_threads_by_user_id(?)', [userId])
            .then((returned) => {
                fulfill(returned[0][0])
            })
            .catch((e) => {
                console.log(e);
                reject({message: 'Error getting threads from mysql', code: 500})
            })
        })
    },

    getMessagesByThread : (threadId) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_messages_by_thread_id(?)', [threadId])
            .then((returned) => {
                fulfill(returned[0][0])
            })
            .catch((e) => {
                console.log(e);
                reject({message: 'Error getting messages from mysql', code: 500})
            })
        })
    },

    updateThread : (threadId, message, date) => {
        console.log("update thread repo");
        return new Promise((fulfill, reject) => {
            knex.raw('CALL update_thread(?,?,?)', [threadId, message, date])
            .then(() => {
                fulfill()
            })
            .catch((e) => {
                console.log(e);
                reject({message: 'Error updating the thread from mysql', code: 500})
            })
        })
    },

    addMessage : (messageObj) => {
        console.log("start of repository");
        return new Promise((fulfill, reject) => {
            knex.raw('CALL add_message(?,?,?,?,?,?,?,?,?,?)', [
                messageObj.messageId,
                messageObj.threadId,
                messageObj.senderId,
                messageObj.senderUsername,
                messageObj.senderProfilePicture,
                messageObj.receiverId,
                messageObj.receiverUsername,
                messageObj.receiverProfilePicture,
                messageObj.message,
                messageObj.date
            ])
            .then(() => {
                fulfill()
            })
            .catch((e) => {
                console.log(e);
                reject({message: 'Error adding the message to mysql', code: 500})
            })
        })
    },

    getThreadByThreadId : (threadId) => {
        return new Promise((fulfill, reject) => {
            knex.raw('CALL get_thread_by_thread_id(?)', [threadId])
            .then((returned) => {
                console.log(returned);
                if(returned[0][0].length > 0){
                    fulfill(returned[0][0][0])
                }
                else{
                    reject({message: 'Thread does not exist yet in mysql', code: 404})
                }
            })
            .catch((e) => {
                console.log(e);
                reject({message: 'Error getting thread from mysql', code: 500})
            })
        })
    },
}

module.exports = repository