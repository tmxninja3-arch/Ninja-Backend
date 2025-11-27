const express = require('express');
const router = express.Router();
const {
  uploadGameImage,
  uploadProfileImage,
  uploadMultipleImages,
  deleteImage,
} = require('../config/cloudinary');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// ============================================
// @route   POST /api/upload/game-image
// @desc    Upload single game image to Cloudinary
// @access  Private/Admin
// ============================================
router.post(
  '/game-image',
  protect,
  admin,
  uploadGameImage.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      // File uploaded to Cloudinary successfully
      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: req.file.path, // Cloudinary URL
          publicId: req.file.filename, // Cloudinary public ID
          originalName: req.file.originalname,
          size: req.file.size,
          format: req.file.format,
        },
      });
    } catch (error) {
      console.error('Upload Error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during upload',
        error: error.message,
      });
    }
  }
);

// ============================================
// @route   POST /api/upload/profile-image
// @desc    Upload profile image to Cloudinary
// @access  Private
// ============================================
router.post(
  '/profile-image',
  protect,
  uploadProfileImage.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: {
          url: req.file.path,
          publicId: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
        },
      });
    } catch (error) {
      console.error('Upload Error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during upload',
        error: error.message,
      });
    }
  }
);

// ============================================
// @route   POST /api/upload/multiple
// @desc    Upload multiple images to Cloudinary
// @access  Private/Admin
// ============================================
router.post(
  '/multiple',
  protect,
  admin,
  uploadMultipleImages.array('images', 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded',
        });
      }

      const uploadedFiles = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
        originalName: file.originalname,
        size: file.size,
      }));

      res.status(200).json({
        success: true,
        message: `${req.files.length} images uploaded successfully`,
        data: uploadedFiles,
      });
    } catch (error) {
      console.error('Upload Error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during upload',
        error: error.message,
      });
    }
  }
);

// ============================================
// @route   DELETE /api/upload/:publicId
// @desc    Delete image from Cloudinary
// @access  Private/Admin
// ============================================
router.delete('/:publicId', protect, admin, async (req, res) => {
  try {
    const publicId = req.params.publicId;

    // Cloudinary public IDs contain slashes, so we need to decode
    const decodedPublicId = decodeURIComponent(publicId);

    const result = await deleteImage(decodedPublicId);

    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during deletion',
      error: error.message,
    });
  }
});

// ============================================
// @route   GET /api/upload/test
// @desc    Test Cloudinary connection
// @access  Public
// ============================================
router.get('/test', async (req, res) => {
  try {
    const { cloudinary } = require('../config/cloudinary');
    
    // Try to get Cloudinary resource stats
    const result = await cloudinary.api.usage();
    
    res.json({
      success: true,
      message: 'Cloudinary connection successful',
      data: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        plan: result.plan,
        usage: {
          storage: `${(result.storage.usage / 1024 / 1024).toFixed(2)} MB`,
          bandwidth: `${(result.bandwidth.usage / 1024 / 1024).toFixed(2)} MB`,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Cloudinary connection failed',
      error: error.message,
    });
  }
});

module.exports = router;