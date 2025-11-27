const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// ============================================
// CLOUDINARY CONFIGURATION
// ============================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ============================================
// STORAGE CONFIGURATION FOR GAME IMAGES
// ============================================
const gameImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gamestore/games', // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 1000, crop: 'limit' }, // Max dimensions
      { quality: 'auto' }, // Automatic quality optimization
      { fetch_format: 'auto' }, // Automatic format selection
    ],
  },
});

// ============================================
// STORAGE CONFIGURATION FOR PROFILE IMAGES
// ============================================
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gamestore/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'face' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  },
});

// ============================================
// MULTER UPLOAD INSTANCES
// ============================================

// Game image upload (single)
const uploadGameImage = multer({
  storage: gameImageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image file.'), false);
    }
  },
});

// Profile image upload (single)
const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image file.'), false);
    }
  },
});

// Multiple images upload
const uploadMultipleImages = multer({
  storage: gameImageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5, // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image file.'), false);
    }
  },
});

// ============================================
// HELPER FUNCTIONS
// ============================================

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Get optimized image URL
const getOptimizedUrl = (publicId, width = 800, height = 600) => {
  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop: 'fill' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });
};

module.exports = {
  cloudinary,
  uploadGameImage,
  uploadProfileImage,
  uploadMultipleImages,
  deleteImage,
  getOptimizedUrl,
};