import axios from 'axios';

// Các URL API tiềm năng mà ứng dụng có thể kết nối
const API_URLS = [
  process.env.NEXT_PUBLIC_API_URL,  // Biến môi trường (nếu được thiết lập)
  'http://localhost:5000/api',      // Cổng 5000 (mặc định)
  'http://localhost:5001/api',      // Cổng 5001 (phòng trường hợp)
  'http://127.0.0.1:5000/api',      // Địa chỉ IP thay vì localhost
  'http://127.0.0.1:5001/api',
  'https://host.domain/api',        // Production URL
  'http://host.domain:5000/api',    // Production URL với port
];

// Thử kết nối với các API URL khác nhau
const tryConnectToAPI = async () => {
  let availableURL = null;
  let errors = [];

  for (const url of API_URLS) {
    if (!url) continue; // Bỏ qua URL null/undefined
    
    try {
      console.log(`Đang thử kết nối với API: ${url}`);
      const startTime = Date.now();
      const response = await axios.get(url, { 
        timeout: 3000, // Tăng timeout để đợi lâu hơn
        validateStatus: status => status < 500 // Chấp nhận mã 404 hoặc 401 vì vẫn đang kết nối được
      });
      const responseTime = Date.now() - startTime;
      
      console.log(`✅ Kết nối thành công đến ${url} (${responseTime}ms)`);
      availableURL = url;
      break;
    } catch (error) {
      const errorMessage = error.code || error.message;
      console.log(`❌ Không thể kết nối đến ${url}: ${errorMessage}`);
      errors.push({ url, error: errorMessage });
    }
  }

  if (!availableURL) {
    console.error('❌❌❌ Không thể kết nối đến bất kỳ API URL nào.');
    console.error('Chi tiết lỗi:', JSON.stringify(errors, null, 2));
    console.warn('Sử dụng URL mặc định mặc dù không thể kết nối.');
    // Sử dụng URL mặc định nếu không tìm thấy URL khả dụng
    return API_URLS[1];
  }

  return availableURL;
};

// Tạo instance axios với URL được xác định động
let API = null;

const initAPI = async () => {
  const baseURL = await tryConnectToAPI();
  
  API = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    // Tăng timeout để xử lý mạng chậm
    timeout: 30000,
  });
  
  // Cấu hình interceptors
  setupInterceptors(API);
  
  return API;
};

// Hàm để lấy instance API đã được khởi tạo
export const getAPI = async () => {
  if (!API) {
    await initAPI();
  }
  return API;
};

// Khởi tạo API khi module được import
initAPI().catch(err => {
  console.error('Lỗi khởi tạo API:', err);
});

// Kiểm tra trạng thái API
export const checkApiStatus = async () => {
  try {
    const api = await getAPI();
    const startTime = Date.now();
    const { data } = await api.get('/', { 
      timeout: 5000 
    });
    const responseTime = Date.now() - startTime;
    console.log(`API status check: OK (${responseTime}ms)`);
    return { ok: true, responseTime };
  } catch (error) {
    console.error('API status check failed:', error.message);
    return { ok: false, error: error.message };
  }
};

// Tiện ích xử lý lỗi API chung
export const handleApiError = (error, fallbackMessage = 'Đã xảy ra lỗi') => {
  if (!error.response) {
    // Lỗi mạng (không có phản hồi từ máy chủ)
    console.error('Network error:', error.message);
    return {
      type: 'network',
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.'
    };
  } else if (error.response.status === 401) {
    // Lỗi xác thực
    console.error('Authentication error:', error.response.data);
    return {
      type: 'auth',
      message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      details: error.response.data
    };
  } else if (error.response.status === 404) {
    // Lỗi không tìm thấy tài nguyên
    console.error('Resource not found:', error.response.data);
    return {
      type: 'not_found',
      message: 'Không tìm thấy dữ liệu yêu cầu.',
      details: error.response.data
    };
  } else if (error.response.status >= 500) {
    // Lỗi máy chủ
    console.error('Server error:', error.response.data);
    return {
      type: 'server',
      message: 'Lỗi máy chủ. Vui lòng thử lại sau.',
      details: error.response.data
    };
  } else {
    // Lỗi khác
    console.error('API error:', error.response?.data || error.message);
    return {
      type: 'unknown',
      message: error.response?.data?.message || fallbackMessage,
      details: error.response?.data
    };
  }
};

// Utility function to get token from localStorage
const getToken = () => {
  try {
    // Get user info from localStorage
    const userInfoStr = typeof window !== 'undefined' ? localStorage.getItem('userInfo') : null;
    
    // Check if userInfo exists
    if (!userInfoStr) {
      console.warn('getToken: No userInfo found in localStorage');
      return null;
    }
    
    // Parse user info
    let userInfo;
    try {
      userInfo = JSON.parse(userInfoStr);
    } catch (parseError) {
      console.error('getToken: Failed to parse userInfo JSON:', parseError);
      // Clear invalid data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userInfo');
      }
      return null;
    }
    
    // Check if token exists and is non-empty
    if (!userInfo || !userInfo.token) {
      console.warn('getToken: userInfo exists but no token found');
      return null;
    }
    
    // Validate token format (simple check that it's a non-empty string)
    if (typeof userInfo.token !== 'string' || userInfo.token.trim() === '') {
      console.warn('getToken: Invalid token format');
      return null;
    }
    
    // Log token details (masked for security)
    const tokenStart = userInfo.token.substring(0, 10);
    const tokenEnd = userInfo.token.substring(userInfo.token.length - 5);
    console.debug(`getToken: Successfully retrieved token (${tokenStart}...${tokenEnd})`);
    
    return userInfo.token;
  } catch (error) {
    console.error('getToken: Unexpected error retrieving token:', error);
    return null;
  }
};

// Thiết lập interceptors cho instance API
const setupInterceptors = (apiInstance) => {
  // Thêm interceptor cho request
  apiInstance.interceptors.request.use(
    (config) => {
      // Debug log - hiển thị URL đang gọi
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.params);
      
      // Kiểm tra nếu đang ở client-side và thêm token
      const token = getToken();
      if (token) {
        console.log(`Adding token to request: ${config.url}`);
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log(`No token for request: ${config.url}, this may cause auth issues if endpoint requires auth`);
        
        // Don't redirect for public endpoints
        const publicEndpoints = ['/users/login', '/users', '/products', '/categories'];
        const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.startsWith(endpoint));
        
        if (!isPublicEndpoint && typeof window !== 'undefined') {
          console.warn('Request to protected endpoint without token');
        }
      }
      
      // Xử lý các endpoint đặc biệt 
      // Sửa lỗi MongoDB ObjectId cho các route đặc biệt
      if (config.url?.includes('/products/new')) {
        console.log('Detected /products/new endpoint - using correct path');
        // Đảm bảo đường dẫn đúng, không phải cố gắng lấy sản phẩm có id="new"
        config.url = '/products/newest';
      }

      // Loại bỏ các dấu / trùng lặp nếu có
      if (config.url && config.url.includes('//')) {
        config.url = config.url.replace(/\/+/g, '/');
        console.log('Fixed duplicate slashes in URL:', config.url);
      }
      
      return config;
    },
    (error) => {
      console.error('❌ API Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Thêm interceptor cho response
  apiInstance.interceptors.response.use(
    (response) => {
      // Debug log - hiển thị response thành công
      console.log(`✅ API Response (${response.config.url}):`, response.status);
      return response;
    },
    (error) => {
      // Chi tiết lỗi cho debugging
      const errorDetails = {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      };
      
      console.error('❌ API Error:', errorDetails);

      // Handle network errors
      if (!error.response) {
        const networkError = new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
        networkError.details = errorDetails;
        return Promise.reject(networkError);
      }

      // Handle specific error cases
      if (error.response.status === 401) {
        // Kiểm tra xem người dùng đang ở trang profile hay không
        const isProfilePage = typeof window !== 'undefined' && 
          (window.location.pathname === '/profile' || window.location.pathname.startsWith('/profile/'));
        
        if (isProfilePage) {
          // Nếu đang ở trang profile, không đăng xuất người dùng ngay lập tức
          // Thay vào đó, đặt cờ cảnh báo trong sessionStorage
          console.warn('Auth error on profile page - setting auth warning flag');
          sessionStorage.setItem('auth_warning', 'true');
          
          // Trả về lỗi để component có thể xử lý một cách mềm dẻo
          const profileAuthError = new Error('Có vấn đề về xác thực, nhưng không tự động đăng xuất trên trang profile');
          profileAuthError.details = errorDetails;
          return Promise.reject(profileAuthError);
        } else {
          // Ở các trang khác, xử lý như thông thường
          console.log('Auth error detected - logging out user');
          localStorage.removeItem('userInfo');
          window.location.href = '/login';
          const authError = new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          authError.details = errorDetails;
          return Promise.reject(authError);
        }
      }

      if (error.response.status === 500) {
        const serverError = new Error(error.response.data?.message || 'Lỗi máy chủ. Vui lòng thử lại sau.');
        serverError.details = errorDetails;
        return Promise.reject(serverError);
      }

      // Make sure error always has useful data
      if (!error.details) {
        error.details = errorDetails;
      }
      
      return Promise.reject(error);
    }
  );
};

// Tạo API proxy wrapper để xử lý việc chờ khởi tạo API
const APIProxy = new Proxy({}, {
  get: function(target, prop) {
    return async function(...args) {
      const api = await getAPI();
      return api[prop](...args);
    };
  }
});

export default APIProxy;