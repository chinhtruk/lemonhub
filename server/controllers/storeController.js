const Store = require('../models/Store');

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
const getStores = async (req, res) => {
  try {
    const { city } = req.query;
    
    let filter = { isActive: true };
    if (city) {
      filter.city = city;
    }
    
    const stores = await Store.find(filter);
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ message: 'Không thể tải danh sách cửa hàng' });
  }
};

// @desc    Get store by ID
// @route   GET /api/stores/:id
// @access  Public
const getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    
    if (store) {
      res.json(store);
    } else {
      res.status(404).json({ message: 'Không tìm thấy cửa hàng' });
    }
  } catch (error) {
    console.error('Error fetching store by ID:', error);
    res.status(500).json({ message: 'Không thể tải thông tin cửa hàng' });
  }
};

// @desc    Find nearest store
// @route   GET /api/stores/nearest
// @access  Public
const findNearestStore = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Vui lòng cung cấp vị trí của bạn' });
    }
    
    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);
    
    // Get all active stores
    const stores = await Store.find({ isActive: true });
    
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Không có cửa hàng nào' });
    }
    
    // Calculate distance using Haversine formula
    const storesWithDistance = stores.map(store => {
      const storeLat = store.location.latitude;
      const storeLng = store.location.longitude;
      
      // Calculate distance in kilometers
      const R = 6371; // Earth's radius in km
      const dLat = toRad(storeLat - userLat);
      const dLon = toRad(storeLng - userLng);
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(userLat)) * Math.cos(toRad(storeLat)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      return {
        ...store.toObject(),
        distance
      };
    });
    
    // Sort by distance and get the nearest
    storesWithDistance.sort((a, b) => a.distance - b.distance);
    const nearestStore = storesWithDistance[0];
    
    res.json(nearestStore);
  } catch (error) {
    console.error('Error finding nearest store:', error);
    res.status(500).json({ message: 'Không thể tìm cửa hàng gần nhất' });
  }
};

// @desc    Create a new store (admin only)
// @route   POST /api/stores
// @access  Private/Admin
const createStore = async (req, res) => {
  try {
    const {
      name,
      address,
      phone,
      hours,
      image,
      location,
      city
    } = req.body;
    
    const store = new Store({
      name,
      address,
      phone,
      hours,
      image: image || '/uploads/stores/default-store.jpg',
      location,
      city,
      isActive: true
    });
    
    const createdStore = await store.save();
    res.status(201).json(createdStore);
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ message: 'Không thể tạo cửa hàng mới' });
  }
};

// @desc    Update a store (admin only)
// @route   PUT /api/stores/:id
// @access  Private/Admin
const updateStore = async (req, res) => {
  try {
    const {
      name,
      address,
      phone,
      hours,
      image,
      location,
      city,
      isActive
    } = req.body;
    
    const store = await Store.findById(req.params.id);
    
    if (store) {
      store.name = name || store.name;
      store.address = address || store.address;
      store.phone = phone || store.phone;
      store.hours = hours || store.hours;
      store.image = image || store.image;
      store.location = location || store.location;
      store.city = city || store.city;
      store.isActive = isActive !== undefined ? isActive : store.isActive;
      
      const updatedStore = await store.save();
      res.json(updatedStore);
    } else {
      res.status(404).json({ message: 'Không tìm thấy cửa hàng' });
    }
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({ message: 'Không thể cập nhật cửa hàng' });
  }
};

// @desc    Delete a store (admin only)
// @route   DELETE /api/stores/:id
// @access  Private/Admin
const deleteStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    
    if (store) {
      await store.deleteOne();
      res.json({ message: 'Đã xóa cửa hàng' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy cửa hàng' });
    }
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).json({ message: 'Không thể xóa cửa hàng' });
  }
};

// Helper function to convert degrees to radians
function toRad(value) {
  return value * Math.PI / 180;
}

module.exports = {
  getStores,
  getStoreById,
  findNearestStore,
  createStore,
  updateStore,
  deleteStore
}; 