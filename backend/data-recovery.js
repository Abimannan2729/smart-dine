const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartdine', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Recovery functions
const checkDataIntegrity = async () => {
  console.log('=== DATA INTEGRITY CHECK ===\n');
  
  try {
    // Check restaurants
    const restaurants = await Restaurant.find({});
    console.log(`Found ${restaurants.length} restaurants:`);
    restaurants.forEach((restaurant, index) => {
      console.log(`  ${index + 1}. ${restaurant.name} (ID: ${restaurant._id})`);
    });
    console.log('');

    // Check categories
    const categories = await Category.find({ isActive: { $ne: false } });
    console.log(`Found ${categories.length} active categories:`);
    categories.forEach((category, index) => {
      console.log(`  ${index + 1}. ${category.name} (ID: ${category._id}) - Restaurant: ${category.restaurant}`);
    });
    console.log('');

    // Check menu items
    const menuItems = await MenuItem.find({ isAvailable: { $ne: false } });
    console.log(`Found ${menuItems.length} available menu items:`);
    menuItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name} (ID: ${item._id}) - Category: ${item.category}`);
    });
    console.log('');

    // Check for orphaned data
    const orphanedCategories = await Category.find({
      restaurant: { $exists: false }
    });
    if (orphanedCategories.length > 0) {
      console.log(`⚠️  Found ${orphanedCategories.length} orphaned categories (no restaurant):`);
      orphanedCategories.forEach(cat => {
        console.log(`    - ${cat.name} (ID: ${cat._id})`);
      });
      console.log('');
    }

    const orphanedItems = await MenuItem.find({
      category: { $exists: false }
    });
    if (orphanedItems.length > 0) {
      console.log(`⚠️  Found ${orphanedItems.length} orphaned menu items (no category):`);
      orphanedItems.forEach(item => {
        console.log(`    - ${item.name} (ID: ${item._id})`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('Error checking data integrity:', error);
  }
};

const restoreDeletedCategories = async () => {
  console.log('=== RESTORING SOFT-DELETED CATEGORIES ===\n');
  
  try {
    const deletedCategories = await Category.find({ isActive: false });
    
    if (deletedCategories.length === 0) {
      console.log('No soft-deleted categories found.');
      return;
    }

    console.log(`Found ${deletedCategories.length} soft-deleted categories:`);
    deletedCategories.forEach((category, index) => {
      console.log(`  ${index + 1}. ${category.name} (ID: ${category._id})`);
    });

    // Restore all soft-deleted categories
    const result = await Category.updateMany(
      { isActive: false },
      { isActive: true }
    );
    
    console.log(`\n✅ Restored ${result.modifiedCount} categories`);
  } catch (error) {
    console.error('Error restoring deleted categories:', error);
  }
};

const restoreDeletedMenuItems = async () => {
  console.log('=== RESTORING SOFT-DELETED MENU ITEMS ===\n');
  
  try {
    const deletedItems = await MenuItem.find({ isAvailable: false });
    
    if (deletedItems.length === 0) {
      console.log('No soft-deleted menu items found.');
      return;
    }

    console.log(`Found ${deletedItems.length} soft-deleted menu items:`);
    deletedItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name} (ID: ${item._id})`);
    });

    // Restore all soft-deleted menu items
    const result = await MenuItem.updateMany(
      { isAvailable: false },
      { isAvailable: true }
    );
    
    console.log(`\n✅ Restored ${result.modifiedCount} menu items`);
  } catch (error) {
    console.error('Error restoring deleted menu items:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  
  console.log('Smart Dine Data Recovery Utility\n');
  console.log('This utility will help you recover any lost menu data.\n');
  
  await checkDataIntegrity();
  await restoreDeletedCategories();
  await restoreDeletedMenuItems();
  
  console.log('\n=== RECOVERY COMPLETE ===');
  console.log('Please refresh your frontend to see the recovered data.');
  
  process.exit(0);
};

// Handle errors
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Run the recovery
main();