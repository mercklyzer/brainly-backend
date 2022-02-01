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
        try{
            uploadImage.single('file')
            console.log("success");
            send.sendData(res, 200, 'Upload success')
        }
        catch(e){
            console.log(e);
            send.sendError(res, 400, e)
        }
    }
}

module.exports = imageController