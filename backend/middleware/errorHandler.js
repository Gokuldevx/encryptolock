// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    // Default error status
    const statusCode = err.status || 
      (err.name === 'ValidationError' ? 400 :
      err.name === 'UnauthorizedError' ? 401 :
      err.name === 'ForbiddenError' ? 403 :
      err.name === 'NotFoundError' ? 404 :
      500);
  
    const errorResponse = {
      success: false,
      error: {
        message: err.message || 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && { 
          stack: err.stack,
          name: err.name,
          details: err 
        })
      }
    };
  
    // Log error (consider using a proper logging service)
    console.error({
      timestamp: new Date().toISOString(),
      error: err,
      path: req.path,
      method: req.method
    });
  
    // Send error response
    res.status(statusCode).json(errorResponse);
  };
  
  // Custom Error Classes
  class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ValidationError';
      this.status = 400;
    }
  }
  
  class UnauthorizedError extends Error {
    constructor(message) {
      super(message);
      this.name = 'UnauthorizedError';
      this.status = 401;
    }
  }
  
  class ForbiddenError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ForbiddenError';
      this.status = 403;
    }
  }
  
  class NotFoundError extends Error {
    constructor(message) {
      super(message);
      this.name = 'NotFoundError';
      this.status = 404;
    }
  }
  
  module.exports = {
    errorHandler,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError
  };