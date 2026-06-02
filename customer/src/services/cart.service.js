import API from './api';

// Get current user's cart
export const getCart = async () => {
  try {
    const { data } = await API.get('/cart');
    console.log('Cart data received:', data);
    return data;
  } catch (error) {
    console.error('Error in getCart:', error);
    throw error.response?.data?.message || 'Could not fetch cart';
  }
};

// Add item to cart
export const addToCart = async (productId, quantity = 1, options = {}) => {
  try {
    console.log('Adding to cart:', { productId, quantity, options });
    
    // Check if user is logged in
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) {
      const error = new Error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      error.needsAuth = true;
      throw error;
    }

    // Validate input
    if (!productId) {
      throw new Error('ID sản phẩm không hợp lệ');
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      throw new Error('Số lượng không hợp lệ');
    }

    // Make API call with retry logic
    let attempts = 0;
    const maxAttempts = 3; // Tăng số lần thử lại
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`Attempt ${attempts}/${maxAttempts} to add to cart`);
        
        // Add timeout to avoid hanging requests
        const { data } = await API.post(
          '/cart/items', 
          { 
            productId, 
            quantity: parsedQuantity, 
            ...options 
          },
          { timeout: 10000 } // 10 second timeout
        );
        
        console.log('Add to cart response:', data);
        return data;
      } catch (apiError) {
        console.warn(`Error on attempt ${attempts}:`, apiError.message);
        
        // If this is our last attempt, throw the error
        if (attempts >= maxAttempts) {
          throw apiError;
        }
        
        // For network errors, wait and retry with increasing backoff
        if (!apiError.response) {
          console.warn(`Network error on attempt ${attempts}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, attempts * 1000));
          continue;
        }
        
        // For other errors, just throw
        throw apiError;
      }
    }
  } catch (error) {
    console.error('Error in addToCart:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      details: error.details || {},
      productId,
      quantity
    });
    
    // Handle auth errors
    if (error.needsAuth) {
      throw error;
    }
    
    // Handle specific error codes
    if (error.response?.status === 404) {
      throw new Error('Sản phẩm không tồn tại');
    }
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Thông tin không hợp lệ');
    }
    
    // Handle API response errors
    if (error.response?.data?.message) {
      const enhancedError = new Error(error.response.data.message);
      enhancedError.details = error.response.data.details;
      throw enhancedError;
    }
    
    // Handle general errors
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw new Error('Không thể thêm sản phẩm vào giỏ hàng');
  }
};

// Update cart item quantity
export const updateCartItem = async (itemId, quantity) => {
  try {
    console.log('Updating cart item:', { itemId, quantity });
    
    // Check if user is logged in
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) {
      const error = new Error('Vui lòng đăng nhập để cập nhật giỏ hàng');
      error.needsAuth = true;
      throw error;
    }

    // Validate input
    if (!itemId) {
      throw new Error('ID sản phẩm không hợp lệ');
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      throw new Error('Số lượng không hợp lệ');
    }

    // Make API call with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`Attempt ${attempts}/${maxAttempts} to update cart item`);
        
        // Add timeout to avoid hanging requests
        const { data } = await API.put(
          `/cart/items/${itemId}`, 
          { quantity: parsedQuantity },
          { timeout: 10000 } // 10 second timeout
        );
        
        console.log('Update cart response:', data);
        return data;
      } catch (apiError) {
        console.warn(`Error on attempt ${attempts}:`, apiError.message);
        
        // If this is our last attempt, throw the error
        if (attempts >= maxAttempts) {
          throw apiError;
        }
        
        // For network errors, wait and retry with increasing backoff
        if (!apiError.response) {
          console.warn(`Network error on attempt ${attempts}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, attempts * 1000));
          continue;
        }
        
        // For other errors, just throw
        throw apiError;
      }
    }
  } catch (error) {
    console.error('Error in updateCartItem:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      details: error.details || {},
      itemId,
      quantity
    });
    
    // Handle auth errors
    if (error.needsAuth) {
      throw error;
    }
    
    // Handle specific error codes
    if (error.response?.status === 404) {
      throw new Error('Sản phẩm không tồn tại trong giỏ hàng');
    }
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Thông tin cập nhật không hợp lệ');
    }
    
    // Handle API response errors
    if (error.response?.data?.message) {
      const enhancedError = new Error(error.response.data.message);
      enhancedError.details = error.response.data.details;
      throw enhancedError;
    }
    
    // Handle general errors
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw new Error('Không thể cập nhật số lượng sản phẩm');
  }
};

// Remove item from cart
export const removeCartItem = async (itemId) => {
  try {
    console.log('Removing cart item:', itemId);
    const { data } = await API.delete(`/cart/items/${itemId}`);
    console.log('Remove item response:', data);
    return data;
  } catch (error) {
    console.error('Error in removeCartItem:', error);
    throw error.response?.data?.message || 'Could not remove item from cart';
  }
};

// Clear cart
export const clearCart = async () => {
  try {
    const { data } = await API.delete('/cart');
    console.log('Clear cart response:', data);
    return data;
  } catch (error) {
    console.error('Error in clearCart:', error);
    throw error.response?.data?.message || 'Could not clear cart';
  }
};

// Apply coupon to cart
export const applyCoupon = async (couponCode) => {
  try {
    const { data } = await API.post('/cart/coupon', { code: couponCode });
    return data;
  } catch (error) {
    console.error('Error in applyCoupon:', error);
    throw error.response?.data?.message || 'Could not apply coupon';
  }
};

// Remove coupon from cart
export const removeCoupon = async () => {
  try {
    const { data } = await API.delete('/cart/coupon');
    return data;
  } catch (error) {
    console.error('Error in removeCoupon:', error);
    throw error.response?.data?.message || 'Could not remove coupon';
  }
};

// Get shipping methods
export const getShippingMethods = async () => {
  try {
    const { data } = await API.get('/shipping-methods');
    return data;
  } catch (error) {
    console.error('Error in getShippingMethods:', error);
    throw error.response?.data?.message || 'Could not fetch shipping methods';
  }
};

// Set shipping method
export const setShippingMethod = async (shippingMethodId) => {
  try {
    const { data } = await API.post('/cart/shipping-method', { shippingMethodId });
    return data;
  } catch (error) {
    console.error('Error in setShippingMethod:', error);
    throw error.response?.data?.message || 'Could not set shipping method';
  }
}; 