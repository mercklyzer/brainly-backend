var express = require('express');
var router = express.Router();
var path = require('path')
const imageController = require('../controllers/images.controller')

const multer = require('multer');
const send = require('../controllers/send');
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname,'../public/images'))
    },
    filename: (req, file, callback) => {
        console.log("filename");
        console.log(file.originalname);
        callback(null, file.originalname)
    }
})

const uploadImage = multer({storage: storage})

router.post('/', async (req, res, next) => {
    await uploadImage.single('file')
    console.log("files route");
    console.log(req.file);
    send.sendData(res,200,'uploaded')
    // imageController.upload(req, res)
})

module.exports = router;
