const axios = require('axios');

// Test configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';

async function testEndpoints() {
  console.log('🧪 Testing Smart Dine API Endpoints');
  console.log('=====================================');
  console.log(`API Base URL: ${API_BASE_URL}\n`);

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Helper function to run a test
  async function runTest(name, testFn) {
    try {
      console.log(`Testing: ${name}`);
      await testFn();
      console.log(`✅ PASSED: ${name}\n`);
      results.passed++;
      results.tests.push({ name, status: 'PASSED' });
    } catch (error) {
      console.log(`❌ FAILED: ${name}`);
      console.log(`   Error: ${error.message}\n`);
      results.failed++;
      results.tests.push({ name, status: 'FAILED', error: error.message });
    }
  }

  // Test 1: Health Check
  await runTest('Health Check', async () => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.status || response.data.status !== 'OK') {
      throw new Error('Health check did not return OK status');
    }
  });

  // Test 2: User Registration
  let authToken = null;
  await runTest('User Registration', async () => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: 'Test User',
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      confirmPassword: TEST_PASSWORD
    });
    
    if (response.status !== 201) {
      throw new Error(`Expected status 201, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Registration was not successful');
    }
    if (!response.data.token) {
      throw new Error('No token received from registration');
    }
    authToken = response.data.token;
  });

  // Test 3: User Login
  await runTest('User Login', async () => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Login was not successful');
    }
    if (!response.data.token) {
      throw new Error('No token received from login');
    }
    authToken = response.data.token;
  });

  // Test 4: Get Current User (Protected Route)
  await runTest('Get Current User (Protected Route)', async () => {
    if (!authToken) {
      throw new Error('No auth token available');
    }
    
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Get user was not successful');
    }
    if (!response.data.data || !response.data.data.user) {
      throw new Error('No user data received');
    }
  });

  // Test 5: Create Restaurant
  let restaurantId = null;
  await runTest('Create Restaurant', async () => {
    if (!authToken) {
      throw new Error('No auth token available');
    }
    
    const response = await axios.post(`${API_BASE_URL}/restaurants`, {
      name: 'Test Restaurant',
      description: 'A test restaurant for API testing',
      cuisine: ['Italian', 'Test'],
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'Test Country'
      },
      contact: {
        phone: '+1234567890',
        email: 'test@restaurant.com'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.status !== 201) {
      throw new Error(`Expected status 201, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Restaurant creation was not successful');
    }
    if (!response.data.data || !response.data.data.restaurant) {
      throw new Error('No restaurant data received');
    }
    restaurantId = response.data.data.restaurant._id;
  });

  // Test 6: Get Restaurants
  await runTest('Get Restaurants', async () => {
    if (!authToken) {
      throw new Error('No auth token available');
    }
    
    const response = await axios.get(`${API_BASE_URL}/restaurants`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Get restaurants was not successful');
    }
    if (!Array.isArray(response.data.data)) {
      throw new Error('Restaurants data is not an array');
    }
  });

  // Test 7: Public Menu Route (should work without auth)
  await runTest('Public Menu Route (No Auth)', async () => {
    if (!restaurantId) {
      throw new Error('No restaurant ID available');
    }
    
    const response = await axios.get(`${API_BASE_URL}/menus/public/restaurant/${restaurantId}`);
    
    // This might return 404 if no menu is published, which is expected
    if (response.status === 404) {
      console.log('   Note: Restaurant has no published menu (expected for new restaurant)');
      return;
    }
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200 or 404, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Public menu request was not successful');
    }
  });

  // Test 8: Demo Menu Route
  await runTest('Demo Menu Route', async () => {
    const response = await axios.get(`${API_BASE_URL}/menus/public/demo`);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Demo menu request was not successful');
    }
  });

  // Print Results
  console.log('=====================================');
  console.log('📊 TEST RESULTS');
  console.log('=====================================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.tests
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`   - ${test.name}: ${test.error}`);
      });
  }
  
  console.log('\n🎉 API endpoint testing completed!');
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the tests
testEndpoints().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
