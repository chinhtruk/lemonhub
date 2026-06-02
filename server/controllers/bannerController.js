const Banner = require('../models/Banner');

// @desc    Fetch all banners
// @route   GET /api/banners
// @access  Public
const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({}).sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch a banner by ID
// @route   GET /api/banners/:id
// @access  Private/Admin
const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (banner) {
      res.json(banner);
    } else {
      res.status(404).json({ message: 'Banner không tồn tại' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private/Admin
const createBanner = async (req, res) => {
  try {
    const { title, subtitle, image, link, order, isActive } = req.body;
    
    const banner = new Banner({
      title,
      subtitle,
      image,
      link: link || '',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });
    
    const createdBanner = await banner.save();
    res.status(201).json(createdBanner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
const updateBanner = async (req, res) => {
  try {
    const { title, subtitle, image, link, order, isActive } = req.body;
    
    const banner = await Banner.findById(req.params.id);
    
    if (banner) {
      banner.title = title || banner.title;
      banner.subtitle = subtitle || banner.subtitle;
      banner.image = image || banner.image;
      banner.link = link !== undefined ? link : banner.link;
      banner.order = order !== undefined ? order : banner.order;
      banner.isActive = isActive !== undefined ? isActive : banner.isActive;
      
      const updatedBanner = await banner.save();
      res.json(updatedBanner);
    } else {
      res.status(404).json({ message: 'Banner không tồn tại' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (banner) {
      await banner.deleteOne();
      res.json({ message: 'Banner đã được xóa' });
    } else {
      res.status(404).json({ message: 'Banner không tồn tại' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
}; 