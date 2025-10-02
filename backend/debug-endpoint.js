// Add this to your server.js temporarily for debugging
// Test endpoint to check user operations without JWT

const express = require('express');
const User = require('./models/User');

const debugRouter = express.Router();

// Simple test endpoint
debugRouter.get('/test', async (req, res) => {
  try {
    console.log('DEBUG: Test endpoint called');
    
    // Test database connection
    const userCount = await User.countDocuments();
    console.log('DEBUG: Total users in database:', userCount);
    
    res.json({
      success: true,
      message: 'Debug endpoint working',
      userCount,
      env: {
        hasJwtSecret: !!process.env.JWT_SECRET,
        jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
        hasJwtExpire: !!process.env.JWT_EXPIRE,
        jwtExpire: process.env.JWT_EXPIRE,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('DEBUG: Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug endpoint error',
      error: error.message
    });
  }
});

// Test user creation without JWT
debugRouter.post('/test-user', async (req, res) => {
  try {
    console.log('DEBUG: Test user creation started');
    
    const testEmail = `debug-${Date.now()}@test.com`;
    
    // Try to create a simple user
    const user = new User({
      name: 'Debug User',
      email: testEmail,
      password: 'testpass123',
      phone: '1234567890'
    });
    
    console.log('DEBUG: User object created, attempting to save...');
    await user.save();
    console.log('DEBUG: User saved successfully');
    
    res.json({
      success: true,
      message: 'User created successfully',
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('DEBUG: User creation error:', error);
    res.status(500).json({
      success: false,
      message: 'User creation failed',
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = debugRouter;