import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDocumentMeta, createAppTitle } from '../../hooks/useDocumentMeta';
import { useAuth } from '../../context/AuthContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, Plus, QrCode, BarChart3, Settings, MapPin, Users, Eye, ExternalLink, Sparkles, Globe, EyeOff } from 'lucide-react';
import Button from '../ui/Button';
import CreateRestaurantModal from './CreateRestaurantModal';
import LoadingSpinner from '../ui/LoadingSpinner';
import AuthDebug from '../debug/AuthDebug';
import SmartDineLogo from '../ui/SmartDineLogo';
import PublishRestaurantButton from '../restaurant/PublishRestaurantButton';

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { state: authState, logout } = useAuth();
  const { state: restaurantState, fetchRestaurants } = useRestaurant();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const hasInitialized = useRef(false);

  // Set document title with user name
  const userName = authState.user?.name;
  const dashboardTitle = userName ? `${userName}'s Dashboard` : 'Dashboard';
  
  useDocumentMeta({
    title: createAppTitle(dashboardTitle),
    description: 'Manage your restaurants and digital menus with SmartDine'
  });

  useEffect(() => {
    // Only fetch restaurants when user is authenticated and not loading, and we haven't initialized yet
    if (authState.isAuthenticated && !authState.loading && !hasInitialized.current) {
      console.log('Dashboard: Auth state ready, fetching restaurants');
      hasInitialized.current = true;
      // Add a small delay to ensure token is available in axios interceptor
      setTimeout(() => {
        fetchRestaurants();
      }, 50);
    }
  }, [authState.isAuthenticated, authState.loading, fetchRestaurants]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (restaurantState.loading && restaurantState.restaurants.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="glass-effect dark:bg-gray-800/80 shadow-xl border-b border-red-100/50 dark:border-gray-700/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <SmartDineLogo size={48} className="hover-glow" />
              <div>
                <h1 className="text-2xl font-bold gradient-text dark:bg-gradient-to-r dark:from-red-400 dark:to-amber-400 dark:bg-clip-text dark:text-transparent">Smart Dine</h1>
                <p className="text-red-600/70 dark:text-red-400/70 transition-colors duration-300">Restaurant Management System</p>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/80 transition-colors duration-300">Crete</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                Welcome, <span className="font-medium text-gray-900 dark:text-gray-100">{authState.user?.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                icon={<LogOut size={16} />}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold gradient-text dark:bg-gradient-to-r dark:from-red-400 dark:to-amber-400 dark:bg-clip-text dark:text-transparent mb-2 float">
              Dashboard
            </h2>
            <p className="text-red-700/70 dark:text-red-400/70 transition-colors duration-300">
              Manage your restaurants and create beautiful digital menus.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="card dark:bg-gray-800/90 hover-lift hover-glow cursor-pointer transition-all duration-300"
              onClick={() => setShowCreateModal(true)}
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-xl shadow-lg">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">New Restaurant</h3>
                    <p className="text-sm text-red-600/60 dark:text-red-400/60 transition-colors duration-300">Create a new restaurant</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="card dark:bg-gray-800/90 hover-lift hover-glow cursor-pointer transition-all duration-300"
              onClick={() => {
                // TODO: Implement QR codes functionality
                console.log('QR Codes clicked - feature to be implemented');
              }}
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">QR Codes</h3>
                    <p className="text-sm text-amber-600/60 dark:text-amber-400/60 transition-colors duration-300">Generate QR codes</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="card dark:bg-gray-800/90 hover-lift hover-glow cursor-pointer transition-all duration-300"
              onClick={() => {
                // TODO: Implement Analytics functionality
                console.log('Analytics clicked - feature to be implemented');
              }}
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">Analytics</h3>
                    <p className="text-sm text-emerald-600/60 dark:text-emerald-400/60 transition-colors duration-300">View your stats</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="card dark:bg-gray-800/90 hover-lift hover-glow cursor-pointer transition-all duration-300"
              onClick={() => {
                // TODO: Implement Settings functionality
                console.log('Settings clicked - feature to be implemented');
              }}
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-slate-500 to-gray-600 rounded-xl shadow-lg">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">Settings</h3>
                    <p className="text-sm text-slate-600/60 dark:text-slate-400/60 transition-colors duration-300">Account settings</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Restaurants Section */}
          {restaurantState.restaurants.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="glass-card dark:bg-gray-800/80 p-12 text-center transition-all duration-300"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-red-200 to-amber-200 dark:from-red-800 dark:to-amber-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg float transition-colors duration-300">
                <Plus className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-2xl font-bold gradient-text dark:bg-gradient-to-r dark:from-red-400 dark:to-amber-400 dark:bg-clip-text dark:text-transparent mb-4">
                No restaurants yet
              </h3>
              <p className="text-red-700/60 dark:text-red-400/60 mb-8 text-lg transition-colors duration-300">
                Get started by creating your first restaurant and digital menu.
              </p>
              <Button 
                variant="primary" 
                size="lg" 
                icon={<Plus size={20} />}
                onClick={() => {
                  console.log('Create Your First Restaurant button clicked!');
                  setShowCreateModal(true);
                }}
                className="hover-lift btn-glow"
              >
                Create Your First Restaurant
              </Button>
            </motion.div>
          ) : (
            /* Restaurant Cards */
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold gradient-text dark:bg-gradient-to-r dark:from-red-400 dark:to-amber-400 dark:bg-clip-text dark:text-transparent">
                  Your Restaurants ({restaurantState.restaurants.length})
                </h3>
                <Button 
                  icon={<Plus size={20} />}
                  onClick={() => setShowCreateModal(true)}
                  className="hover-lift"
                >
                  Add Restaurant
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurantState.restaurants.map((restaurant, index) => (
                  <motion.div
                    key={restaurant._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300 group"
                  >
                    {/* Cover Image */}
                    <div className="h-48 bg-gradient-to-br from-primary-500 to-secondary-500 relative overflow-hidden">
                      {restaurant.coverImage ? (
                        <img
                          src={restaurant.coverImage}
                          alt={`${restaurant.name} cover`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-white text-center">
                            <MapPin size={32} className="mx-auto mb-2" />
                            <div className="text-lg font-medium">{restaurant.name}</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                          restaurant.isPublished 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          {restaurant.isPublished ? (
                            <><Globe size={12} /><span>Published</span></>
                          ) : (
                            <><EyeOff size={12} /><span>Draft</span></>
                          )}
                        </span>
                      </div>
                      
                      {/* Logo */}
                      {restaurant.logo && (
                        <div className="absolute bottom-4 left-4">
                          <img
                            src={restaurant.logo}
                            alt={`${restaurant.name} logo`}
                            className="w-12 h-12 rounded-lg bg-white p-1 shadow-lg"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Card Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {restaurant.name}
                          </h4>
                          {restaurant.description && (
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {restaurant.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Address */}
                      {(restaurant.address.city || restaurant.address.state) && (
                        <div className="flex items-center text-gray-500 text-sm mb-4">
                          <MapPin size={14} className="mr-2" />
                          <span>
                            {[restaurant.address.city, restaurant.address.state]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Eye size={14} className="mr-1" />
                          <span>{restaurant.stats?.totalMenuViews || 0} views</span>
                        </div>
                        <div className="flex items-center">
                          <QrCode size={14} className="mr-1" />
                          <span>{restaurant.stats?.totalQRScans || 0} scans</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="space-y-3">
                        {/* Primary Actions Row */}
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => navigate(`/restaurants/${restaurant._id}/menu`)}
                          >
                            Manage Menu
                          </Button>
                          <Button 
                            variant={restaurant.isPublished ? "primary" : "outline"}
                            size="sm" 
                            className="flex-1"
                            icon={<ExternalLink size={14} />}
                            disabled={!restaurant.isPublished}
                            onClick={() => {
                              if (!restaurant.isPublished) {
                                alert('Please publish your restaurant first to view the public menu.');
                                return;
                              }
                              try {
                                // Navigate to public menu view - opens in new tab
                                // Use restaurant ID for the public menu URL
                                const publicMenuUrl = `/menu/${restaurant._id}`;
                                console.log('Opening public menu:', publicMenuUrl);
                                window.open(publicMenuUrl, '_blank');
                              } catch (error) {
                                console.error('Failed to open public menu:', error);
                              }
                            }}
                            title={restaurant.isPublished ? "View public menu" : "Publish restaurant to enable public menu"}
                          >
                            View Menu
                          </Button>
                        </div>
                        
                        {/* Publication Status Row */}
                        <div className="flex space-x-2">
                          <PublishRestaurantButton 
                            restaurant={restaurant}
                            variant="primary"
                            size="sm"
                            className="flex-1"
                          />
                          {restaurant.isPublished && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-gray-500 hover:text-gray-700"
                              onClick={() => {
                                // Use restaurant ID for the public menu URL
                                const publicUrl = `${window.location.origin}/menu/${restaurant._id}`;
                                navigator.clipboard.writeText(publicUrl).then(() => {
                                  alert('Public menu URL copied to clipboard!');
                                }).catch(() => {
                                  alert(`Public menu URL: ${publicUrl}`);
                                });
                              }}
                              title="Copy public menu URL"
                            >
                              Copy Link
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* {process.env.NODE_ENV === 'development' && <AuthDebug />} */}
      
      {/* Create Restaurant Modal */}
      {showCreateModal && (
        <CreateRestaurantModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;