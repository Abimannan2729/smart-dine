#!/usr/bin/env node

/**
 * Quick CORS Test Script
 * Tests the backend CORS configuration locally
 */

const http = require('http');

const testCORS = (host, port, path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://smart-dine-frontend.onrender.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`\n🧪 CORS Test Results for ${host}:${port}${path}`);
      console.log(`Status: ${res.statusCode}`);
      console.log('Response Headers:');
      
      Object.keys(res.headers).forEach(key => {
        if (key.toLowerCase().includes('access-control')) {
          console.log(`  ${key}: ${res.headers[key]}`);
        }
      });

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ CORS preflight successful');
        } else {
          console.log('❌ CORS preflight failed');
        }
        resolve({ status: res.statusCode, headers: res.headers });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Connection failed: ${err.message}`);
      reject(err);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Request timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
};

// Test local backend if running
console.log('🚀 Testing CORS Configuration...');

testCORS('localhost', 5000, '/api/auth/register')
  .then(() => {
    console.log('\n✅ Local CORS test completed');
    console.log('\n💡 To test production:');
    console.log('   Replace localhost:5000 with your production backend URL');
    console.log('   Example: smart-dine-backend.onrender.com (port 443 for HTTPS)');
  })
  .catch((err) => {
    console.log('\n⚠️  Local backend not running or not accessible');
    console.log('   Start your backend with: cd backend && npm run dev');
    console.log('   Or test production URL instead');
  });