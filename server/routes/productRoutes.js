const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  getFeaturedProducts,
  getNewProducts,
  getBestSellingProducts,
  getRelatedProducts
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/newest', getNewProducts);
router.get('/new', getNewProducts);
router.get('/best-selling', getBestSellingProducts);
router.get('/category/:categoryId', getProductsByCategory);

// Route động phải đặt sau route cố định 
router.get('/:id/related', getRelatedProducts);
router.get('/:id', getProductById);

// Protected routes (admin only)
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router; 