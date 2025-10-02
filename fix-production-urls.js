#!/usr/bin/env node

/**
 * Production URL Fix Script
 * Run this script on the production server to fix localhost image URLs
 * 
 * Usage: node fix-production-urls.js
 */

const mongoose = require('mongoose');

// Production MongoDB URI - should be set as environment variable
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI or DATABASE_URL environment variable is required');
  process.exit(1);
}

// Import models (adjust paths as needed)
const Restaurant = require('./backend/models/Restaurant');
const MenuItem = require('./backend/models/MenuItem');

const OLD_URLS = [
  'http://localhost:5000',
  'http://smart-dine-backend-1eyi.onrender.com'  // Also fix HTTP to HTTPS
];
const NEW_URL = 'https://smart-dine-backend-1eyi.onrender.com';

async function fixProductionUrls() {
  try {
    console.log('🔗 Connecting to production MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let totalFixed = 0;

    // Fix Restaurant images (logo and coverImage)
    console.log('\n🏪 Fixing Restaurant images...');
    
    for (const oldUrl of OLD_URLS) {
      const restaurants = await Restaurant.find({
        $or: [
          { logo: { $regex: oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') } },
          { coverImage: { $regex: oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') } }
        ]
      });

      console.log(`Found ${restaurants.length} restaurants with ${oldUrl} URLs`);

      for (const restaurant of restaurants) {
        let updated = false;
        
        if (restaurant.logo && restaurant.logo.includes(oldUrl)) {
          const oldLogo = restaurant.logo;
          restaurant.logo = restaurant.logo.replace(oldUrl, NEW_URL);
          console.log(`  📸 Updated logo: ${oldLogo} → ${restaurant.logo}`);
          updated = true;
        }
        
        if (restaurant.coverImage && restaurant.coverImage.includes(oldUrl)) {
          const oldCover = restaurant.coverImage;
          restaurant.coverImage = restaurant.coverImage.replace(oldUrl, NEW_URL);
          console.log(`  🖼️  Updated cover: ${oldCover} → ${restaurant.coverImage}`);
          updated = true;
        }
        
        if (updated) {
          await restaurant.save();
          console.log(`  ✅ Saved restaurant: ${restaurant.name}`);
          totalFixed++;
        }
      }
    }

    // Fix MenuItem images
    console.log('\n🍽️  Fixing MenuItem images...');
    
    for (const oldUrl of OLD_URLS) {
      const menuItems = await MenuItem.find({
        $or: [
          { image: { $regex: oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') } },
          { 'images.url': { $regex: oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') } }
        ]
      });

      console.log(`Found ${menuItems.length} menu items with ${oldUrl} URLs`);

      for (const item of menuItems) {
        let updated = false;
        
        // Fix main image field
        if (item.image && item.image.includes(oldUrl)) {
          const oldImage = item.image;
          item.image = item.image.replace(oldUrl, NEW_URL);
          console.log(`  📸 Updated item image: ${oldImage} → ${item.image}`);
          updated = true;
        }
        
        // Fix images array
        if (item.images && Array.isArray(item.images)) {
          for (const imageObj of item.images) {
            if (imageObj.url && imageObj.url.includes(oldUrl)) {
              const oldImageUrl = imageObj.url;
              imageObj.url = imageObj.url.replace(oldUrl, NEW_URL);
              console.log(`  📸 Updated array image: ${oldImageUrl} → ${imageObj.url}`);
              updated = true;
            }
          }
        }
        
        if (updated) {
          await item.save();
          console.log(`  ✅ Saved menu item: ${item.name}`);
          totalFixed++;
        }
      }
    }

    console.log('\n🎉 Production URL fix completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  • Fixed ${totalFixed} total records`);
    console.log(`  • Changed URLs from: ${OLD_URLS.join(', ')}`);
    console.log(`  • Changed URLs to: ${NEW_URL}`);
    
  } catch (error) {
    console.error('❌ Error fixing production URLs:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixProductionUrls();