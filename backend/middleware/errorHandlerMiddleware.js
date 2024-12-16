const errorHandlerMiddleware = (err, req, res, next) => {
    // Default values for status and message
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    const message = err.message || 'Internal Server Error';

    // Log the error for debugging purposes
    console.error(`[ERROR] ${err.stack}`);

    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Hide stack trace in production
    });
};

module.exports = errorHandlerMiddleware;
