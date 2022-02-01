const knex = require('knex')({
    client: 'mysql',
    connection: {
        host : "database-1.c1ia2fko8aat.ap-southeast-1.rds.amazonaws.com",
        user : "root",
        password : "password",
        database : "brainly",
        port: 3306
    }
});
// const knex = require('knex')({
//     client: 'mysql',
//     connection: {
//         host : "localhost",
//         user : "root",
//         password : "password",
//         database : "brainly",
//         port: 3306
//     }
// });

module.exports = knex;