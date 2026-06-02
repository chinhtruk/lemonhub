const express = require('express');
const router = express.Router();
const {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/bannerController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.route('/').get(getBanners);

// Admin only routes
router.route('/').post(protect, admin, createBanner);
router
  .route('/:id')
  .get(protect, admin, getBannerById)
  .put(protect, admin, updateBanner)
  .delete(protect, admin, deleteBanner);

module.exports = router; 