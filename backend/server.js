const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Database
const sequelize = require('./config/database');

// Middleware
const { errorHandler } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const secretRoutes = require('./routes/secretRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
  credentials: true
}));

// Body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log('Request Method:', req.method);
  console.log('Request Path:', req.path);
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/secrets', secretRoutes);

// Basic Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models
    await sequelize.sync({ 
      alter: process.env.NODE_ENV === 'development' 
    });
    console.log('✅ Database models synchronized.');

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

// Run the server
startServer();

module.exports = app;