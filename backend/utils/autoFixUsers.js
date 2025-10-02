const User = require('../models/User');

/**
 * Auto-fix user verification on startup
 * This runs once when the server starts to fix any unverified users
 */
async function autoFixUserVerification() {
  try {
    console.log('🔧 AUTO-FIX: Checking for unverified users...');

    // Find all users who are not email verified
    const unverifiedUsers = await User.find({ 
      isEmailVerified: { $ne: true } 
    });

    if (unverifiedUsers.length === 0) {
      console.log('✅ AUTO-FIX: All users are already verified');
      return;
    }

    console.log(`🔧 AUTO-FIX: Found ${unverifiedUsers.length} unverified users, fixing...`);

    // Fix each user
    let fixedCount = 0;
    for (const user of unverifiedUsers) {
      // Auto-verify the user
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      
      await user.save({ validateBeforeSave: false });
      console.log(`✅ AUTO-FIX: Verified user: ${user.name} (${user.email})`);
      fixedCount++;
    }

    console.log(`🎉 AUTO-FIX: Fixed ${fixedCount} users on startup`);

  } catch (error) {
    console.error('❌ AUTO-FIX: Error fixing user verification:', error);
    // Don't throw error to prevent server startup failure
  }
}

module.exports = { autoFixUserVerification };