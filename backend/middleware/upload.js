const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadToCloudinary } = require('../config/cloudinary');

// Configure multer to use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 10 // Max 10 files per request
  },
  fileFilter: fileFilter
});

// Middleware for single file upload with Cloudinary
exports.uploadSingle = (fieldName) => {
  return async (req, res, next) => {
    const singleUpload = upload.single(fieldName);
    
    singleUpload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size allowed is 5MB.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files. Maximum 10 files allowed.'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      // If file was uploaded, upload to Cloudinary
      if (req.file) {
        try {
          console.log('Uploading file to Cloudinary:', req.file.originalname);
          
          // Determine folder based on field name
          let folder = 'smart-dine/misc';
          if (fieldName.includes('logo') || fieldName.includes('avatar')) {
            folder = 'smart-dine/logos';
          } else if (fieldName.includes('cover') || fieldName.includes('banner')) {
            folder = 'smart-dine/covers';
          } else if (fieldName.includes('menu') || fieldName.includes('item')) {
            folder = 'smart-dine/menu-items';
          } else if (fieldName.includes('category')) {
            folder = 'smart-dine/categories';
          }

          const result = await uploadToCloudinary(req.file.buffer, { folder });
          
          // Replace file info with Cloudinary result
          req.file.path = result.secure_url;
          req.file.cloudinary = result;
          
          console.log('Cloudinary upload successful:', result.secure_url);
        } catch (uploadError) {
          console.error('Cloudinary upload failed:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload image to cloud storage'
          });
        }
      }

      next();
    });
  };
};

// Middleware for multiple file upload with Cloudinary
exports.uploadMultiple = (fieldName, maxCount = 10) => {
  return async (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxCount);
    
    multipleUpload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size allowed is 5MB.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: `Too many files. Maximum ${maxCount} files allowed.`
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      // If files were uploaded, upload to Cloudinary
      if (req.files && req.files.length > 0) {
        try {
          console.log(`Uploading ${req.files.length} files to Cloudinary`);
          
          // Determine folder based on field name
          let folder = 'smart-dine/misc';
          if (fieldName.includes('logo') || fieldName.includes('avatar')) {
            folder = 'smart-dine/logos';
          } else if (fieldName.includes('cover') || fieldName.includes('banner')) {
            folder = 'smart-dine/covers';
          } else if (fieldName.includes('menu') || fieldName.includes('item')) {
            folder = 'smart-dine/menu-items';
          } else if (fieldName.includes('category')) {
            folder = 'smart-dine/categories';
          }

          // Upload all files to Cloudinary
          const uploadPromises = req.files.map(async (file) => {
            const result = await uploadToCloudinary(file.buffer, { folder });
            file.path = result.secure_url;
            file.cloudinary = result;
            return result;
          });

          await Promise.all(uploadPromises);
          console.log('All files uploaded to Cloudinary successfully');
        } catch (uploadError) {
          console.error('Cloudinary upload failed:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload images to cloud storage'
          });
        }
      }

      next();
    });
  };
};

// Middleware for multiple fields with Cloudinary
exports.uploadFields = (fields) => {
  return async (req, res, next) => {
    const fieldsUpload = upload.fields(fields);
    
    fieldsUpload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size allowed is 5MB.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files uploaded.'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      // If files were uploaded, upload to Cloudinary
      if (req.files && Object.keys(req.files).length > 0) {
        try {
          console.log('Uploading multiple field files to Cloudinary');
          
          // Process each field
          for (const fieldName in req.files) {
            const files = req.files[fieldName];
            
            // Determine folder based on field name
            let folder = 'smart-dine/misc';
            if (fieldName.includes('logo') || fieldName.includes('avatar')) {
              folder = 'smart-dine/logos';
            } else if (fieldName.includes('cover') || fieldName.includes('banner')) {
              folder = 'smart-dine/covers';
            } else if (fieldName.includes('menu') || fieldName.includes('item')) {
              folder = 'smart-dine/menu-items';
            } else if (fieldName.includes('category')) {
              folder = 'smart-dine/categories';
            }

            // Upload all files for this field
            const uploadPromises = files.map(async (file) => {
              const result = await uploadToCloudinary(file.buffer, { folder });
              file.path = result.secure_url;
              file.cloudinary = result;
              return result;
            });

            await Promise.all(uploadPromises);
          }
          
          console.log('All field files uploaded to Cloudinary successfully');
        } catch (uploadError) {
          console.error('Cloudinary upload failed:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload images to cloud storage'
          });
        }
      }

      next();
    });
  };
};

// Helper function to delete file from Cloudinary
exports.deleteFile = async (filePath) => {
  try {
    const { deleteFromCloudinary, getPublicIdFromUrl } = require('../config/cloudinary');
    
    // If it's a Cloudinary URL, delete from Cloudinary
    if (filePath && filePath.includes('cloudinary.com')) {
      const publicId = getPublicIdFromUrl(filePath);
      if (publicId) {
        const result = await deleteFromCloudinary(publicId);
        console.log(`Cloudinary file deleted: ${filePath}`);
        return result.result === 'ok';
      }
    }
    
    // For backward compatibility, try to delete local file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Local file deleted: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
};

// Helper function to get file URL
exports.getFileUrl = (req, filePath) => {
  if (!filePath) return null;
  
  // If it's already a Cloudinary URL, return as is
  if (filePath.includes('cloudinary.com')) {
    return filePath;
  }
  
  // For local files, construct URL
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/${filePath.replace(/\\/g, '/')}`;
};