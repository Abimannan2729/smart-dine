import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Search, Heart, Share } from 'lucide-react';
import { demoMenu } from '../../data/demoMenu';
import { useDocumentMeta, createAppTitle } from '../../hooks/useDocumentMeta';
import { useTheme } from '../../context/ThemeContext';
import { DIETARY_TAGS } from '../../types/menu';
import { formatPrice } from '../../utils/currency';
import SmartDineLogo from '../ui/SmartDineLogo';
import { MapPin, Phone, Mail, Globe, ExternalLink, Navigation, Star, Facebook, Instagram, Twitter } from 'lucide-react';

const DemoMenu: React.FC = () => {
  const { theme } = useTheme();
  const menu = demoMenu;

  // Set document title and favicon for demo menu
  useDocumentMeta({
    title: createAppTitle('Demo Menu'),
    favicon: menu.restaurant?.logo,
    description: menu.description || 'Demo digital menu experience'
  });

  const getDietaryTagsDisplay = (item: any) => {
    if (!item.dietaryTags || !Array.isArray(item.dietaryTags)) {
      return '';
    }
    return item.dietaryTags.slice(0, 3).map((tag: any) => {
      const tagId = typeof tag === 'string' ? tag : tag?.id || tag;
      const dietaryTag = DIETARY_TAGS.find(dt => dt.id === tagId);
      return dietaryTag ? dietaryTag.icon : '';
    }).join(' ');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-700 dark:to-secondary-700 text-white text-center py-3">
        <div className="flex items-center justify-center space-x-2">
          <Eye size={16} />
          <span className="text-sm font-medium">Demo Menu - Experience SmartDine</span>
        </div>
      </div>
      
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
              
              <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
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
                  className="flex items-center px-6 py-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg"
                >
                  <Search size={18} className="mr-2" />
                  Search Menu
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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

      {/* Categories */}
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {menu.categories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="mb-12"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/50 overflow-hidden transition-all duration-300">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">{category.name}</h2>
                  {category.description && (
                    <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{category.description}</p>
                  )}
                </div>
                <div className="p-6">
                  <div className="grid gap-6">
                    {category.items?.filter(item => item.isAvailable).map((item, itemIndex) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: itemIndex * 0.05 }}
                        className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-300"
                      >
                        {/* Item Image */}
                        {item.image && (
                          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0 transition-colors duration-300">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">{item.name}</h3>
                              {getDietaryTagsDisplay(item) && (
                                <span className="text-lg">{getDietaryTagsDisplay(item)}</span>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <span className="text-xl font-bold text-primary-600 dark:text-primary-400 transition-colors duration-300">
                                {formatPrice(item.price)}
                              </span>
                            </div>
                          </div>
                          
                          {item.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 leading-relaxed transition-colors duration-300">{item.description}</p>
                          )}
                          
                          {item.ingredients && item.ingredients.length > 0 && (
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Ingredients:</span> {item.ingredients.join(', ')}
                            </div>
                          )}
                        </div>
                        
                        {/* Favorite Button */}
                        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                          <Heart size={18} className="text-gray-400 hover:text-red-500" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Restaurant Information Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
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
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Experience our carefully crafted menu through this Smart Dine demo. 
                Discover authentic flavors and exceptional dining in a modern digital format.
              </p>
              
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Demo Features</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-200 border border-gray-600">QR Menu</span>
                  <span className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-200 border border-gray-600">Mobile Optimized</span>
                  <span className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-200 border border-gray-600">Live Updates</span>
                </div>
              </div>
            </div>
            
            {/* Demo Information */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Demo Info</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Status</p>
                    <p className="text-white">Demo Mode Active</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Features</p>
                    <p className="text-white">Full Restaurant Experience</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Platform</p>
                    <p className="text-white">Smart Dine System</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Get Started */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Get Started</h4>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-4">
                  <h5 className="text-white font-semibold mb-2">Ready to create your menu?</h5>
                  <p className="text-orange-100 text-sm mb-3">
                    Join thousands of restaurants using Smart Dine for their digital menus.
                  </p>
                  <a
                    href="/register"
                    className="inline-block bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors"
                  >
                    Start Free Trial
                  </a>
                </div>
                
                <div className="text-sm text-gray-400 space-y-2">
                  <div className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>14-day free trial</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Setup in minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              
              {/* Demo Notice */}
              <div className="text-center md:text-left">
                <p className="text-amber-400 text-sm font-medium mb-1">
                  🎉 This is a demo menu showcasing Smart Dine capabilities
                </p>
                <p className="text-gray-400 text-xs">
                  Ready to create your own digital menu? Sign up for free!
                </p>
              </div>
              
              {/* Copyright & Branding */}
              <div className="text-center md:text-right">
                <p className="text-gray-400 text-sm mb-1">
                  © {new Date().getFullYear()} Smart Dine Demo. All rights reserved.
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

export default DemoMenu;
