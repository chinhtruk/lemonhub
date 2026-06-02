const express = require('express');
const router = express.Router();
const {
  getStores,
  getStoreById,
  findNearestStore,
  createStore,
  updateStore,
  deleteStore
} = require('../controllers/storeController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.route('/').get(getStores);
router.route('/nearest').get(findNearestStore);
router.route('/:id').get(getStoreById);

// Admin routes
router.route('/').post(protect, admin, createStore);
router.route('/:id')
  .put(protect, admin, updateStore)
  .delete(protect, admin, deleteStore);

module.exports = router; 