const Job = require('../model/job'); // Model for job postings
const User= require('../model/User'); // Separate model for candidates
require('dotenv').config();
const nodemailer = require('nodemailer');

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});

// Create a job
exports.createJob = async (req, res) => {
    const { title, description, company, location, salary } = req.body;

    if (!title || !description || !company || !location || !salary) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    try {
        // Save the job details to the database
        const newJob = await Job.create({
            title,
            description,
            company,
            location,
            salary,
        });

        console.log('Job posted successfully:', newJob);


        // Fetch the list of candidates who have applied previously
        const candidates = await User.find(); // Assuming Candidate model exists and stores candidate data

        if (candidates.length > 0) {
            // Send notification emails to all candidates
            const emailPromises = candidates.map(async (candidate) => {
                const mailOptions = {
                    from: process.env.EMAIL, // Sender address
                    to: candidate.email,    // Candidate's email address
                    subject: `New Job Posted: ${title}`,
                    text: `Dear ${candidate.name},\n\nWe have a new job opening that might interest you:\n\nJob Title: ${title}\nCompany: ${company}\nLocation: ${location}\nSalary: ${salary}\n\nVisit our portal to apply now!\n\nBest Regards,\nJob Search Portal`,
                };

                try {
                    await transporter.sendMail(mailOptions);
                    console.log(`Notification email sent to: ${candidate.email}`);
                } catch (error) {
                    console.error(`Error sending email to ${candidate.email}:`, error);
                }
            });

            await Promise.all(emailPromises);
        }

        res.status(200).json({
            message: 'Job posted successfully, and notification emails sent to candidates.',
            job: newJob,
        });
    } catch (error) {
        console.error('Error posting job:', error);
        res.status(500).json({ message: 'Failed to post job.' });
    }
};

// Get all jobs
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find();
        return res.json(jobs);
    } catch (error) {
        console.error('Error getting jobs:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
