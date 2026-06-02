const Address = require('../models/Address');
const asyncHandler = require('express-async-handler');

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
const getUserAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id })
    .sort({ isDefault: -1, createdAt: -1 });
  
  res.json(addresses.map(address => ({
    id: address._id,
    fullName: address.fullName,
    phone: address.phone,
    address: address.address,
    isDefault: address.isDefault
  })));
});

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const { fullName, phone, address, isDefault } = req.body;

  if (!fullName || !phone || !address) {
    res.status(400);
    throw new Error('Vui lòng điền đầy đủ thông tin');
  }

  // Nếu đây là địa chỉ đầu tiên, tự động đặt làm mặc định
  const existingAddresses = await Address.countDocuments({ user: req.user._id });
  const shouldBeDefault = isDefault || existingAddresses === 0;

  const newAddress = await Address.create({
    user: req.user._id,
    fullName,
    phone,
    address,
    isDefault: shouldBeDefault
  });

  res.status(201).json({
    id: newAddress._id,
    fullName: newAddress.fullName,
    phone: newAddress.phone,
    address: newAddress.address,
    isDefault: newAddress.isDefault
  });
});

// @desc    Update address
// @route   PUT /api/users/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const { fullName, phone, address, isDefault } = req.body;
  
  // Tìm địa chỉ hiện tại
  const addressToUpdate = await Address.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!addressToUpdate) {
    res.status(404);
    throw new Error('Địa chỉ không tồn tại');
  }

  // Cập nhật thông tin
  addressToUpdate.fullName = fullName || addressToUpdate.fullName;
  addressToUpdate.phone = phone || addressToUpdate.phone;
  addressToUpdate.address = address || addressToUpdate.address;
  
  // Nếu đặt làm mặc định, cập nhật tất cả các địa chỉ khác
  if (isDefault && !addressToUpdate.isDefault) {
    addressToUpdate.isDefault = true;
  }

  const updatedAddress = await addressToUpdate.save();

  res.json({
    id: updatedAddress._id,
    fullName: updatedAddress.fullName,
    phone: updatedAddress.phone,
    address: updatedAddress.address,
    isDefault: updatedAddress.isDefault
  });
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const addressToDelete = await Address.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!addressToDelete) {
    res.status(404);
    throw new Error('Địa chỉ không tồn tại');
  }

  const wasDefault = addressToDelete.isDefault;
  
  await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  // Nếu địa chỉ bị xóa là mặc định, đặt địa chỉ đầu tiên làm mặc định (nếu có)
  if (wasDefault) {
    const firstAddress = await Address.findOne({ user: req.user._id });
    if (firstAddress) {
      firstAddress.isDefault = true;
      await firstAddress.save();
    }
  }

  res.json({ message: 'Đã xóa địa chỉ' });
});

// @desc    Set address as default
// @route   PUT /api/users/addresses/:id/default
// @access  Private
const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!address) {
    res.status(404);
    throw new Error('Địa chỉ không tồn tại');
  }

  // Đặt tất cả địa chỉ khác không phải mặc định
  await Address.updateMany(
    { user: req.user._id, _id: { $ne: address._id } },
    { $set: { isDefault: false } }
  );

  // Đặt địa chỉ hiện tại làm mặc định
  address.isDefault = true;
  await address.save();

  res.json({
    id: address._id,
    fullName: address.fullName,
    phone: address.phone,
    address: address.address,
    isDefault: address.isDefault
  });
});

module.exports = {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
}; 