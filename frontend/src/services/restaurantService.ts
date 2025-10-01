import api from './api';
import { Restaurant, RestaurantFormData, ApiResponse } from '../types';

export const restaurantService = {
  // Get all restaurants for current user
  getRestaurants: async (): Promise<ApiResponse<{ restaurants: Restaurant[] }>> => {
    const response = await api.get('/restaurants');
    return response.data;
  },

  // Get single restaurant by ID
  getRestaurant: async (id: string): Promise<ApiResponse<{ restaurant: Restaurant }>> => {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  },

  // Create new restaurant
  createRestaurant: async (data: FormData): Promise<ApiResponse<{ restaurant: Restaurant }>> => {
    const response = await api.post('/restaurants', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update restaurant
  updateRestaurant: async (id: string, data: FormData): Promise<ApiResponse<{ restaurant: Restaurant }>> => {
    const response = await api.put(`/restaurants/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete restaurant
  deleteRestaurant: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/restaurants/${id}`);
    return response.data;
  },

  // Toggle restaurant published status
  togglePublishStatus: async (id: string): Promise<ApiResponse<{ restaurant: Restaurant }>> => {
    const response = await api.put(`/restaurants/${id}/toggle-publish`);
    return response.data;
  },

  // Get restaurant analytics
  getAnalytics: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/restaurants/${id}/analytics`);
    return response.data;
  },

  // Helper function to create FormData from restaurant data
  createFormData: (data: RestaurantFormData): FormData => {
    const formData = new FormData();

    // Basic fields
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);

    // Address
    if (data.address) {
      if (data.address.street) formData.append('address[street]', data.address.street);
      if (data.address.city) formData.append('address[city]', data.address.city);
      if (data.address.state) formData.append('address[state]', data.address.state);
      if (data.address.zipCode) formData.append('address[zipCode]', data.address.zipCode);
      if (data.address.country) formData.append('address[country]', data.address.country);
    }

    // Contact
    if (data.contact) {
      if (data.contact.phone) formData.append('contact[phone]', data.contact.phone);
      if (data.contact.email) formData.append('contact[email]', data.contact.email);
      if (data.contact.website) formData.append('contact[website]', data.contact.website);
    }

    // Operating Hours
    if (data.operatingHours) {
      Object.keys(data.operatingHours).forEach(day => {
        const hours = data.operatingHours[day];
        if (hours) {
          formData.append(`operatingHours[${day}][open]`, hours.open);
          formData.append(`operatingHours[${day}][close]`, hours.close);
          formData.append(`operatingHours[${day}][isOpen]`, hours.isOpen.toString());
        }
      });
    }

    // Cuisine (array)
    if (data.cuisine && data.cuisine.length > 0) {
      data.cuisine.forEach((cuisine, index) => {
        formData.append(`cuisine[${index}]`, cuisine);
      });
    }

    // Features (array)
    if (data.features && data.features.length > 0) {
      data.features.forEach((feature, index) => {
        formData.append(`features[${index}]`, feature);
      });
    }

    // Social Media
    if (data.socialMedia) {
      if (data.socialMedia.facebook) formData.append('socialMedia[facebook]', data.socialMedia.facebook);
      if (data.socialMedia.instagram) formData.append('socialMedia[instagram]', data.socialMedia.instagram);
      if (data.socialMedia.twitter) formData.append('socialMedia[twitter]', data.socialMedia.twitter);
    }

    // Theme
    if (data.theme) {
      if (data.theme.primaryColor) formData.append('theme[primaryColor]', data.theme.primaryColor);
      if (data.theme.secondaryColor) formData.append('theme[secondaryColor]', data.theme.secondaryColor);
      if (data.theme.fontFamily) formData.append('theme[fontFamily]', data.theme.fontFamily);
      if (data.theme.layout) formData.append('theme[layout]', data.theme.layout);
    }

    // Files
    if (data.logo) {
      formData.append('logo', data.logo);
    }
    if (data.coverImage) {
      formData.append('coverImage', data.coverImage);
    }

    return formData;
  }
};