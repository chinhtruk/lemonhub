const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getRevenueStatistics,
  getProductCategoryDistribution
} = require('../controllers/statisticController');

router.get('/revenue', protect, admin, getRevenueStatistics);
router.get('/product-categories', protect, admin, getProductCategoryDistribution);

module.exports = router; 