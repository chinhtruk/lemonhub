const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner; 