import api from './api';
import { getFullImageUrl } from '@/utils/image';

// Dữ liệu mẫu cho danh mục khi API không trả về kết quả
const FALLBACK_CATEGORIES = [
  {
    id: 'cat1',
    _id: 'cat1',
    name: 'Điện thoại di động',
    slug: 'dien-thoai-di-dong',
    description: 'Các loại điện thoại di động mới nhất',
    icon: '📱',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3',
    isFeatured: true,
    order: 1,
    parentCategory: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat2',
    _id: 'cat2',
    name: 'Laptop & Máy tính',
    slug: 'laptop-may-tinh',
    description: 'Laptop và máy tính để bàn các loại',
    icon: '💻',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3',
    isFeatured: true,
    order: 2,
    parentCategory: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat3',
    _id: 'cat3',
    name: 'Thiết bị thông minh',
    slug: 'thiet-bi-thong-minh',
    description: 'Các thiết bị thông minh và đồ điện tử',
    icon: '⌚',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3',
    isFeatured: true,
    order: 3,
    parentCategory: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Transform category data from API response
const transformCategory = (category) => {
  if (!category) return null;
  
  // Use the getFullImageUrl utility to ensure proper image URL
  const imageUrl = getFullImageUrl(category.image);
  
  return {
    id: category._id || category.id || '',
    _id: category._id || category.id || '',
    name: category.name || 'Danh mục không tên',
    slug: category.slug || '',
    description: category.description || '',
    icon: category.icon || '📦',
    image: imageUrl, // Use the properly transformed image URL
    isFeatured: Boolean(category.isFeatured),
    order: category.order || 0,
    parentCategory: category.parentCategory || null,
    createdAt: category.createdAt || new Date().toISOString(),
    updatedAt: category.updatedAt || new Date().toISOString()
  };
};

// Get all categories
export const getAllCategories = async () => {
  try {
    console.log('Fetching all categories');
    const response = await api.get('/categories');
    if (response.data && Array.isArray(response.data)) {
      console.log(`Received ${response.data.length} categories from API`);
      return response.data.map(transformCategory).filter(Boolean);
    }
    console.warn('Invalid category data received from API');
    return FALLBACK_CATEGORIES; // Return fallback data if no valid data
  } catch (error) {
    console.error('Error fetching categories:', error);
    return FALLBACK_CATEGORIES; // Return fallback data on error
  }
};

// Get featured categories
export const getFeaturedCategories = async () => {
  try {
    console.log('Fetching featured categories');
    const response = await api.get('/categories/featured');
    if (response.data && Array.isArray(response.data)) {
      console.log(`Received ${response.data.length} featured categories from API`);
      return response.data.map(transformCategory).filter(Boolean);
    }
    console.warn('Invalid featured category data received from API');
    return FALLBACK_CATEGORIES.filter(cat => cat.isFeatured);
  } catch (error) {
    console.error('Error fetching featured categories:', error);
    return FALLBACK_CATEGORIES.filter(cat => cat.isFeatured);
  }
};

// Get category by ID with subcategories
export const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/categories/${id}`);
    if (response.data) {
      return transformCategory(response.data);
    }
    return FALLBACK_CATEGORIES.find(cat => cat.id === id) || null;
  } catch (error) {
    console.error('Error fetching category by id:', error);
    return FALLBACK_CATEGORIES.find(cat => cat.id === id) || null;
  }
};

// Get category by slug
export const getCategoryBySlug = async (slug) => {
  try {
    const response = await api.get(`/categories/slug/${slug}`);
    if (response.data) {
      return transformCategory(response.data);
    }
    return FALLBACK_CATEGORIES.find(cat => cat.slug === slug) || null;
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    return FALLBACK_CATEGORIES.find(cat => cat.slug === slug) || null;
  }
};

// Get parent categories only
export const getParentCategories = async () => {
  try {
    const response = await api.get('/categories/parents');
    if (response.data && Array.isArray(response.data)) {
      return response.data.map(transformCategory).filter(Boolean);
    }
    return FALLBACK_CATEGORIES.filter(cat => cat.parentCategory === null);
  } catch (error) {
    console.error('Error fetching parent categories:', error);
    return FALLBACK_CATEGORIES.filter(cat => cat.parentCategory === null);
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

export const updateOrder = async (id, order) => {
  try {
    const response = await api.patch(`/categories/${id}/order`, { order });
    return response.data;
  } catch (error) {
    console.error('Error updating category order:', error);
    throw error;
  }
};

export const updateStatus = async (id, isActive) => {
  try {
    const response = await api.patch(`/categories/${id}/status`, { isActive });
    return response.data;
  } catch (error) {
    console.error('Error updating category status:', error);
    throw error;
  }
}; 