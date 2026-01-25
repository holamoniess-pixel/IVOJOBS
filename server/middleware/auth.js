const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
             return res.status(401).json({ message: 'Authentication failed: No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication failed: No token provided' });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_ivo');
        req.userData = { email: decodedToken.email, userId: decodedToken.userId };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
             return res.status(401).json({ message: 'Authentication failed: Token expired' });
        }
        return res.status(401).json({ message: 'Authentication failed: Invalid token' });
    }
};