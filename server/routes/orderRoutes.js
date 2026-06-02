const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  getOrderByTrackingCode,
  updateDeliveredCODOrdersToPaid,
  updateOnlinePaymentOrdersToPaid,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/track/:trackingCode').get(getOrderByTrackingCode);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/update-delivered-to-paid').put(protect, admin, updateDeliveredCODOrdersToPaid);
router.route('/update-online-to-paid').put(protect, admin, updateOnlinePaymentOrdersToPaid);

module.exports = router; 