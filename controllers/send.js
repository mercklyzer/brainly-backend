const send = {
    sendData : (res, statusCode, data) => {
        res.status(statusCode).json({
            data: data
        })
    },

    sendError : (res, statusCode, errorMessage) => {
        res.status(statusCode? statusCode: 404).json({
            error: {
                message: errorMessage
            }
        })
    }
}

module.exports = send