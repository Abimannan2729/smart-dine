import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Download, 
  Smartphone, 
  Eye,
  Copy,
  Check
} from 'lucide-react';
import Button from '../ui/Button';

interface DemoQRCodeProps {
  url?: string;
  restaurantName?: string;
  className?: string;
}

const DemoQRCode: React.FC<DemoQRCodeProps> = ({ 
  url, 
  restaurantName = "The Golden Fork", 
  className = "" 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [actualUrl, setActualUrl] = useState<string>('');
  const [qrImageUrl, setQrImageUrl] = useState<string>('');

  useEffect(() => {
    // Set the actual URL either from props or construct dynamically
    let finalUrl = url;
    
    if (!finalUrl) {
      // Get the current origin and construct the demo URL
      const currentOrigin = window.location.origin;
      finalUrl = `${currentOrigin}/menu/demo`;
      
      console.log('🔗 Generated demo URL from current origin:', finalUrl);
    }
    
    // Validate URL format
    try {
      new URL(finalUrl);
      console.log('✅ Valid URL for QR code:', finalUrl);
    } catch (error) {
      console.error('❌ Invalid URL format:', finalUrl);
      // Fallback to relative path if URL construction fails
      finalUrl = `${window.location.protocol}//${window.location.host}/menu/demo`;
      console.log('🔄 Using fallback URL:', finalUrl);
    }
    
    setActualUrl(finalUrl);
  }, [url]);

  useEffect(() => {
    if (actualUrl) {
      generateQRCode();
    }
  }, [actualUrl]);

  const generateQRCode = async () => {
    if (!actualUrl) {
      console.log('❌ No URL available for QR code generation');
      return;
    }
    
    console.log('🔄 Generating QR code for URL:', actualUrl);
    console.log('📱 This URL should be scannable from mobile devices on the same network');
    
    try {
      setIsGenerating(true);
      
      // First, always generate a data URL as fallback
      const imageDataUrl = await QRCode.toDataURL(actualUrl, {
        width: 300,
        margin: 4,
        color: {
          dark: '#000000',  // Pure black for better contrast
          light: '#ffffff'  // Pure white for better contrast
        },
        errorCorrectionLevel: 'H'  // High error correction for better reliability
      });
      setQrImageUrl(imageDataUrl);
      console.log('✅ QR code image generated successfully for:', actualUrl);
      console.log('📱 Scan this QR code with your phone camera to test');
      
      // Also generate higher resolution data URL for download
      const downloadDataUrl = await QRCode.toDataURL(actualUrl, {
        width: 512,
        margin: 4,
        color: {
          dark: '#000000',  // Pure black for better contrast
          light: '#ffffff'  // Pure white for better contrast
        },
        errorCorrectionLevel: 'H'  // High error correction for better reliability
      });
      setQrDataUrl(downloadDataUrl);
      console.log('QR code download URL generated successfully');
      
      // Try to also generate on canvas if available
      if (canvasRef.current) {
        console.log('Canvas element found, generating QR code...');
        await QRCode.toCanvas(canvasRef.current, actualUrl, {
          width: 300,
          margin: 4,
          color: {
            dark: '#000000',  // Pure black for better contrast
            light: '#ffffff'  // Pure white for better contrast
          },
          errorCorrectionLevel: 'H'  // High error correction for better reliability
        });
        console.log('QR code canvas generated successfully');
      } else {
        console.log('Canvas element not found, using image fallback');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.download = `${restaurantName.replace(/\s+/g, '-').toLowerCase()}-menu-qr.png`;
      link.href = qrDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(actualUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = actualUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePreview = () => {
    window.open(actualUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mb-3">
          <QrCode className="w-6 h-6 text-primary-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Try Our Demo Menu
        </h3>
        <p className="text-gray-600 text-sm">
          Scan the QR code or click to view how your digital menu will look to customers
        </p>
      </div>

      {/* QR Code */}
      <div className="relative">
        <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center justify-center min-h-[320px]">
          {isGenerating ? (
            <div className="w-[300px] h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              {qrImageUrl ? (
                <img 
                  src={qrImageUrl} 
                  alt="QR Code for Demo Menu" 
                  className="rounded-lg shadow-sm border border-gray-200" 
                  style={{ maxWidth: '300px', maxHeight: '300px' }}
                />
              ) : (
                <canvas 
                  ref={canvasRef} 
                  className="rounded-lg shadow-sm border border-gray-200" 
                  style={{ display: 'block', maxWidth: '300px', maxHeight: '300px' }}
                />
              )}
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="sm"
            icon={<Eye size={16} />}
            onClick={handlePreview}
            className="w-full"
            disabled={isGenerating}
          >
            View Demo Menu
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={copied ? <Check size={16} /> : <Copy size={16} />}
              onClick={handleCopyUrl}
              disabled={isGenerating}
              className={copied ? 'text-green-600 border-green-600' : ''}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              icon={<Download size={16} />}
              onClick={handleDownload}
              disabled={isGenerating || !qrDataUrl}
            >
              Download
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreview}
            disabled={isGenerating}
            className="w-full text-xs mt-2"
          >
            🔗 Test URL: {actualUrl}
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl">
          <div className="flex items-start space-x-3">
            <Smartphone className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                How to use QR menus
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Point your phone camera at the QR code</li>
                <li>• Tap the notification that appears</li>
                <li>• View the digital menu in your browser</li>
                <li>• No app download required!</li>
              </ul>
              {actualUrl && (
                <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                  <strong>📱 QR Code URL:</strong> <br/>
                  <span className="break-all font-mono">{actualUrl}</span>
                  <div className="mt-1 text-green-600">
                    ✅ This URL should work when scanned with your phone
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-primary-600">2.5K+</div>
            <div className="text-xs text-gray-500">Demo Views</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-secondary-600">4.8★</div>
            <div className="text-xs text-gray-500">User Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoQRCode;