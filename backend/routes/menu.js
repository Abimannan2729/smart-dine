const express = require('express');
const { protect, checkRestaurantOwnership, optionalAuth } = require('../middleware/auth');
const { uploadMultiple, uploadSingle } = require('../middleware/cloudinary');
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

const router = express.Router();

// ===== CATEGORIES =====

// @desc    Get all categories for a restaurant
// @route   GET /api/menus/restaurants/:restaurantId/categories
// @access  Private
router.get('/restaurants/:restaurantId/categories', protect, checkRestaurantOwnership, async (req, res) => {
  try {
    const categories = await Category.find({
      restaurant: req.params.restaurantId,
      isActive: true
    })
    .populate('menuItemsCount')
    .sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// @desc    Create new category
// @route   POST /api/menus/restaurants/:restaurantId/categories
// @access  Private
router.post('/restaurants/:restaurantId/categories', protect, checkRestaurantOwnership, uploadSingle('image'), async (req, res) => {
  try {
    const { getFileUrl } = require('../middleware/upload');
    
    const categoryData = {
      ...req.body,
      restaurant: req.params.restaurantId
    };

    if (req.file) {
      categoryData.image = getFileUrl(req, req.file.path);
    }

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Create category error:', error);
    
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
      message: 'Error creating category'
    });
  }
});

// @desc    Update category
// @route   PUT /api/menus/categories/:id
// @access  Private
router.put('/categories/:id', protect, uploadSingle('image'), async (req, res) => {
  try {
    // Validate category ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Valid category ID is required'
      });
    }
    
    const category = await Category.findById(req.params.id).populate('restaurant');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && category.restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this category'
      });
    }

    const { getFileUrl, deleteFile } = require('../middleware/upload');
    const updateData = { ...req.body };

    if (req.file) {
      // Delete old image if exists
      if (category.image) {
        deleteFile(category.image.replace(/^https?:\/\/[^\/]+\//, ''));
      }
      updateData.image = getFileUrl(req, req.file.path);
    }

    const updatedCategory = await Category.findByIdAndUpdate(
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
        category: updatedCategory
      }
    });
  } catch (error) {
    console.error('Update category error:', error);
    
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
      message: 'Error updating category'
    });
  }
});

// @desc    Delete category
// @route   DELETE /api/menus/categories/:id
// @access  Private
router.delete('/categories/:id', protect, async (req, res) => {
  try {
    // Validate category ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Valid category ID is required'
      });
    }
    
    const category = await Category.findById(req.params.id).populate('restaurant');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && category.restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this category'
      });
    }

    // Check if category has menu items
    const itemCount = await MenuItem.countDocuments({ category: req.params.id, isAvailable: true });
    
    if (itemCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with active menu items. Please move or delete items first.'
      });
    }

    // Soft delete
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category'
    });
  }
});

// ===== MENU ITEMS =====

// @desc    Get all menu items for a restaurant
// @route   GET /api/menus/restaurants/:restaurantId/items
// @access  Private
router.get('/restaurants/:restaurantId/items', protect, checkRestaurantOwnership, async (req, res) => {
  try {
    const { category, search, sortBy = 'order' } = req.query;
    
    let query = {
      restaurant: req.params.restaurantId,
      isAvailable: true
    };

    if (category) {
      query.category = category;
    }

    let menuItems;

    if (search) {
      menuItems = await MenuItem.searchItems(req.params.restaurantId, search, query);
    } else {
      menuItems = await MenuItem.find(query)
        .populate('category', 'name color')
        .sort({ [sortBy]: 1 });
    }

    // Debug: log menu items with image data
    console.log('Admin getMenuItems: Returning', menuItems.length, 'items');
    menuItems.forEach((item, index) => {
      console.log(`Admin Item ${index + 1}:`, {
        name: item.name,
        images: item.images,
        image: item.image, // virtual field
        primaryImage: item.primaryImage // virtual field
      });
    });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: {
        menuItems
      }
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu items'
    });
  }
});

// @desc    Get single menu item
// @route   GET /api/menus/items/:id
// @access  Private
router.get('/items/:id', protect, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate('category', 'name color')
      .populate('restaurant', 'name owner');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && menuItem.restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this menu item'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        menuItem
      }
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu item'
    });
  }
});

// @desc    Create new menu item
// @route   POST /api/menus/restaurants/:restaurantId/items
// @access  Private
router.post('/restaurants/:restaurantId/items', protect, checkRestaurantOwnership, uploadMultiple('images', 5), async (req, res) => {
  try {
    const { getFileUrl } = require('../middleware/upload');
    
    console.log('Backend createMenuItem: req.body:', req.body);
    console.log('Backend createMenuItem: req.files:', req.files);
    console.log('Backend createMenuItem: req.body.image:', req.body.image);
    
    const menuItemData = {
      ...req.body,
      restaurant: req.params.restaurantId
    };

    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
      menuItemData.images = req.files.map((file, index) => ({
        url: getFileUrl(req, file.path),
        alt: `${req.body.name} image ${index + 1}`,
        isPrimary: index === 0 // First image is primary
      }));
    }
    
    // Also handle single image URL from frontend form
    if (req.body.image && typeof req.body.image === 'string') {
      if (!menuItemData.images) {
        menuItemData.images = [];
      }
      // Add the image URL to the images array if it's not already there
      const imageExists = menuItemData.images.some(img => img.url === req.body.image);
      if (!imageExists) {
        menuItemData.images.unshift({
          url: req.body.image,
          alt: `${req.body.name} image`,
          isPrimary: menuItemData.images.length === 0
        });
      }
    }

    // Parse JSON fields if they exist
    if (req.body.ingredients && typeof req.body.ingredients === 'string') {
      menuItemData.ingredients = JSON.parse(req.body.ingredients);
    }
    
    if (req.body.allergens && typeof req.body.allergens === 'string') {
      menuItemData.allergens = JSON.parse(req.body.allergens);
    }
    
    if (req.body.dietary && typeof req.body.dietary === 'string') {
      menuItemData.dietary = JSON.parse(req.body.dietary);
    }
    
    if (req.body.customizations && typeof req.body.customizations === 'string') {
      menuItemData.customizations = JSON.parse(req.body.customizations);
    }

    if (req.body.nutritionalInfo && typeof req.body.nutritionalInfo === 'string') {
      menuItemData.nutritionalInfo = JSON.parse(req.body.nutritionalInfo);
    }

    console.log('Backend createMenuItem: Final menuItemData before saving:', menuItemData);
    console.log('Backend createMenuItem: menuItemData.images:', menuItemData.images);
    
    const menuItem = await MenuItem.create(menuItemData);
    await menuItem.populate('category', 'name color');
    
    console.log('Backend createMenuItem: Created menuItem:', {
      id: menuItem._id,
      name: menuItem.name,
      images: menuItem.images,
      image: menuItem.image // virtual field
    });

    res.status(201).json({
      success: true,
      data: {
        menuItem
      }
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    
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
      message: 'Error creating menu item'
    });
  }
});

// @desc    Update menu item
// @route   PUT /api/menus/items/:id
// @access  Private
router.put('/items/:id', protect, uploadMultiple('images', 5), async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurant');
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && menuItem.restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this menu item'
      });
    }

    const { getFileUrl, deleteFile } = require('../middleware/upload');
    const updateData = { ...req.body };

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      // Delete old images if replacing
      if (menuItem.images && menuItem.images.length > 0) {
        menuItem.images.forEach(image => {
          deleteFile(image.url.replace(/^https?:\/\/[^\/]+\//, ''));
        });
      }

      updateData.images = req.files.map((file, index) => ({
        url: getFileUrl(req, file.path),
        alt: `${req.body.name || menuItem.name} image ${index + 1}`,
        isPrimary: index === 0
      }));
    }

    // Parse JSON fields if they exist
    if (req.body.ingredients && typeof req.body.ingredients === 'string') {
      updateData.ingredients = JSON.parse(req.body.ingredients);
    }
    
    if (req.body.allergens && typeof req.body.allergens === 'string') {
      updateData.allergens = JSON.parse(req.body.allergens);
    }
    
    if (req.body.dietary && typeof req.body.dietary === 'string') {
      updateData.dietary = JSON.parse(req.body.dietary);
    }
    
    if (req.body.customizations && typeof req.body.customizations === 'string') {
      updateData.customizations = JSON.parse(req.body.customizations);
    }

    if (req.body.nutritionalInfo && typeof req.body.nutritionalInfo === 'string') {
      updateData.nutritionalInfo = JSON.parse(req.body.nutritionalInfo);
    }

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name color');

    res.status(200).json({
      success: true,
      data: {
        menuItem: updatedMenuItem
      }
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    
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
      message: 'Error updating menu item'
    });
  }
});

// @desc    Delete menu item
// @route   DELETE /api/menus/items/:id
// @access  Private
router.delete('/items/:id', protect, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurant');
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && menuItem.restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this menu item'
      });
    }

    // Soft delete
    await MenuItem.findByIdAndUpdate(req.params.id, { isAvailable: false });

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting menu item'
    });
  }
});

// ===== PUBLIC ROUTES =====

// @desc    Get demo menu (static data)
// @route   GET /api/menus/public/demo
// @access  Public
router.get('/public/demo', async (req, res) => {
  try {
    // Return static demo menu data
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
            },
            {
              _id: 'item-2',
              name: 'Pan-Seared Scallops',
              description: 'Fresh sea scallops with cauliflower purée and pancetta crisps',
              price: 1800,
              category: 'appetizers',
              image: 'https://images.unsplash.com/photo-1559847844-d445cb8d6810?w=300&h=200&fit=crop',
              isAvailable: true,
              dietaryTags: [{ id: 'gluten-free', name: 'Gluten Free', color: '#3b82f6' }],
              preparationTime: 20,
              calories: 280,
              isFeatured: true,
              ingredients: ['Sea scallops', 'Cauliflower', 'Pancetta', 'Butter', 'Herbs'],
              allergens: ['Shellfish', 'Dairy'],
              sortOrder: 2
            }
          ]
        },
        {
          _id: 'mains',
          name: 'Main Courses',
          description: 'Our signature dishes and chef\'s specialties',
          image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=200&fit=crop',
          isActive: true,
          sortOrder: 2,
          items: [
            {
              _id: 'item-4',
              name: 'Wagyu Beef Ribeye',
              description: 'Premium A5 Wagyu ribeye with roasted vegetables and red wine jus',
              price: 6500,
              originalPrice: 7000,
              category: 'mains',
              image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop',
              isAvailable: true,
              dietaryTags: [{ id: 'gluten-free', name: 'Gluten Free', color: '#3b82f6' }],
              preparationTime: 25,
              calories: 650,
              isPopular: true,
              isFeatured: true,
              ingredients: ['Wagyu ribeye', 'Seasonal vegetables', 'Red wine', 'Herbs'],
              allergens: [],
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

// @desc    Get public menu by restaurant ID or slug
// @route   GET /api/menus/public/restaurant/:restaurantIdOrSlug
// @access  Public
router.get('/public/restaurant/:restaurantIdOrSlug', optionalAuth, async (req, res) => {
  try {
    // Try to find by ID first, then by slug
    const restaurant = await Restaurant.findOne({
      $or: [
        { _id: req.params.restaurantIdOrSlug },
        { slug: req.params.restaurantIdOrSlug }
      ],
      isActive: true,
      isPublished: true // Only show published restaurants
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant menu not found or not published'
      });
    }

    // Increment view count if method exists
    if (restaurant.incrementViews) {
      await restaurant.incrementViews();
    }

    // Get categories with menu items
    const categories = await Category.find({
      restaurant: restaurant._id,
      isActive: true
    }).populate({
      path: 'menuItems',
      match: { isAvailable: true },
      options: { sort: { order: 1 } },
      select: 'name description price originalPrice image images isAvailable isPopular isFeatured preparationTime calories spicyLevel dietary ingredients allergens'
    }).sort({ order: 1 });

    // Transform categories to include items property for frontend compatibility
    const transformedCategories = categories.map(category => {
      const categoryObj = category.toObject();
      // Rename menuItems to items for frontend compatibility
      categoryObj.items = (categoryObj.menuItems || []).map(item => {
        // Transform item fields for frontend compatibility
        let primaryImage = null;
        
        // Handle both single image URL and images array
        if (item.images && Array.isArray(item.images) && item.images.length > 0) {
          primaryImage = item.images[0].url;
        } else if (item.image) {
          primaryImage = item.image;
        }
        
        return {
          ...item,
          dietaryTags: item.dietary || [], // Map dietary to dietaryTags
          image: primaryImage
        };
      });
      delete categoryObj.menuItems;
      return categoryObj;
    });

    // Create menu structure with restaurant details
    const menu = {
      _id: `menu_${restaurant._id}`,
      name: `${restaurant.name} Menu`,
      description: restaurant.description,
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        description: restaurant.description,
        logo: restaurant.logo,
        coverImage: restaurant.coverImage,
        theme: restaurant.theme,
        address: restaurant.address,
        contact: restaurant.contact,
        operatingHours: restaurant.operatingHours,
        cuisine: restaurant.cuisine,
        features: restaurant.features,
        socialMedia: restaurant.socialMedia
      },
      categories: transformedCategories,
      isActive: true,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt
    };

    res.status(200).json({
      success: true,
      data: menu
    });
  } catch (error) {
    console.error('Get public menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu'
    });
  }
});

// @desc    Get public menu by restaurant slug
// @route   GET /api/menus/public/:slug
// @access  Public
router.get('/public/:slug', optionalAuth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ 
      slug: req.params.slug,
      isActive: true,
      isPublished: true // Only show published restaurants
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant menu not found or not published'
      });
    }

    // Increment view count
    await restaurant.incrementViews();

    // Get categories with menu items
    const categories = await Category.find({
      restaurant: restaurant._id,
      isActive: true
    }).populate({
      path: 'menuItems',
      match: { isAvailable: true },
      options: { sort: { order: 1 } },
      select: 'name description price originalPrice image images isAvailable isPopular isFeatured preparationTime calories spicyLevel dietary ingredients allergens'
    }).sort({ order: 1 });

    // Transform categories to include items property for frontend compatibility
    const transformedCategories = categories.map(category => {
      const categoryObj = category.toObject();
      // Rename menuItems to items for frontend compatibility
      categoryObj.items = (categoryObj.menuItems || []).map(item => {
        // Transform item fields for frontend compatibility
        let primaryImage = null;
        
        // Handle both single image URL and images array
        if (item.images && Array.isArray(item.images) && item.images.length > 0) {
          primaryImage = item.images[0].url;
        } else if (item.image) {
          primaryImage = item.image;
        }
        
        return {
          ...item,
          dietaryTags: item.dietary || [], // Map dietary to dietaryTags
          image: primaryImage
        };
      });
      delete categoryObj.menuItems;
      return categoryObj;
    });

    // Create menu structure with restaurant details (same as ID-based route)
    const menu = {
      _id: `menu_${restaurant._id}`,
      name: `${restaurant.name} Menu`,
      description: restaurant.description,
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        description: restaurant.description,
        logo: restaurant.logo,
        coverImage: restaurant.coverImage,
        theme: restaurant.theme,
        address: restaurant.address,
        contact: restaurant.contact,
        operatingHours: restaurant.operatingHours,
        cuisine: restaurant.cuisine,
        features: restaurant.features,
        socialMedia: restaurant.socialMedia
      },
      categories: transformedCategories,
      isActive: true,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt
    };

    res.status(200).json({
      success: true,
      data: menu
    });
  } catch (error) {
    console.error('Get public menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu'
    });
  }
});

module.exports = router;