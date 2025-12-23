const express = require('express')
const router = express.Router();
const { jobController } = require('../controllers/jobController');
const { checkRecruiterAuth } = require('../middlewares/recruiterAuthentication');


router.get('/', jobController.allJobs)
router.get('/applications', checkRecruiterAuth("token"), jobController.job)

module.exports = router