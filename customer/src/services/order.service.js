import API from './api';

export const getAllOrders = async (params) => {
  const response = await API.get('/orders', { params });
  return response.data;
};

export const getOrderById = async (id) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    // Get the token from userInfo stored in localStorage
    const userInfo = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;
    
    const token = userInfo?.token;
    
    if (!token) {
      throw new Error('Vui lòng đăng nhập để xem chi tiết đơn hàng');
    }
    
    const response = await fetch(`${baseUrl}/api/orders/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể lấy thông tin đơn hàng');
    }

    return await response.json();
  } catch (error) {
    console.error('getOrderById error:', error);
    throw error;
  }
};

export const updateOrderStatus = async (id, status) => {
  const response = await API.patch(`/orders/${id}/status`, { status });
  return response.data;
};

export const updatePaymentStatus = async (id, status, transactionId) => {
  const response = await API.patch(`/orders/${id}/payment`, {
    status,
    transactionId
  });
  return response.data;
};

export const getOrderStats = async () => {
  const response = await API.get('/orders/stats');
  return response.data;
};

// Tạo đơn hàng mới
export const createOrder = async (orderData) => {
  try {
    const { data } = await API.post('/orders', orderData);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể tạo đơn hàng';
  }
};

// Lấy danh sách đơn hàng của người dùng
export const getUserOrders = async () => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    // Get the token from userInfo stored in localStorage
    const userInfo = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;
    
    const token = userInfo?.token;
    
    if (!token) {
      throw new Error('Vui lòng đăng nhập để xem đơn hàng của bạn');
    }
    
    const response = await fetch(`${baseUrl}/api/orders/myorders`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể lấy danh sách đơn hàng');
    }

    return await response.json();
  } catch (error) {
    console.error('getUserOrders error:', error);
    throw error;
  }
};

// Lấy chi tiết đơn hàng theo ID
export const getOrderDetails = async (orderId) => {
  try {
    const { data } = await API.get(`/orders/${orderId}`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể lấy thông tin đơn hàng';
  }
};

// Hủy đơn hàng
export const cancelOrder = async (orderId, reason) => {
  try {
    const { data } = await API.put(`/orders/${orderId}/cancel`, { reason });
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể hủy đơn hàng';
  }
};

// Thanh toán đơn hàng
export const payOrder = async (orderId, paymentResult) => {
  try {
    const { data } = await API.put(`/orders/${orderId}/pay`, paymentResult);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể thanh toán đơn hàng';
  }
};

// Xác nhận đã nhận được đơn hàng
export const deliverOrder = async (orderId) => {
  try {
    const { data } = await API.put(`/orders/${orderId}/deliver`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể xác nhận đã nhận hàng';
  }
};

// Tạo phiên thanh toán Stripe
export const createPaymentSession = async (orderId) => {
  try {
    const { data } = await API.post(`/payment/create-checkout-session`, { orderId });
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể tạo phiên thanh toán';
  }
};

// Lấy thông tin về tình trạng đơn hàng
export const getOrderStatus = async (orderId) => {
  try {
    const { data } = await API.get(`/orders/${orderId}/status`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể lấy thông tin tình trạng đơn hàng';
  }
};

// Đánh giá đơn hàng
export const reviewOrder = async (orderId, reviewData) => {
  try {
    const { data } = await API.post(`/orders/${orderId}/review`, reviewData);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể đánh giá đơn hàng';
  }
};

// Get order by tracking code
export const getOrderByTrackingCode = async (trackingCode) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const response = await fetch(`${baseUrl}/api/orders/tracking/${trackingCode}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể lấy thông tin đơn hàng');
    }

    return await response.json();
  } catch (error) {
    console.error('getOrderByTrackingCode error:', error);
    throw error;
  }
};

// Transforms raw order data to include full image paths
export const transformOrder = (order) => {
  if (!order) return null;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  
  // Function to get full image path
  const getFullImagePath = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return `${baseUrl}${imagePath}`;
    } else {
      return `${baseUrl}/${imagePath}`;
    }
  };

  // Transform order items to include full image paths
  const orderItemsWithFullPaths = order.orderItems.map(item => ({
    ...item,
    image: getFullImagePath(item.image)
  }));

  // Return the transformed order
  return {
    ...order,
    orderItems: orderItemsWithFullPaths
  };
}; 