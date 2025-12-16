const express = require('express')
const router = express.Router();
const { recruiterController } = require('../controllers/recruiterController')


router.post('/signup', recruiterController.registerRecruiter)
router.post('/login', recruiterController.loginRecruiter)
router.get('/logout', recruiterController.logoutRecruiter)
router.post('/createJob', recruiterController.createJob)
router.patch('/update', recruiterController.updateJob)
router.patch('/update-applicationStatus', recruiterController.updateApplication)
router.get('/data', recruiterController.recruiterData)

module.exports = router