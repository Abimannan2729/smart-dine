export interface MenuItem {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number; // For discounted items
  image?: string;
  category: string;
  isAvailable: boolean;
  dietaryTags: DietaryTag[];
  ingredients?: string[];
  allergens?: string[];
  preparationTime?: number; // in minutes
  calories?: number;
  spicyLevel?: 0 | 1 | 2 | 3; // 0 = not spicy, 3 = very spicy
  isPopular?: boolean;
  isFeatured?: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuCategory {
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  items?: MenuItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Menu {
  _id?: string;
  restaurantId?: string;
  name: string;
  description?: string;
  isActive: boolean;
  categories: MenuCategory[];
  restaurant?: {
    _id: string;
    name: string;
    description?: string;
    logo?: string;
    coverImage?: string;
    theme?: any;
    address?: any;
    contact?: any;
    operatingHours?: any;
    cuisine?: string[];
    features?: string[];
    socialMedia?: any;
  };
  settings?: MenuSettings;
  stats?: MenuStats;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuSettings {
  currency: string;
  showPrices: boolean;
  showImages: boolean;
  showDescriptions: boolean;
  showDietaryTags: boolean;
  showIngredients: boolean;
  showCalories: boolean;
  showPreparationTime: boolean;
  showSpicyLevel: boolean;
  allowCustomization: boolean;
  showAvailability: boolean;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    layout: 'grid' | 'list' | 'card';
  };
}

export interface MenuStats {
  totalViews: number;
  totalOrders: number;
  popularItems: string[]; // Array of item IDs
  averageViewTime: number; // in seconds
  lastViewedAt?: string;
}

export interface DietaryTag {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Pre-defined dietary tags
export const DIETARY_TAGS: DietaryTag[] = [
  { id: 'vegetarian', name: 'Vegetarian', icon: '🥬', color: 'green' },
  { id: 'vegan', name: 'Vegan', icon: '🌱', color: 'green' },
  { id: 'gluten-free', name: 'Gluten Free', icon: '🌾', color: 'amber' },
  { id: 'dairy-free', name: 'Dairy Free', icon: '🥛', color: 'blue' },
  { id: 'nut-free', name: 'Nut Free', icon: '🥜', color: 'orange' },
  { id: 'keto', name: 'Keto', icon: '🥑', color: 'purple' },
  { id: 'low-carb', name: 'Low Carb', icon: '🥒', color: 'emerald' },
  { id: 'high-protein', name: 'High Protein', icon: '💪', color: 'red' },
  { id: 'organic', name: 'Organic', icon: '🌿', color: 'green' },
  { id: 'spicy', name: 'Spicy', icon: '🌶️', color: 'red' },
];

// Form types for creating/editing
export interface CreateMenuRequest {
  name: string;
  description?: string;
  restaurantId: string;
  settings?: Partial<MenuSettings>;
}

export interface UpdateMenuRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
  settings?: Partial<MenuSettings>;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  image?: string;
  menuId: string;
  restaurantId: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CreateMenuItemRequest {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: File[]; // For file uploads
  categoryId: string;
  restaurantId: string;
  dietaryTags?: string[];
  ingredients?: string[];
  allergens?: string[];
  preparationTime?: number;
  calories?: number;
  spicyLevel?: 0 | 1 | 2 | 3;
  isPopular?: boolean;
  isFeatured?: boolean;
}

export interface UpdateMenuItemRequest {
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  images?: File[]; // For file uploads
  categoryId?: string;
  isAvailable?: boolean;
  dietaryTags?: string[];
  ingredients?: string[];
  allergens?: string[];
  preparationTime?: number;
  calories?: number;
  spicyLevel?: 0 | 1 | 2 | 3;
  isPopular?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

// Reorder types for drag and drop
export interface ReorderCategoriesRequest {
  menuId: string;
  categoryIds: string[];
}

export interface ReorderMenuItemsRequest {
  categoryId: string;
  itemIds: string[];
}

// API Response types
export interface MenuResponse {
  success: boolean;
  data: Menu;
  message?: string;
}

export interface MenusResponse {
  success: boolean;
  data: Menu[];
  message?: string;
}

export interface CategoryResponse {
  success: boolean;
  data: MenuCategory;
  message?: string;
}

export interface MenuItemResponse {
  success: boolean;
  data: MenuItem;
  message?: string;
}