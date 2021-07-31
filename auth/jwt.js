const jwt = require('jsonwebtoken');

const jwtController = {
    issueJWT : (user) => {
        const payload = {user: user};
        const signedToken = jwt.sign(payload, 'secret');

        return  "Bearer " + signedToken;
    }
}

module.exports = jwtController