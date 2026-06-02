const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({})
    .populate('category')
    .sort('-createdAt');
  res.json({ products });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      slug,
      price,
      image,
      images,
      brand,
      category,
      description,
      countInStock,
      specifications,
      isFeatured,
      salePrice,
    } = req.body;

    // Create a new product with all fields
    const product = new Product({
      name,
      slug, // Explicitly include slug from request
      price,
      image,
      images: images || [],
      brand,
      category,
      description,
      countInStock,
      specifications: specifications || {},
      isFeatured: isFeatured || false,
      salePrice: salePrice || 0,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Product creation error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: messages,
        details: error.errors
      });
    }
    
    // Handle duplicate key errors (e.g., duplicate slug)
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate key error',
        error: `Field '${Object.keys(error.keyPattern)[0]}' with value '${error.keyValue[Object.keys(error.keyPattern)[0]]}' already exists`
      });
    }
    
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    image,
    images,
    brand,
    category,
    description,
    countInStock,
    specifications,
    isFeatured,
    salePrice,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.image = image;
    product.images = images || product.images;
    product.brand = brand;
    product.category = category;
    product.description = description;
    product.countInStock = countInStock;
    product.specifications = specifications || product.specifications;
    product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
    product.salePrice = salePrice || product.salePrice;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Sản phẩm đã được xóa' });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm');
  }
});

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const products = await Product.find({ category: req.params.categoryId })
    .populate('category')
    .sort('-createdAt');
  res.json({ products });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { brand: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  const products = await Product.find({ ...keyword })
    .populate('category')
    .sort('-createdAt');
  res.json({ products });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true })
    .populate('category')
    .sort('-createdAt')
    .limit(10);
  res.json({ products });
});

// @desc    Get new products
// @route   GET /api/products/new
// @access  Public
const getNewProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({})
    .populate('category')
    .sort('-createdAt')
    .limit(10);
  res.json({ products });
});

// @desc    Get best selling products
// @route   GET /api/products/best-selling
// @access  Public
const getBestSellingProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({})
    .populate('category')
    .sort('-rating')
    .limit(10);
  res.json({ products });
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm');
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  })
    .populate('category')
    .limit(4);

  res.json({ products: relatedProducts });
});

module.exports = {
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
}; 