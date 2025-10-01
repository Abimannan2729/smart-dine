import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

type MotionButtonProps = HTMLMotionProps<'button'>;

interface ButtonProps extends Omit<MotionButtonProps, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const { theme } = useTheme();
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed btn-glow';
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return theme === 'dark'
          ? 'bg-primary-700 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-lg hover:shadow-glow'
          : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-lg hover:shadow-glow';
      
      case 'secondary':
        return theme === 'dark'
          ? 'bg-secondary-600 text-white hover:bg-secondary-500 focus:ring-secondary-500 shadow-lg hover:shadow-lg'
          : 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500 shadow-lg hover:shadow-lg';
      
      case 'outline':
        return theme === 'dark'
          ? 'border-2 border-primary-400 text-primary-400 hover:bg-primary-400 hover:text-gray-900 focus:ring-primary-500'
          : 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-primary-500';
      
      case 'ghost':
        return theme === 'dark'
          ? 'text-gray-300 hover:bg-gray-700 focus:ring-gray-500 hover:text-primary-400'
          : 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 hover:text-primary-600';
      
      default:
        return 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-lg hover:shadow-glow';
    }
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const classes = `${baseClasses} ${getVariantClasses()} ${sizes[size]} ${className}`;
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader className="w-4 h-4 mr-2 animate-spin" />
      )}
      {!loading && icon && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
    </motion.button>
  );
};

export default Button;
