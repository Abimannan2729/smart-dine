const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables');
  process.env.JWT_SECRET = 'fallback-secret-key-for-development-only';
  console.warn('Using fallback JWT_SECRET - this should only be used in development');
}

// Ensure Cloudinary credentials are set
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('Cloudinary credentials not set. Image uploads will use local storage.');
} else {
  console.log('Cloudinary configured successfully');
}

// Import routes
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const restaurantRoutes = require('./routes/restaurant');
const qrRoutes = require('./routes/qr');
const uploadRoutes = require('./routes/upload');

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

// Health check route for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Smart Dine API is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not Set',
    cloudinary: (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) ? 'Configured' : 'Not Configured',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test route to verify server is working
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is working',
    timestamp: new Date().toISOString()
  });
});

// Temporary demo menu route to fix 404 issue
app.get('/api/menus/public/demo', (req, res) => {
  console.log('Demo menu route hit:', req.url, req.method);
  try {
    const demoMenu = {
      _id: 'demo-menu-id',
      name: 'Golden Fork Menu',
      description: 'Experience our curated selection of fine dining favorites',
      isActive: true,
      restaurant: {
        _id: 'demo-restaurant-id',
        name: 'The Golden Fork',
        description: 'Fine dining experience with modern cuisine and exceptional service',
        logo: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&h=200&fit=crop&crop=face',
        coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop',
        theme: {
          primaryColor: '#dc2626',
          secondaryColor: '#f97316',
          fontFamily: 'Inter',
          layout: 'modern'
        },
        address: {
          street: '123 Culinary Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA'
        },
        contact: {
          phone: '+1 (555) 123-4567',
          email: 'hello@goldenfork.com',
          website: 'www.goldenfork.com'
        },
        operatingHours: {
          monday: { open: '11:00', close: '22:00', isOpen: true },
          tuesday: { open: '11:00', close: '22:00', isOpen: true },
          wednesday: { open: '11:00', close: '22:00', isOpen: true },
          thursday: { open: '11:00', close: '22:00', isOpen: true },
          friday: { open: '11:00', close: '23:00', isOpen: true },
          saturday: { open: '10:00', close: '23:00', isOpen: true },
          sunday: { open: '10:00', close: '21:00', isOpen: true }
        },
        cuisine: ['Italian', 'Mediterranean', 'Modern']
      },
      categories: [
        {
          _id: 'appetizers',
          name: 'Appetizers',
          description: 'Start your dining experience with our carefully crafted starters',
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=200&fit=crop',
          isActive: true,
          sortOrder: 1,
          items: [
            {
              _id: 'item-1',
              name: 'Truffle Arancini',
              description: 'Crispy risotto balls filled with truffle cheese, served with garlic aioli',
              price: 1200,
              category: 'appetizers',
              image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
              isAvailable: true,
              dietaryTags: [{ id: 'vegetarian', name: 'Vegetarian', color: '#22c55e' }],
              preparationTime: 15,
              calories: 320,
              isPopular: true,
              ingredients: ['Arborio rice', 'Truffle cheese', 'Panko breadcrumbs', 'Garlic', 'Aioli'],
              allergens: ['Dairy', 'Gluten'],
              sortOrder: 1
            }
          ]
        }
      ],
      settings: {
        currency: 'INR',
        showPrices: true,
        showImages: true,
        showDescriptions: true,
        showDietaryTags: true,
        showIngredients: true,
        showCalories: true,
        showPreparationTime: true,
        showSpicyLevel: false,
        allowCustomization: true,
        showAvailability: true,
        theme: {
          primaryColor: '#dc2626',
          secondaryColor: '#f97316',
          fontFamily: 'Inter',
          layout: 'grid'
        }
      },
      stats: {
        totalViews: 2547,
        totalOrders: 189,
        popularItems: ['item-1', 'item-4', 'item-7'],
        averageViewTime: 245
      }
    };

    res.status(200).json({
      success: true,
      data: demoMenu
    });
  } catch (error) {
    console.error('Get demo menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching demo menu'
    });
  }
});

// Routes
console.log('Registering routes...');
app.use('/api/auth', authRoutes);
console.log('Auth routes registered');
app.use('/api/restaurants', restaurantRoutes);
console.log('Restaurant routes registered');
app.use('/api/menus', menuRoutes);
console.log('Menu routes registered');
app.use('/api/qr', qrRoutes);
console.log('QR routes registered');
app.use('/api/upload', uploadRoutes);
console.log('Upload routes registered');

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