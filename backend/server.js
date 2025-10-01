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

const app = express();

// CORS configuration - Very permissive for development (BEFORE helmet)
app.use((req, res, next) => {
  // Allow all origins
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Expose-Headers', 'Content-Length, X-Requested-With');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Backup CORS with cors library
app.use(cors({
  origin: true,
  credentials: false, // Set to false when allowing all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH']
}));

// Security middleware (AFTER CORS)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Additional CORS headers for static files (uploads)
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

// Serve static files (uploaded images)
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

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Smart Dine API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/upload', uploadRoutes);

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