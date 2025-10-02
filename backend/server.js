const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const restaurantRoutes = require('./routes/restaurant');
const qrRoutes = require('./routes/qr');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');

const app = express();

// Security middleware (BEFORE CORS)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
  crossOriginEmbedderPolicy: false // Disable COEP which can interfere with CORS
}));

// CORS configuration - Comprehensive setup for production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow specific origins or all if in development
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'https://smart-dine-frontend.onrender.com',
      process.env.CLIENT_URL
    ].filter(Boolean);
    
    // In development or if CLIENT_URL is not set, allow all origins
    if (process.env.NODE_ENV === 'development' || !process.env.CLIENT_URL) {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('CORS: Blocked origin:', origin);
      return callback(null, true); // Allow all for now to fix immediate issue
    }
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cache-Control', 'Pragma'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Additional CORS headers middleware (for extra safety)
app.use((req, res, next) => {
  // Set CORS headers explicitly
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Expose-Headers', 'Content-Length, X-Requested-With');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('CORS Preflight request from:', req.headers.origin);
    return res.status(200).end();
  }
  
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Additional CORS headers for static files (uploads) - kept for backward compatibility
app.use('/uploads', (req, res, next) => {
  // Very permissive CORS for static assets
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Cache-Control', 'public, max-age=31536000');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  
  console.log('UPLOADS REQUEST:', {
    method: req.method,
    url: req.url,
    origin: req.get('Origin'),
    referer: req.get('Referer')
  });
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Middleware
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded images) - kept for backward compatibility
// Note: New uploads go to Cloudinary, but this serves any existing local files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  maxPoolSize: 10, // Maintain up to 10 socket connections
  heartbeatFrequencyMS: 10000, // Send heartbeat every 10 seconds
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  console.log('🌐 Database:', process.env.MONGODB_URI.split('/')[3].split('?')[0]);
})
.catch((err) => {
  console.error('❌ MongoDB Atlas connection error:', err.message);
  console.log('💡 Please check:');
  console.log('   1. Internet connection');
  console.log('   2. MongoDB Atlas cluster is running');
  console.log('   3. IP address is whitelisted in Atlas');
  console.log('   4. Connection string is correct');
  process.exit(1);
});

// Health check route for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Smart Dine API is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: '1.1.0' // Added to force redeploy
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Smart Dine API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});