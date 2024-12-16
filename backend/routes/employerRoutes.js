const express = require('express');
const router = express.Router();
const {
    registerEmployer,
    loginEmployer,
    createJob,
    getEmployerJobs
} = require('../controllers/employerController');
const authorizeEmployer= require('../middleware/authorizeEmployerMiddleware');

// Employer registration and login
router.post('/register', registerEmployer);
router.post('/login', loginEmployer);

// Protected routes
router.post('/job', authorizeEmployer, createJob);
router.get('/jobs', getEmployerJobs);

module.exports = router;
