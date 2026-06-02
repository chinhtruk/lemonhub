require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const cartRoutes = require('./routes/cartRoutes');
const storeRoutes = require('./routes/storeRoutes');
const statisticRoutes = require('./routes/statisticRoutes');

// Function để start server (async để đợi DB connect)
const startServer = async () => {
  try {
    // Connect to database trước
    await connectDB();

    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Mount routes
    app.use('/api/users', userRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/upload', uploadRoutes);
    app.use('/api/banners', bannerRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/stores', storeRoutes);
    app.use('/api/statistics', statisticRoutes);

    // Make uploads folder static
    app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

    // Serve static assets if in production
    if (process.env.NODE_ENV === 'production') {
      // Set static folder
      app.use(express.static(path.join(__dirname, '../customer/build')));

      // Any route that is not api will be redirected to index.html
      app.get('*', (req, res) =>
        res.sendFile(path.resolve(__dirname, '../customer', 'build', 'index.html'))
      );
    } else {
      app.get('/', (req, res) => {
        res.send('API is running....');
      });
    }

    // Error handling middleware
    app.use((err, req, res, next) => {
      const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
      res.status(statusCode);
      res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
      });
    });

    const PORT = process.env.PORT || 5001;

    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server
startServer();