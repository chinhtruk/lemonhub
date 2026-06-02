const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../utils/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// @route   POST /api/upload
// @desc    Upload an image
// @access  Private/Admin
router.post('/', protect, admin, (req, res, next) => {
  console.log('Upload request received:', req.originalUrl);
  next();
}, uploadMiddleware.single('image'), (req, res) => {
  try {
    console.log('File processed:', req.file);
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file nào được tải lên' });
    }
    
    const filePath = `/${req.file.path.replace(/\\/g, '/')}`;
    console.log('Responding with file path:', filePath);
    
    res.json({
      message: 'Image uploaded successfully',
      image: filePath,
    });
  } catch (error) {
    console.error('Error in upload route handler:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple images
// @access  Private/Admin
router.post(
  '/multiple',
  protect,
  admin,
  (req, res, next) => {
    console.log('Multiple upload request received');
    next();
  },
  uploadMiddleware.array('images', 5),
  (req, res) => {
    try {
      console.log('Files processed:', req.files);
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Không có file nào được tải lên' });
      }
      
      const imagePaths = req.files.map((file) => 
        `/${file.path.replace(/\\/g, '/')}`
      );
      
      console.log('Responding with file paths:', imagePaths);
      
      res.json({
        message: 'Images uploaded successfully',
        images: imagePaths,
      });
    } catch (error) {
      console.error('Error in multiple upload route handler:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   POST /api/upload/store
// @desc    Upload a store image
// @access  Private/Admin
router.post(
  '/store',
  protect,
  admin,
  (req, res, next) => {
    console.log('Store image upload request received');
    next();
  },
  uploadMiddleware.single('image'),
  (req, res) => {
    try {
      console.log('Store image processed:', req.file);
      if (!req.file) {
        return res.status(400).json({ message: 'Không có file nào được tải lên' });
      }
      
      const filePath = `/${req.file.path.replace(/\\/g, '/')}`;
      console.log('Responding with store image path:', filePath);
      
      res.json({
        message: 'Store image uploaded successfully',
        image: filePath,
      });
    } catch (error) {
      console.error('Error in store image upload route handler:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router; 