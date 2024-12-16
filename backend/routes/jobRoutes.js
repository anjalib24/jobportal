const express = require('express');
const router = express.Router();
const { createJob, getAllJobs } = require('../controllers/jobController');
const authorizeEmployer = require('../middleware/authorizeEmployerMiddleware');
// POST: Create a job
router.post('/job', authorizeEmployer, createJob);

// GET: Get all jobs
router.get('/jobs', getAllJobs);

module.exports = router;
