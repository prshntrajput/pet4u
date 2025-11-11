const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');
const { logger } = require('./logger');

// Configure Cloudinary with credentials
const configureCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    logger.info('Cloudinary configured successfully');
    
    // Test connection
    cloudinary.api.ping()
      .then(() => logger.info('Cloudinary connection test passed'))
      .catch((err) => logger.error('Cloudinary connection test failed:', err));

  } catch (error) {
    logger.error('Failed to configure Cloudinary:', error);
    process.exit(1);
  }
};

// Initialize configuration
configureCloudinary();

// Use memory storage for multer
const storage = multer.memoryStorage();

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Convert buffer to readable stream and pipe to Cloudinary
    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

// Multer upload configurations for profile images
const uploadProfileImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Multer upload configurations for pet images
const uploadPetImage = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Multiple pet images upload
const uploadMultiplePetImages = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10, // Maximum 10 images per pet
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Upload handlers that process files after multer
const handleProfileImageUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const userId = req.user?.userId || 'unknown';
    const timestamp = Date.now();

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'pet4u/profiles',
      public_id: `user-${userId}-${timestamp}`,
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    });

    req.cloudinaryResult = result;
    next();
  } catch (error) {
    logger.error('Error uploading profile image to Cloudinary:', error);
    next(error);
  }
};

const handlePetImageUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const petId = req.body?.petId || 'temp';
    const timestamp = Date.now();

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'pet4u/pets',
      public_id: `pet-${petId}-${timestamp}`,
      transformation: [
        { width: 1200, height: 900, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    });

    req.cloudinaryResult = result;
    next();
  } catch (error) {
    logger.error('Error uploading pet image to Cloudinary:', error);
    next(error);
  }
};

const handleMultiplePetImagesUpload = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const petId = req.body?.petId || 'temp';
    const uploadPromises = req.files.map((file, index) => {
      const timestamp = Date.now();
      return uploadToCloudinary(file.buffer, {
        folder: 'pet4u/pets',
        public_id: `pet-${petId}-${timestamp}-${index}`,
        transformation: [
          { width: 1200, height: 900, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ],
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      });
    });

    const results = await Promise.all(uploadPromises);
    req.cloudinaryResults = results;
    next();
  } catch (error) {
    console.log('[DEBUG] cloudinaryResults:', req.cloudinaryResults);
    logger.error('Error uploading multiple pet images to Cloudinary:', error);
    next(error);
  }
};

// Utility functions for Cloudinary operations
const cloudinaryUtils = {
  // Delete image from Cloudinary
  deleteImage: async (publicId) => {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      logger.info('Image deleted from Cloudinary:', { publicId, result });
      return result;
    } catch (error) {
      logger.error('Error deleting image from Cloudinary:', error);
      throw error;
    }
  },

  // Delete multiple images
  deleteMultipleImages: async (publicIds) => {
    try {
      const result = await cloudinary.api.delete_resources(publicIds);
      logger.info('Multiple images deleted from Cloudinary:', { count: publicIds.length });
      return result;
    } catch (error) {
      logger.error('Error deleting multiple images:', error);
      throw error;
    }
  },

  // Get image details
  getImageDetails: async (publicId) => {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      logger.error('Error getting image details:', error);
      throw error;
    }
  },

  // Generate optimized URL
  getOptimizedUrl: (publicId, options = {}) => {
    const defaultOptions = {
      quality: 'auto:good',
      fetch_format: 'auto',
      ...options
    };
    return cloudinary.url(publicId, defaultOptions);
  },

  // Generate thumbnail URL
  getThumbnailUrl: (publicId, width = 200, height = 200) => {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto:good',
      fetch_format: 'auto',
    });
  },
};

module.exports = {
  cloudinary,
  uploadProfileImage,
  uploadPetImage,
  uploadMultiplePetImages,
  handleProfileImageUpload,
  handlePetImageUpload,
  handleMultiplePetImagesUpload,
  cloudinaryUtils,
};
