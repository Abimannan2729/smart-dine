#!/usr/bin/env node

/**
 * Authentication Flow Test Script
 * Tests the complete auth flow to identify issues
 * 
 * Usage: node test-auth-flow.js
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_URL || 'https://smart-dine-backend-1eyi.onrender.com/api';
const TEST_USER = {
  name: 'Test User',
  email: `test-${Date.now()}@example.com`,
  password: 'testpassword123',
  phone: '1234567890'
};

console.log('🧪 Starting Authentication Flow Test');
console.log('🌐 API Base URL:', API_BASE_URL);
console.log('👤 Test User:', { ...TEST_USER, password: '[HIDDEN]' });

async function testAuthFlow() {
  try {
    // Step 1: Test Registration
    console.log('\n📝 Step 1: Testing Registration...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, TEST_USER, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Registration successful:', {
      status: registerResponse.status,
      success: registerResponse.data.success,
      hasToken: !!registerResponse.data.token,
      hasUser: !!registerResponse.data.data?.user,
      userVerified: registerResponse.data.data?.user?.isEmailVerified
    });
    
    const { token, user } = registerResponse.data.data;
    
    // Step 2: Test Profile Access with Registration Token
    console.log('\n👤 Step 2: Testing Profile Access with Registration Token...');
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Profile access successful:', {
      status: profileResponse.status,
      success: profileResponse.data.success,
      userEmail: profileResponse.data.data?.user?.email,
      userVerified: profileResponse.data.data?.user?.isEmailVerified
    });
    
    // Step 3: Test Login with Same Credentials
    console.log('\n🔐 Step 3: Testing Login with Same Credentials...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful:', {
      status: loginResponse.status,
      success: loginResponse.data.success,
      hasToken: !!loginResponse.data.token,
      hasUser: !!loginResponse.data.data?.user
    });
    
    // Step 4: Test Profile Access with Login Token
    console.log('\n👤 Step 4: Testing Profile Access with Login Token...');
    const loginToken = loginResponse.data.token;
    const profileResponse2 = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${loginToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Profile access with login token successful:', {
      status: profileResponse2.status,
      success: profileResponse2.data.success,
      userEmail: profileResponse2.data.data?.user?.email
    });
    
    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📋 Summary:');
    console.log('  ✅ Registration works');
    console.log('  ✅ Profile access after registration works');
    console.log('  ✅ Login works');
    console.log('  ✅ Profile access after login works');
    
  } catch (error) {
    console.error('\n❌ Authentication test failed:', {
      step: error.config?.url?.includes('register') ? 'Registration' :
            error.config?.url?.includes('login') ? 'Login' :
            error.config?.url?.includes('me') ? 'Profile Access' : 'Unknown',
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
    
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAuthFlow();