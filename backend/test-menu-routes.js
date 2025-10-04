const express = require('express');
const menuRoutes = require('./routes/menu');

const app = express();

// Register menu routes
app.use('/api/menus', menuRoutes);

// Test the routes
app.listen(3001, () => {
  console.log('Test server running on port 3001');
  
  // Test the test route
  const http = require('http');
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/menus/test',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Response:', data);
      process.exit(0);
    });
  });
  
  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
    process.exit(1);
  });
  
  req.end();
});
