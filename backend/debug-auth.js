// Use built-in fetch for Node.js 18+
const BASE_URL = 'https://smart-dine-backend-1eyi.onrender.com/api';

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { error: error.message };
  }
}

async function debugAuth() {
  console.log('🔍 Debugging Smart Dine Authentication...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await makeRequest(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test 2: Login with empty body
    console.log('\n2. Testing login with empty body...');
    const emptyResponse = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    console.log('❌ Login empty body:', emptyResponse.status, emptyResponse.data);
    
    // Test 3: Login with missing password
    console.log('\n3. Testing login with missing password...');
    const missingPassResponse = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com' })
    });
    console.log('❌ Login missing password:', missingPassResponse.status, missingPassResponse.data);
    
    // Test 4: Login with invalid credentials (should be 401)
    console.log('\n4. Testing login with invalid credentials...');
    const invalidResponse = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@test.com',
        password: 'wrongpassword'
      })
    });
    console.log('❌ Login invalid credentials:', invalidResponse.status, invalidResponse.data);
    
    // Test 5: Register a test user first
    console.log('\n5. Testing user registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test User',
        email: 'testuser@smartdine.com',
        password: 'testpassword123',
        phone: '+1234567890'
      });
      console.log('✅ Registration successful:', {
        success: registerResponse.data.success,
        hasToken: !!registerResponse.data.token,
        hasUser: !!registerResponse.data.data?.user
      });
      
      // Test 6: Login with the registered user
      console.log('\n6. Testing login with registered user...');
      try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: 'testuser@smartdine.com',
          password: 'testpassword123'
        });
        console.log('✅ Login successful:', {
          success: loginResponse.data.success,
          hasToken: !!loginResponse.data.token,
          hasUser: !!loginResponse.data.data?.user
        });
      } catch (loginError) {
        console.log('❌ Login with registered user failed:', {
          status: loginError.response.status,
          error: loginError.response.data
        });
      }
      
    } catch (regError) {
      console.log('❌ Registration failed:', regError.response.status, regError.response.data);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

debugAuth();