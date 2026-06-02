import API, { handleApiError } from './api';
import { getFullImageUrl } from '@/utils/image';

// Hàm chuyển đổi dữ liệu sản phẩm từ API sang định dạng frontend
const transformProduct = (product) => {
  // Kiểm tra xem product có tồn tại không
  if (!product) return null;
  
  // Đảm bảo đường dẫn ảnh đầy đủ
  const mainImage = getFullImageUrl(product.image);
  
  // Xử lý mảng ảnh phụ (chỉ lấy những ảnh phụ khác với ảnh chính)
  let additionalImages = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    additionalImages = product.images
      .map(getFullImageUrl)
      .filter(img => img && img !== mainImage); // Loại bỏ ảnh trùng với ảnh chính và ảnh null
  }
  
  // Tạo mảng đầy đủ các ảnh, với ảnh chính ở đầu tiên
  const allImages = [mainImage, ...additionalImages];
  
  // Chuyển đổi specifications từ Map sang mảng các đối tượng
  let specifications = [];
  if (product.specifications) {
    if (product.specifications instanceof Map) {
      // Nếu specifications là Map
      for (const [key, value] of product.specifications.entries()) {
        specifications.push({
          name: key,
          value: value
        });
      }
    } else if (typeof product.specifications === 'object') {
      // Nếu specifications là object thông thường
      specifications = Object.entries(product.specifications).map(([key, value]) => ({
        name: key,
        value: value
      }));
    }
  }
  
  return {
    id: product._id || product.id || '',
    name: product.name || 'Sản phẩm',
    slug: product.slug || '',
    price: product.price || 0,
    originalPrice: product.salePrice || product.originalPrice || product.price || 0,
    image: mainImage,
    images: allImages, // Mảng ảnh đã được xử lý, với ảnh chính ở đầu tiên
    description: product.description || '',
    brand: product.brand || '',
    category: product.category ? {
      id: product.category._id || product.category.id || '',
      name: product.category.name || ''
    } : null,
    countInStock: product.countInStock || 0,
    stock: product.countInStock || product.stock || 0,
    rating: product.rating || 0,
    numReviews: product.numReviews || 0,
    isFeatured: Boolean(product.isFeatured),
    specifications: specifications // Thêm specifications vào dữ liệu trả về
  };
};

// Dữ liệu mẫu cho sản phẩm
const FALLBACK_PRODUCTS = [
  {
    id: 'fallback1',
    name: 'Laptop Gaming Asus',
    price: 25990000,
    originalPrice: 29990000,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'fallback2',
    name: 'Samsung Galaxy S23 Ultra',
    price: 18990000,
    originalPrice: 21990000,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'fallback3',
    name: 'Apple iPad Pro',
    price: 29990000,
    originalPrice: 35990000,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  },
];

// Dữ liệu mẫu cho banner
const FALLBACK_BANNERS = [
  {
    id: 1,
    title: "Trải nghiệm công nghệ tốt nhất",
    subtitle: "Các sản phẩm chất lượng cao với mức giá hợp lý",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1500&q=80"
  },
  {
    id: 2,
    title: "Thiết bị thông minh cho cuộc sống",
    subtitle: "Khám phá bộ sưu tập thiết bị mới nhất",
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1500&q=80"
  }
];

// Hàm chuyển đổi mảng sản phẩm
const transformProducts = (data) => {
  try {
    // First check if data is null or undefined
    if (!data) {
      console.warn('Empty data passed to transformProducts');
      return [];
    }
    
    // Check if data is already an array of products
    if (Array.isArray(data)) {
      console.log('Data is array, mapping directly:', data.length, 'items');
      return data.map(transformProduct).filter(Boolean);
    }
    
    // Check if data has a 'products' property that is an array
    if (data.products && Array.isArray(data.products)) {
      console.log('Data has products array:', data.products.length, 'items');
      return data.products.map(transformProduct).filter(Boolean);
    }
    
    console.warn('Invalid products data structure:', data);
    return [];
  } catch (error) {
    console.error('Error transforming products:', error);
    return [];
  }
};

// Lấy tất cả sản phẩm
export const getAllProducts = async (params) => {
  try {
    const { data } = await API.get('/products', { params });
    return {
      ...data,
      products: transformProducts(data)
    };
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    return {
      products: FALLBACK_PRODUCTS,
      page: 1,
      pages: 1, 
      total: FALLBACK_PRODUCTS.length
    };
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (id) => {
  try {
    console.log('Fetching product with ID:', id);
    // Fetch the product details
    const { data: product } = await API.get(`/products/${id}`);
    
    console.log('Raw product data:', product);
    
    const transformedProduct = transformProduct(product);
    console.log('Transformed product:', transformedProduct);
    return transformedProduct;
  } catch (error) {
    console.error('Error in getProductById:', error);
    // Fallback to a dummy product if real data couldn't be fetched
    return FALLBACK_PRODUCTS.find(p => p.id === id) || FALLBACK_PRODUCTS[0];
  }
};

// Lấy sản phẩm theo slug
export const getProductBySlug = async (slug) => {
  try {
    const { data } = await API.get(`/products/slug/${slug}`);
    return transformProduct(data);
  } catch (error) {
    throw error.response?.data?.message || 'Could not fetch product by slug';
  }
};

// Tìm kiếm sản phẩm
export const searchProducts = async (keyword, page = 1, limit = 10) => {
  try {
    const { data } = await API.get('/products', {
      params: { keyword, page, limit }
    });
    return {
      ...data,
      products: transformProducts(data)
    };
  } catch (error) {
    throw error.response?.data?.message || 'Could not search products';
  }
};

// Lấy sản phẩm theo danh mục
export const getProductsByCategory = async (categoryId, page = 1, limit = 12, sort = '') => {
  try {
    console.log('Fetching products for category:', categoryId);
    
    // Convert frontend sort values to API sort parameters
    let sortParam = '';
    switch (sort) {
      case 'newest':
        sortParam = '-createdAt';
        break;
      case 'price-asc':
        sortParam = 'price';
        break;
      case 'price-desc':
        sortParam = '-price';
        break;
      case 'name-asc':
        sortParam = 'name';
        break;
      case 'name-desc':
        sortParam = '-name';
        break;
      case 'popular':
        sortParam = '-numSales';
        break;
      case 'rating':
        sortParam = '-rating';
        break;
      default:
        sortParam = '-createdAt';
    }
    
    const { data } = await API.get(`/products/category/${categoryId}`, {
      params: { 
        page, 
        limit,
        sort: sortParam
      }
    });
    
    // Transform the response data
    const transformedData = {
      products: transformProducts(data),
      page: data.page,
      pages: data.pages,
      total: data.total,
      category: data.category
    };
    
    console.log('Transformed category products:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    throw error.response?.data?.message || 'Could not fetch products by category';
  }
};

// Tạo đánh giá sản phẩm
export const createProductReview = async (productId, review) => {
  try {
    const { data } = await API.post(`/products/${productId}/reviews`, review);
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Could not create product review';
  }
};

// Lấy sản phẩm nổi bật
export const getFeaturedProducts = async (limit = 8) => {
  try {
    console.log('Fetching featured products with limit:', limit);
    const { data } = await API.get(`/products/featured`, {
      params: { limit }
    });
    console.log('Received featured products data:', data);
    
    // Kiểm tra dữ liệu trước khi chuyển đổi
    if (!data) {
      console.warn('Empty data received from featured products API');
      return FALLBACK_PRODUCTS;
    }
    
    const transformed = transformProducts(data);
    console.log('Transformed featured products:', transformed);
    
    // Nếu không có sản phẩm nổi bật, trả về sản phẩm mẫu
    if (!transformed || transformed.length === 0) {
      console.log('No featured products found, using fallbacks');
      return FALLBACK_PRODUCTS;
    }
    
    return transformed;
  } catch (error) {
    console.error('Error in getFeaturedProducts:', error);
    // Return fallback products instead of throwing
    return FALLBACK_PRODUCTS;
  }
};

// Lấy các sản phẩm mới nhất
export const getNewProducts = async (limit = 8) => {
  try {
    console.log('Fetching newest products with limit:', limit);
    // Updated to use the correct endpoint
    const { data } = await API.get(`/products/newest`, {
      params: { limit }
    });
    
    // Extra check to ensure data is valid
    if (!data || !Array.isArray(data)) {
      console.error('Invalid data received for newest products:', data);
      return [];
    }
    
    console.log('Received newest products data:', data.length, 'items');
    
    // Process each product to ensure valid image URLs
    const productsWithImages = data.map(product => {
      if (!product.image || product.image === '') {
        console.warn('Product without image:', product._id);
        // Set a default image
        product.image = '/images/product-placeholder.svg';
      }
      return product;
    });
    
    const transformed = transformProducts(productsWithImages);
    console.log('Transformed newest products:', transformed.length, 'items');
    return transformed;
  } catch (error) {
    console.error('Error in getNewProducts:', error);
    // Return empty array instead of throwing to prevent UI errors
    return [];
  }
};

// Lấy sản phẩm top rated
export const getTopRatedProducts = async (limit = 3) => {
  try {
    const { data } = await API.get(`/products/top`, {
      params: { limit }
    });
    return transformProducts(data);
  } catch (error) {
    throw error.response?.data?.message || 'Could not fetch top rated products';
  }
};

// Lấy sản phẩm liên quan
export const getRelatedProducts = async (productId, limit = 4) => {
  try {
    console.log('Fetching related products for ID:', productId);
    const { data } = await API.get(`/products/${productId}/related`, {
      params: { limit }
    });
    
    // API trả về { products: [...] }
    const productsArray = data.products || data;
    
    // Check if data exists and is an array
    if (!productsArray || !Array.isArray(productsArray)) {
      console.warn('Invalid data structure returned for related products:', data);
      return [];
    }
    
    // Ensure all products have valid images
    const productsWithImages = productsArray.map(product => {
      if (!product.image || product.image === '') {
        console.warn('Related product without image:', product._id);
        product.image = '/images/product-placeholder.svg';
      }
      return product;
    });
    
    const transformed = productsArray.map(transformProduct).filter(Boolean);
    console.log('Successfully fetched related products:', transformed.length, 'items');
    return transformed;
  } catch (error) {
    console.error('Error in getRelatedProducts:', error);
    // Return empty array instead of throwing to prevent UI errors
    return [];
  }
};

// Lấy đánh giá sản phẩm
export const getProductReviews = async (productId, page = 1, limit = 10) => {
  try {
    const { data } = await API.get(`/products/${productId}/reviews`, {
      params: { page, limit }
    });
    return data;
  } catch (error) {
    throw error.response?.data?.message || 'Could not fetch product reviews';
  }
};

// Lấy sản phẩm bán chạy nhất
export const getBestSellingProducts = async (limit = 8) => {
  try {
    const { data } = await API.get(`/products/best-selling`, {
      params: { limit }
    });
    return transformProducts(data);
  } catch (error) {
    throw error.response?.data?.message || 'Could not fetch best selling products';
  }
};

// Lấy banners
export const getBanners = async () => {
  try {
    console.log('Fetching banners');
    const { data } = await API.get('/banners');
    console.log('Received banners data:', data);
    
    // Kiểm tra dữ liệu trước khi xử lý
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('No banners data received or invalid format');
      return FALLBACK_BANNERS;
    }
    
    // Chuyển đổi _id thành id cho banners và đảm bảo đường dẫn ảnh đầy đủ
    const transformed = data.map(banner => {
      if (!banner) return null;
      
      // Process image path using our utility
      const imagePath = getFullImageUrl(banner.image);
      
      return {
        id: banner._id || banner.id || Math.random().toString(36).substr(2, 9),
        title: banner.title || 'Công nghệ mới',
        subtitle: banner.subtitle || 'Khám phá các sản phẩm mới nhất',
        image: imagePath || FALLBACK_BANNERS[0].image,
        link: banner.link || '',
        isActive: banner.isActive || true
      };
    }).filter(Boolean);
    
    if (transformed.length === 0) {
      console.warn('No valid banners after transformation');
      return FALLBACK_BANNERS;
    }
    
    console.log('Transformed banners:', transformed);
    return transformed;
  } catch (error) {
    console.error('Error in getBanners:', error);
    return FALLBACK_BANNERS;
  }
};

export const createProduct = async (productData) => {
  const response = await API.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await API.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await API.delete(`/products/${id}`);
  return response.data;
};

export const updateStock = async (id, stock) => {
  const response = await API.patch(`/products/${id}/stock`, { stock });
  return response.data;
};

export const updateStatus = async (id, isActive) => {
  const response = await API.patch(`/products/${id}/status`, { isActive });
  return response.data;
};

export const getNewestProducts = async (limit = 8) => {
  try {
    const { data } = await API.get(`/products/newest`, {
      params: { limit }
    });
    return transformProducts(data);
  } catch (error) {
    throw error.response?.data?.message || 'Could not fetch newest products';
  }
};