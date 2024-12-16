const loggerMiddleware = (req, res, next) => {
    const method = req.method; // HTTP method (e.g., GET, POST)
    const url = req.url; // Requested URL
    const time = new Date().toISOString(); // Timestamp of the request

    console.log(`[${time}] ${method} ${url}`);
    
    // Call next middleware in the chain
    next();
};

module.exports = loggerMiddleware;
