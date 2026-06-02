const mongoose = require('mongoose');

const cartItemSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    items: [cartItemSchema],
    coupon: {
      code: {
        type: String,
      },
      discount: {
        type: Number, 
      },
    },
    shippingMethod: {
      id: {
        type: String,
      },
      name: {
        type: String,
      },
      price: {
        type: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart; 