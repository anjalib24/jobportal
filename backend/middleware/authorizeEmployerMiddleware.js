const jwt = require('jsonwebtoken');
const User = require('../model/User'); // Adjust path to your user model

const authorizeEmployerMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Check if the user's role is "employer"
        if (user.role !== 'employer') {
            return res.status(403).json({ message: 'Access denied. Employers only.' });
        }

        // Attach user info to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports =authorizeEmployerMiddleware;
