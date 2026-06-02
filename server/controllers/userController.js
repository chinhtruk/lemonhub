const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const getJwtSecret = require('../utils/jwtSecret');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: '7d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, birthday, gender, isAdmin } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      address: address || '',
      birthday: birthday || '',
      gender: gender || '',
      isAdmin: isAdmin || false,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        birthday: user.birthday,
        gender: user.gender,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        phone: user.phone,
        address: user.address,
        birthday: user.birthday,
        gender: user.gender,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.birthday = req.body.birthday || user.birthday;
      user.gender = req.body.gender || user.gender;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        phone: updatedUser.phone,
        address: updatedUser.address,
        birthday: updatedUser.birthday,
        gender: updatedUser.gender,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.birthday = req.body.birthday || user.birthday;
      user.gender = req.body.gender || user.gender;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        phone: updatedUser.phone,
        address: updatedUser.address,
        birthday: updatedUser.birthday,
        gender: updatedUser.gender,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find the user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Check if current password is correct
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác' });
    }

    // Set new password and save
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Mật khẩu đã được thay đổi thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload user avatar
// @route   POST /api/users/upload-avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  // Check if file exists
  if (!req.file) {
    res.status(400);
    throw new Error('Hãy chọn một file hình ảnh');
  }

  // Get file path
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  
  // Update user avatar in database
  const user = await User.findById(req.user._id);
  user.avatar = avatarUrl;
  await user.save();

  res.status(200).json({
    success: true,
    avatarUrl: avatarUrl,
    message: 'Avatar đã được cập nhật thành công'
  });
});

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  changePassword,
  uploadAvatar,
}; 
