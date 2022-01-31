const knex = require('knex')({
    client: 'mysql',
    connection: {
        host : "localhost",
        user : "root",
        password : "password",
        database : "brainly",
        port: 3306
    }
});

module.exports = knex;