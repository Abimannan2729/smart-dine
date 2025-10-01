const express = require('express');
const QRCode = require('qrcode');
const { protect, checkRestaurantOwnership } = require('../middleware/auth');
const Restaurant = require('../models/Restaurant');

const router = express.Router();

// @desc    Generate QR code for restaurant menu
// @route   POST /api/qr/restaurants/:restaurantId/generate
// @access  Private
router.post('/restaurants/:restaurantId/generate', protect, checkRestaurantOwnership, async (req, res) => {
  try {
    const restaurant = req.restaurant;

    // Generate public menu URL
    const publicUrl = restaurant.getPublicMenuUrl();

    // Generate QR code as base64 data URL
    const qrCodeDataUrl = await QRCode.toDataURL(publicUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });

    // Update restaurant with QR code information
    restaurant.qrCode = {
      code: qrCodeDataUrl,
      publicUrl: publicUrl,
      lastGenerated: new Date(),
      scanCount: restaurant.qrCode?.scanCount || 0
    };

    await restaurant.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: {
        qrCode: qrCodeDataUrl,
        publicUrl: publicUrl,
        lastGenerated: restaurant.qrCode.lastGenerated
      }
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating QR code'
    });
  }
});

// @desc    Get restaurant QR code
// @route   GET /api/qr/restaurants/:restaurantId
// @access  Private
router.get('/restaurants/:restaurantId', protect, checkRestaurantOwnership, async (req, res) => {
  try {
    const restaurant = req.restaurant;

    if (!restaurant.qrCode || !restaurant.qrCode.code) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found. Please generate one first.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        qrCode: restaurant.qrCode.code,
        publicUrl: restaurant.qrCode.publicUrl,
        lastGenerated: restaurant.qrCode.lastGenerated,
        scanCount: restaurant.qrCode.scanCount
      }
    });
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching QR code'
    });
  }
});

// @desc    Download QR code as image
// @route   GET /api/qr/restaurants/:restaurantId/download
// @access  Private
router.get('/restaurants/:restaurantId/download', protect, checkRestaurantOwnership, async (req, res) => {
  try {
    const restaurant = req.restaurant;
    const { format = 'png', size = '256' } = req.query;

    if (!restaurant.qrCode || !restaurant.qrCode.publicUrl) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found. Please generate one first.'
      });
    }

    const publicUrl = restaurant.qrCode.publicUrl;
    const qrSize = parseInt(size) || 256;

    let qrBuffer;
    let contentType;

    if (format.toLowerCase() === 'svg') {
      // Generate SVG
      qrBuffer = await QRCode.toString(publicUrl, {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: qrSize
      });
      contentType = 'image/svg+xml';
    } else {
      // Generate PNG (default)
      qrBuffer = await QRCode.toBuffer(publicUrl, {
        errorCorrectionLevel: 'M',
        type: 'png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: qrSize
      });
      contentType = 'image/png';
    }

    // Set response headers for file download
    const filename = `${restaurant.slug || restaurant.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-qr-code.${format === 'svg' ? 'svg' : 'png'}`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);

    if (format.toLowerCase() === 'svg') {
      res.send(qrBuffer);
    } else {
      res.send(qrBuffer);
    }
  } catch (error) {
    console.error('Download QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading QR code'
    });
  }
});

// @desc    Track QR code scan
// @route   POST /api/qr/scan/:slug
// @access  Public
router.post('/scan/:slug', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ 
      slug: req.params.slug,
      isActive: true,
      isPublished: true
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Increment QR scan count
    await restaurant.incrementQRScans();

    res.status(200).json({
      success: true,
      message: 'QR scan tracked',
      data: {
        redirect: restaurant.getPublicMenuUrl()
      }
    });
  } catch (error) {
    console.error('Track QR scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking QR scan'
    });
  }
});

// @desc    Regenerate QR code with custom options
// @route   POST /api/qr/restaurants/:restaurantId/regenerate
// @access  Private
router.post('/restaurants/:restaurantId/regenerate', protect, checkRestaurantOwnership, async (req, res) => {
  try {
    const restaurant = req.restaurant;
    const { 
      size = 256, 
      margin = 1, 
      darkColor = '#000000', 
      lightColor = '#FFFFFF',
      errorCorrectionLevel = 'M'
    } = req.body;

    const publicUrl = restaurant.getPublicMenuUrl();

    // Generate QR code with custom options
    const qrCodeDataUrl = await QRCode.toDataURL(publicUrl, {
      errorCorrectionLevel,
      type: 'image/png',
      quality: 0.92,
      margin: parseInt(margin),
      color: {
        dark: darkColor,
        light: lightColor
      },
      width: parseInt(size)
    });

    // Update restaurant with new QR code
    restaurant.qrCode = {
      code: qrCodeDataUrl,
      publicUrl: publicUrl,
      lastGenerated: new Date(),
      scanCount: restaurant.qrCode?.scanCount || 0
    };

    await restaurant.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: {
        qrCode: qrCodeDataUrl,
        publicUrl: publicUrl,
        lastGenerated: restaurant.qrCode.lastGenerated,
        options: {
          size: parseInt(size),
          margin: parseInt(margin),
          darkColor,
          lightColor,
          errorCorrectionLevel
        }
      }
    });
  } catch (error) {
    console.error('Regenerate QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error regenerating QR code'
    });
  }
});

// @desc    Get QR code analytics
// @route   GET /api/qr/restaurants/:restaurantId/analytics
// @access  Private
router.get('/restaurants/:restaurantId/analytics', protect, checkRestaurantOwnership, async (req, res) => {
  try {
    const restaurant = req.restaurant;

    const analytics = {
      totalScans: restaurant.qrCode?.scanCount || 0,
      totalMenuViews: restaurant.stats.totalMenuViews,
      qrToViewRatio: restaurant.qrCode?.scanCount > 0 
        ? (restaurant.stats.totalMenuViews / restaurant.qrCode.scanCount).toFixed(2)
        : 0,
      lastGenerated: restaurant.qrCode?.lastGenerated || null,
      lastViewed: restaurant.stats.lastViewedAt || null,
      isGenerated: !!(restaurant.qrCode && restaurant.qrCode.code),
      publicUrl: restaurant.qrCode?.publicUrl || restaurant.getPublicMenuUrl()
    };

    res.status(200).json({
      success: true,
      data: {
        analytics
      }
    });
  } catch (error) {
    console.error('Get QR analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching QR code analytics'
    });
  }
});

module.exports = router;