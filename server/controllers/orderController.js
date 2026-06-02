const Order = require('../models/Order');
const Cart = require('../models/Cart');
const crypto = require('crypto');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    // Generate tracking code
    const trackingCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Kiểm tra nếu phương thức thanh toán là online
    const onlinePaymentMethods = ['momo', 'zalopay', 'vnpay', 'online', 'credit-card'];
    const isPaid = onlinePaymentMethods.includes(paymentMethod);

    console.log(`Đơn hàng mới với phương thức thanh toán: ${paymentMethod}, đặt isPaid: ${isPaid}`);

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      trackingCode,
      isPaid: isPaid,
      paidAt: isPaid ? Date.now() : undefined,
    });

    const createdOrder = await order.save();

    // Clear user's cart after successful order
    try {
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $set: { items: [] } },
        { new: true }
      );
      console.log(`Cart cleared for user ${req.user._id} after order`);
    } catch (cartError) {
      console.error('Error clearing cart:', cartError);
      // We don't want to fail the order if cart clearing fails
      // Just log the error and continue
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.payer.email_address,
      };

      const updatedOrder = await order.save();

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('orderItems.product');

    if (order) {
      // Nếu đơn hàng chưa được đánh dấu là đã giao hàng
      if (!order.isDelivered) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.status = 'delivered';

        // Nếu đơn hàng có phương thức thanh toán là COD và chưa được đánh dấu là đã thanh toán
        // thì tự động đánh dấu là đã thanh toán khi đã giao hàng
        if (!order.isPaid && order.paymentMethod === 'cod') {
          order.isPaid = true;
          order.paidAt = Date.now();
        }

        // Giảm số lượng tồn kho của mỗi sản phẩm
        const Product = require('../models/Product');
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product._id);
          if (product) {
            product.countInStock = Math.max(0, product.countInStock - item.qty);
            await product.save();
            console.log(`Đã giảm số lượng tồn kho của sản phẩm ${product.name} từ ${product.countInStock + item.qty} xuống ${product.countInStock}`);
          }
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
      } else {
        // Đơn hàng đã giao trước đó rồi
        res.json(order);
      }
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('orderItems.product');
    const prevStatus = order ? order.status : null;

    if (order) {
      order.status = status;

      // If status is delivered, update isDelivered
      if (status === 'delivered' && !order.isDelivered) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        
        // Nếu trạng thái là "đã giao" và thanh toán trực tuyến, cập nhật isPaid
        const onlinePaymentMethods = ['momo', 'zalopay', 'vnpay', 'online', 'credit-card'];
        if (!order.isPaid && onlinePaymentMethods.includes(order.paymentMethod)) {
          order.isPaid = true;
          order.paidAt = Date.now();
          console.log(`Đơn hàng ${order._id} đã giao, phương thức ${order.paymentMethod}: cập nhật thành đã thanh toán`);
        }
        
        // Giảm số lượng tồn kho của mỗi sản phẩm khi đơn hàng được giao
        const Product = require('../models/Product');
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product._id);
          if (product) {
            product.countInStock = Math.max(0, product.countInStock - item.qty);
            await product.save();
            console.log(`Đã giảm số lượng tồn kho của sản phẩm ${product.name} từ ${product.countInStock + item.qty} xuống ${product.countInStock}`);
          }
        }
      }
      
      // Nếu đơn hàng từ trạng thái delivered chuyển sang trạng thái khác (hủy giao hàng), 
      // cần tăng lại số lượng sản phẩm
      if (prevStatus === 'delivered' && status !== 'delivered') {
        const Product = require('../models/Product');
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product._id);
          if (product) {
            product.countInStock = product.countInStock + item.qty;
            await product.save();
            console.log(`Đã tăng số lượng tồn kho của sản phẩm ${product.name} từ ${product.countInStock - item.qty} lên ${product.countInStock}`);
          }
        }
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by tracking code
// @route   GET /api/orders/track/:trackingCode
// @access  Public
const getOrderByTrackingCode = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      trackingCode: req.params.trackingCode 
    }).populate('user', 'name email');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update all delivered COD orders to paid
// @route   PUT /api/orders/update-delivered-to-paid
// @access  Private/Admin
const updateDeliveredCODOrdersToPaid = async (req, res) => {
  try {
    // Tìm tất cả đơn hàng đã giao, thanh toán COD nhưng chưa đánh dấu là đã thanh toán
    const orders = await Order.find({
      status: 'delivered',
      paymentMethod: 'cod',
      isPaid: false
    });

    if (orders.length === 0) {
      return res.json({ message: 'Không có đơn hàng cần cập nhật', count: 0 });
    }

    // Cập nhật tất cả các đơn hàng này
    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        order.isPaid = true;
        order.paidAt = Date.now();
        return await order.save();
      })
    );

    res.json({
      message: `Đã cập nhật ${updatedOrders.length} đơn hàng thành đã thanh toán`,
      count: updatedOrders.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update all online payment orders to paid
// @route   PUT /api/orders/update-online-to-paid
// @access  Private/Admin
const updateOnlinePaymentOrdersToPaid = async (req, res) => {
  try {
    // Tìm tất cả đơn hàng thanh toán online nhưng chưa đánh dấu là đã thanh toán
    const onlinePaymentMethods = ['momo', 'zalopay', 'vnpay', 'online', 'credit-card'];
    const orders = await Order.find({
      paymentMethod: { $in: onlinePaymentMethods },
      isPaid: false
    });

    if (orders.length === 0) {
      return res.json({ message: 'Không có đơn hàng cần cập nhật', count: 0 });
    }

    console.log(`Tìm thấy ${orders.length} đơn hàng thanh toán online chưa đánh dấu là đã thanh toán`);
    console.log('Phương thức thanh toán của các đơn hàng:', orders.map(o => o.paymentMethod));

    // Cập nhật tất cả các đơn hàng này
    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        order.isPaid = true;
        order.paidAt = Date.now();
        const saved = await order.save();
        console.log(`Đã cập nhật đơn hàng ${order._id} với phương thức ${order.paymentMethod} thành đã thanh toán`);
        return saved;
      })
    );

    res.json({
      message: `Đã cập nhật ${updatedOrders.length} đơn hàng thanh toán online thành đã thanh toán`,
      count: updatedOrders.length,
      orders: updatedOrders.map(o => ({id: o._id, method: o.paymentMethod}))
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật đơn hàng thanh toán online:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
}; 