const express = require('express');
const { protect } = require('../middleware/auth');
const { uploadSingle, getFileUrl } = require('../middleware/upload');

const router = express.Router();

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
router.post('/image', protect, uploadSingle('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Get the full URL for the uploaded file
    const imageUrl = getFileUrl(req, req.file.path);

    res.status(200).json({
      success: true,
      data: {
        url: imageUrl
      },
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image'
    });
  }
});

module.exports = router;