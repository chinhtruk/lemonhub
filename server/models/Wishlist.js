const mongoose = require('mongoose');

const wishlistSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
  },
  {
    timestamps: true,
  }
);

// Đảm bảo mỗi sản phẩm chỉ xuất hiện một lần trong wishlist của mỗi người dùng
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist; 