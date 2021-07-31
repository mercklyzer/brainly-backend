const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const usersRepository = require('../repositories/users.repository')

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret'
}

module.exports = (passport) => {
    passport.use(new JwtStrategy(options, function(jwt_payload, done) {
        usersRepository.getUserByUserId(jwt_payload.user.userId)
        .then((user) => {
            return done(null, user);
                
        })
        .catch((err) => {
            console.log("err ", err);
            return done(err, false);
            // return done(null, false);
        })

    }));
}