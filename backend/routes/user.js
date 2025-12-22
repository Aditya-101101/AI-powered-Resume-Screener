const express = require('express')
const router = express.Router();
const { userController } = require('../controllers/userController')
const { upload } = require('../middlewares/multerPdf')

router.post('/signup', userController.registerUser)
router.post('/login', userController.loginUser)
router.get('/logout', userController.logoutUser)
router.post('/application', upload.single("resume"), userController.uploadApplication)
router.get('/data', userController.userData)

module.exports = router