import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { getThemeColors, getThemeShadow, withThemeTransition } from '../../utils/themeUtils';

export interface ThemeCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'outline' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  hover = true,
  clickable = false,
  onClick
}) => {
  const { theme } = useTheme();

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return theme === 'dark'
          ? 'bg-black/20 backdrop-blur-md border border-gray-700/30'
          : 'bg-white/20 backdrop-blur-md border border-white/30';
      
      case 'outline':
        return theme === 'dark'
          ? 'bg-transparent border border-gray-600'
          : 'bg-transparent border border-gray-300';
      
      case 'elevated':
        return theme === 'dark'
          ? 'bg-gray-800/95 border border-gray-700/50'
          : 'bg-white/95 border border-gray-200/50';
      
      default:
        return theme === 'dark'
          ? 'bg-gray-800/90 border border-gray-700/30'
          : 'bg-white/90 border border-white/20';
    }
  };

  const shadowClass = getThemeShadow(variant === 'glass' ? 'glass' : 'card', theme);
  
  const baseClasses = 'rounded-xl overflow-hidden';
  const interactiveClasses = clickable ? 'cursor-pointer' : '';
  const hoverClasses = hover ? 'hover:scale-[1.02] hover:shadow-2xl' : '';
  
  const cardClasses = withThemeTransition(
    `${baseClasses} ${getVariantClasses()} ${shadowClass} ${paddingClasses[padding]} ${interactiveClasses} ${hoverClasses} ${className}`,
    theme
  );

  if (hover || clickable) {
    return (
      <motion.div
        whileHover={hover ? { scale: 1.02 } : undefined}
        whileTap={clickable ? { scale: 0.98 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={cardClasses}
        onClick={clickable ? onClick : undefined}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClasses} onClick={clickable ? onClick : undefined}>
      {children}
    </div>
  );
};

export default ThemeCard;