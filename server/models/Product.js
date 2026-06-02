const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    images: [String],
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category',
    },
    description: {
      type: String,
      required: true,
    },
    specifications: {
      type: Map,
      of: String,
      default: new Map(),
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    salePrice: {
      type: Number,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'User',
        },
        name: { type: String, required: true },
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create slug from name before saving
productSchema.pre('save', function(next) {
  // Only auto-generate slug if it's not provided or empty
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 