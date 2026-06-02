const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getFeaturedCategories,
  getCategoryBySlug,
  getParentCategories,
  getSubcategories
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getCategories)
  .post(protect, admin, createCategory);

router.get('/featured', getFeaturedCategories);
router.get('/parents', getParentCategories);
router.get('/parent/:id', getSubcategories);
router.get('/slug/:slug', getCategoryBySlug);

router
  .route('/:id')
  .get(getCategoryById)
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

module.exports = router; 