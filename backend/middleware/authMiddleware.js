const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UnauthorizedError } = require('./errorHandler');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    // Detailed logging for debugging
    console.log('Authorization Header:', authHeader);
    console.log('Request Headers:', req.headers);

    if (!authHeader) {
      console.warn('No authorization header provided');
      throw new UnauthorizedError('No token provided');
    }

    // Extract token (assuming "Bearer TOKEN" format)
    const parts = authHeader.split(' ');
    
    // Validate token format
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.warn('Invalid authorization header format');
      throw new UnauthorizedError('Invalid token format');
    }

    const token = parts[1];

    if (!token) {
      console.warn('Empty token');
      throw new UnauthorizedError('Empty token');
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Additional token validation
      if (!decoded.userId) {
        console.warn('Invalid token payload');
        throw new UnauthorizedError('Invalid token payload');
      }
    } catch (error) {
      console.error('Token verification failed:', error.message);
      
      // Differentiate between different types of JWT errors
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid token');
      } else {
        throw new UnauthorizedError('Authentication failed');
      }
    }

    // Find user
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'ethereumAddress', 'lastLogin']
    });

    if (!user) {
      console.warn(`User not found for ID: ${decoded.userId}`);
      throw new UnauthorizedError('User not found');
    }

    // Optional: Check for user account status or additional conditions
    // For example, you might want to check if the user is active
    // if (!user.isActive) {
    //   throw new UnauthorizedError('User account is inactive');
    // }

    // Log authentication success (optional)
    console.log(`Authentication successful for user: ${user.id}`);

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    // Log the full error for server-side tracking
    console.error('Authentication Middleware Error:', error);

    // Pass to error handling middleware
    next(error);
  }
};

// Optional: Add a method to generate tokens
authMiddleware.generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      ethereumAddress: user.ethereumAddress 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRATION || '1h' 
    }
  );
};

module.exports = authMiddleware;