const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot be more than 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  icon: {
    type: String,
    default: null
  },
  image: {
    type: String,
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#dc2626' // Default red color
  }
}, {
  timestamps: true
});

// Indexes
categorySchema.index({ restaurant: 1, order: 1 });
categorySchema.index({ restaurant: 1, isActive: 1 });

// Virtual for menu items in this category
categorySchema.virtual('menuItems', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'category'
});

// Virtual for menu items count
categorySchema.virtual('menuItemsCount', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Ensure virtual fields are included in JSON output
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);