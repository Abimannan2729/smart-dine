import api from './api';
import {
  Menu,
  MenuCategory,
  MenuItem,
  CreateMenuRequest,
  UpdateMenuRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  ReorderCategoriesRequest,
  ReorderMenuItemsRequest,
  MenuResponse,
  MenusResponse,
  CategoryResponse,
  MenuItemResponse
} from '../types/menu';

class MenuService {

  // Menu operations
  async getMenus(restaurantId: string): Promise<Menu[]> {
    try {
      console.log('MenuService: Getting menus for restaurant:', restaurantId);
      const response = await api.get<{ success: boolean; data: Menu[] }>(`/restaurants/${restaurantId}/menus`);
      console.log('MenuService: getMenus response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('MenuService: getMenus error:', error);
      if ((error as any).response) {
        console.error('MenuService: getMenus error response data:', (error as any).response.data);
        console.error('MenuService: getMenus error response status:', (error as any).response.status);
      }
      throw error;
    }
  }

  async getMenu(menuId: string): Promise<Menu> {
    const response = await api.get<MenuResponse>(`/menus/${menuId}`);
    return response.data.data;
  }

  async createMenu(menuData: CreateMenuRequest): Promise<Menu> {
    const response = await api.post<MenuResponse>('/menus', menuData);
    return response.data.data;
  }

  async updateMenu(menuId: string, menuData: UpdateMenuRequest): Promise<Menu> {
    const response = await api.put<MenuResponse>(`/menus/${menuId}`, menuData);
    return response.data.data;
  }

  async deleteMenu(menuId: string): Promise<void> {
    await api.delete(`/menus/${menuId}`);
  }

  async toggleMenuStatus(menuId: string, isActive: boolean): Promise<Menu> {
    const response = await api.patch<MenuResponse>(`/menus/${menuId}/toggle-status`, { isActive });
    return response.data.data;
  }

  // Category operations
  async getCategories(menuId: string): Promise<MenuCategory[]> {
    const response = await api.get<{ success: boolean; data: MenuCategory[] }>(`/menus/${menuId}/categories`);
    return response.data.data;
  }

  async createCategory(categoryData: CreateCategoryRequest): Promise<MenuCategory> {
    // Extract restaurantId from the categoryData for the route
    const restaurantId = (categoryData as any).restaurantId || (categoryData as any).restaurant;
    const response = await api.post<CategoryResponse>(`/menus/restaurants/${restaurantId}/categories`, categoryData);
    return response.data.data;
  }

  async updateCategory(categoryId: string, categoryData: UpdateCategoryRequest): Promise<MenuCategory> {
    const response = await api.put<CategoryResponse>(`/menus/categories/${categoryId}`, categoryData);
    return response.data.data;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await api.delete(`/menus/categories/${categoryId}`);
  }

  async reorderCategories(reorderData: ReorderCategoriesRequest): Promise<MenuCategory[]> {
    const response = await api.put<{ success: boolean; data: MenuCategory[] }>('/categories/reorder', reorderData);
    return response.data.data;
  }

  // Menu item operations
  async getMenuItems(restaurantId: string, categoryId?: string): Promise<MenuItem[]> {
    const url = `/menus/restaurants/${restaurantId}/items${categoryId ? `?category=${categoryId}` : ''}`;
    const response = await api.get<{ success: boolean; data: { menuItems: MenuItem[] } }>(url);
    return response.data.data.menuItems;
  }

  async getMenuItem(itemId: string): Promise<MenuItem> {
    const response = await api.get<{ success: boolean; data: { menuItem: MenuItem } }>(`/menus/items/${itemId}`);
    return response.data.data.menuItem;
  }

  async createMenuItem(itemData: CreateMenuItemRequest): Promise<MenuItem> {
    try {
      // Extract restaurant ID from item data
      const restaurantId = (itemData as any).restaurantId;
      console.log('MenuService: Creating menu item for restaurant:', restaurantId);
      console.log('MenuService: Item data:', itemData);
      
      if (!restaurantId) {
        throw new Error('Restaurant ID is required for creating menu items');
      }

      // Create FormData for file upload support
      const formData = new FormData();
      
      // Map frontend fields to backend expected fields
      const fieldMapping = {
        categoryId: 'category', // Backend expects 'category' not 'categoryId'
        dietaryTags: 'dietary', // Backend expects 'dietary' not 'dietaryTags'
      };
      
      // Add basic fields with proper mapping
      Object.entries(itemData).forEach(([key, value]) => {
        if (key === 'images' || key === 'restaurantId') return; // Handle separately
        if (value !== undefined && value !== null) {
          // Use mapped field name if it exists, otherwise use original
          const backendKey = fieldMapping[key as keyof typeof fieldMapping] || key;
          
          if (Array.isArray(value)) {
            formData.append(backendKey, JSON.stringify(value));
          } else {
            formData.append(backendKey, value.toString());
          }
        }
      });

      // Add images if present
      if ((itemData as any).images) {
        const images = (itemData as any).images;
        if (Array.isArray(images)) {
          images.forEach((image: File) => {
            formData.append('images', image);
          });
        }
      }

      // Debug: log FormData contents
      console.log('MenuService: FormData contents:');
      const entries = Array.from(formData.entries());
      entries.forEach(([key, value]) => {
        console.log(`  ${key}:`, typeof value === 'object' ? value.constructor.name : value);
      });

      console.log('MenuService: Sending POST to:', `/menus/restaurants/${restaurantId}/items`);
      const response = await api.post<{ success: boolean; data: { menuItem: MenuItem } }>(`/menus/restaurants/${restaurantId}/items`, formData);
      console.log('MenuService: createMenuItem response:', response.data);
      return response.data.data.menuItem;
    } catch (error) {
      console.error('MenuService: createMenuItem error:', error);
      if ((error as any).response) {
        console.error('MenuService: Error response data:', (error as any).response.data);
        console.error('MenuService: Error response status:', (error as any).response.status);
      }
      throw error;
    }
  }

  async updateMenuItem(itemId: string, itemData: UpdateMenuItemRequest): Promise<MenuItem> {
    // Create FormData for file upload support
    const formData = new FormData();
    
    // Add basic fields
    Object.entries(itemData).forEach(([key, value]) => {
      if (key === 'images') return; // Handle separately
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add images if present
    if ((itemData as any).images) {
      const images = (itemData as any).images;
      if (Array.isArray(images)) {
        images.forEach((image: File) => {
          formData.append('images', image);
        });
      }
    }

    const response = await api.put<{ success: boolean; data: { menuItem: MenuItem } }>(`/menus/items/${itemId}`, formData);
    return response.data.data.menuItem;
  }

  async deleteMenuItem(itemId: string): Promise<void> {
    await api.delete(`/menus/items/${itemId}`);
  }

  async toggleMenuItemAvailability(itemId: string, isAvailable: boolean): Promise<MenuItem> {
    const response = await api.patch<MenuItemResponse>(`/menu-items/${itemId}/toggle-availability`, { isAvailable });
    return response.data.data;
  }

  async reorderMenuItems(reorderData: ReorderMenuItemsRequest): Promise<MenuItem[]> {
    const response = await api.put<{ success: boolean; data: MenuItem[] }>('/menu-items/reorder', reorderData);
    return response.data.data;
  }

  // Bulk operations
  async duplicateMenu(menuId: string, newName: string): Promise<Menu> {
    const response = await api.post<MenuResponse>(`/menus/${menuId}/duplicate`, { name: newName });
    return response.data.data;
  }

  async importMenuFromTemplate(restaurantId: string, templateId: string): Promise<Menu> {
    const response = await api.post<MenuResponse>('/menus/import-template', { restaurantId, templateId });
    return response.data.data;
  }

  async exportMenu(menuId: string, format: 'json' | 'pdf' | 'csv'): Promise<Blob> {
    const response = await api.get(`/menus/${menuId}/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Image upload
  async uploadImage(file: File): Promise<string> {
    console.log('MenuService: uploadImage called with file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    const formData = new FormData();
    formData.append('image', file);
    
    // Debug FormData contents
    console.log('MenuService: FormData entries:');
    // Use Array.from to avoid TypeScript iteration issues
    const entries = Array.from(formData.entries());
    entries.forEach(([key, value]) => {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
    });

    console.log('MenuService: Sending POST to /upload/image');
    const response = await api.post<{ success: boolean; data: { url: string } }>('/upload/image', formData);
    console.log('MenuService: Upload response:', response.data);
    return response.data.data.url;
  }

  // Search and filter
  async searchMenuItems(menuId: string, query: string): Promise<MenuItem[]> {
    const response = await api.get<{ success: boolean; data: MenuItem[] }>(
      `/menus/${menuId}/search?q=${encodeURIComponent(query)}`
    );
    return response.data.data;
  }

  async getMenuItemsByTag(menuId: string, tagId: string): Promise<MenuItem[]> {
    const response = await api.get<{ success: boolean; data: MenuItem[] }>(
      `/menus/${menuId}/items-by-tag/${tagId}`
    );
    return response.data.data;
  }

  // Analytics
  async getMenuAnalytics(menuId: string, period: '7d' | '30d' | '90d' = '30d') {
    const response = await api.get<{ success: boolean; data: any }>(
      `/menus/${menuId}/analytics?period=${period}`
    );
    return response.data.data;
  }

  async trackMenuView(menuId: string): Promise<void> {
    await api.post(`/menus/${menuId}/track-view`);
  }

  // QR Code generation
  async generateQRCode(menuId: string, size: number = 256): Promise<string> {
    const response = await api.get<{ success: boolean; data: { qrCode: string } }>(
      `/menus/${menuId}/qr-code?size=${size}`
    );
    return response.data.data.qrCode;
  }

  // Public menu access (no auth required)
  async getPublicMenu(restaurantId: string): Promise<Menu> {
    const response = await api.get<{ success: boolean; data: Menu }>(`/menus/public/restaurant/${restaurantId}`);
    return response.data.data;
  }
}

export const menuService = new MenuService();
export default menuService;