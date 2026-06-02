const express = require('express');
const router = express.Router();
const {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// All cart routes require authentication
router.use(protect);

// Base cart routes
router.route('/')
  .get(getCart)
  .delete(clearCart);

// Cart items routes
router.route('/items')
  .post(addItemToCart);

router.route('/items/:id')
  .put(updateCartItem)
  .delete(removeCartItem);

module.exports = router; 