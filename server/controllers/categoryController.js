const Category = require('../models/Category');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Fetch all categories with product counts
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    // Aggregate to get categories with product counts
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      {
        $project: {
          products: 0 // Remove products array from result
        }
      },
      {
        $sort: { order: 1 }
      }
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, slug, image, description, parentCategory, isFeatured, order } = req.body;

    const category = new Category({
      name,
      slug,
      image: image || '',
      description: description || '',
      parentCategory: parentCategory || null,
      isFeatured: isFeatured || false,
      order: order || 0,
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const { name, slug, image, description, parentCategory, isFeatured, order } = req.body;

    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = name || category.name;
      category.slug = slug || category.slug;
      category.image = image || category.image;
      category.description = description || category.description;
      category.parentCategory = parentCategory !== undefined ? parentCategory : category.parentCategory;
      category.isFeatured = isFeatured !== undefined ? isFeatured : category.isFeatured;
      category.order = order !== undefined ? order : category.order;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      await category.deleteOne();
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get featured categories with product counts
// @route   GET /api/categories/featured
// @access  Public
const getFeaturedCategories = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $match: { isFeatured: true }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      {
        $project: {
          products: 0
        }
      },
      {
        $sort: { order: 1 }
      }
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get parent categories only
// @route   GET /api/categories/parents
// @access  Public
const getParentCategories = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $match: { parentCategory: null }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      {
        $project: {
          products: 0
        }
      },
      {
        $sort: { order: 1 }
      }
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get subcategories by parent ID with product counts
// @route   GET /api/categories/parent/:id
// @access  Public
const getSubcategories = async (req, res) => {
  try {
    const parentId = mongoose.Types.ObjectId(req.params.id);
    
    const categories = await Category.aggregate([
      {
        $match: { parentCategory: parentId }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      {
        $project: {
          products: 0
        }
      },
      {
        $sort: { order: 1 }
      }
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getFeaturedCategories,
  getCategoryBySlug,
  getParentCategories,
  getSubcategories
}; 