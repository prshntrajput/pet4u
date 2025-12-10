const sharp = require('sharp');
const { logger } = require('../config/logger');

// Image optimization middleware
const optimizeImage = async (buffer, options = {}) => {
  try {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'webp',
    } = options;

    const optimized = await sharp(buffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFormat(format, { quality })
      .toBuffer();

    logger.info('Image optimized successfully', { 
      originalSize: buffer.length,
      optimizedSize: optimized.length,
      reduction: `${((1 - optimized.length / buffer.length) * 100).toFixed(2)}%`
    });

    return optimized;
  } catch (error) {
    logger.error('Image optimization error:', error);
    throw error;
  }
};

module.exports = {
  optimizeImage,
};
