const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
  try {
    let token;

    console.log('AUTH MIDDLEWARE: Checking authentication for:', {
      method: req.method,
      url: req.url,
      hasAuthHeader: !!req.headers.authorization,
      authHeader: req.headers.authorization ? req.headers.authorization.substring(0, 20) + '...' : 'none'
    });

    // Check if token is sent in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('AUTH MIDDLEWARE: Token extracted:', {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
      });
    }

    if (!token) {
      console.log('AUTH MIDDLEWARE: No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    console.log('AUTH MIDDLEWARE: Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('AUTH MIDDLEWARE: Token decoded successfully:', {
      userId: decoded.id,
      exp: new Date(decoded.exp * 1000).toISOString()
    });

    // Check if user still exists
    console.log('AUTH MIDDLEWARE: Looking up user in database...');
    const user = await User.findById(decoded.id).select('+isActive');
    console.log('AUTH MIDDLEWARE: User lookup result:', {
      userFound: !!user,
      userId: user ? user._id : 'none',
      userActive: user ? user.isActive : 'n/a'
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Grant access to protected route
    req.user = user;
    console.log('AUTH MIDDLEWARE: Authentication successful, granting access');
    next();
  } catch (error) {
    console.log('AUTH MIDDLEWARE: Error during authentication:', {
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack ? error.stack.substring(0, 200) + '...' : 'none'
    });
    
    if (error.name === 'JsonWebTokenError') {
      console.log('AUTH MIDDLEWARE: Invalid token error');
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    } else if (error.name === 'TokenExpiredError') {
      console.log('AUTH MIDDLEWARE: Token expired error');
      return res.status(401).json({
        success: false,
        message: 'Token has expired.'
      });
    } else {
      console.log('AUTH MIDDLEWARE: General authentication error');
      return res.status(500).json({
        success: false,
        message: 'Authentication error.'
      });
    }
  }
};

// Restrict to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};

// Optional authentication - don't require token but decode if present
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('+isActive');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Check if user owns the restaurant
exports.checkRestaurantOwnership = async (req, res, next) => {
  try {
    const Restaurant = require('../models/Restaurant');
    const restaurant = await Restaurant.findById(req.params.restaurantId || req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found.'
      });
    }

    // Admin can access any restaurant, owner can only access their own
    if (req.user.role !== 'admin' && restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own restaurants.'
      });
    }

    req.restaurant = restaurant;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking restaurant ownership.'
    });
  }
};

// Generate JWT token
exports.signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Create and send token response
exports.createSendToken = (user, statusCode, res) => {
  const token = exports.signToken(user._id);
  
  console.log('AUTH MIDDLEWARE: createSendToken called:', {
    userId: user._id,
    hasToken: !!token,
    tokenType: typeof token,
    tokenLength: token ? token.length : 0,
    tokenPreview: token ? token.substring(0, 30) + '...' : 'none'
  });

  // Remove password from output
  user.password = undefined;

  const responseData = {
    success: true,
    token,
    data: {
      user
    }
  };
  
  console.log('AUTH MIDDLEWARE: Sending response:', {
    success: responseData.success,
    hasToken: !!responseData.token,
    hasUser: !!responseData.data.user,
    userEmail: responseData.data.user.email
  });

  res.status(statusCode).json(responseData);
};
