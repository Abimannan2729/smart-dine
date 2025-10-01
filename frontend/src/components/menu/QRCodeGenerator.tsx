import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { 
  Download, 
  Share, 
  Copy, 
  ExternalLink, 
  Palette,
  Settings,
  Eye,
  Smartphone
} from 'lucide-react';
import { Restaurant } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import notifications from '../../utils/notifications';

interface QRCodeGeneratorProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
}

interface QRCodeOptions {
  size: number;
  color: {
    dark: string;
    light: string;
  };
  margin: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  restaurant,
  isOpen,
  onClose,
}) => {
  const { theme } = useTheme();
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<QRCodeOptions>({
    size: 512,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    margin: 4,
    errorCorrectionLevel: 'M',
  });

  // Generate public menu URL - use restaurant ID since our backend API works with IDs
  const menuUrl = `${window.location.origin}/menu/${restaurant._id}`;

  // Generate QR code when options change or modal opens
  useEffect(() => {
    if (isOpen && restaurant) {
      generateQRCode();
    }
  }, [isOpen, options, restaurant]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      const dataURL = await QRCode.toDataURL(menuUrl, {
        width: options.size,
        margin: options.margin,
        color: options.color,
        errorCorrectionLevel: options.errorCorrectionLevel,
      });
      setQrCodeDataURL(dataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
      notifications.error('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrCodeDataURL) return;

    const link = document.createElement('a');
    link.download = `${restaurant.name}-menu-qr-code.png`;
    link.href = qrCodeDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    notifications.success('QR code downloaded successfully');
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      notifications.success('Menu URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      notifications.error('Failed to copy URL');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${restaurant.name} Menu`,
          text: `Check out the menu for ${restaurant.name}`,
          url: menuUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyUrl();
    }
  };

  const previewInNewTab = () => {
    window.open(menuUrl, '_blank');
  };

  const colorPresets = [
    { name: 'Classic', dark: '#000000', light: '#FFFFFF' },
    { name: 'Blue', dark: '#1E40AF', light: '#FFFFFF' },
    { name: 'Green', dark: '#059669', light: '#FFFFFF' },
    { name: 'Purple', dark: '#7C3AED', light: '#FFFFFF' },
    { name: 'Red', dark: '#DC2626', light: '#FFFFFF' },
    { name: 'Brand', dark: '#0EA5E9', light: '#F8FAFC' },
  ];

  const sizeOptions = [
    { label: 'Small (256px)', value: 256 },
    { label: 'Medium (512px)', value: 512 },
    { label: 'Large (1024px)', value: 1024 },
    { label: 'Extra Large (2048px)', value: 2048 },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate QR Code"
      size="lg"
    >
      <div className="space-y-6">
        {/* Restaurant Info */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {restaurant.name}
          </h3>
          <p className="text-gray-600 text-sm mb-2">
            {restaurant.description || 'Real taste of Indian'}
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <ExternalLink size={14} />
            <span className="font-mono break-all">{menuUrl}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Preview */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 flex items-center">
              <Eye size={18} className="mr-2" />
              Preview
            </h4>
            
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 flex items-center justify-center shadow-inner">
              {loading ? (
                <div className="flex items-center justify-center w-64 h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : qrCodeDataURL ? (
                <img
                  src={qrCodeDataURL}
                  alt="QR Code"
                  className="max-w-full max-h-64 rounded-lg shadow-sm"
                />
              ) : (
                <div className="flex items-center justify-center w-64 h-64 bg-gray-100 rounded-lg">
                  <span className="text-gray-500">QR Code will appear here</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                onClick={handleDownload}
                icon={<Download size={16} />}
                className="flex-1"
                disabled={!qrCodeDataURL || loading}
              >
                Download
              </Button>
              <Button
                onClick={handleShare}
                icon={<Share size={16} />}
                variant="outline"
                className="flex-1"
              >
                Share
              </Button>
              <Button
                onClick={previewInNewTab}
                icon={<ExternalLink size={16} />}
                variant="outline"
              >
                Preview
              </Button>
            </div>
          </div>

          {/* Customization Options */}
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900 flex items-center">
              <Settings size={18} className="mr-2" />
              Customize
            </h4>

            {/* Size Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <select
                value={options.size}
                onChange={(e) => setOptions({ ...options, size: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {sizeOptions.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Palette size={16} className="mr-1" />
                Color Presets
              </label>
              <div className="grid grid-cols-3 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setOptions({ 
                      ...options, 
                      color: { dark: preset.dark, light: preset.light }
                    })}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                      options.color.dark === preset.dark
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded mx-auto mb-1"
                      style={{ backgroundColor: preset.dark }}
                    />
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foreground Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={options.color.dark}
                    onChange={(e) => setOptions({
                      ...options,
                      color: { ...options.color, dark: e.target.value }
                    })}
                    className="w-10 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={options.color.dark}
                    onChange={(e) => setOptions({
                      ...options,
                      color: { ...options.color, dark: e.target.value }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={options.color.light}
                    onChange={(e) => setOptions({
                      ...options,
                      color: { ...options.color, light: e.target.value }
                    })}
                    className="w-10 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={options.color.light}
                    onChange={(e) => setOptions({
                      ...options,
                      color: { ...options.color, light: e.target.value }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margin
                </label>
                <select
                  value={options.margin}
                  onChange={(e) => setOptions({ ...options, margin: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value={1}>Small (1)</option>
                  <option value={2}>Medium (2)</option>
                  <option value={4}>Large (4)</option>
                  <option value={6}>Extra Large (6)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Error Correction
                </label>
                <select
                  value={options.errorCorrectionLevel}
                  onChange={(e) => setOptions({ 
                    ...options, 
                    errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="L">Low (L)</option>
                  <option value="M">Medium (M)</option>
                  <option value="Q">Quartile (Q)</option>
                  <option value="H">High (H)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
            <Smartphone size={16} className="mr-1" />
            How to use your QR code
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Print the QR code and place it on tables, counters, or promotional materials</li>
            <li>• Customers can scan it with their phone camera to view your digital menu</li>
            <li>• The menu works on all devices - no app download required</li>
            <li>• Updates to your menu will automatically reflect when customers scan</li>
          </ul>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <Button
            onClick={handleCopyUrl}
            variant="outline"
            icon={<Copy size={16} />}
          >
            Copy URL
          </Button>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              onClick={handleDownload}
              disabled={!qrCodeDataURL || loading}
              icon={<Download size={16} />}
            >
              Download QR Code
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QRCodeGenerator;