const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create avatars directory if it doesn't exist
const avatarsDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/avatars'));
  },
  filename: function (req, file, cb) {
    // Generate unique filename with user ID and timestamp
    const userId = req.user._id;
    const timestamp = Date.now();
    const fileExt = path.extname(file.originalname);
    cb(null, `user_${userId}_${timestamp}${fileExt}`);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Accept only image files
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file hình ảnh (jpeg, jpg, png, gif, webp)'));
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: fileFilter
});

module.exports = upload; 