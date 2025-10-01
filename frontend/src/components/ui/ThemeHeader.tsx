import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { withThemeTransition } from '../../utils/themeUtils';

export interface ThemeHeaderProps {
  title?: string;
  subtitle?: string;
  showThemeToggle?: boolean;
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'minimal' | 'hero';
}

const ThemeHeader: React.FC<ThemeHeaderProps> = ({
  title,
  subtitle,
  showThemeToggle = true,
  children,
  className = '',
  variant = 'default'
}) => {
  const { theme } = useTheme();

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return theme === 'dark'
          ? 'bg-gray-900/95 border-b border-gray-700'
          : 'bg-white/95 border-b border-gray-200';
      
      case 'hero':
        return theme === 'dark'
          ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-600';
      
      default:
        return theme === 'dark'
          ? 'bg-gray-800/90 backdrop-blur-md border-b border-gray-700/50'
          : 'bg-white/90 backdrop-blur-md border-b border-gray-200/50';
    }
  };

  const textClasses = variant === 'hero'
    ? 'text-white'
    : theme === 'dark' 
      ? 'text-gray-100' 
      : 'text-gray-900';

  const subtitleClasses = variant === 'hero'
    ? 'text-gray-200'
    : theme === 'dark'
      ? 'text-gray-400'
      : 'text-gray-600';

  const headerClasses = withThemeTransition(
    `${getVariantClasses()} sticky top-0 z-40 shadow-sm ${className}`,
    theme
  );

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={headerClasses}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Title Section */}
          <div className="flex items-center space-x-4">
            {title && (
              <div>
                <h1 className={`text-xl font-bold ${textClasses}`}>
                  {title}
                </h1>
                {subtitle && (
                  <p className={`text-sm ${subtitleClasses}`}>
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            {children && !title && children}
          </div>

          {/* Actions Section */}
          <div className="flex items-center space-x-4">
            {children && title && children}
            {showThemeToggle && (
              <ThemeToggle 
                variant="minimal" 
                size="sm" 
                className="ml-4"
              />
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default ThemeHeader;