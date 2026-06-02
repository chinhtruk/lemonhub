const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get revenue statistics
// @route   GET /api/statistics/revenue
// @access  Private/Admin
const getRevenueStatistics = async (req, res) => {
  try {
    const { period = 'month', year = new Date().getFullYear(), month } = req.query;

    let startDate, endDate;
    let groupBy;

    switch (period) {
      case 'year':
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
        groupBy = { $month: '$createdAt' };
        break;
      case 'month':
        if (!month) {
          return res.status(400).json({ message: 'Month parameter is required for monthly view' });
        }
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0);
        groupBy = { $dayOfMonth: '$createdAt' };
        break;
      case 'quarter':
        const quarter = Math.floor((month - 1) / 3);
        startDate = new Date(year, quarter * 3, 1);
        endDate = new Date(year, (quarter + 1) * 3, 0);
        groupBy = { $month: '$createdAt' };
        break;
      default:
        return res.status(400).json({ message: 'Invalid period parameter' });
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          status: 'Delivered',
          createdAt: { $gte: startDate, $lte: endDate }
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
    console.error('Error in getRevenueStatistics:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Get product category distribution
// @route   GET /api/statistics/product-categories
// @access  Private/Admin
const getProductCategoryDistribution = async (req, res) => {
  try {
    const distribution = await Product.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$categoryInfo.name'
        }
      }
    ]);

    res.json(distribution);
  } catch (error) {
    console.error('Error in getProductCategoryDistribution:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  getRevenueStatistics,
  getProductCategoryDistribution
}; 