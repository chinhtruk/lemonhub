'use client';

import { FiFilter, FiGrid, FiList, FiChevronDown, FiX } from 'react-icons/fi';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getAllProducts } from '@/services/product.service';
import { getAllCategories } from '@/services/category.service';
import { toast } from 'react-hot-toast';
import { getFullImageUrl } from '@/utils/image';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
  brand: string;
  stock: number;
}

interface FilterState {
  category: string | null;
  brand: string;
  minPrice: number;
  maxPrice: number;
}

interface Category {
  id: string;
  name: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const calculateDiscount = (originalPrice: number, price: number) => {
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

const priceRanges = [
  { min: 0, max: 500000, label: 'Dưới 500,000₫' },
  { min: 500000, max: 1000000, label: '500,000₫ - 1,000,000₫' },
  { min: 1000000, max: 5000000, label: '1,000,000₫ - 5,000,000₫' },
  { min: 5000000, max: 10000000, label: '5,000,000₫ - 10,000,000₫' },
  { min: 10000000, max: 20000000, label: '10,000,000₫ - 20,000,000₫' },
  { min: 20000000, max: Infinity, label: 'Trên 20,000,000₫' }
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [isGridView, setIsGridView] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'>('name-asc');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>(() => {
    const categoryParam = searchParams.get('category');
    const brandParam = searchParams.get('brand');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    
    return {
      category: categoryParam || null,
      brand: brandParam || '',
      minPrice: minPriceParam ? parseInt(minPriceParam, 10) : 0,
      maxPrice: maxPriceParam ? parseInt(maxPriceParam, 10) : Infinity
    };
  });

  // Fetch products, categories, and brands from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch categories first
        const categoriesData = await getAllCategories();
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData.map(cat => ({
            id: cat.id || cat._id,
            name: cat.name
          })));
        }
        
        // Fetch products
        const params: Record<string, string> = {};
        if (filters.category) {
          params.category = filters.category;
        }
        
        const data = await getAllProducts(params);
        if (data && data.products) {
          // Transform product data
          const transformedProducts = data.products.map((p: any) => ({
            id: p.id || p._id || '',
            name: p.name || 'Sản phẩm không tên',
            price: p.price || 0,
            originalPrice: p.originalPrice || p.price || 0,
            image: getFullImageUrl(p.image),
            description: p.description || '',
            category: {
              id: p.category?.id || p.category?._id || '',
              name: p.category?.name || 'Chưa phân loại'
            },
            brand: p.brand || 'Chưa xác định',
            stock: p.countInStock || p.stock || 0
          }));
          
          setProducts(transformedProducts);
          
          // Extract unique brands from products
          const uniqueBrands = Array.from(
            new Set(transformedProducts.map((p: Product) => p.brand).filter(Boolean))
          ) as string[];
          setBrands(uniqueBrands);
        } else {
          setProducts([]);
          setBrands([]);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Không thể tải danh sách sản phẩm');
        setIsLoading(false);
        toast.error('Không thể tải danh sách sản phẩm');
      }
    };
    
    fetchData();
  }, [filters.category]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        if (!product) return false;
        if (filters.category && product.category?.id !== filters.category) return false;
        if (filters.brand && product.brand !== filters.brand) return false;
        if (product.price < filters.minPrice) return false;
        if (filters.maxPrice !== Infinity && product.price > filters.maxPrice) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return (a.price || 0) - (b.price || 0);
          case 'price-desc':
            return (b.price || 0) - (a.price || 0);
          case 'name-asc':
            return (a.name || '').localeCompare(b.name || '');
          case 'name-desc':
            return (b.name || '').localeCompare(a.name || '');
          default:
            return 0;
        }
      });
  }, [products, filters, sortBy]);

  const handleFilterChange = (key: keyof FilterState, value: string | number | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: null,
      brand: '',
      minPrice: 0,
      maxPrice: Infinity
    });
  };

  // Find the current category name
  const currentCategoryName = useMemo(() => {
    if (!filters.category) return '';
    const category = categories.find(cat => cat.id === filters.category);
    return category ? category.name : '';
  }, [filters.category, categories]);

  // Select a price range
  const selectPriceRange = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      minPrice: min,
      maxPrice: max
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
            {currentCategoryName 
              ? `${currentCategoryName}` 
              : 'Tất cả sản phẩm'
            }
            <span className="text-lg font-normal text-gray-600 ml-4">
              ({filteredProducts.length} sản phẩm)
            </span>
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-4 pr-10 text-gray-700 cursor-pointer hover:border-yellow-500 transition-colors focus:outline-none focus:border-yellow-500"
              >
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsGridView(true)}
                className={`p-2 rounded-lg transition-colors ${
                  isGridView ? 'bg-yellow-500 text-white' : 'text-gray-600 hover:text-yellow-500'
                }`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsGridView(false)}
                className={`p-2 rounded-lg transition-colors ${
                  !isGridView ? 'bg-yellow-500 text-white' : 'text-gray-600 hover:text-yellow-500'
                }`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden p-2 text-gray-600 hover:text-yellow-500 transition-colors"
            >
              <FiFilter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-8">
          {/* Filters */}
          <div className={`${
            showFilters ? 'block' : 'hidden'
          } sm:block w-full sm:w-64 space-y-6 bg-white p-6 rounded-2xl shadow-sm`}>
            <div className="flex items-center justify-between sm:justify-start">
              <h2 className="text-lg font-medium text-gray-900">Bộ lọc</h2>
              {(filters.category || filters.brand || filters.minPrice > 0 || filters.maxPrice !== Infinity) && (
                <button
                  onClick={clearFilters}
                  className="text-yellow-500 hover:text-yellow-600 transition-colors text-sm font-medium sm:ml-4"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            ) : (
              <>
                {/* Categories filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Danh mục</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="all-categories"
                        type="radio"
                        name="category"
                        checked={filters.category === null}
                        onChange={() => handleFilterChange('category', null)}
                        className="h-4 w-4 text-yellow-500 focus:ring-yellow-400"
                      />
                      <label htmlFor="all-categories" className="ml-2 text-sm text-gray-700">
                        Tất cả
                      </label>
                    </div>
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center">
                        <input
                          id={`category-${category.id}`}
                          type="radio"
                          name="category"
                          checked={filters.category === category.id}
                          onChange={() => handleFilterChange('category', category.id)}
                          className="h-4 w-4 text-yellow-500 focus:ring-yellow-400"
                        />
                        <label htmlFor={`category-${category.id}`} className="ml-2 text-sm text-gray-700">
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brands filter */}
                {brands.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Thương hiệu</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="all-brands"
                          type="radio"
                          name="brand"
                          checked={filters.brand === ''}
                          onChange={() => handleFilterChange('brand', '')}
                          className="h-4 w-4 text-yellow-500 focus:ring-yellow-400"
                        />
                        <label htmlFor="all-brands" className="ml-2 text-sm text-gray-700">
                          Tất cả
                        </label>
                      </div>
                      {brands.map((brand) => (
                        <div key={brand} className="flex items-center">
                          <input
                            id={`brand-${brand}`}
                            type="radio"
                            name="brand"
                            checked={filters.brand === brand}
                            onChange={() => handleFilterChange('brand', brand)}
                            className="h-4 w-4 text-yellow-500 focus:ring-yellow-400"
                          />
                          <label htmlFor={`brand-${brand}`} className="ml-2 text-sm text-gray-700">
                            {brand}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price range filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Khoảng giá</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="all-prices"
                        type="radio"
                        name="price"
                        checked={filters.minPrice === 0 && filters.maxPrice === Infinity}
                        onChange={() => selectPriceRange(0, Infinity)}
                        className="h-4 w-4 text-yellow-500 focus:ring-yellow-400"
                      />
                      <label htmlFor="all-prices" className="ml-2 text-sm text-gray-700">
                        Tất cả
                      </label>
                    </div>
                    {priceRanges.map((range, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          id={`price-${index}`}
                          type="radio"
                          name="price"
                          checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                          onChange={() => selectPriceRange(range.min, range.max)}
                          className="h-4 w-4 text-yellow-500 focus:ring-yellow-400"
                        />
                        <label htmlFor={`price-${index}`} className="ml-2 text-sm text-gray-700">
                          {range.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Products grid/list */}
          <div className="flex-1">
            {isLoading ? (
              // Loading state
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              // Empty state
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <FiX className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm nào</h3>
                <p className="text-gray-600 mb-6">
                  Không có sản phẩm nào phù hợp với bộ lọc bạn đã chọn. Hãy thử bỏ bớt bộ lọc để xem nhiều sản phẩm hơn.
                </p>
                <button 
                  onClick={clearFilters}
                  className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : isGridView ? (
              // Grid view
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full"
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
                          -{calculateDiscount(product.originalPrice, product.price)}%
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
                ))}
              </div>
            ) : (
              // List view
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-300 flex flex-row"
                  >
                    <div className="relative w-36 h-36 sm:w-48 sm:h-48 flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(min-width: 640px) 12rem, 9rem"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          console.error('Failed to load product image:', product.image);
                          e.currentTarget.src = '/images/product-placeholder.svg';
                        }}
                      />
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-medium px-2 py-1 rounded-md">
                          -{calculateDiscount(product.originalPrice, product.price)}%
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-6 flex flex-col justify-between flex-grow">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-yellow-500 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {product.description || 'Không có mô tả cho sản phẩm này.'}
                        </p>
                        {product.category && (
                          <div className="text-xs text-gray-600 mb-2">
                            <span className="font-medium">Danh mục:</span> {product.category.name}
                          </div>
                        )}
                        {product.brand && (
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Thương hiệu:</span> {product.brand}
                          </div>
                        )}
                      </div>
                      <div className="mt-4">
                        <div className="flex items-baseline">
                          <div className="text-xl font-bold text-yellow-500">
                            {formatPrice(product.price)}
                          </div>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="ml-2 text-sm text-gray-600 line-through">
                              {formatPrice(product.originalPrice)}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-green-600 mt-1">
                          {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 