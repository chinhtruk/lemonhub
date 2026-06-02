import api from '../config/api';

// Lấy tất cả danh mục
export const getAllCategories = async () => {
  try {
    const { data } = await api.get('/categories');
    return data;
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    throw error.response?.data?.message || 'Không thể tải danh sách danh mục';
  }
};

// Lấy danh mục theo ID
export const getCategoryById = async (id) => {
  try {
    const { data } = await api.get(`/categories/${id}`);
    return data;
  } catch (error) {
    console.error('Error in getCategoryById:', error);
    throw error.response?.data?.message || 'Không thể tải thông tin danh mục';
  }
};

// Tạo danh mục mới
export const createCategory = async (categoryData) => {
  try {
    const { data } = await api.post('/categories', categoryData);
    return data;
  } catch (error) {
    console.error('Error in createCategory:', error);
    throw error.response?.data?.message || 'Không thể tạo danh mục';
  }
};

// Cập nhật danh mục
export const updateCategory = async (id, categoryData) => {
  try {
    const { data } = await api.put(`/categories/${id}`, categoryData);
    return data;
  } catch (error) {
    console.error('Error in updateCategory:', error);
    throw error.response?.data?.message || 'Không thể cập nhật danh mục';
  }
};

// Xóa danh mục
export const deleteCategory = async (id) => {
  try {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    throw error.response?.data?.message || 'Không thể xóa danh mục';
  }
};

// Lấy danh mục nổi bật
export const getFeaturedCategories = async () => {
  try {
    const { data } = await api.get('/categories/featured');
    return data;
  } catch (error) {
    console.error('Error in getFeaturedCategories:', error);
    throw error.response?.data?.message || 'Không thể tải danh mục nổi bật';
  }
};

// Cập nhật thứ tự danh mục
export const updateCategoryOrder = async (id, order) => {
  try {
    const { data } = await api.patch(`/categories/${id}/order`, { order });
    return data;
  } catch (error) {
    console.error('Error in updateCategoryOrder:', error);
    throw error.response?.data?.message || 'Không thể cập nhật thứ tự danh mục';
  }
};

// Lấy danh mục theo slug
export const getCategoryBySlug = async (slug) => {
  try {
    const { data } = await api.get(`/categories/slug/${slug}`);
    return data;
  } catch (error) {
    console.error('Error in getCategoryBySlug:', error);
    throw error.response?.data?.message || 'Không thể tìm thấy danh mục';
  }
}; 