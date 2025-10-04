const axios = require('axios');

const API_BASE_URL = 'https://smart-dine-backend-1eyi.onrender.com/api';

async function testRestaurantMenu() {
  console.log('🧪 Testing Restaurant Menu Access');
  console.log('=====================================');
  
  try {
    // Test 1: Get restaurants (with auth)
    console.log('\n1. Testing restaurants endpoint...');
    const authResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    const token = authResponse.data.token;
    console.log('✅ Login successful');
    
    const restaurantsResponse = await axios.get(`${API_BASE_URL}/restaurants`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Restaurants fetched:', restaurantsResponse.data.data.restaurants.length);
    
    if (restaurantsResponse.data.data.restaurants.length > 0) {
      const restaurant = restaurantsResponse.data.data.restaurants[0];
      console.log('Restaurant ID:', restaurant._id);
      console.log('Restaurant Name:', restaurant.name);
      console.log('Is Published:', restaurant.isPublished);
      
      // Publish the restaurant first
      if (!restaurant.isPublished) {
        console.log('\n1.5. Publishing restaurant...');
        try {
          await axios.put(`${API_BASE_URL}/restaurants/${restaurant._id}`, {
            isPublished: true
          }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log('✅ Restaurant published');
        } catch (error) {
          console.log('❌ Failed to publish restaurant:', error.response?.status, error.response?.data?.message);
        }
      }
      
      // Test 2: Try to get public menu for this restaurant
      console.log('\n2. Testing public menu for restaurant...');
      try {
        const menuResponse = await axios.get(`${API_BASE_URL}/menus/public/restaurant/${restaurant._id}`);
        console.log('✅ Public menu found:', menuResponse.data.success);
        console.log('Menu name:', menuResponse.data.data?.name);
        console.log('Categories count:', menuResponse.data.data?.categories?.length || 0);
      } catch (error) {
        console.log('❌ Public menu not found:', error.response?.status, error.response?.data?.message);
      }
      
      // Test 3: Try to get public menu by slug
      if (restaurant.slug) {
        console.log('\n3. Testing public menu by slug...');
        try {
          const menuResponse = await axios.get(`${API_BASE_URL}/menus/public/${restaurant.slug}`);
          console.log('✅ Public menu by slug found:', menuResponse.data.success);
        } catch (error) {
          console.log('❌ Public menu by slug not found:', error.response?.status, error.response?.data?.message);
        }
      }
    } else {
      console.log('❌ No restaurants found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRestaurantMenu();
