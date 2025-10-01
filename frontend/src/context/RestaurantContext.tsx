import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Restaurant, RestaurantFormData } from '../types';
import { restaurantService } from '../services/restaurantService';
import toast from 'react-hot-toast';

interface RestaurantState {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  loading: boolean;
  error: string | null;
}

type RestaurantAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_RESTAURANTS'; payload: Restaurant[] }
  | { type: 'SET_SELECTED_RESTAURANT'; payload: Restaurant | null }
  | { type: 'ADD_RESTAURANT'; payload: Restaurant }
  | { type: 'UPDATE_RESTAURANT'; payload: Restaurant }
  | { type: 'REMOVE_RESTAURANT'; payload: string };

const initialState: RestaurantState = {
  restaurants: [],
  selectedRestaurant: null,
  loading: false,
  error: null,
};

const restaurantReducer = (state: RestaurantState, action: RestaurantAction): RestaurantState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_RESTAURANTS':
      return { ...state, restaurants: action.payload, loading: false, error: null };
    case 'SET_SELECTED_RESTAURANT':
      return { ...state, selectedRestaurant: action.payload };
    case 'ADD_RESTAURANT':
      return {
        ...state,
        restaurants: [...state.restaurants, action.payload],
        loading: false,
        error: null,
      };
    case 'UPDATE_RESTAURANT':
      return {
        ...state,
        restaurants: state.restaurants.map(restaurant =>
          restaurant._id === action.payload._id ? action.payload : restaurant
        ),
        selectedRestaurant: state.selectedRestaurant?._id === action.payload._id 
          ? action.payload 
          : state.selectedRestaurant,
        loading: false,
        error: null,
      };
    case 'REMOVE_RESTAURANT':
      return {
        ...state,
        restaurants: state.restaurants.filter(restaurant => restaurant._id !== action.payload),
        selectedRestaurant: state.selectedRestaurant?._id === action.payload 
          ? null 
          : state.selectedRestaurant,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

interface RestaurantContextType {
  state: RestaurantState;
  fetchRestaurants: () => Promise<void>;
  fetchRestaurant: (id: string) => Promise<void>;
  createRestaurant: (data: RestaurantFormData) => Promise<void>;
  updateRestaurant: (id: string, data: RestaurantFormData) => Promise<void>;
  deleteRestaurant: (id: string) => Promise<void>;
  togglePublishStatus: (id: string) => Promise<void>;
  selectRestaurant: (restaurant: Restaurant | null) => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

interface RestaurantProviderProps {
  children: ReactNode;
}

export const RestaurantProvider: React.FC<RestaurantProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(restaurantReducer, initialState);

  const fetchRestaurants = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await restaurantService.getRestaurants();
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_RESTAURANTS', payload: response.data.restaurants });
      } else {
        throw new Error(response.message || 'Failed to fetch restaurants');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch restaurants';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  const fetchRestaurant = async (id: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await restaurantService.getRestaurant(id);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_SELECTED_RESTAURANT', payload: response.data.restaurant });
      } else {
        throw new Error(response.message || 'Failed to fetch restaurant');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch restaurant';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  const createRestaurant = async (data: RestaurantFormData): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const formData = restaurantService.createFormData(data);
      const response = await restaurantService.createRestaurant(formData);
      
      if (response.success && response.data) {
        dispatch({ type: 'ADD_RESTAURANT', payload: response.data.restaurant });
        toast.success('Restaurant created successfully!');
      } else {
        throw new Error(response.message || 'Failed to create restaurant');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create restaurant';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateRestaurant = async (id: string, data: RestaurantFormData): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const formData = restaurantService.createFormData(data);
      const response = await restaurantService.updateRestaurant(id, formData);
      
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_RESTAURANT', payload: response.data.restaurant });
        toast.success('Restaurant updated successfully!');
      } else {
        throw new Error(response.message || 'Failed to update restaurant');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update restaurant';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  const deleteRestaurant = async (id: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await restaurantService.deleteRestaurant(id);
      
      if (response.success) {
        dispatch({ type: 'REMOVE_RESTAURANT', payload: id });
        toast.success('Restaurant deleted successfully!');
      } else {
        throw new Error(response.message || 'Failed to delete restaurant');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete restaurant';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  const togglePublishStatus = async (id: string): Promise<void> => {
    try {
      const response = await restaurantService.togglePublishStatus(id);
      
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_RESTAURANT', payload: response.data.restaurant });
        const status = response.data.restaurant.isPublished ? 'published' : 'unpublished';
        toast.success(`Restaurant ${status} successfully!`);
      } else {
        throw new Error(response.message || 'Failed to update restaurant status');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update restaurant status';
      toast.error(errorMessage);
      throw error;
    }
  };

  const selectRestaurant = (restaurant: Restaurant | null): void => {
    dispatch({ type: 'SET_SELECTED_RESTAURANT', payload: restaurant });
  };

  const contextValue: RestaurantContextType = {
    state,
    fetchRestaurants,
    fetchRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    togglePublishStatus,
    selectRestaurant,
  };

  return (
    <RestaurantContext.Provider value={contextValue}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = (): RestaurantContextType => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};