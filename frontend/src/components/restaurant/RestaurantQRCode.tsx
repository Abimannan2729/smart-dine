import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Download, Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { Restaurant } from '../../types';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

interface RestaurantQRCodeProps {
  restaurant: Restaurant;
  size?: number;
  showActions?: boolean;
  className?: string;
}

const RestaurantQRCode: React.FC<RestaurantQRCodeProps> = ({
  restaurant,
  size = 200,
  showActions = true,
  className = ''
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate QR code URL (using a QR code service)
  const generateQRCodeUrl = (text: string, size: number) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
  };

  useEffect(() => {
    if (restaurant.isPublished) {
      // Use restaurant ID for the public menu URL
      const publicMenuUrl = `${window.location.origin}/menu/${restaurant._id}`;
      const qrUrl = generateQRCodeUrl(publicMenuUrl, size);
      setQrCodeUrl(qrUrl);
    }
  }, [restaurant, size]);

  const handleDownload = async () => {
    if (!qrCodeUrl) return;

    try {
      setIsLoading(true);
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${restaurant.name}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('QR code downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    // Use restaurant ID for the public menu URL
    const publicMenuUrl = `${window.location.origin}/menu/${restaurant._id}`;
    
    try {
      await navigator.clipboard.writeText(publicMenuUrl);
      setCopied(true);
      toast.success('Menu URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy error:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = publicMenuUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        toast.success('Menu URL copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        toast.error('Failed to copy URL');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleShare = async () => {
    // Use restaurant ID for the public menu URL
    const publicMenuUrl = `${window.location.origin}/menu/${restaurant._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${restaurant.name} Menu`,
          text: `Check out the menu for ${restaurant.name}`,
          url: publicMenuUrl
        });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Share error:', error);
          toast.error('Failed to share');
        }
      }
    } else {
      // Fallback to copy URL
      handleCopyUrl();
    }
  };

  // Use restaurant ID for the public menu URL
  const publicMenuUrl = `${window.location.origin}/menu/${restaurant._id}`;

  if (!restaurant.isPublished) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl p-8 ${className}`} style={{ width: size, height: size }}>
        <div className="text-center">
          <QrCode size={48} className="text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Publish restaurant to generate QR code
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* QR Code Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200"
        style={{ width: size + 32, height: size + 32 }}
      >
        {qrCodeUrl ? (
          <img
            src={qrCodeUrl}
            alt={`QR Code for ${restaurant.name}`}
            className="w-full h-full object-contain rounded-lg"
            style={{ width: size, height: size }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
            <div className="text-center">
              <QrCode size={32} className="text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Generating...</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* URL Display */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Public Menu URL:</p>
        <div className="flex items-center space-x-2">
          <code className="flex-1 text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 px-2 py-1 rounded border truncate">
            {publicMenuUrl}
          </code>
          <Button
            variant="ghost"
            size="sm"
            icon={copied ? <Check size={14} /> : <Copy size={14} />}
            onClick={handleCopyUrl}
            className={copied ? 'text-green-600' : ''}
            title="Copy URL"
          >
            {/* Icon only button */}
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={16} />}
            onClick={handleDownload}
            disabled={isLoading || !qrCodeUrl}
            className="flex-1"
            title="Download QR code as PNG"
          >
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Share2 size={16} />}
            onClick={handleShare}
            className="flex-1"
            title="Share menu URL"
          >
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<ExternalLink size={16} />}
            onClick={() => window.open(publicMenuUrl, '_blank')}
            title="Open public menu"
          >
            View
          </Button>
        </div>
      )}
    </div>
  );
};

export default RestaurantQRCode;