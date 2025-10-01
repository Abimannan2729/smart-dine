import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDocumentMeta, createAppTitle } from '../hooks/useDocumentMeta';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Star, 
  Search, 
  Filter, 
  Heart,
  Share,
  ArrowLeft,
  Flame,
  DollarSign,
  Eye,
  EyeOff,
  Loader,
  AlertCircle,
  Wifi,
  Globe
} from 'lucide-react';
import { demoMenu } from '../data/demoMenu';
import PublicMenu from '../components/public/PublicMenu';
import { DIETARY_TAGS } from '../types/menu';

const DemoMenuPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  console.log('DemoMenuPage component initialized with slug:', slug);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // For demo purposes, we'll show the demo menu
  if (slug === 'demo') {
    console.log('DemoMenuPage: Loading with slug:', slug);
    const menu = demoMenu;
    
    // Set document title and favicon for demo menu
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDocumentMeta({
      title: createAppTitle('Demo Menu'),
      favicon: menu.restaurant?.logo,
      description: menu.description || 'Demo digital menu experience'
    });
    
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

    return (
      <div className="min-h-screen bg-white">
        {/* Demo Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-center py-3">
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
                      <span className="text-white font-bold text-sm">MENU</span>
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
              </motion.div>
            </div>
          </div>
        </header>

        {/* Categories */}
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-8">
            {menu.categories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mb-12"
              >
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h2>
                    {category.description && (
                      <p className="text-gray-600">{category.description}</p>
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
                          className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          {/* Item Image */}
                          {item.image && (
                            <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                  {item.isPopular && (
                                    <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                                  )}
                                  {item.isFeatured && (
                                    <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                                      Featured
                                    </span>
                                  )}
                                </div>
                                
                                {item.description && (
                                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                                
                                {/* Meta Info */}
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  {item.preparationTime && (
                                    <div className="flex items-center">
                                      <Clock size={12} className="mr-1" />
                                      <span>{item.preparationTime}m</span>
                                    </div>
                                  )}
                                  {item.calories && <span>{item.calories} cal</span>}
                                  {item.dietaryTags && item.dietaryTags.length > 0 && (
                                    <span>{item.dietaryTags.slice(0, 3).map(tag => tag.icon).join(' ')}</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right ml-4">
                                {item.originalPrice && item.originalPrice > item.price && (
                                  <div className="text-sm text-gray-500 line-through">
                                    ${item.originalPrice.toFixed(2)}
                                  </div>
                                )}
                                <div className="text-xl font-bold text-gray-900 flex items-center">
                                  <DollarSign size={16} className="mr-1" />
                                  {item.price.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // For other routes, use the normal PublicMenu component
  return <PublicMenu />;
};

export default DemoMenuPage;