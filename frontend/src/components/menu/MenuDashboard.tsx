import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Eye, 
  Edit2, 
  Settings,
  Download,
  Upload,
  BarChart3,
  QrCode,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Menu, MenuCategory, MenuItem } from '../../types/menu';
import { menuService } from '../../services/menuService';
import { useRestaurant } from '../../context/RestaurantContext';
import { useDocumentMeta, createAppTitle } from '../../hooks/useDocumentMeta';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import CategoryManager from './CategoryManager';
import MenuItemManager from './MenuItemManager';
import MenuPreview from './MenuPreview';
import QRCodeGenerator from './QRCodeGenerator';
import ExportModal from './ExportModal';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';
import notifications from '../../utils/notifications';
import { formatPrice } from '../../utils/currency';

interface MenuDashboardProps {
  restaurantId: string;
}

type ViewMode = 'grid' | 'list';
type ActiveTab = 'overview' | 'categories' | 'items' | 'settings' | 'analytics';

const MenuDashboard: React.FC<MenuDashboardProps> = ({ restaurantId }) => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const { state: restaurantState, fetchRestaurants } = useRestaurant();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    category: '',
    availability: 'all',
    priceRange: 'all',
    dietaryTags: [] as string[]
  });
  const [showPreview, setShowPreview] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [currentTheme, setCurrentTheme] = useState({
    primaryColor: '#dc2626',
    secondaryColor: '#f97316',
    fontFamily: 'Inter',
    layout: 'grid' as 'grid' | 'list' | 'card'
  });

  useEffect(() => {
    loadMenus();
  }, [restaurantId]);

  // Fetch restaurants if not already loaded
  useEffect(() => {
    if (restaurantState.restaurants.length === 0 && !restaurantState.loading) {
      fetchRestaurants();
    }
  }, [restaurantState.restaurants.length, restaurantState.loading, fetchRestaurants]);

  // Try to find restaurant from existing data in context
  const currentRestaurant = restaurantState.restaurants.find(r => r._id === restaurantId);

  // Set document title with restaurant name
  const restaurant = currentRestaurant || restaurantState.selectedRestaurant;
  // Try to get restaurant name from menu data if not available from context
  const restaurantName = restaurant?.name || selectedMenu?.restaurant?.name;
  const menuTitle = restaurantName ? `${restaurantName} - Menu Management` : 'Menu Management';
  
  useDocumentMeta({
    title: createAppTitle(menuTitle),
    favicon: restaurant?.logo || selectedMenu?.restaurant?.logo,
    description: `Manage menus and items for ${restaurantName || 'your restaurant'}`
  });

  const loadMenus = async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) {
        setLoading(true);
      }
      const menuData = await menuService.getMenus(restaurantId);
      setMenus(menuData);
      if (menuData.length > 0 && !selectedMenu) {
        setSelectedMenu(menuData[0]);
      }
    } catch (error) {
      console.error('Failed to load menus:', error);
    } finally {
      if (showLoadingSpinner) {
        setLoading(false);
      }
    }
  };

  const refreshMenuData = async () => {
    try {
      console.log('Refreshing menu data...');
      await loadMenus(false);
      notifications.success('Menu data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh menu data:', error);
      notifications.error('Failed to refresh menu data');
    }
  };

  const handleCategoriesUpdate = (updatedCategories: MenuCategory[]) => {
    if (!selectedMenu) return;
    
    const updatedMenu = {
      ...selectedMenu,
      categories: updatedCategories
    };
    
    setSelectedMenu(updatedMenu);
    setMenus(menus.map(menu => 
      menu._id === selectedMenu._id ? updatedMenu : menu
    ));
  };

  const handleMenuItemsUpdate = (categoryId: string, updatedItems: MenuItem[]) => {
    if (!selectedMenu) return;
    
    const updatedCategories = selectedMenu.categories.map(category => 
      category._id === categoryId 
        ? { ...category, items: updatedItems }
        : category
    );
    
    const updatedMenu = {
      ...selectedMenu,
      categories: updatedCategories
    };
    
    setSelectedMenu(updatedMenu);
    setMenus(menus.map(menu => 
      menu._id === selectedMenu._id ? updatedMenu : menu
    ));
  };

  const handleCreateMenu = async (menuData: { name: string; description?: string }) => {
    try {
      console.log('Creating menu:', menuData);
      const newMenu = await menuService.createMenu({
        name: menuData.name,
        description: menuData.description || '',
        restaurantId: restaurantId
      });
      
      setMenus([...menus, newMenu]);
      setSelectedMenu(newMenu);
      setShowCreateMenu(false);
      setActiveTab('categories'); // Switch to categories tab to start adding categories
    } catch (error) {
      console.error('Failed to create menu:', error);
      alert('Failed to create menu. Please try again.');
    }
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'categories' as const, label: 'Categories', icon: Grid3X3 },
    { id: 'items' as const, label: 'Menu Items', icon: List },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
    { id: 'analytics' as const, label: 'Analytics', icon: TrendingUp },
  ];

  const getMenuStats = (menu: Menu | null) => {
    if (!menu) return { totalItems: 0, totalCategories: 0, activeItems: 0, avgPrice: 0 };
    
    const totalCategories = menu.categories.length;
    const allItems = menu.categories.flatMap(cat => cat.items || []);
    const totalItems = allItems.length;
    const activeItems = allItems.filter(item => item.isAvailable).length;
    const avgPrice = allItems.length > 0 
      ? allItems.reduce((sum, item) => sum + item.price, 0) / allItems.length 
      : 0;

    return { totalItems, totalCategories, activeItems, avgPrice };
  };

  const stats = getMenuStats(selectedMenu);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Menu Management</h1>
              {menus.length > 1 && (
                <select
                  value={selectedMenu?._id || ''}
                  onChange={(e) => setSelectedMenu(menus.find(m => m._id === e.target.value) || null)}
                  className="px-3 py-1 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {menus.map(menu => (
                    <option key={menu._id} value={menu._id}>
                      {menu.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                icon={<Upload size={16} />}
                onClick={refreshMenuData}
                title="Refresh menu data from server"
              >
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                icon={<Download size={16} />}
                onClick={() => {
                  if (activeTab === 'analytics') {
                    // For analytics tab, scroll to analytics export section
                    const analyticsExportButton = document.querySelector('[data-analytics-export]');
                    if (analyticsExportButton) {
                      (analyticsExportButton as HTMLButtonElement).click();
                    }
                  } else {
                    setShowExport(true);
                  }
                }}
                disabled={!selectedMenu}
              >
                {activeTab === 'analytics' ? 'Export Analytics' : 'Export Menu'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                icon={<QrCode size={16} />}
                onClick={() => setShowQRCode(true)}
              >
                QR Code
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                icon={<Eye size={16} />}
                onClick={() => setShowPreview(true)}
              >
                Preview
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                icon={<Plus size={16} />}
                onClick={() => {
                  console.log('Add Item button clicked!');
                  setActiveTab('items');
                }}
              >
                Add Item
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Menu Selector */}
              {menus.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No menus yet</h3>
                  <p className="text-xs text-gray-500 mb-4">Create your first menu to get started</p>
                  <Button 
                    size="sm" 
                    variant="primary"
                    onClick={() => {
                      console.log('Create Menu button clicked!');
                      setShowCreateMenu(true);
                    }}
                  >
                    Create Menu
                  </Button>
                </div>
              ) : (
                <>
                  {/* Quick Stats */}
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          console.log('Items stats clicked!');
                          setActiveTab('items');
                        }}
                        className="text-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        title="Click to view all menu items"
                      >
                        <div className="text-lg font-semibold text-red-600">{stats.totalItems}</div>
                        <div className="text-xs text-gray-500">Items</div>
                      </button>
                      <button
                        onClick={() => {
                          console.log('Categories stats clicked!');
                          setActiveTab('categories');
                        }}
                        className="text-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        title="Click to view and manage categories"
                      >
                        <div className="text-lg font-semibold text-orange-600">{stats.totalCategories}</div>
                        <div className="text-xs text-gray-500">Categories</div>
                      </button>
                      <button
                        onClick={() => {
                          console.log('Active items stats clicked!');
                          setActiveTab('items');
                        }}
                        className="text-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        title="Click to view active menu items"
                      >
                        <div className="text-lg font-semibold text-green-600">{stats.activeItems}</div>
                        <div className="text-xs text-gray-500">Active</div>
                      </button>
                      <button
                        onClick={() => {
                          console.log('Avg price stats clicked!');
                          setActiveTab('analytics');
                        }}
                        className="text-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        title="Click to view pricing analytics"
                      >
                        <div className="text-lg font-semibold text-yellow-600">{formatPrice(stats.avgPrice)}</div>
                        <div className="text-xs text-gray-500">Avg Price</div>
                      </button>
                    </div>
                  </div>

                  {/* Navigation Tabs */}
                  <nav className="flex flex-col">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            console.log('Switching to tab:', tab.id);
                            setActiveTab(tab.id);
                          }}
                          className={`flex items-center px-4 py-3 text-sm font-medium border-r-2 transition-colors duration-200 ${
                            activeTab === tab.id
                              ? 'bg-red-50 border-red-500 text-red-700'
                              : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <Icon size={16} className="mr-3" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>
                </>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {selectedMenu ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Debug current tab */}
                  <div style={{ display: 'none' }}>{(() => { console.log('Rendering tab:', activeTab); return null; })()}</div>
                  
                  {activeTab === 'overview' && (
                    <OverviewTab 
                      menu={selectedMenu} 
                      stats={stats} 
                      onSetActiveTab={setActiveTab}
                      onSetShowQRCode={setShowQRCode}
                      onSetShowExport={setShowExport}
                    />
                  )}
                  {activeTab === 'categories' && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Category Management</h2>
                      <CategoryManager 
                        menuId={selectedMenu._id!}
                        restaurantId={restaurantId}
                        categories={selectedMenu.categories}
                        onCategoriesUpdate={handleCategoriesUpdate}
                      />
                    </div>
                  )}
                  {activeTab === 'items' && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Menu Items</h2>
                      <MenuItemManager 
                        menuId={selectedMenu._id!}
                        restaurantId={restaurantId}
                        categories={selectedMenu.categories}
                        onMenuItemsUpdate={handleMenuItemsUpdate}
                      />
                    </div>
                  )}
                  {activeTab === 'settings' && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
                      <SettingsTab 
                        menu={selectedMenu} 
                        currentTheme={currentTheme}
                        onThemeChange={setCurrentTheme}
                      />
                    </div>
                  )}
                  {activeTab === 'analytics' && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics</h2>
                      <AnalyticsDashboard 
                        menu={selectedMenu} 
                        restaurantName={selectedMenu.name || 'Smart Dine Restaurant'}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No menu selected
                </h3>
                <p className="text-gray-500 mb-6">
                  Create your first menu to start managing your items and categories.
                </p>
                <Button 
                  variant="primary" 
                  size="lg" 
                  icon={<Plus size={20} />}
                  onClick={() => {
                    console.log('Create Your First Menu button clicked!');
                    setShowCreateMenu(true);
                  }}
                >
                  Create Your First Menu
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Menu Preview Modal */}
      {selectedMenu && (
        <MenuPreview
          menu={selectedMenu}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          themeSettings={currentTheme}
        />
      )}
      
      {/* QR Code Generator Modal */}
      {selectedMenu && (
        <QRCodeGenerator
          restaurant={(restaurant as any) || {
            _id: restaurantId,
            name: restaurantName || 'Restaurant Menu',
            description: 'Digital Menu',
            slug: restaurantId // Will use ID for now, QR generator will handle URL correctly
          }}
          isOpen={showQRCode}
          onClose={() => setShowQRCode(false)}
        />
      )}
      
      {/* Export Modal */}
      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        menu={selectedMenu}
      />
      
      {/* Create Menu Modal */}
      <CreateMenuModal
        isOpen={showCreateMenu}
        onClose={() => setShowCreateMenu(false)}
        onSubmit={handleCreateMenu}
      />
    </div>
  );
};

// Overview Tab Component
interface OverviewTabProps {
  menu: Menu;
  stats: any;
  onSetActiveTab: (tab: ActiveTab) => void;
  onSetShowQRCode: (show: boolean) => void;
  onSetShowExport: (show: boolean) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ menu, stats, onSetActiveTab, onSetShowQRCode, onSetShowExport }) => {
  const recentActivity = [
    { action: 'Added', item: 'Grilled Salmon', time: '2 hours ago', type: 'add' },
    { action: 'Updated', item: 'Caesar Salad', time: '4 hours ago', type: 'edit' },
    { action: 'Disabled', item: 'Soup of the Day', time: '1 day ago', type: 'disable' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg cursor-pointer hover:scale-105 transition-all duration-300"
          onClick={() => {
            console.log('Total Items card clicked!');
            onSetActiveTab('items');
          }}
          title="Click to view all menu items"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <List className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-2xl font-semibold text-gray-900">{stats.totalItems}</p>
              <p className="text-sm text-gray-500">Total Items</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg cursor-pointer hover:scale-105 transition-all duration-300"
          onClick={() => {
            console.log('Categories card clicked!');
            onSetActiveTab('categories');
          }}
          title="Click to view and manage categories"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Grid3X3 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCategories}</p>
              <p className="text-sm text-gray-500">Categories</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg cursor-pointer hover:scale-105 transition-all duration-300"
          onClick={() => {
            console.log('Avg Price card clicked!');
            onSetActiveTab('analytics');
          }}
          title="Click to view pricing analytics"
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-2xl font-semibold text-gray-900">{formatPrice(stats.avgPrice)}</p>
              <p className="text-sm text-gray-500">Avg Price</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg cursor-pointer hover:scale-105 transition-all duration-300"
          onClick={() => {
            console.log('Menu Views card clicked!');
            onSetActiveTab('analytics');
          }}
          title="Click to view analytics and statistics"
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-2xl font-semibold text-gray-900">{menu.stats?.totalViews || 0}</p>
              <p className="text-sm text-gray-500">Menu Views</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  activity.type === 'add' ? 'bg-green-500' :
                  activity.type === 'edit' ? 'bg-blue-500' : 'bg-red-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.action}</span> {activity.item}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              icon={<Plus size={16} />}
              onClick={() => onSetActiveTab('items')}
            >
              Add Item
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              icon={<Grid3X3 size={16} />}
              onClick={() => onSetActiveTab('categories')}
            >
              Add Category
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              icon={<Download size={16} />}
              onClick={() => onSetShowExport(true)}
            >
              Export Menu
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              icon={<QrCode size={16} />}
              onClick={() => onSetShowQRCode(true)}
            >
              Generate QR
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Settings Tab Component
interface MenuSettingsState {
  name: string;
  description: string;
  isActive: boolean;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    layout: 'grid' | 'list' | 'card';
  };
  visibility: {
    showPrices: boolean;
    showDescriptions: boolean;
    showImages: boolean;
    showNutrition: boolean;
    showAllergens: boolean;
    allowFavorites: boolean;
  };
  ordering: {
    enableOnlineOrdering: boolean;
    requirePhone: boolean;
    allowScheduling: boolean;
    deliveryRadius: number;
    minOrderAmount: number;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
}

interface SettingsTabProps {
  menu: Menu;
  currentTheme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    layout: 'grid' | 'list' | 'card';
  };
  onThemeChange: (theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    layout: 'grid' | 'list' | 'card';
  }) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ menu, currentTheme, onThemeChange }) => {
  const [menuSettings, setMenuSettings] = useState<MenuSettingsState>({
    name: menu.name || '',
    description: 'Digital menu for restaurant',
    isActive: menu.isActive ?? true,
    theme: currentTheme,
    visibility: {
      showPrices: true,
      showDescriptions: true,
      showImages: true,
      showNutrition: false,
      showAllergens: true,
      allowFavorites: true
    },
    ordering: {
      enableOnlineOrdering: false,
      requirePhone: false,
      allowScheduling: false,
      deliveryRadius: 5,
      minOrderAmount: 0
    },
    seo: {
      metaTitle: `${menu.name} - Digital Menu`,
      metaDescription: 'View our delicious menu items online',
      keywords: 'restaurant, menu, food, dining'
    }
  });

  const handleSaveSettings = () => {
    console.log('Saving menu settings:', menuSettings);
    // Apply theme to shared state so Preview reflects it
    onThemeChange(menuSettings.theme);
    // TODO: Persist to backend when API is ready
    try {
      notifications.success('Menu settings saved');
    } catch (e) {
      // Fallback toast if notifications util fails
      console.log('Settings saved');
    }
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Menu Name
            </label>
            <input
              type="text"
              value={menuSettings.name}
              onChange={(e) => setMenuSettings(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={menuSettings.isActive}
                onChange={(e) => setMenuSettings(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {menuSettings.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={menuSettings.description}
            onChange={(e) => setMenuSettings(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme & Appearance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <input
              type="color"
              value={menuSettings.theme.primaryColor}
              onChange={(e) => {
                const newTheme = { ...menuSettings.theme, primaryColor: e.target.value };
                setMenuSettings(prev => ({
                  ...prev,
                  theme: newTheme
                }));
              }}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <input
              type="color"
              value={menuSettings.theme.secondaryColor}
              onChange={(e) => {
                const newTheme = { ...menuSettings.theme, secondaryColor: e.target.value };
                setMenuSettings(prev => ({
                  ...prev,
                  theme: newTheme
                }));
              }}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Layout Style
            </label>
            <select
              value={menuSettings.theme.layout}
              onChange={(e) => {
                const newTheme = { ...menuSettings.theme, layout: e.target.value as 'grid' | 'list' | 'card' };
                setMenuSettings(prev => ({
                  ...prev,
                  theme: newTheme
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="grid">Grid</option>
              <option value="list">List</option>
              <option value="card">Card</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          variant="primary" 
          onClick={handleSaveSettings}
          icon={<Settings size={16} />}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
};

// Create Menu Modal Component
interface CreateMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string }) => void;
}

const CreateMenuModal: React.FC<CreateMenuModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleClose}></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Plus className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Create New Menu
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Menu Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Main Menu, Breakfast Menu"
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (Optional)
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description of your menu"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <Button
                type="submit"
                variant="primary"
                disabled={!name.trim() || loading}
                className="w-full sm:w-auto sm:ml-3"
              >
                {loading ? 'Creating...' : 'Create Menu'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="mt-3 w-full sm:mt-0 sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MenuDashboard;