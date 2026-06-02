const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getRevenueStats,
  getProductCategoryStats,
  getDashboardStats
} = require('../controllers/statisticsController');

// All routes are protected and require admin access
router.use(protect, admin);

router.get('/revenue', getRevenueStats);
router.get('/products/categories', getProductCategoryStats);
router.get('/dashboard', getDashboardStats);

module.exports = router; 