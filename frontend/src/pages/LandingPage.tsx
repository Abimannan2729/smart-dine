import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentMeta, getAppName } from '../hooks/useDocumentMeta';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import {
  QrCode,
  Smartphone,
  BarChart3,
  Settings,
  Eye,
  Star,
  ArrowRight,
  CheckCircle,
  Play,
  Users,
  Clock,
  TrendingUp,
  Shield,
  Zap,
  Globe
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import MenuPreview from '../components/menu/MenuPreview';
import DemoQRCode from '../components/demo/DemoQRCode';
import SmartDineLogo from '../components/ui/SmartDineLogo';
import { demoMenu } from '../data/demoMenu';

const LandingPage: React.FC = () => {
  const { theme } = useTheme();
  const [showDemoPreview, setShowDemoPreview] = useState(false);

  // Set document title and favicon
  useDocumentMeta({
    title: getAppName(),
    description: 'Transform your restaurant with digital menus. Create beautiful, contactless dining experiences with QR code menus.'
  });

  const features = [
    {
      icon: QrCode,
      title: 'QR Code Menus',
      description: 'Contactless dining with instant QR code generation for your restaurant menus',
      color: 'text-blue-600'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Perfect experience on any device - mobile, tablet, or desktop',
      color: 'text-green-600'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track menu views, popular items, and customer engagement',
      color: 'text-purple-600'
    },
    {
      icon: Settings,
      title: 'Easy Management',
      description: 'Simple drag-and-drop interface to update menus in real-time',
      color: 'text-orange-600'
    },
    {
      icon: Eye,
      title: 'Live Preview',
      description: 'See exactly how your menu looks to customers before publishing',
      color: 'text-pink-600'
    },
    {
      icon: Shield,
      title: 'Secure & Fast',
      description: 'Enterprise-grade security with lightning-fast loading times',
      color: 'text-red-600'
    }
  ];

  const benefits = [
    'Reduce physical contact',
    'Cut printing costs',
    'Update menus instantly',
    'Increase customer satisfaction',
    'Boost operational efficiency',
    'Gain valuable insights'
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Restaurant Owner',
      restaurant: 'Golden Fork Bistro',
      content: 'SmartDine transformed our dining experience. Customers love the QR menus and we\'ve saved thousands on printing costs.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b96ae123?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Marco Rodriguez',
      role: 'Head Chef',
      restaurant: 'Artisan Kitchen',
      content: 'Being able to update our daily specials instantly is a game changer. The analytics help us understand what our customers love.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Emily Johnson',
      role: 'Manager',
      restaurant: 'Urban Cafe',
      content: 'Setup was incredibly easy and our customers adapted quickly. The mobile experience is flawless.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Restaurants' },
    { number: '2M+', label: 'Menu Views' },
    { number: '99.9%', label: 'Uptime' },
    { number: '4.8/5', label: 'Rating' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 pt-20 pb-16 sm:pt-24 sm:pb-20 transition-colors duration-300">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/20 to-secondary-50/20" />
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
          <div className="absolute bottom-8 left-1/3 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex justify-center mb-8">
                <SmartDineLogo size={120} className="animate-pulse" />
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors duration-300">
                Smart
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-red-600 dark:from-amber-400 dark:to-red-500">
                  Dine
                </span>
              </h1>
              <p className="text-lg text-amber-700/80 dark:text-amber-400/80 font-medium -mt-4 mb-4 transition-colors duration-300">Crete</p>
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto transition-colors duration-300">
                Transform your restaurant with digital menus
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto transition-colors duration-300">
                Create beautiful, contactless dining experiences with QR code menus. 
                Easy setup, instant updates, and powerful analytics.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/register">
                <Button size="lg" variant="primary" icon={<ArrowRight size={20} />}>
                  Start Free Trial
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                icon={<Play size={20} />}
                onClick={() => setShowDemoPreview(true)}
              >
                View Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12 flex justify-center items-center space-x-8 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>Setup in minutes</span>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
              Everything you need for digital dining
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
              Powerful features designed to modernize your restaurant and delight your customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg dark:hover:shadow-gray-900/30 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4 transition-colors duration-300`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
              See SmartDine in action
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
              Try our interactive demo to experience how your customers will view and interact with your digital menu
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Demo QR Code */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <DemoQRCode />
            </motion.div>

            {/* Demo Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors duration-300">
                Why restaurants love SmartDine
              </h3>
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button variant="primary" icon={<ArrowRight size={16} />}>
                    Get Started Free
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  icon={<Eye size={16} />}
                  onClick={() => setShowDemoPreview(true)}
                >
                  Preview Demo Menu
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
              Loved by restaurants worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">
              Join thousands of satisfied restaurant owners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl transition-colors duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic transition-colors duration-300">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      {testimonial.role}, {testimonial.restaurant}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to transform your restaurant?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of restaurants already using SmartDine to create better dining experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" icon={<ArrowRight size={20} />}>
                  Start Your Free Trial
                </Button>
              </Link>
              <Link to="#demo">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary-600">
                  View Demo
                </Button>
              </Link>
            </div>
            <p className="text-sm text-white/70 mt-6">
              14-day free trial • No credit card required • Setup in minutes
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Demo Preview Modal */}
      {showDemoPreview && (
        <MenuPreview
          menu={demoMenu}
          isOpen={showDemoPreview}
          onClose={() => setShowDemoPreview(false)}
          themeSettings={demoMenu.settings?.theme}
        />
      )}
    </div>
  );
};

export default LandingPage;