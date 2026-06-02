'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiGrid, FiList, FiChevronDown, FiFilter, FiChevronRight } from 'react-icons/fi';
import { getProductsByCategory } from '@/services/product.service';
import { getFullImageUrl } from '@/utils/image';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  images: string[];
  description: string;
  brand: string;
  category: {
    id: string;
    name: string;
  };
  countInStock: number;
  stock: number;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isFlashSale: boolean;
  flashSalePrice?: number;
  flashSaleDiscount?: number;
  flashSaleEndDate?: string;
}

interface ApiResponse {
  products: (Partial<Product> | null)[];
  category: {
    id: string;
    name: string;
    description?: string;
  };
  pages: number;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Subcategory {
  id: string;
  name: string;
  parentCategory: string;
}

export default function CategoryPage() {
  const params = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGridView, setIsGridView] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const categoryId = params.id as string;
        
        // Fetch category details and subcategories
        const [categoryResponse, subcategoriesResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${categoryId}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/parent/${categoryId}`)
        ]);
        
        const categoryData = await categoryResponse.json();
        const subcategoriesData = await subcategoriesResponse.json();
        
        setCategory(categoryData);
        setSubcategories(subcategoriesData);
        
        // Fetch products
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products/category/${categoryId}?subcategory=${selectedSubcategory}&minPrice=${priceRange[0]}&maxPrice=${priceRange[1]}&sort=${sortBy}&page=${currentPage}`
        );
        const data: ApiResponse = await response.json();
        
        const validProducts = data.products
          .filter((product): product is Product => 
            product !== null && 
            typeof product.id === 'string' &&
            typeof product.name === 'string' &&
            typeof product.slug === 'string' &&
            typeof product.price === 'number' &&
            typeof product.originalPrice === 'number' &&
            typeof product.discount === 'number' &&
            typeof product.image === 'string' &&
            Array.isArray(product.images) &&
            typeof product.description === 'string' &&
            typeof product.brand === 'string' &&
            typeof product.category === 'object' &&
            product.category !== null &&
            typeof product.category.id === 'string' &&
            typeof product.category.name === 'string'
          );
        
        setProducts(validProducts);
        setTotalPages(data.pages);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Không thể tải thông tin danh mục. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchCategoryData();
    }
  }, [params.id, selectedSubcategory, priceRange, sortBy, currentPage]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const calculateDiscount = (originalPrice: number, price: number) => {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Đã xảy ra lỗi</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-4 text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="hover:text-yellow-500 transition-colors">
                Trang chủ
              </Link>
            </li>
            <li className="flex items-center space-x-2">
              <FiChevronRight className="w-4 h-4" />
              <Link href="/product" className="hover:text-yellow-500 transition-colors">
                Sản phẩm
              </Link>
            </li>
            <li className="flex items-center space-x-2">
              <FiChevronRight className="w-4 h-4" />
              <span className="text-gray-900">{category?.name || 'Đang tải...'}</span>
            </li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {category?.name}
          </h1>
          {category?.description && (
            <p className="text-gray-600">{category.description}</p>
          )}
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              {/* Subcategories */}
              {subcategories.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Danh mục con</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedSubcategory('all')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedSubcategory === 'all'
                          ? 'bg-yellow-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Tất cả
                    </button>
                    {subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSubcategory(sub.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedSubcategory === sub.id
                            ? 'bg-yellow-500 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Khoảng giá</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {formatPrice(priceRange[0])}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatPrice(priceRange[1])}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="100000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile Filters Button */}
            <button
              className="lg:hidden w-full mb-4 px-4 py-2 bg-white rounded-lg shadow-sm text-gray-700 flex items-center justify-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter size={16} />
              {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
            </button>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden mb-4">
                <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                  {/* Mobile Subcategories */}
                  {subcategories.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Danh mục con</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSelectedSubcategory('all')}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            selectedSubcategory === 'all'
                              ? 'bg-yellow-500 text-white'
                              : 'text-gray-700 bg-gray-50'
                          }`}
                        >
                          Tất cả
                        </button>
                        {subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => setSelectedSubcategory(sub.id)}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              selectedSubcategory === sub.id
                                ? 'bg-yellow-500 text-white'
                                : 'text-gray-700 bg-gray-50'
                            }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mobile Price Range */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Khoảng giá</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {formatPrice(priceRange[0])}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatPrice(priceRange[1])}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10000000"
                        step="100000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm mb-8 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsGridView(true)}
                    className={`p-2 rounded-lg transition-colors ${
                      isGridView ? 'bg-yellow-500 text-white' : 'text-gray-600 hover:text-yellow-500'
                    }`}
                    title="Hiển thị dạng lưới"
                  >
                    <FiGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsGridView(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      !isGridView ? 'bg-yellow-500 text-white' : 'text-gray-600 hover:text-yellow-500'
                    }`}
                    title="Hiển thị dạng danh sách"
                  >
                    <FiList className="w-5 h-5" />
                  </button>
                  <div className="hidden sm:block h-6 w-px bg-gray-200 mx-2"></div>
                  <span className="text-sm text-gray-500">
                    Hiển thị {products.length} sản phẩm
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="text-sm text-gray-500">Sắp xếp theo:</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-4 pr-10 text-gray-700 cursor-pointer hover:border-yellow-500 transition-colors focus:outline-none focus:border-yellow-500"
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="price-asc">Giá thấp đến cao</option>
                      <option value="price-desc">Giá cao đến thấp</option>
                      <option value="name-asc">Tên A-Z</option>
                      <option value="name-desc">Tên Z-A</option>
                      <option value="popular">Phổ biến nhất</option>
                      <option value="rating">Đánh giá cao nhất</option>
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {products.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy sản phẩm nào
                </h3>
                <p className="text-gray-600">
                  Hiện không có sản phẩm nào trong danh mục này
                </p>
              </div>
            ) : (
              <div className={isGridView ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-6'}>
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className={`group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
                      isGridView ? '' : 'flex'
                    }`}
                  >
                    <div className={`relative ${isGridView ? 'aspect-square' : 'w-48 h-48'}`}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.originalPrice > product.price && (
                        <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-sm font-medium">
                          -{calculateDiscount(product.originalPrice, product.price)}%
                        </div>
                      )}
                    </div>
                    <div className={`p-6 ${isGridView ? '' : 'flex-1'}`}>
                      <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-yellow-500 transition-colors">
                        {product.name}
                      </h3>
                      <div className="space-y-1">
                        <div className="text-lg font-bold text-yellow-500">
                          {formatPrice(product.price)}
                        </div>
                        {product.originalPrice > product.price && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </div>
                        )}
                      </div>
                      {!isGridView && (
                        <p className="mt-4 text-gray-600 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-yellow-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-yellow-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 