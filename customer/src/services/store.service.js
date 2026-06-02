import api from './api';

// Dữ liệu fallback cho cửa hàng khi API không trả về kết quả
const FALLBACK_STORES = [
  {
    id: 'store1',
    _id: 'store1',
    name: 'Cửa hàng Trung tâm',
    slug: 'cua-hang-trung-tam',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    phone: '0987654321',
    email: 'contact@lemonhub.vn',
    description: 'Cửa hàng chính của LemonHub',
    image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?ixlib=rb-4.0.3',
    isOpen: true,
    openTime: '08:00',
    closeTime: '22:00',
    location: {
      type: 'Point',
      coordinates: [106.7020, 10.7756]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'store2',
    _id: 'store2',
    name: 'Cửa hàng Cầu Giấy',
    slug: 'cua-hang-cau-giay',
    address: '88 Xuân Thủy, Cầu Giấy, Hà Nội',
    phone: '0123456789',
    email: 'caugiay@lemonhub.vn',
    description: 'Chi nhánh LemonHub tại Hà Nội',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9c8a213?ixlib=rb-4.0.3',
    isOpen: true,
    openTime: '08:30',
    closeTime: '21:30',
    location: {
      type: 'Point',
      coordinates: [105.7921, 21.0283]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Transform store data from API response
const transformStore = (store) => {
  if (!store) return null;

  return {
    id: store._id || store.id || '',
    _id: store._id || store.id || '',
    name: store.name || 'Cửa hàng không tên',
    slug: store.slug || '',
    address: store.address || 'Chưa cập nhật địa chỉ',
    phone: store.phone || 'Chưa cập nhật SĐT',
    email: store.email || '',
    description: store.description || '',
    image: store.image || 'https://images.unsplash.com/photo-1604719312566-8912e9c8a213?ixlib=rb-4.0.3',
    isOpen: store.isOpen !== undefined ? store.isOpen : true,
    openTime: store.openTime || '08:00',
    closeTime: store.closeTime || '22:00',
    hours: store.hours || `${store.openTime || '08:00'} - ${store.closeTime || '22:00'}`,
    location: store.location || null,
    createdAt: store.createdAt || new Date().toISOString(),
    updatedAt: store.updatedAt || new Date().toISOString()
  };
};

// Get all stores
export const getAllStores = async () => {
  try {
    console.log('Fetching all stores');
    const response = await api.get('/stores');
    if (response.data && Array.isArray(response.data)) {
      console.log(`Received ${response.data.length} stores from API`);
      return response.data.map(transformStore).filter(Boolean);
    }
    console.warn('Invalid store data received from API');
    return FALLBACK_STORES;
  } catch (error) {
    console.error('Error fetching stores:', error);
    return FALLBACK_STORES;
  }
};

// Get store by ID
export const getStoreById = async (id) => {
  try {
    const response = await api.get(`/stores/${id}`);
    if (response.data) {
      return transformStore(response.data);
    }
    return FALLBACK_STORES.find(store => store.id === id) || null;
  } catch (error) {
    console.error('Error fetching store by id:', error);
    return FALLBACK_STORES.find(store => store.id === id) || null;
  }
};

// Get store by slug
export const getStoreBySlug = async (slug) => {
  try {
    const response = await api.get(`/stores/slug/${slug}`);
    if (response.data) {
      return transformStore(response.data);
    }
    return FALLBACK_STORES.find(store => store.slug === slug) || null;
  } catch (error) {
    console.error('Error fetching store by slug:', error);
    return FALLBACK_STORES.find(store => store.slug === slug) || null;
  }
};

// Get nearest stores
export const getNearestStores = async (lat, lng, limit = 5) => {
  try {
    const response = await api.get(`/stores/nearest?lat=${lat}&lng=${lng}&limit=${limit}`);
    if (response.data && Array.isArray(response.data)) {
      return response.data.map(transformStore).filter(Boolean);
    }
    return FALLBACK_STORES;
  } catch (error) {
    console.error('Error fetching nearest stores:', error);
    return FALLBACK_STORES;
  }
};

// Create a new store (admin only)
export const createStore = async (storeData) => {
  try {
    const response = await api.post('/stores', storeData);
    return response.data;
  } catch (error) {
    console.error('Error creating store:', error);
    throw error;
  }
};

// Update a store (admin only)
export const updateStore = async (id, storeData) => {
  try {
    const response = await api.put(`/stores/${id}`, storeData);
    return response.data;
  } catch (error) {
    console.error('Error updating store:', error);
    throw error;
  }
};

// Delete a store (admin only)
export const deleteStore = async (id) => {
  try {
    const response = await api.delete(`/stores/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting store:', error);
    throw error;
  }
};

// Update store status (open/closed) (admin only)
export const updateStoreStatus = async (id, isOpen) => {
  try {
    const response = await api.patch(`/stores/${id}/status`, { isOpen });
    return response.data;
  } catch (error) {
    console.error('Error updating store status:', error);
    throw error;
  }
};

// Lấy cửa hàng theo thành phố
export const getStoresByCity = async (city) => {
  try {
    const { data } = await api.get('/stores', { params: { city } });
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể tải danh sách cửa hàng theo thành phố';
  }
};

// Tìm cửa hàng gần nhất
export const findNearestStore = async (latitude, longitude) => {
  try {
    const { data } = await api.get('/stores/nearest', {
      params: { latitude, longitude }
    });
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Không thể tìm cửa hàng gần nhất';
  }
}; 