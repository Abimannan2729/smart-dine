const cloudinary = require('cloudinary').v2;

// Test Cloudinary configuration
async function testCloudinary() {
  console.log('🧪 Testing Cloudinary Configuration');
  console.log('=====================================');

  // Check environment variables
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log('Environment Variables:');
  console.log(`  CLOUDINARY_CLOUD_NAME: ${cloudName ? 'Set' : 'Not Set'}`);
  console.log(`  CLOUDINARY_API_KEY: ${apiKey ? 'Set' : 'Not Set'}`);
  console.log(`  CLOUDINARY_API_SECRET: ${apiSecret ? 'Set' : 'Not Set'}`);

  if (!cloudName || !apiKey || !apiSecret) {
    console.log('\n❌ Cloudinary credentials not properly configured');
    console.log('Please set the following environment variables:');
    console.log('  - CLOUDINARY_CLOUD_NAME');
    console.log('  - CLOUDINARY_API_KEY');
    console.log('  - CLOUDINARY_API_SECRET');
    process.exit(1);
  }

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });

  try {
    // Test Cloudinary connection
    console.log('\n🔗 Testing Cloudinary connection...');
    const result = await cloudinary.api.ping();
    
    if (result.status === 'ok') {
      console.log('✅ Cloudinary connection successful');
      console.log(`   Status: ${result.status}`);
    } else {
      console.log('❌ Cloudinary connection failed');
      console.log(`   Status: ${result.status}`);
      process.exit(1);
    }

    // Test upload capabilities (with a simple test image)
    console.log('\n📤 Testing upload capabilities...');
    const uploadResult = await cloudinary.uploader.upload(
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwN2JmZiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRlc3Q8L3RleHQ+PC9zdmc+',
      {
        folder: 'smart-dine/test',
        public_id: 'test-upload-' + Date.now(),
        overwrite: true
      }
    );

    if (uploadResult.secure_url) {
      console.log('✅ Upload test successful');
      console.log(`   URL: ${uploadResult.secure_url}`);
      console.log(`   Public ID: ${uploadResult.public_id}`);
      
      // Clean up test image
      console.log('\n🧹 Cleaning up test image...');
      const deleteResult = await cloudinary.uploader.destroy(uploadResult.public_id);
      if (deleteResult.result === 'ok') {
        console.log('✅ Test image cleaned up successfully');
      } else {
        console.log('⚠️  Warning: Could not clean up test image');
      }
    } else {
      console.log('❌ Upload test failed');
      process.exit(1);
    }

    console.log('\n🎉 Cloudinary integration test completed successfully!');
    console.log('Your Cloudinary configuration is working properly.');

  } catch (error) {
    console.log('\n❌ Cloudinary test failed:');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('Invalid cloud name')) {
      console.log('\n💡 Tip: Check your CLOUDINARY_CLOUD_NAME');
    } else if (error.message.includes('Invalid API key')) {
      console.log('\n💡 Tip: Check your CLOUDINARY_API_KEY');
    } else if (error.message.includes('Invalid API secret')) {
      console.log('\n💡 Tip: Check your CLOUDINARY_API_SECRET');
    }
    
    process.exit(1);
  }
}

// Run the test
testCloudinary().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
