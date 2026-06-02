'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { 
  getFeaturedProducts, 
  getBanners 
} from '@/services/product.service';
import { getAllCategories, getFeaturedCategories } from '@/services/category.service';
import { getFullImageUrl } from '@/utils/image';

interface Banner {
  id: string | number;
  title: string;
  subtitle: string;
  image: string;
  link?: string;
  isActive?: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[];
  description?: string;
  brand?: string;
  category?: {
    id: string;
    name: string;
  };
  countInStock?: number;
  stock?: number;
  rating?: number;
  numReviews?: number;
  isFeatured?: boolean;
  slug?: string;
}

interface Category {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  isFeatured: boolean;
  order: number;
  parentCategory: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // State để lưu trữ dữ liệu từ API
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  
  // Use this for fallback banners if needed
  const fallbackBanners: Banner[] = [
    {
      id: 1,
      title: "Trải nghiệm công nghệ tốt nhất",
      subtitle: "Các sản phẩm chất lượng cao với mức giá hợp lý",
      image: "/images/placeholder-banner.svg"
    },
    {
      id: 2,
      title: "Thiết bị thông minh cho cuộc sống",
      subtitle: "Khám phá bộ sưu tập thiết bị mới nhất",
      image: "/images/placeholder-banner.svg"
    }
  ];

  // Hàm chuyển đổi dữ liệu từ API sang kiểu Product
  const transformApiProduct = (apiProduct: any): Product | null => {
    if (!apiProduct) return null;
    
    // Đảm bảo luôn có đường dẫn hình ảnh hợp lệ
    let imageUrl = apiProduct.image || '';
    if (!imageUrl.startsWith('http')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      imageUrl = imageUrl.startsWith('/') 
        ? `${baseUrl}${imageUrl}` 
        : `${baseUrl}/${imageUrl}`;
    }
    
    return {
      id: apiProduct._id || apiProduct.id || '',
      name: apiProduct.name || 'Sản phẩm không tên',
      price: Number(apiProduct.price) || 0,
      originalPrice: apiProduct.originalPrice ? Number(apiProduct.originalPrice) : undefined,
      discount: apiProduct.discount ? Number(apiProduct.discount) : undefined,
      image: imageUrl,
      images: apiProduct.images || [],
      description: apiProduct.description,
      brand: apiProduct.brand,
      category: apiProduct.category ? {
        id: apiProduct.category._id || apiProduct.category.id || '',
        name: apiProduct.category.name || ''
      } : undefined,
      countInStock: apiProduct.countInStock ? Number(apiProduct.countInStock) : undefined,
      stock: apiProduct.stock ? Number(apiProduct.stock) : undefined,
      rating: apiProduct.rating ? Number(apiProduct.rating) : undefined,
      numReviews: apiProduct.numReviews ? Number(apiProduct.numReviews) : undefined,
      isFeatured: apiProduct.isFeatured,
      slug: apiProduct.slug
    };
  };

  function transformApiCategory(apiCategory: any): Category {
    return {
      _id: apiCategory._id || apiCategory.id,
      id: apiCategory.id || apiCategory._id,
      name: apiCategory.name,
      slug: apiCategory.slug,
      description: apiCategory.description,
      icon: apiCategory.icon,
      image: apiCategory.image,
      isFeatured: apiCategory.isFeatured,
      order: apiCategory.order,
      parentCategory: apiCategory.parentCategory,
      createdAt: apiCategory.createdAt,
      updatedAt: apiCategory.updatedAt,
    };
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Categories
        const categoriesData = await getAllCategories();
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData.map(cat => ({
            ...cat,
            _id: cat.id || '', // Ensure _id is present
          })));
        }
        
        // Featured Categories
        const featuredCategoriesData = await getFeaturedCategories();
        if (Array.isArray(featuredCategoriesData)) {
          setFeaturedCategories(featuredCategoriesData.map(cat => ({
            ...cat,
            _id: cat.id || '', // Ensure _id is present
          })));
        }
        
        // Banners and Featured Products
        console.log('Fetching banners and featured products...');
        try {
          const bannersData = await getBanners();
          console.log('Received banners:', bannersData);
          
          // Set banners - always use fallback if empty
          if (bannersData && Array.isArray(bannersData) && bannersData.length > 0) {
            setBanners(bannersData.filter(banner => banner !== null) as Banner[]);
          } else {
            console.log('Using fallback banners');
            setBanners(fallbackBanners);
          }
        } catch (err) {
          console.error('Banner fetch error:', err);
          setBanners(fallbackBanners);
        }
        
        // Tạo sản phẩm nổi bật giả nếu API không trả về dữ liệu
        const fallbackProducts: Product[] = [
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
        
        try {
          const featuredProductsData = await getFeaturedProducts();
          console.log('Received featured products data:', featuredProductsData);
          
          // Set featured products
          if (featuredProductsData && Array.isArray(featuredProductsData) && featuredProductsData.length > 0) {
            const transformedProducts = featuredProductsData
              .map((p: any) => transformApiProduct(p))
              .filter((p: Product | null): p is Product => p !== null)
              .slice(0, 16);
            
            if (transformedProducts.length > 0) {
              setFeaturedProducts(transformedProducts);
            } else {
              console.log('Using fallback products - transformed list was empty');
              setFeaturedProducts(fallbackProducts);
            }
          } else {
            console.log('Using fallback products - API returned empty');
            setFeaturedProducts(fallbackProducts);
          }
      } catch (err) {
          console.error('Featured products fetch error:', err);
          setFeaturedProducts(fallbackProducts);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        // Set fallback data
        setBanners(fallbackBanners);
        setFeaturedProducts([
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
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto slide banners
  useEffect(() => {
    if (banners.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Format số 2 chữ số (thêm số 0 phía trước nếu cần)
  const formatTwoDigits = (num: number) => {
    return num.toString().padStart(2, '0');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner Slider */}
      <div className="relative w-full overflow-hidden">
        {isLoading ? (
          <div className="relative aspect-[21/9] w-full bg-gray-800 animate-pulse" />
        ) : banners.length === 0 ? (
          // Fallback banner if no banners are loaded
          <div className="relative aspect-[21/9] w-full bg-gray-800 flex items-center justify-center">
            <div className="text-white text-center">
              <h2 className="text-4xl font-bold mb-4">LemonHub</h2>
              <p className="text-xl">Địa chỉ mua sắm công nghệ uy tín</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentBanner * 100}%)` }}
              >
                {banners.map((banner, index) => (
                  <div key={banner.id} className="min-w-full">
                    <div className="relative aspect-[21/9] w-full overflow-hidden">
                      {banner.link ? (
                        <Link href={banner.link} className="block w-full h-full">
                          <Image
                            src={banner.image}
                            alt={banner.title}
                            fill
                            priority={index === 0}
                            sizes="100vw"
                            className="object-cover"
                            onError={(e) => {
                              console.error('Failed to load banner image:', banner.image);
                              // Fallback to a default image on error
                              e.currentTarget.src = '/images/placeholder-banner.svg';
                            }}
                          />
                        </Link>
                      ) : (
                <Image
                  src={banner.image}
                          alt={banner.title}
                          fill
                          priority={index === 0}
                          sizes="100vw"
                          className="object-cover"
                          onError={(e) => {
                            console.error('Failed to load banner image:', banner.image);
                            // Fallback to a default image on error
                            e.currentTarget.src = '/images/placeholder-banner.svg';
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
        {/* Banner navigation */}
            <div className="absolute bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-3 md:space-x-4 z-30">
          {banners.map((_, index) => (
            <button
              key={`nav-${index}`}
              onClick={() => setCurrentBanner(index)}
              aria-label={`Chuyển đến banner ${index + 1}`}
              className={`w-2 md:w-3 h-2 md:h-3 rounded-full transition-all duration-500 transform hover:scale-125 ${
                index === currentBanner 
                  ? 'bg-yellow-500 w-6 md:w-8' 
                  : 'bg-white/60 hover:bg-white'
              }`}
            />
          ))}
        </div>
        {/* Navigation arrows */}
        <button 
          onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
          aria-label="Banner trước"
              className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-3 md:p-4 rounded-full transition-all duration-300 backdrop-blur-md hover:scale-110 z-30"
        >
          <FiArrowRight className="w-5 h-5 md:w-6 md:h-6 transform rotate-180" />
        </button>
        <button 
          onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
          aria-label="Banner tiếp theo"
              className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-3 md:p-4 rounded-full transition-all duration-300 backdrop-blur-md hover:scale-110 z-30"
        >
          <FiArrowRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
        )}
        </div>

      {/* Featured products section */}
      <section className="py-16 md:py-24 bg-white scroll-mt-16" id="featured">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Sản phẩm nổi bật
            </h2>
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={() => {
                  const container = document.getElementById('featured-products-container');
                  if (container) {
                    container.scrollBy({ left: -300, behavior: 'smooth' });
                  }
                }}
                aria-label="Xem sản phẩm trước đó"
                className="p-2 rounded-full bg-transparent hover:bg-yellow-100 text-gray-800 transition-all"
              >
                <FiArrowRight className="w-5 h-5 transform rotate-180" />
              </button>
              <button
                onClick={() => {
                  const container = document.getElementById('featured-products-container');
                  if (container) {
                    container.scrollBy({ left: 300, behavior: 'smooth' });
                  }
                }}
                aria-label="Xem sản phẩm tiếp theo"
                className="p-2 rounded-full bg-transparent hover:bg-yellow-100 text-gray-800 transition-all"
              >
                <FiArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div 
            id="featured-products-container"
            className="flex overflow-x-auto pb-6 space-x-4 md:space-x-6 snap-x hide-scrollbar"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <style jsx>{`
              #featured-products-container::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {featuredProducts.length === 0 ? (
              // Placeholder sản phẩm khi không có dữ liệu
              Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={`placeholder-${i}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden flex-shrink-0 snap-start animate-pulse"
                  style={{ width: 'calc(100% - 1rem)', maxWidth: '280px' }}
                >
                  <div className="relative aspect-square bg-gray-300"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-300 rounded mb-4"></div>
                    <div className="h-5 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              featuredProducts.map((product) => (
              <Link
                  key={product.id}
                href={`/product/${product.id}`}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex-shrink-0 snap-start"
                  style={{ width: 'calc(50% - 0.5rem)', minWidth: '180px', maxWidth: '280px' }}
              >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <Image
                      src={product.image}
                    alt={product.name}
                    fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        console.error('Failed to load product image:', product.image);
                        e.currentTarget.src = '/images/product-placeholder.svg';
                      }}
                  />
                  {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-medium px-2 py-1 rounded-md">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </div>
                  )}
                </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <h3 className="text-base font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-yellow-500 transition-colors">
                    {product.name}
                  </h3>
                    <div className="mt-auto">
                    <div className="text-lg font-bold text-yellow-500">
                      {formatPrice(product.price)}
                    </div>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <div className="text-sm text-gray-600 line-through">
                          {formatPrice(product.originalPrice)}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
              ))
            )}
          </div>
          <div className="text-center mt-8">
            <Link href="/products" className="inline-block px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors">
              Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </section>

      {/* Why choose us section */}
      <section className="py-16 md:py-24 bg-gray-50 scroll-mt-16" id="why-choose-us">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12 md:mb-20">
            Tại sao chọn LemonHub?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
            <div className="text-center group">
              <div className="relative w-24 h-24 md:w-32 md:h-32 bg-yellow-100 group-hover:bg-yellow-200 rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6">
                <span className="text-4xl md:text-6xl transform transition-transform duration-500 group-hover:scale-110">🚚</span>
                <div className="absolute -inset-2 bg-yellow-200 rounded-3xl -z-10 opacity-50 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6">Giao hàng nhanh chóng</h3>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                Giao hàng toàn quốc với thời gian nhanh chóng và đảm bảo an toàn cho sản phẩm.
              </p>
            </div>
            <div className="text-center group">
              <div className="relative w-24 h-24 md:w-32 md:h-32 bg-yellow-100 group-hover:bg-yellow-200 rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6">
                <span className="text-4xl md:text-6xl transform transition-transform duration-500 group-hover:scale-110">💳</span>
                <div className="absolute -inset-2 bg-yellow-200 rounded-3xl -z-10 opacity-50 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6">Thanh toán đa dạng</h3>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                Hỗ trợ nhiều phương thức thanh toán an toàn và tiện lợi cho khách hàng.
              </p>
            </div>
            <div className="text-center group">
              <div className="relative w-24 h-24 md:w-32 md:h-32 bg-yellow-100 group-hover:bg-yellow-200 rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6">
                <span className="text-4xl md:text-6xl transform transition-transform duration-500 group-hover:scale-110">🛡️</span>
                <div className="absolute -inset-2 bg-yellow-200 rounded-3xl -z-10 opacity-50 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6">Bảo hành chính hãng</h3>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                Chính sách bảo hành uy tín, đổi trả dễ dàng trong 30 ngày đầu tiên.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
