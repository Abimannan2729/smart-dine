// User and Authentication Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin';
  avatar?: string;
  phone?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// Restaurant Types
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface Contact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface OperatingHours {
  [key: string]: {
    open: string;
    close: string;
    isOpen: boolean;
  };
}

export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  layout: 'grid' | 'list' | 'card';
}

export interface QRCode {
  code: string;
  publicUrl: string;
  lastGenerated: string;
  scanCount: number;
}

export interface RestaurantStats {
  totalMenuViews: number;
  totalQRScans: number;
  lastViewedAt?: string;
}

export interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  owner: string | User;
  address: Address;
  contact: Contact;
  operatingHours: OperatingHours;
  logo?: string;
  coverImage?: string;
  cuisine: string[];
  features: string[];
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  theme: Theme;
  qrCode?: QRCode;
  stats: RestaurantStats;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  menuItemsCount?: number;
  categoriesCount?: number;
}

// Menu Types
export interface Category {
  _id: string;
  name: string;
  description?: string;
  restaurant: string | Restaurant;
  icon?: string;
  image?: string;
  order: number;
  isActive: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
  menuItemsCount?: number;
  menuItems?: MenuItem[];
}

export interface MenuItemImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface Customization {
  name: string;
  options: {
    name: string;
    price: number;
  }[];
  required: boolean;
  maxSelections: number;
}

export interface MenuItemStats {
  views: number;
  orders: number;
  lastOrderedAt?: string;
}

export interface Availability {
  days: string[];
  startTime?: string;
  endTime?: string;
}

export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  restaurant: string | Restaurant;
  category: string | Category;
  images: MenuItemImage[];
  ingredients: string[];
  allergens: string[];
  dietary: string[];
  nutritionalInfo?: NutritionalInfo;
  preparationTime?: number;
  spiceLevel: number;
  customizations: Customization[];
  order: number;
  isAvailable: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  tags: string[];
  stats: MenuItemStats;
  availability: Availability;
  createdAt: string;
  updatedAt: string;
  primaryImage?: MenuItemImage;
  discountPercentage?: number;
  isOnSale?: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  count?: number;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form Types
export interface RestaurantFormData {
  name: string;
  description?: string;
  address: Address;
  contact: Contact;
  operatingHours: OperatingHours;
  cuisine: string[];
  features: string[];
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  theme: Theme;
  logo?: File;
  coverImage?: File;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  icon?: string;
  image?: File;
  order: number;
  color: string;
}

export interface MenuItemFormData {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category: string;
  images?: File[];
  ingredients: string[];
  allergens: string[];
  dietary: string[];
  nutritionalInfo?: NutritionalInfo;
  preparationTime?: number;
  spiceLevel: number;
  customizations: Customization[];
  order: number;
  isPopular: boolean;
  isFeatured: boolean;
  tags: string[];
  availability: Availability;
}

// Analytics Types
export interface Analytics {
  totalViews: number;
  totalQRScans: number;
  totalCategories: number;
  totalMenuItems: number;
  popularItems: MenuItem[];
  categories: Category[];
  lastViewedAt?: string;
}

export interface QRAnalytics {
  totalScans: number;
  totalMenuViews: number;
  qrToViewRatio: string;
  lastGenerated?: string;
  lastViewed?: string;
  isGenerated: boolean;
  publicUrl: string;
}

// UI Types
export interface ToastOptions {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

// Filter and Search Types
export interface MenuFilters {
  category?: string;
  search?: string;
  sortBy?: string;
  priceRange?: [number, number];
  dietary?: string[];
  allergens?: string[];
}

export interface RestaurantFilters {
  cuisine?: string[];
  features?: string[];
  search?: string;
}

// Public Menu Types
export interface PublicRestaurant {
  name: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  theme: Theme;
  address: Address;
  contact: Contact;
  operatingHours: OperatingHours;
  cuisine: string[];
  features: string[];
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface PublicMenuData {
  restaurant: PublicRestaurant;
  categories: Category[];
}