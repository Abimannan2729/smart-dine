const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  ingredients: [{
    type: String,
    trim: true
  }],
  allergens: [{
    type: String,
    enum: [
      'gluten', 'dairy', 'eggs', 'nuts', 'peanuts', 'shellfish', 
      'fish', 'soy', 'sesame', 'sulfites', 'mustard', 'celery'
    ]
  }],
  dietary: [{
    type: String,
    enum: [
      'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 
      'nut-free', 'halal', 'kosher', 'organic', 'spicy', 'low-carb'
    ]
  }],
  nutritionalInfo: {
    calories: Number,
    protein: Number, // in grams
    carbs: Number, // in grams
    fat: Number, // in grams
    fiber: Number, // in grams
    sugar: Number, // in grams
    sodium: Number // in mg
  },
  preparationTime: {
    type: Number, // in minutes
    min: [0, 'Preparation time cannot be negative']
  },
  spiceLevel: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  customizations: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    options: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      price: {
        type: Number,
        default: 0
      }
    }],
    required: {
      type: Boolean,
      default: false
    },
    maxSelections: {
      type: Number,
      default: 1
    }
  }],
  order: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  stats: {
    views: {
      type: Number,
      default: 0
    },
    orders: {
      type: Number,
      default: 0
    },
    lastOrderedAt: Date
  },
  availability: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    startTime: String,
    endTime: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
menuItemSchema.index({ restaurant: 1, category: 1, order: 1 });
menuItemSchema.index({ restaurant: 1, isAvailable: 1 });
menuItemSchema.index({ name: 'text', description: 'text', tags: 'text' });
menuItemSchema.index({ price: 1 });
menuItemSchema.index({ isPopular: 1, isFeatured: 1 });

// Virtual for primary image
menuItemSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || (this.images.length > 0 ? this.images[0] : null);
});

// Virtual for simple image field (for frontend compatibility)
menuItemSchema.virtual('image').get(function() {
  const primaryImage = this.primaryImage;
  return primaryImage ? primaryImage.url : null;
});

// Virtual for discount percentage
menuItemSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for checking if item is on sale
menuItemSchema.virtual('isOnSale').get(function() {
  return this.originalPrice && this.originalPrice > this.price;
});

// Method to increment views
menuItemSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Method to record order
menuItemSchema.methods.recordOrder = function() {
  this.stats.orders += 1;
  this.stats.lastOrderedAt = new Date();
  return this.save({ validateBeforeSave: false });
};

// Static method to get popular items
menuItemSchema.statics.getPopularItems = function(restaurantId, limit = 10) {
  return this.find({ 
    restaurant: restaurantId, 
    isAvailable: true 
  })
  .sort({ 'stats.orders': -1, 'stats.views': -1 })
  .limit(limit)
  .populate('category', 'name color');
};

// Static method to search items
menuItemSchema.statics.searchItems = function(restaurantId, query, filters = {}) {
  const searchQuery = {
    restaurant: restaurantId,
    isAvailable: true,
    ...filters
  };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  return this.find(searchQuery)
    .populate('category', 'name color')
    .sort(query ? { score: { $meta: 'textScore' } } : { order: 1 });
};

// Ensure virtual fields are included in JSON output
menuItemSchema.set('toJSON', { virtuals: true });
menuItemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);