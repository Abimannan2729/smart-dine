import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, EyeOff, Loader } from 'lucide-react';
import { Restaurant } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

interface PublishRestaurantButtonProps {
  restaurant: Restaurant;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const PublishRestaurantButton: React.FC<PublishRestaurantButtonProps> = ({
  restaurant,
  variant = 'outline',
  size = 'sm',
  showText = true,
  className = ''
}) => {
  const { togglePublishStatus } = useRestaurant();
  const [isLoading, setIsLoading] = useState(false);

  const handleTogglePublish = async () => {
    if (!restaurant._id) {
      toast.error('Invalid restaurant ID');
      return;
    }

    // Show confirmation for unpublishing
    if (restaurant.isPublished) {
      const confirmed = window.confirm(
        'Are you sure you want to unpublish this restaurant? This will make the public menu inaccessible to customers.'
      );
      if (!confirmed) return;
    }

    try {
      setIsLoading(true);
      await togglePublishStatus(restaurant._id);
      
      const action = restaurant.isPublished ? 'unpublished' : 'published';
      toast.success(`Restaurant ${action} successfully!`);
    } catch (error: any) {
      console.error('Error toggling publish status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update restaurant status';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonText = restaurant.isPublished ? 'Unpublish' : 'Publish';
  const buttonIcon = isLoading ? (
    <Loader size={size === 'lg' ? 20 : size === 'md' ? 18 : 16} className="animate-spin" />
  ) : restaurant.isPublished ? (
    <EyeOff size={size === 'lg' ? 20 : size === 'md' ? 18 : 16} />
  ) : (
    <Globe size={size === 'lg' ? 20 : size === 'md' ? 18 : 16} />
  );

  const buttonVariant = restaurant.isPublished ? 'outline' : 'primary';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        variant={variant === 'primary' ? buttonVariant : variant}
        size={size}
        icon={buttonIcon}
        onClick={handleTogglePublish}
        disabled={isLoading}
        className={`${className} ${restaurant.isPublished ? 'hover:bg-red-50 hover:border-red-300' : 'hover:bg-green-50 hover:border-green-300'}`}
        title={restaurant.isPublished 
          ? 'Click to unpublish and make restaurant private' 
          : 'Click to publish and make restaurant accessible to public'
        }
      >
        {showText && (isLoading ? 'Processing...' : buttonText)}
      </Button>
    </motion.div>
  );
};

export default PublishRestaurantButton;