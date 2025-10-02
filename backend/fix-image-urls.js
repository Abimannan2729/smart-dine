const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/smartdine';
const OLD_URL = 'http://localhost:5000';
const NEW_URL = 'http://smart-dine-backend-1eyi.onrender.com';

async function fixImageUrls() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Fix Restaurant images (logo and coverImage)
    console.log('\n🏪 Fixing Restaurant images...');
    const restaurants = await Restaurant.find({
      $or: [
        { logo: { $regex: OLD_URL } },
        { coverImage: { $regex: OLD_URL } }
      ]
    });

    console.log(`Found ${restaurants.length} restaurants with localhost URLs`);

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
      }
    }

    // Fix MenuItem images
    console.log('\n🍽️  Fixing MenuItem images...');
    const menuItems = await MenuItem.find({
      $or: [
        { image: { $regex: OLD_URL } },
        { 'images.url': { $regex: OLD_URL } }
      ]
    });

    console.log(`Found ${menuItems.length} menu items with localhost URLs`);

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
      }
    }

    console.log('\n🎉 Database URL fix completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  • Fixed ${restaurants.length} restaurant records`);
    console.log(`  • Fixed ${menuItems.length} menu item records`);
    console.log(`  • Changed: ${OLD_URL} → ${NEW_URL}`);
    
  } catch (error) {
    console.error('❌ Error fixing image URLs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixImageUrls();