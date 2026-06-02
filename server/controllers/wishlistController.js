const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getUserWishlist = asyncHandler(async (req, res) => {
  // Tìm tất cả các mục wishlist của người dùng
  const wishlistItems = await Wishlist.find({ user: req.user._id }).populate({
    path: 'product',
    select: 'name image price originalPrice discount brand'
  });
  
  // Chuyển đổi dữ liệu để phù hợp với frontend
  const products = wishlistItems.map(item => {
    const product = item.product;
    return {
      id: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      brand: product.brand,
      createdAt: item.createdAt
    };
  });
  
  res.json(products);
});

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Vui lòng cung cấp ID sản phẩm');
  }

  // Kiểm tra sản phẩm có tồn tại không
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm');
  }

  // Kiểm tra xem sản phẩm đã tồn tại trong wishlist chưa
  const existingWishlistItem = await Wishlist.findOne({
    user: req.user._id,
    product: productId
  });

  if (existingWishlistItem) {
    res.status(400);
    throw new Error('Sản phẩm đã tồn tại trong danh sách yêu thích');
  }

  // Thêm vào wishlist
  const wishlistItem = await Wishlist.create({
    user: req.user._id,
    product: productId
  });

  if (wishlistItem) {
    res.status(201).json({
      success: true,
      message: 'Đã thêm sản phẩm vào danh sách yêu thích'
    });
  } else {
    res.status(500);
    throw new Error('Không thể thêm vào danh sách yêu thích');
  }
});

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const productId = req.params.productId;

  const result = await Wishlist.findOneAndDelete({
    user: req.user._id,
    product: productId
  });

  if (result) {
    res.json({ 
      success: true,
      message: 'Đã xóa sản phẩm khỏi danh sách yêu thích' 
    });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm trong danh sách yêu thích');
  }
});

// @desc    Check if product is in wishlist
// @route   GET /api/users/wishlist/:productId
// @access  Private
const checkWishlist = asyncHandler(async (req, res) => {
  const productId = req.params.productId;

  const wishlistItem = await Wishlist.findOne({
    user: req.user._id,
    product: productId
  });

  res.json({
    inWishlist: !!wishlistItem
  });
});

module.exports = {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist
}; 