import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Clock, 
  Star,
  Flame,
  ArrowLeft,
  Search,
  Filter,
  Heart,
  Share,
  Download
} from 'lucide-react';
import { Menu, MenuCategory, MenuItem, DIETARY_TAGS } from '../../types/menu';
import { formatPrice, getCurrencySymbol } from '../../utils/currency';
import { useTheme } from '../../context/ThemeContext';
import ExportModal from './ExportModal';

interface MenuPreviewProps {
  menu: Menu;
  isOpen: boolean;
  onClose: () => void;
  themeSettings?: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    layout: 'grid' | 'list' | 'card';
  };
}

type DeviceType = 'mobile' | 'tablet' | 'desktop';

const MenuPreview: React.FC<MenuPreviewProps> = ({ menu, isOpen, onClose, themeSettings }) => {
  const { theme: darkModeTheme } = useTheme();
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('mobile');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Default theme settings
  const menuTheme = themeSettings || {
    primaryColor: '#dc2626',
    secondaryColor: '#f97316',
    fontFamily: 'Inter',
    layout: 'grid' as const
  };

  const devices = [
    { id: 'mobile' as const, icon: Smartphone, label: 'Mobile', width: 375, height: 667 },
    { id: 'tablet' as const, icon: Tablet, label: 'Tablet', width: 768, height: 1024 },
    { id: 'desktop' as const, icon: Monitor, label: 'Desktop', width: 1200, height: 800 },
  ];

  const currentDevice = devices.find(d => d.id === selectedDevice) || devices[0];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-2xl w-full max-w-7xl h-full max-h-[90vh] overflow-hidden transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/5 to-secondary-50/5 dark:from-primary-900/5 dark:to-secondary-900/5 rounded-xl" />
        {/* Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Menu Preview</h2>
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">See how your menu looks to customers</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Device Selector */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 transition-colors duration-300">
              {devices.map((device) => {
                const Icon = device.icon;
                return (
                  <button
                    key={device.id}
                    onClick={() => setSelectedDevice(device.id)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                      selectedDevice === device.id
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={16} className="mr-2" />
                    {device.label}
                  </button>
                );
              })}
            </div>
            
            {/* Export Button */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center px-3 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-300"
              title="Export menu"
            >
              <Download size={16} className="mr-2" />
              Export
            </button>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-300"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="relative flex-1 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/10 to-secondary-50/10 dark:from-primary-900/10 dark:to-secondary-900/10" />
          <div className="relative z-10">
            {/* Device Frame */}
            <div
              className="bg-gradient-to-br from-black to-gray-800 dark:from-gray-800 dark:to-gray-600 rounded-3xl p-2 shadow-2xl transition-all duration-300"
              style={{
                width: currentDevice.width * 0.8 + 16,
                height: currentDevice.height * 0.8 + 16,
              }}
            >
              <div
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl overflow-hidden relative transition-all duration-300"
                style={{
                  width: currentDevice.width * 0.8,
                  height: currentDevice.height * 0.8,
                }}
              >
                {/* Mobile Status Bar (for mobile only) */}
                {selectedDevice === 'mobile' && (
                  <div className="bg-gray-900 text-white px-4 py-2 text-xs flex justify-between items-center">
                    <span>9:41</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-2 bg-white rounded-full opacity-60" />
                      <div className="w-4 h-2 bg-white rounded-full opacity-80" />
                      <div className="w-4 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                )}

                {/* Menu Content */}
                <div className="h-full overflow-y-auto custom-scrollbar">
                  {!selectedCategory ? (
                    <MenuCategoriesView 
                      menu={menu} 
                      onCategorySelect={handleCategorySelect}
                      deviceType={selectedDevice}
                      theme={menuTheme}
                    />
                  ) : (
                    <CategoryItemsView 
                      menu={menu}
                      categoryId={selectedCategory}
                      onBack={() => setSelectedCategory(null)}
                      deviceType={selectedDevice}
                      theme={menuTheme}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Device Info */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                {currentDevice.width} × {currentDevice.height}px
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        menu={menu}
      />
    </div>
  );
};

// Menu Categories View
interface MenuCategoriesViewProps {
  menu: Menu;
  onCategorySelect: (categoryId: string) => void;
  deviceType: DeviceType;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    layout: 'grid' | 'list' | 'card';
  };
}

// Helper function to render menu content
const renderMenuContent = (menu: Menu, deviceType: DeviceType, onCategorySelect: (categoryId: string) => void, menuTheme: any) => {
  if (menu.categories.length === 0) {
    return renderSampleMenu(deviceType, menuTheme);
  }

  return (
    <div className="space-y-6">
      {menu.categories.map((category, categoryIndex) => (
        <motion.div
          key={category._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categoryIndex * 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Category Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
                {category.description && (
                  <p className="text-gray-600 text-sm">{category.description}</p>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {category.items?.length || 0} items
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-4">
            {(!category.items || category.items.length === 0) ? (
              renderSampleCategoryItems(category.name, deviceType, menuTheme)
            ) : (
              <div className="grid gap-4 grid-cols-1">
                {category.items.filter(item => item.isAvailable).slice(0, 3).map((item, itemIndex) => (
                  renderPreviewMenuItem(item, itemIndex, deviceType, menuTheme)
                ))}
                {category.items.filter(item => item.isAvailable).length > 3 && (
                  <div className="text-center py-2">
                    <button 
                      onClick={() => onCategorySelect(category._id!)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View all {category.items.filter(item => item.isAvailable).length} items →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Helper functions for rendering components
const renderPreviewMenuItem = (item: MenuItem, index: number, deviceType: DeviceType, menuTheme: any) => {
  const getDietaryTagsDisplay = () => {
    if (!item.dietaryTags || !Array.isArray(item.dietaryTags)) {
      return '';
    }
    return item.dietaryTags.slice(0, 3).map(tag => {
      const tagId = typeof tag === 'string' ? tag : tag?.id || tag;
      const dietaryTag = DIETARY_TAGS.find(dt => dt.id === tagId);
      return dietaryTag ? dietaryTag.icon : '';
    }).join(' ');
  };

  const isCompact = deviceType === 'mobile';

  return (
    <motion.div
      key={item._id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      style={{ 
        borderLeft: `3px solid ${menuTheme.primaryColor}`,
        fontFamily: menuTheme.fontFamily 
      }}
    >
      {/* Item Image */}
      {item.image && (
        <div className={`${isCompact ? 'w-16 h-16' : 'w-20 h-20'} bg-gray-200 rounded-lg overflow-hidden flex-shrink-0`}>
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className={`font-medium text-gray-900 ${isCompact ? 'text-sm' : 'text-base'}`}>
                {item.name}
              </h4>
              {item.isPopular && (
                <Star size={12} className="text-yellow-500" fill="currentColor" />
              )}
            </div>

            {item.description && (
              <p className={`text-gray-600 line-clamp-2 ${isCompact ? 'text-xs mt-1' : 'text-sm mt-1'}`}>
                {item.description}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex items-center space-x-3 text-xs text-gray-500 mt-2">
              {item.preparationTime && (
                <div className="flex items-center">
                  <Clock size={10} className="mr-1" />
                  <span>{item.preparationTime}m</span>
                </div>
              )}
              
              {item.spicyLevel && item.spicyLevel > 0 && (
                <div className="flex items-center">
                  <Flame size={10} className="mr-1" />
                  <span>{'🌶️'.repeat(item.spicyLevel)}</span>
                </div>
              )}
              
              {item.calories && (
                <span>{item.calories} cal</span>
              )}
              
              {getDietaryTagsDisplay() && (
                <span>{getDietaryTagsDisplay()}</span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="text-right ml-3 flex-shrink-0">
            {item.originalPrice && item.originalPrice > item.price && (
              <div className="text-xs text-gray-500 line-through">
                {formatPrice(item.originalPrice)}
              </div>
            )}
            <div className={`font-bold text-gray-900 ${isCompact ? 'text-sm' : 'text-base'}`}>
              {formatPrice(item.price)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Sample menu rendering functions
const renderSampleMenu = (deviceType: DeviceType, menuTheme: any) => {
  const sampleCategories = [
    {
      name: "Appetizers",
      description: "Start your meal with our delicious appetizers",
      items: [
        {
          name: "Caesar Salad",
          description: "Fresh romaine lettuce with parmesan cheese and our signature caesar dressing",
          price: 950,
          preparationTime: 10,
          isPopular: true,
          calories: 280
        },
        {
          name: "Garlic Bread",
          description: "Freshly baked bread with garlic butter and herbs",
          price: 650,
          preparationTime: 5,
          calories: 220
        }
      ]
    },
    {
      name: "Main Course",
      description: "Our signature dishes and chef's specialties",
      items: [
        {
          name: "Grilled Salmon",
          description: "Fresh Atlantic salmon with lemon butter sauce and seasonal vegetables",
          price: 2200,
          preparationTime: 20,
          isFeatured: true,
          calories: 450
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sample Menu Preview</h3>
        <p className="text-gray-600 text-sm">This is how your menu will look to customers</p>
      </div>
      
      {sampleCategories.map((category, categoryIndex) => (
        <motion.div
          key={category.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categoryIndex * 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
              <span className="text-sm text-gray-500">
                {category.items.length} items
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid gap-4 grid-cols-1">
              {category.items.map((item, itemIndex) => (
                renderSampleMenuItem(item, itemIndex, deviceType, `${category.name}-${item.name}`, menuTheme)
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const renderSampleCategoryItems = (categoryName: string, deviceType: DeviceType, menuTheme: any) => {
  const getSampleItems = (category: string) => {
    const samples: { [key: string]: any[] } = {
      "Drinks": [
        {
          name: "Fresh Orange Juice",
          description: "Freshly squeezed orange juice",
          price: 350,
          calories: 110
        }
      ],
      "Appetizers": [
        {
          name: "Mozzarella Sticks",
          description: "Crispy mozzarella with marinara sauce",
          price: 750,
          preparationTime: 12,
          calories: 320
        }
      ],
      "Main Course": [
        {
          name: "Beef Burger",
          description: "Juicy beef patty with fresh vegetables",
          price: 1450,
          preparationTime: 15,
          isPopular: true,
          calories: 580
        }
      ]
    };
    
    return samples[category] || [
      {
        name: `Sample ${category} Item`,
        description: `Delicious ${category.toLowerCase()} item from our kitchen`,
        price: 1200,
        preparationTime: 15,
        calories: 350
      }
    ];
  };

  const sampleItems = getSampleItems(categoryName);

  return (
    <div className="space-y-3">
      <div className="text-center py-2 mb-3">
        <p className="text-gray-500 text-sm italic">Sample items for preview - Add your own items to see them here</p>
      </div>
      {sampleItems.map((item, index) => (
        renderSampleMenuItem(item, index, deviceType, `sample-${categoryName}-${index}`, menuTheme)
      ))}
    </div>
  );
};

const renderSampleMenuItem = (item: any, index: number, deviceType: DeviceType, key: string, menuTheme: any) => {
  const isCompact = deviceType === 'mobile';

  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg opacity-75"
      style={{ 
        borderLeft: `3px solid ${menuTheme.primaryColor}`,
        fontFamily: menuTheme.fontFamily 
      }}
    >
      <div 
        className={`${isCompact ? 'w-16 h-16' : 'w-20 h-20'} rounded-lg flex items-center justify-center flex-shrink-0`}
        style={{
          background: `linear-gradient(to bottom right, ${menuTheme.primaryColor}40, ${menuTheme.secondaryColor}40)`
        }}
      >
        <span className="text-2xl">🍽️</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className={`font-medium text-gray-900 ${isCompact ? 'text-sm' : 'text-base'}`}>
                {item.name}
              </h4>
              {item.isPopular && (
                <Star size={12} className="text-yellow-500" fill="currentColor" />
              )}
              {item.isFeatured && (
                <span className="px-2 py-0.5 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                  Featured
                </span>
              )}
            </div>
            {item.description && (
              <p className={`text-gray-600 line-clamp-2 ${isCompact ? 'text-xs mt-1' : 'text-sm mt-1'}`}>
                {item.description}
              </p>
            )}
            <div className="flex items-center space-x-3 text-xs text-gray-500 mt-2">
              {item.preparationTime && (
                <div className="flex items-center">
                  <Clock size={10} className="mr-1" />
                  <span>{item.preparationTime}m</span>
                </div>
              )}
              {item.calories && (
                <span>{item.calories} cal</span>
              )}
            </div>
          </div>
          <div className="text-right ml-3 flex-shrink-0">
            <div className={`font-bold text-gray-900 ${isCompact ? 'text-sm' : 'text-base'}`}>
              {formatPrice(item.price)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MenuCategoriesView: React.FC<MenuCategoriesViewProps> = ({ 
  menu, 
  onCategorySelect, 
  deviceType,
  theme: menuTheme 
}) => {
  const restaurant = menu.restaurant;

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-all duration-300">
      {/* Restaurant Header with Cover Image */}
      {restaurant?.coverImage && (
        <div 
          className="relative h-32 sm:h-40"
          style={{
            background: `linear-gradient(to bottom right, ${menuTheme.primaryColor}, ${menuTheme.secondaryColor})`
          }}
        >
          {restaurant.coverImage && (
            <img
              src={restaurant.coverImage}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          
          {/* Restaurant Logo */}
          {restaurant.logo && (
            <div className="absolute -bottom-6 left-4">
              <div className="w-12 h-12 rounded-full bg-white p-1 shadow-lg">
                <img
                  src={restaurant.logo}
                  alt={`${restaurant.name} logo`}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Restaurant Info Header */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 shadow-sm transition-all duration-300 border-b border-gray-100 dark:border-gray-700">
        <div className="p-4" style={{ paddingTop: restaurant?.coverImage ? '2rem' : '1rem' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">
                {restaurant?.name || menu.name}
              </h1>
              {(restaurant?.description || menu.description) && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 transition-colors duration-300">
                  {restaurant?.description || menu.description}
                </p>
              )}
              {restaurant?.cuisine && restaurant.cuisine.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {restaurant.cuisine.slice(0, 3).map((cuisineType, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: `${menuTheme.primaryColor}20`,
                        color: menuTheme.primaryColor,
                        fontFamily: menuTheme.fontFamily
                      }}
                    >
                      {cuisineType}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex space-x-2 ml-4">
              <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300">
                <Search size={16} className="text-gray-600 dark:text-gray-300" />
              </button>
              <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300">
                <Heart size={16} className="text-gray-600 dark:text-gray-300" />
              </button>
              <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300">
                <Share size={16} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
            <span>{menu.categories.length} Categories</span>
            <span>•</span>
            <span>{menu.categories.reduce((acc, cat) => acc + (cat.items?.length || 0), 0)} Items</span>
            <span>•</span>
            <span>Updated recently</span>
          </div>
        </div>
      </div>

      {/* Categories and Items Display */}
      <div className="p-4">
        {renderMenuContent(menu, deviceType, onCategorySelect, menuTheme)}
      </div>
    </div>
  );
};

// Category Items View
interface CategoryItemsViewProps {
  menu: Menu;
  categoryId: string;
  onBack: () => void;
  deviceType: DeviceType;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    layout: 'grid' | 'list' | 'card';
  };
}

const CategoryItemsView: React.FC<CategoryItemsViewProps> = ({ 
  menu, 
  categoryId, 
  onBack, 
  deviceType,
  theme 
}) => {
  const category = menu.categories.find(cat => cat._id === categoryId);
  
  if (!category) return null;

  return (
    <div className="min-h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-all duration-300 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{category.name}</h1>
              {category.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">{category.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
              {category.items?.length || 0} items
            </span>
            <button className="flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors duration-300">
              <Filter size={14} className="text-gray-600 dark:text-gray-300" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="p-4 space-y-4">
        {category.items?.map((item, index) => (
          <MenuItemCard 
            key={item._id}
            item={item}
            index={index}
            deviceType={deviceType}
          />
        ))}
        
        {(!category.items || category.items.length === 0) && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">🍽️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              No items in this category yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
              Items will appear here once they're added to this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Menu Item Card
interface MenuItemCardProps {
  item: MenuItem;
  index: number;
  deviceType: DeviceType;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, index, deviceType }) => {
  const getDietaryTagsDisplay = () => {
    if (!item.dietaryTags || !Array.isArray(item.dietaryTags)) {
      return '';
    }
    return item.dietaryTags.slice(0, 3).map(tag => {
      // Handle both string IDs and tag objects
      const tagId = typeof tag === 'string' ? tag : tag?.id || tag;
      const dietaryTag = DIETARY_TAGS.find(dt => dt.id === tagId);
      return dietaryTag ? dietaryTag.icon : '';
    }).join(' ');
  };

  const isCompact = deviceType === 'mobile';

  if (!item.isAvailable) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/30 transition-all duration-300"
    >
      <div className={`flex ${isCompact ? 'flex-col' : 'flex-row'}`}>
        {/* Item Image */}
        {item.image && (
          <div className={`${isCompact ? 'h-48 w-full' : 'w-32 h-32'} bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden transition-colors duration-300`}>
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Item Details */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                  {item.name}
                </h3>
                {item.isPopular && (
                  <Star size={16} className="text-yellow-500" fill="currentColor" />
                )}
                {item.isFeatured && (
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                    Featured
                  </span>
                )}
              </div>

              {item.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                {item.preparationTime && (
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>{item.preparationTime}m</span>
                  </div>
                )}
                
                {item.spicyLevel && item.spicyLevel > 0 && (
                  <div className="flex items-center">
                    <Flame size={14} className="mr-1" />
                    <span>{'🌶️'.repeat(item.spicyLevel)}</span>
                  </div>
                )}
                
                {item.calories && (
                  <span>{item.calories} cal</span>
                )}
              </div>

              {/* Dietary Tags */}
              {getDietaryTagsDisplay() && (
                <div className="mb-3">
                  <span className="text-sm">{getDietaryTagsDisplay()}</span>
                </div>
              )}

              {/* Ingredients */}
              {item.ingredients && item.ingredients.length > 0 && (
                <div className="text-xs text-gray-500 mb-2">
                  <span className="font-medium">Ingredients: </span>
                  <span>{item.ingredients.join(', ')}</span>
                </div>
              )}

              {/* Allergens */}
              {item.allergens && item.allergens.length > 0 && (
                <div className="text-xs text-red-600 mb-2">
                  <span className="font-medium">⚠️ Contains: </span>
                  <span>{item.allergens.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="text-right ml-4 flex-shrink-0">
              {item.originalPrice && item.originalPrice > item.price && (
                <div className="text-sm text-gray-500 line-through">
                  {formatPrice(item.originalPrice)}
                </div>
              )}
              <div className="text-xl font-bold text-gray-900">
                {formatPrice(item.price)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


export default MenuPreview;
