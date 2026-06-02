const mongoose = require('mongoose');

const paymentMethodSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    type: {
      type: String,
      required: true,
      enum: ['credit', 'debit', 'bank'],
    },
    cardNumber: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: String,
      required: true,
    },
    cardType: {
      type: String,
      enum: ['visa', 'mastercard', 'jcb'],
      default: 'visa',
    },
    bankName: {
      type: String,
      default: '',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Đảm bảo chỉ có một phương thức thanh toán mặc định cho mỗi người dùng
paymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

module.exports = PaymentMethod; 