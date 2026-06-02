const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo các thư mục uploads nếu chưa tồn tại
const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/products',
    'uploads/stores',
    'uploads/categories',
    'uploads/banners',
    'uploads/avatars'
  ];
  
  dirs.forEach(dir => {
    const dirPath = path.resolve(dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`Creating directory: ${dirPath}`);
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

// Khởi tạo thư mục
createUploadDirs();

// Custom storage dựa vào loại file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Xác định thư mục dựa vào route và field
    let uploadDir = 'uploads';
    
    if (req.originalUrl.includes('/api/upload/multiple')) {
      uploadDir = 'uploads/products';
    } else if (file.fieldname === 'avatar') {
      uploadDir = 'uploads/avatars';
    } else if (req.originalUrl.includes('/api/categories')) {
      uploadDir = 'uploads/categories';
    } else if (req.originalUrl.includes('/api/banners')) {
      uploadDir = 'uploads/banners';
    } else if (req.originalUrl.includes('/api/stores')) {
      uploadDir = 'uploads/stores';
    }
    
    // Mặc định sử dụng field
    if (file.fieldname === 'store') {
      uploadDir = 'uploads/stores';
    }
    
    // Log thông tin
    console.log(`Uploading file ${file.originalname} to ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Tạo tên file an toàn: fieldname-timestamp-randomstring.extension
    const fileName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    console.log(`Generated filename: ${fileName}`);
    cb(null, fileName);
  },
});

// Check file type
const checkFileType = (file, cb) => {
  // Allowed file extensions
  const filetypes = /jpeg|jpg|png|gif|webp/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error(`Chỉ chấp nhận file hình ảnh. Định dạng ${file.mimetype} không được hỗ trợ.`));
  }
};

// Initialize multer upload
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('image');

// Custom middleware để xử lý lỗi multer
const uploadMiddleware = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Lỗi từ Multer
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
          message: 'Kích thước file vượt quá giới hạn cho phép (5MB)' 
        });
      }
      console.error('Multer error:', err);
      return res.status(400).json({ message: `Lỗi upload: ${err.message}` });
    } else if (err) {
      // Lỗi khác
      console.error('Other upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    // Thành công
    if (req.file) {
      console.log('File uploaded successfully:', req.file.path);
    } else if (req.files) {
      console.log('Files uploaded successfully:', req.files.map(f => f.path));
    } else {
      console.warn('No files were uploaded');
      return res.status(400).json({ message: 'Không có file nào được tải lên' });
    }
    
    next();
  });
};

module.exports = {
  upload: uploadMiddleware,
  array: (fieldName, maxCount) => {
    const uploadArray = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
      },
    }).array(fieldName, maxCount);
    
    return (req, res, next) => {
      uploadArray(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          // Lỗi từ Multer
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ 
              message: 'Kích thước file vượt quá giới hạn cho phép (5MB)' 
            });
          }
          console.error('Multer error:', err);
          return res.status(400).json({ message: `Lỗi upload: ${err.message}` });
        } else if (err) {
          // Lỗi khác
          console.error('Other upload error:', err);
          return res.status(400).json({ message: err.message });
        }
        
        // Thành công
        if (req.files && req.files.length > 0) {
          console.log('Files uploaded successfully:', req.files.map(f => f.path));
        } else {
          console.warn('No files were uploaded');
          return res.status(400).json({ message: 'Không có file nào được tải lên' });
        }
        
        next();
      });
    };
  },
  single: (fieldName) => {
    const uploadSingle = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
      },
    }).single(fieldName);
    
    return (req, res, next) => {
      uploadSingle(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          // Lỗi từ Multer
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ 
              message: 'Kích thước file vượt quá giới hạn cho phép (5MB)' 
            });
          }
          console.error('Multer error:', err);
          return res.status(400).json({ message: `Lỗi upload: ${err.message}` });
        } else if (err) {
          // Lỗi khác
          console.error('Other upload error:', err);
          return res.status(400).json({ message: err.message });
        }
        
        // Thành công
        if (req.file) {
          console.log('File uploaded successfully:', req.file.path);
        } else {
          console.warn('No file was uploaded');
          return res.status(400).json({ message: 'Không có file nào được tải lên' });
        }
        
        next();
      });
    };
  }
}; 