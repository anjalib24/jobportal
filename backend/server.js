const express=require('express');
const app=express();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const connectDB=require('./database/db');
const Userdb=require('./model/job');
const cors = require('cors');
const jobRoutes=require('./routes/jobRoutes')
const employerRoutes = require('./routes/employerRoutes');
const logger = require('./middleware/loggerMiddleware');
const errorHandler = require('./middleware/errorHandlerMiddleware');
const multer = require('multer');

const PORT=3001;
connectDB();
app.use(cors());

app.use(express.json());
app.use(logger);
app.use(errorHandler);
require('dotenv').config();
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Email Configuration (Nodemailer)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use any email provider (e.g., Outlook, SMTP)
    auth: {
        user: process.env.EMAIL,      // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
    },
});

// Test Email Transporter
transporter.verify((error, success) => {
    if (error) {
        console.error('Error configuring email transporter:', error);
    } else {
        console.log('Email transporter configured successfully');
    }
});
const storage = multer.diskStorage({
    destination: (req, file, cb) => 
    {
        cb(null,'uploads/'); // Directory to store resumes
    },
    filename: (req, file, cb) => 
    {
        cb(null, Date.now() + '-' + file.originalname); // Unique file name
    },
});
const upload = multer({ storage });

app.delete('/api/jobs/:jobId', async (req, res) => {
    const { jobId } = req.params;

    try {
        const deletedJob = await Job.findByIdAndDelete(jobId); // Using Mongoose for MongoDB
        if (!deletedJob) {
            return res.status(404).json({ message: 'Job not found.' });
        }
        res.status(200).json({ message: 'Job deleted successfully.' });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ message: 'Failed to delete job.' });
    }
});


app.post('/api/candidate/apply/:jobId', upload.single('resume'), async (req, res) => {
    const { jobId } = req.params;
    const { name, email, mobile, location } = req.body;
    const resume = req.file;

    if (!resume) {
        return res.status(400).json({ message: 'Resume is required!' });
    }

    // Validate other fields if needed
    if (!mobile || !location) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    // Save application details to the database (logic omitted for brevity)

    // Email Options
    const mailOptions = {
        from: process.env.EMAIL, // Sender email address
        to: email,              // Candidate's email address
        subject: `Application Received for Job ID: ${jobId}`,
        text: `Dear ${name},\n\nThank you for applying for the job with ID: ${jobId}.\n\nYour application has been received successfully.\n\nBest regards,\nJob Search Portal`,
    };

    try {
        // Send Email
        await transporter.sendMail(mailOptions);
        console.log(`Application confirmation email sent successfully to: ${email}`);

        // Respond with success message
        res.status(200).json({
            message: 'Application submitted successfully! Confirmation email sent.',
            application: { jobId, name, email, mobile, location, resumePath: resume.path },
        });
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        res.status(500).json({
            message: 'Application submitted, but failed to send confirmation email.',
            application: { jobId, name, email, mobile, location, resumePath: resume.path },
        });
    }
});

app.get("/",(req,res)=>{
    res.send("<h1>Home page of a job portal</h1>");
});
app.listen(PORT,()=>{
    console.log(`app is running on http://localhost:${PORT}`);
})
app.use('/api', jobRoutes);
app.use('/api/employers', employerRoutes);
