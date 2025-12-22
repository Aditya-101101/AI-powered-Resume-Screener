const express = require('express')
const router = express.Router();
const { jobController } = require('../controllers/jobController');
const { checkRecruiterAuth } = require('../middlewares/recruiterAuthentication');


router.get('/', jobController.allJobs)
router.patch('/:jobId', checkRecruiterAuth("token"), jobController.job)

module.exports = router