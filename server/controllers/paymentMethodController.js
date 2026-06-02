const PaymentMethod = require('../models/PaymentMethod');
const asyncHandler = require('express-async-handler');

// @desc    Get user payment methods
// @route   GET /api/users/payment-methods
// @access  Private
const getUserPaymentMethods = asyncHandler(async (req, res) => {
  const paymentMethods = await PaymentMethod.find({ user: req.user._id })
    .sort({ isDefault: -1, createdAt: -1 });
  
  res.json(paymentMethods.map(method => ({
    id: method._id,
    type: method.type,
    cardNumber: method.cardNumber,
    expiryDate: method.expiryDate,
    cardType: method.cardType,
    bankName: method.bankName,
    isDefault: method.isDefault
  })));
});

// @desc    Add new payment method
// @route   POST /api/users/payment-methods
// @access  Private
const addPaymentMethod = asyncHandler(async (req, res) => {
  const { type, cardNumber, expiryDate, cardType, bankName, isDefault } = req.body;

  if (!type || !cardNumber || !expiryDate) {
    res.status(400);
    throw new Error('Vui lòng điền đầy đủ thông tin');
  }

  if (type === 'bank' && !bankName) {
    res.status(400);
    throw new Error('Vui lòng nhập tên ngân hàng');
  }

  // Nếu là phương thức đầu tiên, tự động đặt làm mặc định
  const existingMethods = await PaymentMethod.countDocuments({ user: req.user._id });
  const shouldBeDefault = isDefault || existingMethods === 0;

  const newPaymentMethod = await PaymentMethod.create({
    user: req.user._id,
    type,
    cardNumber,
    expiryDate,
    cardType: cardType || 'visa',
    bankName: bankName || '',
    isDefault: shouldBeDefault
  });

  res.status(201).json({
    id: newPaymentMethod._id,
    type: newPaymentMethod.type,
    cardNumber: newPaymentMethod.cardNumber,
    expiryDate: newPaymentMethod.expiryDate,
    cardType: newPaymentMethod.cardType,
    bankName: newPaymentMethod.bankName,
    isDefault: newPaymentMethod.isDefault
  });
});

// @desc    Update payment method
// @route   PUT /api/users/payment-methods/:id
// @access  Private
const updatePaymentMethod = asyncHandler(async (req, res) => {
  const { type, cardNumber, expiryDate, cardType, bankName, isDefault } = req.body;
  
  // Tìm phương thức thanh toán hiện tại
  const methodToUpdate = await PaymentMethod.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!methodToUpdate) {
    res.status(404);
    throw new Error('Phương thức thanh toán không tồn tại');
  }

  // Cập nhật thông tin
  methodToUpdate.type = type || methodToUpdate.type;
  methodToUpdate.cardNumber = cardNumber || methodToUpdate.cardNumber;
  methodToUpdate.expiryDate = expiryDate || methodToUpdate.expiryDate;
  methodToUpdate.cardType = cardType || methodToUpdate.cardType;
  methodToUpdate.bankName = bankName !== undefined ? bankName : methodToUpdate.bankName;
  
  // Nếu đặt làm mặc định, cập nhật tất cả các phương thức khác
  if (isDefault && !methodToUpdate.isDefault) {
    methodToUpdate.isDefault = true;
  }

  const updatedMethod = await methodToUpdate.save();

  res.json({
    id: updatedMethod._id,
    type: updatedMethod.type,
    cardNumber: updatedMethod.cardNumber,
    expiryDate: updatedMethod.expiryDate,
    cardType: updatedMethod.cardType,
    bankName: updatedMethod.bankName,
    isDefault: updatedMethod.isDefault
  });
});

// @desc    Delete payment method
// @route   DELETE /api/users/payment-methods/:id
// @access  Private
const deletePaymentMethod = asyncHandler(async (req, res) => {
  const methodToDelete = await PaymentMethod.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!methodToDelete) {
    res.status(404);
    throw new Error('Phương thức thanh toán không tồn tại');
  }

  const wasDefault = methodToDelete.isDefault;
  
  await PaymentMethod.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  // Nếu phương thức bị xóa là mặc định, đặt phương thức đầu tiên làm mặc định (nếu có)
  if (wasDefault) {
    const firstMethod = await PaymentMethod.findOne({ user: req.user._id });
    if (firstMethod) {
      firstMethod.isDefault = true;
      await firstMethod.save();
    }
  }

  res.json({ message: 'Đã xóa phương thức thanh toán' });
});

// @desc    Set payment method as default
// @route   PUT /api/users/payment-methods/:id/default
// @access  Private
const setDefaultPaymentMethod = asyncHandler(async (req, res) => {
  const method = await PaymentMethod.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!method) {
    res.status(404);
    throw new Error('Phương thức thanh toán không tồn tại');
  }

  // Đặt tất cả phương thức khác không phải mặc định
  await PaymentMethod.updateMany(
    { user: req.user._id, _id: { $ne: method._id } },
    { $set: { isDefault: false } }
  );

  // Đặt phương thức hiện tại làm mặc định
  method.isDefault = true;
  await method.save();

  res.json({
    id: method._id,
    type: method.type,
    cardNumber: method.cardNumber,
    expiryDate: method.expiryDate,
    cardType: method.cardType,
    bankName: method.bankName,
    isDefault: method.isDefault
  });
});

module.exports = {
  getUserPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod
}; 