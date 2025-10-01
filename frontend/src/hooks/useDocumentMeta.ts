import { useEffect } from 'react';

interface DocumentMetaOptions {
  title?: string;
  favicon?: string;
  description?: string;
}

export const useDocumentMeta = ({ title, favicon, description }: DocumentMetaOptions) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }
  }, [title]);

  useEffect(() => {
    // Update favicon
    if (favicon) {
      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(link => link.remove());

      // Create new favicon link
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/x-icon';
      link.href = favicon;
      document.head.appendChild(link);

      // Also update apple-touch-icon if it's a larger icon
      const appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      appleIcon.href = favicon;
      document.head.appendChild(appleIcon);
    }
  }, [favicon]);

  useEffect(() => {
    // Update meta description
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = description;
        document.head.appendChild(meta);
      }
    }
  }, [description]);
};

// Helper function to get app name from environment or default
export const getAppName = () => {
  return process.env.REACT_APP_NAME || 'SmartDine';
};

// Helper function to create title with app name
export const createAppTitle = (pageTitle?: string) => {
  const appName = getAppName();
  return pageTitle ? `${appName} - ${pageTitle}` : appName;
};

// Helper function to create restaurant title
export const createRestaurantTitle = (restaurantName: string, pageTitle = 'Menu') => {
  return `${restaurantName} - ${pageTitle}`;
};