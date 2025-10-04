const axios = require('axios');

const API_BASE_URL = 'https://smart-dine-backend-1eyi.onrender.com/api';

async function checkRestaurant() {
  try {
    // Login first
    const authResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    const token = authResponse.data.token;
    
    // Get restaurants
    const restaurantsResponse = await axios.get(`${API_BASE_URL}/restaurants`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const restaurants = restaurantsResponse.data.data.restaurants;
    
    console.log('All restaurants:');
    restaurants.forEach((r, index) => {
      console.log(`${index + 1}. ID: ${r._id}`);
      console.log(`   Name: ${r.name}`);
      console.log(`   Slug: ${r.slug || 'No slug'}`);
      console.log(`   Is Published: ${r.isPublished}`);
      console.log(`   Is Active: ${r.isActive}`);
      console.log('---');
    });
    
    const targetRestaurant = restaurants.find(r => r._id === '68e132b424c5a62c18df97df');
    
    if (targetRestaurant) {
      console.log('Target restaurant found:');
      console.log('ID:', targetRestaurant._id);
      console.log('Name:', targetRestaurant.name);
      console.log('Slug:', targetRestaurant.slug);
      console.log('Is Published:', targetRestaurant.isPublished);
      console.log('Is Active:', targetRestaurant.isActive);
    } else {
      console.log('Target restaurant not found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkRestaurant();
