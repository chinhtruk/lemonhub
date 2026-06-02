import API from './api';

// Đăng nhập
export const login = async (email, password) => {
  try {
    console.log('Attempting login with email:', email);
    const { data } = await API.post('/users/login', { email, password });
    
    console.log('Login API response received:', {
      success: true,
      name: data.name,
      hasToken: !!data.token,
      tokenPrefix: data.token ? `${data.token.substring(0, 10)}...` : 'none'
    });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('userInfo', JSON.stringify(data));
    }
    
    return data;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
};

// Đăng ký
export const register = async (name, email, password) => {
  try {
    const { data } = await API.post('/users', { name, email, password });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('userInfo', JSON.stringify(data));
    }
    
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Đăng ký thất bại';
  }
};

// Đăng xuất
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userInfo');
  }
};

// Lấy thông tin người dùng
export const getUserProfile = async () => {
  try {
    const { data } = await API.get('/users/profile');
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể lấy thông tin người dùng';
  }
};

// Cập nhật thông tin người dùng
export const updateUserProfile = async (userDetails) => {
  try {
    const { data } = await API.put('/users/profile', userDetails);
    
    // Cập nhật thông tin người dùng trong localStorage
    if (typeof window !== 'undefined') {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      
      // Preserve existing addresses and payment methods
      const preservedFields = {
        addresses: userInfo.addresses || [],
        paymentMethods: userInfo.paymentMethods || []
      };
      
      // Create updated user info with preserved data
      const updatedUserInfo = { 
        ...userInfo, 
        ...data,
        ...preservedFields  // Make sure to keep existing addresses and payment methods
      };
      
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      console.log('Updated user profile in localStorage with preserved user data');
    }
    
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Cập nhật thông tin thất bại';
  }
};

// Đổi mật khẩu
export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const { data } = await API.put('/users/change-password', { 
      currentPassword, 
      newPassword 
    });
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Đổi mật khẩu thất bại';
  }
};

// Kiểm tra xem người dùng đã đăng nhập hay chưa
export const isAuthenticated = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
}; 