const knex = require('knex')({
    client: 'mysql',
    connection: {
        host : "brainly-database.cdjoyibl7f8k.ap-southeast-1.rds.amazonaws.com",
        user : "admin",
        password : "BRAINLY123password",
        database : "brainly",
        port: 3306
    }
});

module.exports = knex;
