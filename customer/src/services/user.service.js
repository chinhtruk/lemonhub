import API from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = async () => {
  try {
    const { data } = await API.get('/users/profile');
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể tải thông tin người dùng';
  }
};

// Cập nhật thông tin người dùng
export const updateUserProfile = async (userData) => {
  try {
    // Ensure we're sending all the required fields
    const dataToUpdate = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      birthday: userData.birthday,
      gender: userData.gender
    };
    
    const { data } = await API.put('/users/profile', dataToUpdate);
    
    // Return the updated user data from the server
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error.response?.data?.message || 'Không thể cập nhật thông tin người dùng';
  }
};

// Lấy đơn hàng của người dùng
export const getUserOrders = async () => {
  try {
    console.log('Calling API to get user orders');
    const { data } = await API.get('/orders/myorders');
    console.log('Orders API response:', data);
    
    // Transform orders data để phù hợp với các yêu cầu hiển thị
    const formattedOrders = data.map(order => {
      return {
        id: order._id,
        date: order.createdAt,
        total: order.totalPrice,
        status: order.status || 'pending',
        trackingCode: order.trackingCode,
        items: order.orderItems.map(item => ({
          id: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.qty
        }))
      };
    });
    
    console.log('Formatted orders for frontend:', formattedOrders);
    return formattedOrders;
  } catch (error) {
    console.error('Error fetching orders:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Không thể tải danh sách đơn hàng';
  }
};

// Lấy danh sách sản phẩm yêu thích
export const getUserWishlist = async () => {
  try {
    console.log('Fetching user wishlist');
    const { data } = await API.get('/users/wishlist');
    
    // Kiểm tra dữ liệu trả về
    if (!data) {
      console.warn('No wishlist data returned from API');
      return [];
    }
    
    // Đảm bảo dữ liệu trả về là một mảng
    if (!Array.isArray(data)) {
      console.warn('Wishlist data is not an array:', data);
      return [];
    }
    
    // Log detailed wishlist data for debugging
    console.log('Raw wishlist data from API:', JSON.stringify(data));
    
    // Ensure each product has the correct image path
    const processedData = data.map(product => {
      // Force log every product to debug
      console.log('Processing wishlist product:', JSON.stringify(product));
      
      // Fix missing or empty image
      if (!product.image || product.image === '') {
        console.warn('Product without image:', product.id || product._id);
        return {
          ...product,
          image: '/images/product-placeholder.svg'
        };
      }
      
      // Complete image URLs if they're relative paths
      let imageUrl = product.image;
      
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        imageUrl = `/${imageUrl}`;
      }
      
      if (imageUrl && !imageUrl.startsWith('http') && imageUrl.startsWith('/')) {
        imageUrl = `${API_URL}${imageUrl}`;
      }
      
      return {
        ...product,
        image: imageUrl
      };
    });
    
    console.log('Wishlist loaded successfully:', processedData.length, 'items');
    console.log('Processed wishlist items IDs:', processedData.map(item => item.id || item._id));
    
    return processedData;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    console.error('Error details:', error.response?.data || error.message);
    
    // Check if it's an authentication error
    if (error.response?.status === 401) {
      console.warn('Authentication error when fetching wishlist - token may be invalid');
    }
    
    // Return empty array instead of throwing error to prevent UI failures
    return [];
  }
};

// Thêm sản phẩm vào danh sách yêu thích
export const addToWishlist = async (productId) => {
  try {
    console.log('Adding product to wishlist:', productId);
    const { data } = await API.post('/users/wishlist', { productId });
    
    if (data.success) {
      console.log('Product added to wishlist successfully');
    }
    
    return data;
  } catch (error) {
    console.error('Error adding to wishlist:', error.response?.data || error);
    throw error.response?.data?.message || 'Không thể thêm sản phẩm vào danh sách yêu thích';
  }
};

// Xóa sản phẩm khỏi danh sách yêu thích
export const removeFromWishlist = async (productId) => {
  try {
    console.log('Removing product from wishlist:', productId);
    const { data } = await API.delete(`/users/wishlist/${productId}`);
    
    if (data.success) {
      console.log('Product removed from wishlist successfully');
    }
    
    return data;
  } catch (error) {
    console.error('Error removing from wishlist:', error.response?.data || error);
    throw error.response?.data?.message || 'Không thể xóa sản phẩm khỏi danh sách yêu thích';
  }
};

// Kiểm tra xem sản phẩm có trong danh sách yêu thích không
export const checkWishlist = async (productId) => {
  try {
    const { data } = await API.get(`/users/wishlist/${productId}`);
    return data.inWishlist;
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    return false;
  }
};

// Lấy địa chỉ của người dùng
export const getUserAddresses = async (forceReload = false) => {
  try {
    console.log('Đang tải danh sách địa chỉ', forceReload ? '(bắt buộc tải mới)' : '');
    
    // Tạo URL endpoing chính xác 
    const endpoint = '/users/addresses';
    console.log(`Gửi yêu cầu API đến: ${endpoint}`);
    
    // Lấy dữ liệu từ API server
    const { data } = await API.get(endpoint);
    
    // Ghi log thông tin chi tiết dữ liệu trả về
    console.log('Dữ liệu địa chỉ gốc từ server (raw):', JSON.stringify(data));
    
    // Kiểm tra dữ liệu trả về
    if (!data) {
      console.warn('Không có dữ liệu địa chỉ trả về từ API');
      return [];
    }
    
    // Đảm bảo dữ liệu trả về là một mảng
    if (!Array.isArray(data)) {
      console.warn('Dữ liệu địa chỉ không phải là mảng:', typeof data, data);
      // Nếu là object có thuộc tính addresses là mảng, trả về addresses
      if (data && typeof data === 'object' && Array.isArray(data.addresses)) {
        console.log('Nhận dạng format response có field addresses, sử dụng data.addresses');
        return data.addresses;
      }
      return [];
    }
    
    console.log('Đã tải thành công', data.length, 'địa chỉ từ server');
    
    // Kiểm tra và log từng địa chỉ trong mảng
    data.forEach((address, index) => {
      console.log(`Địa chỉ #${index + 1}:`, JSON.stringify(address));
      
      // Kiểm tra xem mỗi địa chỉ có thuộc tính id không, nếu không thì dùng _id
      if (!address.id && address._id) {
        console.log(`Chuyển đổi _id thành id cho địa chỉ #${index + 1}`);
        address.id = address._id;
      }
    });
    
    // Đảm bảo mỗi địa chỉ đều có thuộc tính id và các thuộc tính cần thiết
    const processedAddresses = data.map(address => {
      // Đảm bảo các trường cần thiết đều có
      return {
        id: address.id || address._id || 'unknown-id', 
        fullName: address.fullName || 'Không có tên',
        phone: address.phone || 'Không có SĐT',
        address: address.address || 'Không có địa chỉ',
        isDefault: !!address.isDefault
      };
    });
    
    console.log('Địa chỉ sau khi xử lý:', JSON.stringify(processedAddresses));
    
    // Cập nhật localStorage
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        if (userInfo && userInfo._id) {
          userInfo.addresses = processedAddresses;
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          console.log('Đã cập nhật địa chỉ trong localStorage từ phản hồi API');
        }
      }
    } catch (e) {
      console.warn('Không thể cập nhật địa chỉ trong localStorage:', e);
    }
    
    return processedAddresses;
  } catch (error) {
    console.error('Lỗi khi tải địa chỉ:', error);
    console.error('Chi tiết lỗi:', error.response?.data || error.message);
    console.error('Config URL:', error.config?.url);
    console.error('Request headers:', error.config?.headers);
    
    // Kiểm tra nếu là lỗi xác thực
    if (error.response?.status === 401) {
      console.warn('Lỗi xác thực khi tải địa chỉ - token có thể không hợp lệ');
    }
    
    // Trả về mảng rỗng thay vì ném lỗi để tránh lỗi giao diện
    return [];
  }
};

// Thêm địa chỉ mới
export const addAddress = async (addressData) => {
  try {
    console.log('Adding new address:', addressData);
    const { data } = await API.post('/users/addresses', addressData);
    console.log('Address added successfully:', data);
    
    // Update addresses in userInfo localStorage
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (userInfo && userInfo._id) {
        if (!Array.isArray(userInfo.addresses)) {
          userInfo.addresses = [];
        }
        userInfo.addresses.push(data);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('Updated userInfo in localStorage with new address');
      }
    } catch (localStorageError) {
      console.error('Error updating localStorage with new address:', localStorageError);
    }
    
    return data;
  } catch (error) {
    console.error('Error adding address:', error);
    throw error.response?.data?.message || 'Không thể thêm địa chỉ mới';
  }
};

// Cập nhật địa chỉ
export const updateAddress = async (addressId, addressData) => {
  try {
    const { data } = await API.put(`/users/addresses/${addressId}`, addressData);
    
    // Update addresses in userInfo localStorage
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (userInfo && userInfo._id && Array.isArray(userInfo.addresses)) {
        userInfo.addresses = userInfo.addresses.map(addr => 
          addr.id === addressId ? { ...addr, ...data } : addr
        );
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('Updated userInfo in localStorage with updated address');
      }
    } catch (localStorageError) {
      console.error('Error updating localStorage with updated address:', localStorageError);
    }
    
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể cập nhật địa chỉ';
  }
};

// Xóa địa chỉ
export const deleteAddress = async (addressId) => {
  try {
    const { data } = await API.delete(`/users/addresses/${addressId}`);
    
    // Update addresses in userInfo localStorage
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (userInfo && userInfo._id && Array.isArray(userInfo.addresses)) {
        userInfo.addresses = userInfo.addresses.filter(addr => addr.id !== addressId);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('Updated userInfo in localStorage after removing address');
      }
    } catch (localStorageError) {
      console.error('Error updating localStorage after removing address:', localStorageError);
    }
    
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể xóa địa chỉ';
  }
};

// Đặt địa chỉ mặc định
export const setDefaultAddress = async (addressId) => {
  try {
    const { data } = await API.put(`/users/addresses/${addressId}/default`);
    
    // Update addresses in userInfo localStorage
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (userInfo && userInfo._id && Array.isArray(userInfo.addresses)) {
        userInfo.addresses = userInfo.addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        }));
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('Updated userInfo in localStorage with default address change');
      }
    } catch (localStorageError) {
      console.error('Error updating localStorage with default address change:', localStorageError);
    }
    
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể đặt địa chỉ mặc định';
  }
};

// Thay đổi mật khẩu người dùng
export const changePassword = async (passwordData) => {
  try {
    const { data } = await API.put('/users/change-password', passwordData);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể thay đổi mật khẩu';
  }
};

/**
 * Upload avatar
 * @param {File} file - The avatar image file
 * @returns {Promise<Object>} The updated user with avatar URL
 */
export const uploadAvatar = async (file) => {
  try {
    console.log('User service: Uploading avatar file', file.name, 'size:', file.size);
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    // Gọi API để upload avatar
    const response = await API.post('/users/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Upload avatar API response:', response.data);
    
    // Check if the response has the avatar path
    if (!response.data || !response.data.avatarUrl) {
      console.error('Avatar path not found in API response:', response.data);
      throw new Error('Avatar path not found in response');
    }
    
    let avatarUrl = response.data.avatarUrl;
    
    // Ensure the avatar URL is complete
    if (!avatarUrl.startsWith('http') && !avatarUrl.startsWith('/')) {
      avatarUrl = `/${avatarUrl}`;
    }
    
    if (!avatarUrl.startsWith('http') && avatarUrl.startsWith('/')) {
      avatarUrl = `${API_URL}${avatarUrl}`;
    }
    
    // Add a timestamp to prevent caching
    const timestamp = Date.now();
    avatarUrl = avatarUrl.includes('?') 
      ? `${avatarUrl}&t=${timestamp}` 
      : `${avatarUrl}?t=${timestamp}`;
    
    console.log('Final avatar URL with cache busting:', avatarUrl);
    
    // Update the user profile in the session storage
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    user.avatar = avatarUrl;
    sessionStorage.setItem('user', JSON.stringify(user));
    
    // Return the updated user with the avatar URL
    return {
      ...response.data,
      avatar: avatarUrl
    };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

// Lấy phương thức thanh toán của người dùng
export const getUserPaymentMethods = async () => {
  try {
    console.log('Đang tải phương thức thanh toán');
    
    // Tạo URL endpoint chính xác
    const endpoint = '/users/payment-methods';
    console.log(`Gửi yêu cầu API đến: ${endpoint}`);
    
    // Lấy dữ liệu từ API server
    const { data } = await API.get(endpoint);
    
    // Ghi log thông tin chi tiết dữ liệu trả về
    console.log('Dữ liệu phương thức thanh toán từ server (raw):', JSON.stringify(data));
    
    // Kiểm tra dữ liệu trả về
    if (!data) {
      console.warn('Không có dữ liệu phương thức thanh toán trả về từ API');
      return [];
    }
    
    // Đảm bảo dữ liệu trả về là một mảng
    if (!Array.isArray(data)) {
      console.warn('Dữ liệu phương thức thanh toán không phải là mảng:', typeof data, data);
      // Nếu là object có thuộc tính paymentMethods là mảng, trả về paymentMethods
      if (data && typeof data === 'object' && Array.isArray(data.paymentMethods)) {
        console.log('Nhận dạng format response có field paymentMethods, sử dụng data.paymentMethods');
        return data.paymentMethods;
      }
      return [];
    }
    
    console.log('Đã tải thành công', data.length, 'phương thức thanh toán từ server');
    
    // Kiểm tra và đảm bảo mỗi phương thức thanh toán đều có thuộc tính id
    const processedPaymentMethods = data.map((method, index) => {
      console.log(`Phương thức thanh toán #${index + 1}:`, JSON.stringify(method));
      
      // Chuyển đổi _id thành id nếu cần
      if (!method.id && method._id) {
        console.log(`Chuyển đổi _id thành id cho phương thức thanh toán #${index + 1}`);
        method.id = method._id;
      }
      
      // Đảm bảo các trường cần thiết đều có
      return {
        id: method.id || method._id || 'unknown-id',
        type: method.type || 'unknown',
        cardNumber: method.cardNumber || '',
        expiryDate: method.expiryDate || '',
        isDefault: !!method.isDefault,
        bankName: method.bankName || '',
        cardType: method.cardType || ''
      };
    });
    
    console.log('Phương thức thanh toán sau khi xử lý:', JSON.stringify(processedPaymentMethods));
    
    // Cập nhật localStorage
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        if (userInfo && userInfo._id) {
          userInfo.paymentMethods = processedPaymentMethods;
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          console.log('Đã cập nhật phương thức thanh toán trong localStorage từ phản hồi API');
        }
      }
    } catch (e) {
      console.warn('Không thể cập nhật phương thức thanh toán trong localStorage:', e);
    }
    
    return processedPaymentMethods;
  } catch (error) {
    console.error('Lỗi khi tải phương thức thanh toán:', error);
    console.error('Chi tiết lỗi:', error.response?.data || error.message);
    console.error('Config URL:', error.config?.url);
    console.error('Request headers:', error.config?.headers);
    
    // Kiểm tra nếu là lỗi xác thực
    if (error.response?.status === 401) {
      console.warn('Lỗi xác thực khi tải phương thức thanh toán - token có thể không hợp lệ');
    }
    
    // Trả về mảng rỗng thay vì ném lỗi để tránh lỗi giao diện
    return [];
  }
};

// Thêm phương thức thanh toán mới
export const addPaymentMethod = async (paymentData) => {
  try {
    console.log('Adding new payment method:', paymentData);
    const { data } = await API.post('/users/payment-methods', paymentData);
    console.log('Payment method added successfully:', data);
    
    // Update payment methods in userInfo localStorage
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (userInfo && userInfo._id) {
        if (!Array.isArray(userInfo.paymentMethods)) {
          userInfo.paymentMethods = [];
        }
        userInfo.paymentMethods.push(data);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('Updated userInfo in localStorage with new payment method');
      }
    } catch (localStorageError) {
      console.error('Error updating localStorage with new payment method:', localStorageError);
    }
    
    return data;
  } catch (error) {
    console.error('Error adding payment method:', error);
    throw error.response?.data?.message || 'Không thể thêm phương thức thanh toán mới';
  }
};

// Cập nhật phương thức thanh toán
export const updatePaymentMethod = async (paymentId, paymentData) => {
  try {
    const { data } = await API.put(`/users/payment-methods/${paymentId}`, paymentData);
    
    // Update payment methods in userInfo localStorage
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (userInfo && userInfo._id && Array.isArray(userInfo.paymentMethods)) {
        userInfo.paymentMethods = userInfo.paymentMethods.map(method => 
          method.id === paymentId ? { ...method, ...data } : method
        );
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('Updated userInfo in localStorage with updated payment method');
      }
    } catch (localStorageError) {
      console.error('Error updating localStorage with updated payment method:', localStorageError);
    }
    
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể cập nhật phương thức thanh toán';
  }
};

// Xóa phương thức thanh toán
export const deletePaymentMethod = async (paymentId) => {
  try {
    const { data } = await API.delete(`/users/payment-methods/${paymentId}`);
    
    // Update payment methods in userInfo localStorage
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (userInfo && userInfo._id && Array.isArray(userInfo.paymentMethods)) {
        userInfo.paymentMethods = userInfo.paymentMethods.filter(method => method.id !== paymentId);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('Updated userInfo in localStorage after removing payment method');
      }
    } catch (localStorageError) {
      console.error('Error updating localStorage after removing payment method:', localStorageError);
    }
    
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể xóa phương thức thanh toán';
  }
};

// Đặt phương thức thanh toán mặc định
export const setDefaultPaymentMethod = async (paymentId) => {
  try {
    const { data } = await API.put(`/users/payment-methods/${paymentId}/default`);
    
    // Update payment methods in userInfo localStorage
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (userInfo && userInfo._id && Array.isArray(userInfo.paymentMethods)) {
        userInfo.paymentMethods = userInfo.paymentMethods.map(method => ({
          ...method,
          isDefault: method.id === paymentId
        }));
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('Updated userInfo in localStorage with default payment method change');
      }
    } catch (localStorageError) {
      console.error('Error updating localStorage with default payment method change:', localStorageError);
    }
    
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể đặt phương thức thanh toán mặc định';
  }
}; 