require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const Category = require('./models/Category');

async function debugMenuItems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const menuItems = await MenuItem.find({}).populate('category', 'name');
    
    console.log(`\nFound ${menuItems.length} menu items:`);
    
    menuItems.forEach((item, index) => {
      console.log(`\n--- Menu Item ${index + 1} ---`);
      console.log('Name:', item.name);
      console.log('Category:', item.category?.name || 'No category');
      console.log('Price:', item.price);
      console.log('Images array:', item.images);
      console.log('Virtual image field:', item.image);
      console.log('Primary image virtual:', item.primaryImage);
      console.log('Available:', item.isAvailable);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

debugMenuItems();