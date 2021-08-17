const multer = require('multer')
const send = require('./send')
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, '/public/images')
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname)
    }
})

const uploadImage = multer({storage: storage})

const imageController = {
    upload: (req,res) => {
        uploadImage.single('file')
        send.sendData(res, 200, 'Upload success')
    }
}

module.exports = imageController