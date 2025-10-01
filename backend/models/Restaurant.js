const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    maxlength: [100, 'Restaurant name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'US'
    }
  },
  contact: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  operatingHours: {
    monday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true }
    },
    tuesday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true }
    },
    wednesday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true }
    },
    thursday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true }
    },
    friday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true }
    },
    saturday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true }
    },
    sunday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true }
    }
  },
  logo: {
    type: String,
    default: null
  },
  coverImage: {
    type: String,
    default: null
  },
  cuisine: [{
    type: String,
    trim: true
  }],
  features: [{
    type: String,
    enum: ['delivery', 'takeout', 'dine-in', 'outdoor-seating', 'wifi', 'parking', 'wheelchair-accessible']
  }],
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String
  },
  theme: {
    primaryColor: {
      type: String,
      default: '#dc2626' // Red
    },
    secondaryColor: {
      type: String,
      default: '#fbbf24' // Gold
    },
    fontFamily: {
      type: String,
      default: 'Inter'
    },
    layout: {
      type: String,
      enum: ['classic', 'modern', 'minimal'],
      default: 'modern'
    }
  },
  qrCode: {
    code: String,
    publicUrl: String,
    lastGenerated: Date,
    scanCount: {
      type: Number,
      default: 0
    }
  },
  stats: {
    totalMenuViews: {
      type: Number,
      default: 0
    },
    totalQRScans: {
      type: Number,
      default: 0
    },
    lastViewedAt: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
restaurantSchema.index({ owner: 1 });
restaurantSchema.index({ slug: 1 });
restaurantSchema.index({ isActive: 1, isPublished: 1 });
restaurantSchema.index({ 'qrCode.publicUrl': 1 });

// Pre-save middleware to generate slug
restaurantSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
    
    // Add timestamp to ensure uniqueness
    this.slug += `-${Date.now()}`;
  }
  next();
});

// Virtual for menu items count
restaurantSchema.virtual('menuItemsCount', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'restaurant',
  count: true
});

// Virtual for total categories
restaurantSchema.virtual('categoriesCount', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'restaurant',
  count: true
});

// Method to generate QR code URL
restaurantSchema.methods.getPublicMenuUrl = function() {
  return `${process.env.CLIENT_URL}/menu/${this.slug}`;
};

// Method to update stats
restaurantSchema.methods.incrementViews = function() {
  this.stats.totalMenuViews += 1;
  this.stats.lastViewedAt = new Date();
  return this.save({ validateBeforeSave: false });
};

restaurantSchema.methods.incrementQRScans = function() {
  this.stats.totalQRScans += 1;
  this.qrCode.scanCount += 1;
  return this.save({ validateBeforeSave: false });
};

// Static method to get popular restaurants
restaurantSchema.statics.getPopularRestaurants = function(limit = 10) {
  return this.find({ isActive: true, isPublished: true })
    .sort({ 'stats.totalMenuViews': -1 })
    .limit(limit)
    .populate('owner', 'name email');
};

// Ensure virtual fields are included in JSON output
restaurantSchema.set('toJSON', { virtuals: true });
restaurantSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);