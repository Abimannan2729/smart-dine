const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

const OLD_URL = 'http://localhost:5000';
const NEW_URL = 'http://smart-dine-backend-1eyi.onrender.com';

// Health check for admin routes
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Admin routes are working' });
});

// Admin endpoint to fix image URLs in database
router.post('/fix-image-urls', async (req, res) => {
  try {
    console.log('🔧 Starting database URL fix...');
    
    // Fix Restaurant images (logo and coverImage)
    console.log('🏪 Fixing Restaurant images...');
    const restaurants = await Restaurant.find({
      $or: [
        { logo: { $regex: OLD_URL } },
        { coverImage: { $regex: OLD_URL } }
      ]
    });

    console.log(`Found ${restaurants.length} restaurants with localhost URLs`);
    let restaurantsFixed = 0;

    for (const restaurant of restaurants) {
      let updated = false;
      
      if (restaurant.logo && restaurant.logo.includes(OLD_URL)) {
        const oldLogo = restaurant.logo;
        restaurant.logo = restaurant.logo.replace(OLD_URL, NEW_URL);
        console.log(`  📸 Updated logo: ${oldLogo} → ${restaurant.logo}`);
        updated = true;
      }
      
      if (restaurant.coverImage && restaurant.coverImage.includes(OLD_URL)) {
        const oldCover = restaurant.coverImage;
        restaurant.coverImage = restaurant.coverImage.replace(OLD_URL, NEW_URL);
        console.log(`  🖼️  Updated cover: ${oldCover} → ${restaurant.coverImage}`);
        updated = true;
      }
      
      if (updated) {
        await restaurant.save();
        console.log(`  ✅ Saved restaurant: ${restaurant.name}`);
        restaurantsFixed++;
      }
    }

    // Fix MenuItem images
    console.log('🍽️  Fixing MenuItem images...');
    const menuItems = await MenuItem.find({
      $or: [
        { image: { $regex: OLD_URL } },
        { 'images.url': { $regex: OLD_URL } }
      ]
    });

    console.log(`Found ${menuItems.length} menu items with localhost URLs`);
    let menuItemsFixed = 0;

    for (const item of menuItems) {
      let updated = false;
      
      // Fix main image field
      if (item.image && item.image.includes(OLD_URL)) {
        const oldImage = item.image;
        item.image = item.image.replace(OLD_URL, NEW_URL);
        console.log(`  📸 Updated item image: ${oldImage} → ${item.image}`);
        updated = true;
      }
      
      // Fix images array
      if (item.images && Array.isArray(item.images)) {
        for (const imageObj of item.images) {
          if (imageObj.url && imageObj.url.includes(OLD_URL)) {
            const oldUrl = imageObj.url;
            imageObj.url = imageObj.url.replace(OLD_URL, NEW_URL);
            console.log(`  📸 Updated array image: ${oldUrl} → ${imageObj.url}`);
            updated = true;
          }
        }
      }
      
      if (updated) {
        await item.save();
        console.log(`  ✅ Saved menu item: ${item.name}`);
        menuItemsFixed++;
      }
    }

    const summary = {
      success: true,
      message: 'Database URL fix completed successfully!',
      results: {
        restaurantsFound: restaurants.length,
        restaurantsFixed: restaurantsFixed,
        menuItemsFound: menuItems.length,
        menuItemsFixed: menuItemsFixed,
        oldUrl: OLD_URL,
        newUrl: NEW_URL
      }
    };

    console.log('🎉 Database URL fix completed successfully!');
    console.log('📋 Summary:', summary.results);
    
    res.json(summary);
    
  } catch (error) {
    console.error('❌ Error fixing image URLs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fixing image URLs',
      error: error.message
    });
  }
});

// @desc    Fix user email verification (temporary endpoint)
// @route   POST /api/admin/fix-user-verification
// @access  Public (temporary - should be removed after use)
router.post('/fix-user-verification', async (req, res) => {
  try {
    console.log('🔧 ADMIN: Starting user verification fix...');

    // Find all users who are not email verified
    const unverifiedUsers = await User.find({ 
      isEmailVerified: { $ne: true } 
    });

    console.log(`Found ${unverifiedUsers.length} unverified users`);

    if (unverifiedUsers.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All users are already verified!',
        data: {
          fixedCount: 0,
          totalUsers: await User.countDocuments()
        }
      });
    }

    // Fix each user
    let fixedCount = 0;
    const fixedUsers = [];

    for (const user of unverifiedUsers) {
      console.log(`📧 Fixing user: ${user.email}`);
      
      // Auto-verify the user
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      
      await user.save({ validateBeforeSave: false });
      console.log(`✅ Verified user: ${user.name} (${user.email})`);
      
      fixedUsers.push({
        id: user._id,
        name: user.name,
        email: user.email
      });
      fixedCount++;
    }

    console.log('🎉 User verification fix completed successfully!');

    res.status(200).json({
      success: true,
      message: 'User verification fix completed successfully!',
      data: {
        fixedCount,
        fixedUsers,
        totalUsers: await User.countDocuments()
      }
    });

  } catch (error) {
    console.error('❌ Error fixing user verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error fixing user verification',
      error: error.message
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Admin routes are working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;