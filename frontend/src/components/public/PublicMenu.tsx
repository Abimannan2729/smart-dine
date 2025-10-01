import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDocumentMeta, createRestaurantTitle } from '../../hooks/useDocumentMeta';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Search, 
  Filter, 
  Heart,
  Share,
  ArrowLeft,
  Flame,
  Eye,
  EyeOff,
  Loader,
  AlertCircle,
  Wifi,
  Globe,
  Mail,
  Calendar,
  ExternalLink,
  Navigation,
  Info,
  Users,
  Award,
  Facebook,
  Instagram,
  Twitter
} from 'lucide-react';
import { Menu, MenuCategory, MenuItem, DIETARY_TAGS } from '../../types/menu';
import { menuService } from '../../services/menuService';
import LoadingSpinner from '../ui/LoadingSpinner';
import SmartDineLogo from '../ui/SmartDineLogo';
import { demoMenu } from '../../data/demoMenu';
import { formatPrice, getCurrencySymbol } from '../../utils/currency';

const PublicMenu: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  console.log('PublicMenu component initialized with slug:', slug);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Set document title and favicon when menu is loaded
  useDocumentMeta({
    title: menu ? createRestaurantTitle(menu.restaurant?.name || menu.name) : 'Loading Menu...',
    favicon: menu?.restaurant?.logo,
    description: menu?.description || `View the digital menu for ${menu?.restaurant?.name || 'this restaurant'}`
  });

  useEffect(() => {
    console.log('PublicMenu: useEffect called with slug:', slug);
    if (slug) {
      loadPublicMenu(slug);
    }
  }, [slug]);

  const loadPublicMenu = async (slugOrId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Handle demo case with static data
      if (slugOrId === 'demo') {
        console.log('PublicMenu: Loading demo menu data for slug:', slugOrId);
        setMenu(demoMenu);
        setLoading(false);
        return;
      }
      
      console.log('PublicMenu: Loading menu data for restaurant:', slugOrId);
      
      // Try to load restaurant menu data using the slug/ID
      // The backend should handle both restaurant slug and ID
      const menuData = await menuService.getPublicMenu(slugOrId);
      setMenu(menuData);
      
      // Track menu view using the same identifier
      menuService.trackMenuView(slugOrId).catch(console.error);
    } catch (error: any) {
      console.error('Failed to load public menu:', error);
      
      // Provide more specific error messages
      if (error.response?.status === 404) {
        setError('Restaurant not found or menu is not published.');
      } else if (error.response?.status === 403) {
        setError('This restaurant menu is not available to the public.');
      } else {
        setError('Menu not found or currently unavailable. Please check the URL and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleShare = async () => {
    if (navigator.share && menu) {
      try {
        await navigator.share({
          title: `${menu.name} Menu`,
          text: `Check out the menu for ${menu.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // You could show a toast here
      } catch (error) {
        console.error('Failed to copy URL:', error);
      }
    }
  };

  // Filter items based on search query
  const filteredItems = menu?.categories.flatMap(category => 
    (category.items || [])
      .filter(item => item.isAvailable)
      .filter(item => 
        !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(item => ({ ...item, categoryName: category.name }))
  ) || [];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Menu Not Available</h2>
          <p className="text-gray-600 mb-6">
            {error || 'The menu you\'re looking for could not be found.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Demo Banner - Show only for demo */}
      {slug === 'demo' && (
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-center py-3">
          <div className="flex items-center justify-center space-x-2">
            <Eye size={16} />
            <span className="text-sm font-medium">Demo Menu - Experience SmartDine</span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="text-white relative overflow-hidden min-h-[400px] flex items-center">
        {/* Background Image (Cover Image) */}
        {menu.restaurant?.coverImage ? (
          <div className="absolute inset-0">
            <img
              src={menu.restaurant.coverImage}
              alt={`${menu.restaurant.name} cover`}
              className="w-full h-full object-cover"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
          </div>
        ) : (
          /* Fallback gradient background */
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500" />
        )}
        
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border border-white/30 rounded-full" />
          <div className="absolute top-32 right-20 w-16 h-16 border border-white/20 rounded-full" />
          <div className="absolute bottom-20 left-1/4 w-12 h-12 border border-white/25 rounded-full" />
          <div className="absolute bottom-10 right-10 w-24 h-24 border border-white/15 rounded-full" />
        </div>
        
        <div className="relative z-10 px-4 py-12 w-full">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="inline-block mb-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto border-2 border-white/30 shadow-lg">
                  {menu.restaurant?.logo ? (
                    <img
                      src={menu.restaurant.logo}
                      alt={`${menu.restaurant.name} logo`}
                      className="w-12 h-12 object-contain rounded-full"
                    />
                  ) : (
                    <SmartDineLogo size={48} />
                  )}
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight text-shadow-lg">
                {menu.restaurant?.name || menu.name}
              </h1>
              {(menu.restaurant?.description || menu.description) && (
                <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto font-light">
                  {menu.restaurant?.description || menu.description}
                </p>
              )}
              
              {/* Restaurant Info */}
              {menu.restaurant?.cuisine && menu.restaurant.cuisine.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-center flex-wrap gap-2">
                    {menu.restaurant.cuisine.slice(0, 3).map((cuisine, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30"
                      >
                        {cuisine}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSearch(!showSearch)}
                  className="flex items-center px-6 py-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg"
                >
                  <Search size={18} className="mr-2" />
                  Search Menu
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="flex items-center px-6 py-3 bg-white text-orange-600 rounded-full hover:bg-white/90 transition-all duration-300 shadow-lg font-medium"
                >
                  <Share size={18} className="mr-2" />
                  Share Menu
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {searchQuery && (
                <div className="mt-2 text-sm text-gray-500">
                  Found {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {searchQuery ? (
          /* Search Results */
          <SearchResults 
            items={filteredItems}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            searchQuery={searchQuery}
          />
        ) : !selectedCategory ? (
          /* Categories Grid */
          <CategoriesGrid 
            categories={menu.categories}
            onCategorySelect={setSelectedCategory}
          />
        ) : (
          /* Category Items */
          <CategoryItems 
            menu={menu}
            categoryId={selectedCategory}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onBack={() => setSelectedCategory(null)}
          />
        )}
      </main>

      {/* Restaurant Information Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Restaurant Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <SmartDineLogo size={40} />
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {menu.restaurant?.name || menu.name}
                  </h3>
                  <p className="text-gray-400 text-sm">Digital Menu by Smart Dine</p>
                </div>
              </div>
              
              {(menu.restaurant?.description || menu.description) && (
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {menu.restaurant?.description || menu.description}
                </p>
              )}
              
              {/* Cuisine Tags */}
              {menu.restaurant?.cuisine && menu.restaurant.cuisine.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Cuisine</h4>
                  <div className="flex flex-wrap gap-2">
                    {menu.restaurant.cuisine.map((cuisine, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-200 border border-gray-600"
                      >
                        {cuisine}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Contact Information */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Contact Us</h4>
              <div className="space-y-4">
                {menu.restaurant?.contact?.phone && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide">Phone</p>
                      <a 
                        href={`tel:${menu.restaurant.contact.phone}`}
                        className="text-white hover:text-blue-400 transition-colors"
                      >
                        {menu.restaurant.contact.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {menu.restaurant?.contact?.email && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide">Email</p>
                      <a 
                        href={`mailto:${menu.restaurant.contact.email}`}
                        className="text-white hover:text-purple-400 transition-colors"
                      >
                        {menu.restaurant.contact.email}
                      </a>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
            
            {/* Location & Hours */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Visit Us</h4>
              <div className="space-y-4">
                
                {/* Address */}
                {menu.restaurant?.address && (
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <MapPin size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Address</p>
                      <div className="text-white leading-relaxed">
                        <p>{menu.restaurant.address.street}</p>
                        <p>
                          {menu.restaurant.address.city}
                          {menu.restaurant.address.state && `, ${menu.restaurant.address.state}`}
                          {menu.restaurant.address.zipCode && ` ${menu.restaurant.address.zipCode}`}
                        </p>
                        {menu.restaurant.address.country && (
                          <p className="text-gray-400">{menu.restaurant.address.country}</p>
                        )}
                      </div>
                      {/* Get Directions Link */}
                      {menu.restaurant.address && (
                        <a
                          href={`https://maps.google.com/maps?q=${encodeURIComponent(
                            `${menu.restaurant.address.street}, ${menu.restaurant.address.city}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center mt-2 text-red-400 hover:text-red-300 transition-colors text-sm"
                        >
                          <Navigation size={12} className="mr-1" />
                          Get Directions
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Business Hours */}
                {menu.restaurant?.operatingHours && Array.isArray(menu.restaurant.operatingHours) && menu.restaurant.operatingHours.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Clock size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Hours</p>
                      <div className="space-y-1 text-sm">
                        {menu.restaurant.operatingHours.map((hours: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-gray-300">{hours.day}</span>
                            <span className="text-white ml-4">
                              {hours.isOpen ? `${hours.openTime} - ${hours.closeTime}` : 'Closed'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Social Media & Bottom Section */}
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              
              {/* Social Media Links */}
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm mr-2">Follow us:</span>
                {menu.restaurant?.socialMedia?.facebook && (
                  <a
                    href={menu.restaurant.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Facebook size={16} className="text-white" />
                  </a>
                )}
                {menu.restaurant?.socialMedia?.instagram && (
                  <a
                    href={menu.restaurant.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-pink-600 hover:bg-pink-700 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Instagram size={16} className="text-white" />
                  </a>
                )}
                {menu.restaurant?.socialMedia?.twitter && (
                  <a
                    href={menu.restaurant.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-sky-600 hover:bg-sky-700 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Twitter size={16} className="text-white" />
                  </a>
                )}
              </div>
              
              {/* Copyright & Smart Dine Branding */}
              <div className="text-center md:text-right">
                <p className="text-gray-400 text-sm mb-1">
                  © {new Date().getFullYear()} {menu.restaurant?.name || menu.name}. All rights reserved.
                </p>
                <div className="flex items-center justify-center md:justify-end space-x-2 text-xs text-gray-500">
                  <span>Powered by</span>
                  <span className="font-semibold text-amber-400">Smart Dine Crete</span>
                  <span>•</span>
                  <span>Digital Menu Solution</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Search Results Component
interface SearchResultsProps {
  items: (MenuItem & { categoryName: string })[];
  favorites: string[];
  onToggleFavorite: (itemId: string) => void;
  searchQuery: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  items,
  favorites,
  onToggleFavorite,
  searchQuery,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Search Results for "{searchQuery}"
        </h2>
        <div className="text-sm text-gray-500">
          {items.length} result{items.length !== 1 ? 's' : ''}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Search size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600">Try searching with different keywords.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <PublicMenuItem
              key={item._id}
              item={item}
              index={index}
              isFavorite={favorites.includes(item._id!)}
              onToggleFavorite={() => onToggleFavorite(item._id!)}
              showCategory
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Categories Grid Component
interface CategoriesGridProps {
  categories: MenuCategory[];
  onCategorySelect: (categoryId: string) => void;
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories,
  onCategorySelect,
}) => {
  const activeCategories = categories.filter(cat => 
    cat.isActive && cat.items && cat.items.some(item => item.isAvailable)
  );

  if (activeCategories.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-gray-500 font-bold text-sm">MENU</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Menu Coming Soon!
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          We're working hard to bring you an amazing menu. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Browse Our Menu
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover delicious dishes crafted with love and the finest ingredients
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeCategories.map((category, index) => (
          <motion.div
            key={category._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            onClick={() => onCategorySelect(category._id!)}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group"
          >
            {/* Category Image */}
            <div className="h-56 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 relative overflow-hidden">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="flex items-center justify-center h-full relative">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="text-white text-center z-10">
                    <div className="text-3xl font-bold tracking-wide mb-2">{category.name}</div>
                    <div className="text-sm opacity-90">Category</div>
                  </div>
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-black/40 transition-colors duration-300" />
              
              {/* Item count badge */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                {category.items?.filter(item => item.isAvailable).length || 0} items
              </div>
            </div>

            {/* Category Info */}
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {category.description}
                </p>
              )}
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-500">
                  {category.items?.filter(item => item.isAvailable).length || 0} delicious options
                </span>
                <div className="flex items-center text-orange-600 font-semibold group-hover:text-orange-700 transition-colors">
                  <span className="mr-2">Explore</span>
                  <motion.div
                    className="transform group-hover:translate-x-1 transition-transform duration-300"
                  >
                    →
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Category Items Component
interface CategoryItemsProps {
  menu: Menu;
  categoryId: string;
  favorites: string[];
  onToggleFavorite: (itemId: string) => void;
  onBack: () => void;
}

const CategoryItems: React.FC<CategoryItemsProps> = ({
  menu,
  categoryId,
  favorites,
  onToggleFavorite,
  onBack,
}) => {
  const category = menu.categories.find(cat => cat._id === categoryId);
  
  if (!category) return null;

  const availableItems = category.items?.filter(item => item.isAvailable) || [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
          {category.description && (
            <p className="text-gray-600">{category.description}</p>
          )}
          <div className="text-sm text-gray-500 mt-1">
            {availableItems.length} item{availableItems.length !== 1 ? 's' : ''} available
          </div>
        </div>
      </div>

      {/* Items */}
      {availableItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🍽️</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No items available
          </h3>
          <p className="text-gray-600">
            Check back later for new items in this category.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {availableItems.map((item, index) => (
            <PublicMenuItem
              key={item._id}
              item={item}
              index={index}
              isFavorite={favorites.includes(item._id!)}
              onToggleFavorite={() => onToggleFavorite(item._id!)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Public Menu Item Component
interface PublicMenuItemProps {
  item: MenuItem & { categoryName?: string };
  index: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  showCategory?: boolean;
}

const PublicMenuItem: React.FC<PublicMenuItemProps> = ({
  item,
  index,
  isFavorite,
  onToggleFavorite,
  showCategory = false,
}) => {
  // Helper function to get image URL from item
  const getItemImageUrl = (item: MenuItem): string | null => {
    // First try the direct image field
    if (item.image && typeof item.image === 'string') {
      return item.image;
    }
    
    // Fallback to images array if available
    const itemWithImages = item as any;
    if (itemWithImages.images && Array.isArray(itemWithImages.images) && itemWithImages.images.length > 0) {
      const firstImage = itemWithImages.images[0];
      return typeof firstImage === 'string' ? firstImage : null;
    }
    
    return null;
  };

  const getDietaryTagsDisplay = () => {
    if (!item.dietaryTags || !Array.isArray(item.dietaryTags)) {
      return '';
    }
    return item.dietaryTags.slice(0, 4).map(tag => {
      // Handle both string IDs and tag objects
      const tagId = typeof tag === 'string' ? tag : tag?.id || tag;
      const dietaryTag = DIETARY_TAGS.find(dt => dt.id === tagId);
      return dietaryTag ? dietaryTag.icon : '';
    }).join(' ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="md:flex">
        {/* Item Image */}
        <div className="md:w-64 h-48 md:h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 overflow-hidden relative">
          {getItemImageUrl(item) ? (
            <img
              src={getItemImageUrl(item)!}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                console.log('PublicMenu: Image failed to load:', getItemImageUrl(item));
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full bg-gradient-to-br from-orange-100 to-red-100"><div class="text-center text-orange-600"><div class="text-2xl font-bold mb-1">No Image</div><div class="text-xs opacity-75">Available</div></div></div>';
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-100 to-red-100">
              <div className="text-center text-orange-600">
                <div className="text-2xl font-bold mb-1">No Image</div>
                <div className="text-xs opacity-75">Available</div>
              </div>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {item.isPopular && (
              <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                Popular
              </span>
            )}
            {item.isFeatured && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Item Details */}
        <div className="flex-1 p-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                  {item.name}
                </h3>
                <button
                  onClick={onToggleFavorite}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    isFavorite 
                      ? 'text-red-500 hover:text-red-600 bg-red-50' 
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>

              {showCategory && item.categoryName && (
                <div className="text-sm text-primary-600 font-medium mb-2">
                  {item.categoryName}
                </div>
              )}

              {item.description && (
                <p className="text-gray-600 mb-4 line-clamp-2">
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
                  <span className="text-lg">{getDietaryTagsDisplay()}</span>
                </div>
              )}

              {/* Ingredients */}
              {item.ingredients && item.ingredients.length > 0 && (
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Ingredients: </span>
                  <span>{item.ingredients.join(', ')}</span>
                </div>
              )}

              {/* Allergens */}
              {item.allergens && item.allergens.length > 0 && (
                <div className="text-sm text-red-600">
                  <span className="font-medium">⚠️ Contains: </span>
                  <span>{item.allergens.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="text-right ml-8 flex-shrink-0">
              {item.originalPrice && item.originalPrice > item.price && (
                <div className="text-sm text-gray-500 line-through mb-1">
                  {formatPrice(item.originalPrice)}
                </div>
              )}
              <div className="text-3xl font-bold text-orange-600">
                {formatPrice(item.price)}
              </div>
              {item.originalPrice && item.originalPrice > item.price && (
                <div className="text-xs text-green-600 font-medium mt-1">
                  Save {formatPrice(item.originalPrice - item.price)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PublicMenu;
