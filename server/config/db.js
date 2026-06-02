const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Remove useNewUrlParser và useUnifiedTopology (deprecated từ Mongoose 6+)
      serverSelectionTimeoutMS: 30000,  // Timeout 30 giây cho server selection
      socketTimeoutMS: 45000,           // Timeout cho socket
      family: 4,                        // Sử dụng IPv4 (tránh IPv6 issues)
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`MongoDB Database: ${conn.connection.name}`);  // Log tên DB để confirm
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    console.error(`Full Error Details: ${JSON.stringify(error, null, 2)}`);  // Log chi tiết để debug
    process.exit(1);  // Exit nếu connect fail
  }
};

module.exports = connectDB;