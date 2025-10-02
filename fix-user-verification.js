#!/usr/bin/env node

/**
 * User Email Verification Fix Script
 * Fixes users who are stuck with isEmailVerified: false
 * 
 * Usage: node fix-user-verification.js
 */

const mongoose = require('mongoose');

// Production MongoDB URI - should be set as environment variable
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI or DATABASE_URL environment variable is required');
  process.exit(1);
}

// Import User model (adjust path as needed)
const User = require('./backend/models/User');

async function fixUserVerification() {
  try {
    console.log('🔗 Connecting to production MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users who are not email verified
    console.log('\n👥 Finding unverified users...');
    const unverifiedUsers = await User.find({ 
      isEmailVerified: { $ne: true } 
    });

    console.log(`Found ${unverifiedUsers.length} unverified users`);

    if (unverifiedUsers.length === 0) {
      console.log('🎉 All users are already verified!');
      return;
    }

    // Fix each user
    let fixedCount = 0;
    for (const user of unverifiedUsers) {
      console.log(`\n📧 Fixing user: ${user.email}`);
      
      // Auto-verify the user
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      
      await user.save({ validateBeforeSave: false });
      console.log(`  ✅ Verified user: ${user.name} (${user.email})`);
      fixedCount++;
    }

    console.log('\n🎉 User verification fix completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  • Fixed ${fixedCount} users`);
    console.log(`  • All users can now login without email verification`);
    
  } catch (error) {
    console.error('❌ Error fixing user verification:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixUserVerification();