const jwt = require('jsonwebtoken');
const User = require('../models/User');
const getJwtSecret = require('../utils/jwtSecret');

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, getJwtSecret());

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        return res.json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('Auth token error:', error.name, error.message);
      
      if (error.name === 'TokenExpiredError') {
        res.status(401);
        return res.json({ message: 'Token has expired, please log in again' });
      } else if (error.name === 'JsonWebTokenError') {
        res.status(401);
        return res.json({ message: 'Invalid token, please log in again' });
      } else {
        res.status(401);
        return res.json({ message: 'Not authorized, token failed' });
      }
    }
  }

  if (!token) {
    res.status(401);
    return res.json({ message: 'Not authorized, no token' });
  }
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    res.json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin }; 
