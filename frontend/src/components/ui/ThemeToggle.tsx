import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

// Custom SVG Icons
const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'floating';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'default'
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const sizeClasses = {
    sm: 'w-12 h-6',
    md: 'w-14 h-7',
    lg: 'w-16 h-8'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const baseClasses = variant === 'floating' 
    ? `fixed top-4 right-4 z-50 ${sizeClasses[size]} bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-lg hover:shadow-xl transition-all duration-300`
    : variant === 'minimal'
    ? `${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300 hover:bg-gray-300 dark:hover:bg-gray-600`
    : `${sizeClasses[size]} bg-gradient-to-r from-orange-400 to-pink-500 dark:from-indigo-500 dark:to-purple-600 rounded-full p-1 shadow-md hover:shadow-lg transition-all duration-300`;

  return (
    <button
      onClick={toggleTheme}
      className={`${baseClasses} ${className} relative flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Track */}
      <div className="absolute inset-0 rounded-full" />
      
      {/* Icons */}
      <div className="relative w-full h-full flex items-center justify-between px-1">
        {/* Sun Icon */}
        <motion.div
          initial={false}
          animate={{
            scale: isDark ? 0.8 : 1,
            opacity: isDark ? 0.3 : 1,
            rotate: isDark ? 180 : 0
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`${iconSizes[size]} text-yellow-500 dark:text-yellow-400`}
        >
          <SunIcon className="w-full h-full" />
        </motion.div>

        {/* Moon Icon */}
        <motion.div
          initial={false}
          animate={{
            scale: isDark ? 1 : 0.8,
            opacity: isDark ? 1 : 0.3,
            rotate: isDark ? 0 : -180
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`${iconSizes[size]} text-indigo-600 dark:text-indigo-400`}
        >
          <MoonIcon className="w-full h-full" />
        </motion.div>
      </div>

      {/* Sliding indicator */}
      <motion.div
        className={`absolute top-0.5 ${size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-6 h-6' : 'w-7 h-7'} bg-white rounded-full shadow-md`}
        animate={{
          x: isDark 
            ? (size === 'sm' ? 24 : size === 'md' ? 28 : 32)
            : 2
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30
        }}
      />

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: isDark
            ? '0 0 20px rgba(129, 140, 248, 0.3)'
            : '0 0 20px rgba(251, 191, 36, 0.3)'
        }}
        transition={{ duration: 0.3 }}
      />
    </button>
  );
};

export default ThemeToggle;