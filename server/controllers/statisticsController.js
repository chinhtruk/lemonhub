const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get revenue statistics
// @route   GET /api/statistics/revenue
// @access  Private/Admin
const getRevenueStats = async (req, res) => {
  try {
    const { period = 'month', year = new Date().getFullYear(), month } = req.query;

    let startDate, endDate;
    let groupBy;

    if (period === 'year') {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
      groupBy = { $month: '$createdAt' };
    } else if (period === 'month') {
      if (!month) {
        return res.status(400).json({ message: 'Month parameter is required for monthly view' });
      }
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
      groupBy = { $dayOfMonth: '$createdAt' };
    } else if (period === 'quarter') {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
      groupBy = {
        $ceil: {
          $divide: [{ $month: '$createdAt' }, 3]
        }
      };
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          status: 'Delivered',
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      period,
      year,
      month,
      data: revenueData
    });
  } catch (error) {
    console.error('Error in getRevenueStats:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Get product category statistics
// @route   GET /api/statistics/products/categories
// @access  Private/Admin
const getProductCategoryStats = async (req, res) => {
  try {
    const categoryStats = await Product.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      {
        $group: {
          _id: '$category',
          categoryName: { $first: '$categoryInfo.name' },
          count: { $sum: 1 },
          totalValue: { 
            $sum: { 
              $multiply: ['$price', '$countInStock'] 
            } 
          }
        }
      },
      {
        $project: {
          _id: 1,
          categoryName: 1,
          count: 1,
          totalValue: 1,
          percentage: {
            $multiply: [
              { $divide: ['$count', { $sum: '$count' }] },
              100
            ]
          }
        }
      }
    ]);

    res.json(categoryStats);
  } catch (error) {
    console.error('Error in getProductCategoryStats:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Get dashboard overview statistics
// @route   GET /api/statistics/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments({ isActive: true });
    
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);

    const monthlyOrders = await Order.countDocuments({
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: 'Delivered',
          createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);

    res.json({
      totalUsers,
      totalProducts,
      monthlyOrders,
      monthlyRevenue: monthlyRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  getRevenueStats,
  getProductCategoryStats,
  getDashboardStats
}; 