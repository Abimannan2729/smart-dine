const express = require('express');
const { protect, checkRestaurantOwnership } = require('../middleware/auth');
const { uploadFields } = require('../middleware/cloudinary');
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

const router = express.Router();

// @desc    Get all restaurants for current user
// @route   GET /api/restaurants
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ 
      owner: req.user.id,
      isActive: true 
    })
    .populate('menuItemsCount')
    .populate('categoriesCount')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: {
        restaurants
      }
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurants'
    });
  }
});

// @desc    Get restaurant menus (returns categories with items)
// @route   GET /api/restaurants/:id/menus
// @access  Private
router.get('/:id/menus', protect, checkRestaurantOwnership, async (req, res) => {
  try {
    // For now, return a mock menu structure since we don't have a Menu model yet
    // This returns categories with their menu items for the restaurant
    const categories = await Category.find({
      restaurant: req.params.id,
      isActive: true
    })
    .populate({
      path: 'menuItems',
      match: { isAvailable: true },
      options: { sort: { order: 1 } },
      select: 'name description price originalPrice image images isAvailable isPopular isFeatured preparationTime calories spicyLevel dietary ingredients allergens'
    })
    .sort({ order: 1 });

    // Create a mock menu structure with proper item transformation
    const transformedCategories = categories.map(category => ({
      ...category.toObject(),
      items: category.menuItems || []
    }));

    const menu = {
      _id: `menu_${req.params.id}`,
      name: `${req.restaurant.name} Menu`,
      restaurant: req.params.id,
      categories: transformedCategories,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(200).json({
      success: true,
      data: [menu] // Return as array to match frontend expectations
    });
  } catch (error) {
    console.error('Get restaurant menus error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant menus'
    });
  }
});

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Private
router.get('/:id', protect, checkRestaurantOwnership, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('menuItemsCount')
      .populate('categoriesCount');

    res.status(200).json({
      success: true,
      data: {
        restaurant
      }
    });
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant'
    });
  }
});

// @desc    Create new restaurant
// @route   POST /api/restaurants
// @access  Private
router.post('/', protect, uploadFields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { getFileUrl } = require('../middleware/cloudinary');
    
    const restaurantData = {
      ...req.body,
      owner: req.user.id
    };

    // Handle file uploads
    if (req.files) {
      if (req.files.logo) {
        restaurantData.logo = getFileUrl(req, req.files.logo[0].path);
      }
      if (req.files.coverImage) {
        restaurantData.coverImage = getFileUrl(req, req.files.coverImage[0].path);
      }
    }

    const restaurant = await Restaurant.create(restaurantData);

    // Create default categories
    const defaultCategories = [
      { name: 'Appetizers', order: 1, color: '#dc2626' },
      { name: 'Main Course', order: 2, color: '#059669' },
      { name: 'Desserts', order: 3, color: '#7c3aed' },
      { name: 'Beverages', order: 4, color: '#0891b2' }
    ];

    await Promise.all(defaultCategories.map(categoryData => 
      Category.create({
        ...categoryData,
        restaurant: restaurant._id
      })
    ));

    res.status(201).json({
      success: true,
      data: {
        restaurant
      }
    });
  } catch (error) {
    console.error('Create restaurant error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant with this slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating restaurant'
    });
  }
});

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private
router.put('/:id', protect, checkRestaurantOwnership, uploadFields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { getFileUrl, deleteFile } = require('../middleware/cloudinary');
    
    const updateData = { ...req.body };

    // Handle file uploads
    if (req.files) {
      if (req.files.logo) {
        // Delete old logo if exists
        if (req.restaurant.logo) {
          deleteFile(req.restaurant.logo.replace(/^https?:\/\/[^\/]+\//, ''));
        }
        updateData.logo = getFileUrl(req, req.files.logo[0].path);
      }
      
      if (req.files.coverImage) {
        // Delete old cover image if exists
        if (req.restaurant.coverImage) {
          deleteFile(req.restaurant.coverImage.replace(/^https?:\/\/[^\/]+\//, ''));
        }
        updateData.coverImage = getFileUrl(req, req.files.coverImage[0].path);
      }
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: {
        restaurant
      }
    });
  } catch (error) {
    console.error('Update restaurant error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating restaurant'
    });
  }
});

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private
router.delete('/:id', protect, checkRestaurantOwnership, async (req, res) => {
  try {
    // Soft delete - mark as inactive
    await Restaurant.findByIdAndUpdate(req.params.id, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting restaurant'
    });
  }
});

// @desc    Toggle restaurant published status
// @route   PUT /api/restaurants/:id/toggle-publish
// @access  Private
router.put('/:id/toggle-publish', protect, checkRestaurantOwnership, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { isPublished: !req.restaurant.isPublished },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: {
        restaurant
      }
    });
  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating restaurant status'
    });
  }
});

// @desc    Get restaurant analytics
// @route   GET /api/restaurants/:id/analytics
// @access  Private
router.get('/:id/analytics', protect, checkRestaurantOwnership, async (req, res) => {
  try {
    const restaurant = req.restaurant;
    
    // Get popular items
    const popularItems = await MenuItem.getPopularItems(restaurant._id, 5);
    
    // Get categories with item counts
    const categories = await Category.aggregate([
      { $match: { restaurant: restaurant._id, isActive: true } },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: 'category',
          as: 'items'
        }
      },
      {
        $addFields: {
          itemCount: { $size: '$items' }
        }
      },
      { $project: { items: 0 } },
      { $sort: { order: 1 } }
    ]);

    // Calculate analytics data
    const analytics = {
      totalViews: restaurant.stats.totalMenuViews,
      totalQRScans: restaurant.stats.totalQRScans,
      totalCategories: categories.length,
      totalMenuItems: await MenuItem.countDocuments({ 
        restaurant: restaurant._id, 
        isAvailable: true 
      }),
      popularItems,
      categories,
      lastViewedAt: restaurant.stats.lastViewedAt
    };

    res.status(200).json({
      success: true,
      data: {
        analytics
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
});

module.exports = router;