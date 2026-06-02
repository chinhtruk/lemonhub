const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  changePassword,
  uploadAvatar
} = require('../controllers/userController');

const {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../controllers/addressController');

const {
  getUserPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod
} = require('../controllers/paymentMethodController');

const {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist
} = require('../controllers/wishlistController');

const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/login', authUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);

// Add route for changing password
router.route('/change-password').put(protect, changePassword);

// Add route for uploading avatar
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

// Routes for user addresses
router
  .route('/addresses')
  .get(protect, getUserAddresses)
  .post(protect, addAddress);

router
  .route('/addresses/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

router.route('/addresses/:id/default').put(protect, setDefaultAddress);

// Routes for user payment methods
router
  .route('/payment-methods')
  .get(protect, getUserPaymentMethods)
  .post(protect, addPaymentMethod);

router
  .route('/payment-methods/:id')
  .put(protect, updatePaymentMethod)
  .delete(protect, deletePaymentMethod);

router.route('/payment-methods/:id/default').put(protect, setDefaultPaymentMethod);

// Routes for user wishlist
router
  .route('/wishlist')
  .get(protect, getUserWishlist)
  .post(protect, addToWishlist);

router
  .route('/wishlist/:productId')
  .get(protect, checkWishlist)
  .delete(protect, removeFromWishlist);

module.exports = router;