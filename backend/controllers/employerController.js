const Employer = require('../model/User');
const Job = require('../model/job');
const jwt = require('jsonwebtoken');
// Helper function to generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role }, // Include role for authorization purposes
        process.env.JWT_SECRET,           // Use the secret from environment variables
        { expiresIn: '1h' }               // Token expiration time
    );
};

// Employer registration
exports.registerEmployer = async (req, res) => {
    const { name, email, password,role } = req.body;

    try {
        // Validate role
        if (role !== 'employer' && role !== 'candidate') {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Check if the user already exists
        const existingUser = await Employer.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create employer account
        const employer = await Employer.create({ name, email, password,role });

        // Generate JWT token
        const token = generateToken(employer);

        res.status(201).json({ 
            message: 'Employer registered successfully', 
            employer, 
            token 
        });
    } catch (error) {
        console.error('Error registering employer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Employer login
// Employer login
exports.loginEmployer = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find employer by email
        const employer = await Employer.findOne({ email });
        if (!employer) {
            return res.status(404).json({ message: 'Invalid email or password' });
        }

        // Verify password
        const isMatch = await employer.comparePassword(password); // Assuming `comparePassword` is implemented in the model
        if (!isMatch) {
            return res.status(404).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = generateToken(employer);

        // Include role in the response
        res.json({ 
            message: 'Login successful', 
            token, 
            role: employer.role // Include the user's role in the response
        });
    } catch (error) {
        console.error('Error logging in employer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a job (Employer only)
exports.createJob = async (req, res) => {
    const { title, company, location, description, salary } = req.body;

    try {
        // Retrieve employer ID from the authenticated user
        const employerId = req.user.id; // Assumes `authorizeEmployerMiddleware` attaches the user info

        const newJob = new Job({
            title,
            company,
            location,
            description,
            salary,
            postedBy: employerId // Associate job with the employer
        });

        await newJob.save();

        res.status(201).json(newJob);
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get jobs posted by the authenticated employer
exports.getEmployerJobs = async (req, res) => {
    try {
        const employerId = req.user.id; // Assumes `authorizeEmployerMiddleware` attaches the user info

        const jobs = await Job.find({ postedBy: employerId });

        res.json(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
