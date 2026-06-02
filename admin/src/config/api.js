import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi authentication
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('Phát hiện lỗi xác thực 401');
      
      // Lưu trang hiện tại
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        localStorage.setItem('adminRedirectAfterLogin', currentPath);
      
        // Chỉ đăng xuất và chuyển hướng từ các trang nhạy cảm
        const sensitiveRoutes = ['/profile', '/settings', '/dashboard', '/statistics'];
        const isOnSensitivePage = sensitiveRoutes.some(route => 
          currentPath.startsWith(route) || currentPath === '/'
        );
        
        if (isOnSensitivePage) {
          console.log('Đang ở trang nhạy cảm, chuyển hướng đến đăng nhập');
          localStorage.removeItem('token');
          window.location.href = '/login?redirect=' + encodeURIComponent(currentPath);
        } else {
          console.log('Lỗi 401 nhưng không chuyển hướng vì không ở trang nhạy cảm');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api; 