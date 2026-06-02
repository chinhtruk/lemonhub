'use client';

import { FiShoppingCart, FiChevronLeft, FiHeart, FiShare2, FiMinus, FiPlus, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { addToCart } from '@/services/cart.service';
import { toast } from 'react-hot-toast';
import AuthModal from '@/components/AuthModal';
import { addToWishlist, removeFromWishlist, checkWishlist } from '@/services/user.service';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { CgSpinner } from 'react-icons/cg';
import { useAuth } from '@/hooks/useAuth';
import { getProductById, getRelatedProducts } from '@/services/product.service';
import React from 'react';

interface Specification {
  name: string;
  value: string;
}

interface Category {
  id: string;
  name: string;
}

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  brand: string;
  category: Category;
  countInStock: number;
  reviews: Review[];
  rating: number;
  numReviews: number;
  createdAt: string;
  inStock: boolean;
  slug: string;
  specifications?: Specification[];
  stock?: number;
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
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

// Tạo các hàm wrapper để kèm thêm log và xử lý lỗi
const fetchProductDetails = async (id: string) => {
  try {
    const productData = await getProductById(id);
    return productData;
  } catch (error) {
    console.error('Error fetching product details:', error);
    return null;
  }
};

const fetchRelatedProducts = async (productId: string) => {
  console.log('Fetching related products for product ID:', productId);
  try {
    const related = await getRelatedProducts(productId);
    console.log('Related products fetched successfully:', related?.length);
    return related;
  } catch (error) {
    console.error('Failed to fetch related products:', error);
    return []; // Return empty array instead of throwing to avoid blocking rendering
  }
};

const checkProductInWishlist = async (productId: string) => {
  console.log('Checking if product is in wishlist:', productId);
  try {
    const isInWishlist = await checkWishlist(productId);
    console.log('Product wishlist status:', isInWishlist ? 'In wishlist' : 'Not in wishlist');
    return isInWishlist;
  } catch (error) {
    console.error('Failed to check wishlist status:', error);
    return false; // Default to not in wishlist on error
  }
};

const ProductDetailPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = React.use(params);
  const navigate = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const { isLoggedIn, openAuthModal } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('Starting to fetch product data for ID:', id);
        
        const product = await fetchProductDetails(id);
        
        if (!product) {
          console.warn('Product not found for ID:', id);
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        // Ensure product.category is always valid
        const safeProduct = {
          ...product,
          category: product.category || { id: '', name: '' }
        };
        
        setProduct(safeProduct);
        
        // Fetch related products in parallel with wishlist check
        const relatedPromise = fetchRelatedProducts(product.id);
        
        // Check wishlist status if user is logged in
        let wishlistPromise = Promise.resolve(false);
        if (isLoggedIn) {
          wishlistPromise = checkProductInWishlist(id);
        }
        
        // Wait for both promises to resolve
        const [related, isInWishlist] = await Promise.all([relatedPromise, wishlistPromise]);
        
        if (related && related.length > 0) {
          const formattedRelatedProducts = related
            .filter((item: any) => item !== null)
            .map((item: any) => ({
              id: item.id,
              name: item.name || '',
              price: item.price || 0,
              originalPrice: item.originalPrice || item.price || 0,
              discount: item.discount || 0,
              image: item.image || '/images/product-placeholder.svg',
              images: item.images || [],
              description: item.description || '',
              category: {
                id: item.category?.id || '',
                name: item.category?.name || ''
              },
              brand: item.brand || '',
              stock: item.stock || item.countInStock || 0
            }));
          setRelatedProducts(formattedRelatedProducts);
        }
        
        // Update wishlist status if user is logged in
        if (isLoggedIn) {
          setInWishlist(isInWishlist);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchProduct:', error);
        setError(typeof error === 'string' ? error : 'Failed to load product');
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, isLoggedIn]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.pathname + window.location.search);
    }
  }, []);

  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    if (product && value > product.stock) {
      toast.error(`Chỉ còn ${product.stock} sản phẩm trong kho`);
      return;
    }
    setQuantity(value);
  };

  const handleAddToCart = async () => {
    // Check if user is logged in by checking userInfo, not just token
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      console.log('User not logged in. Opening auth modal...');
      setIsAuthModalOpen(true);
      return;
    }
    
    setAddingToCart(true);
    try {
      // Convert selected variants to array of objects
      const selectedOptions = Object.entries(selectedVariants).map(([key, value]) => ({
        name: key,
        value: value
      }));
      
      if (product) {
        console.log('Adding to cart:', {
          productId: product.id,
          quantity,
          options: selectedOptions
        });
        
        const result = await addToCart(product.id, quantity, selectedOptions);
        toast.success('Sản phẩm đã được thêm vào giỏ hàng');
        
        // Force a hard refresh to update the cart count in header
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }

    try {
      setWishlistLoading(true);
      
      if (inWishlist) {
        // Remove from wishlist
        await removeFromWishlist(id);
        setInWishlist(false);
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        // Add to wishlist
        await addToWishlist(id);
        setInWishlist(true);
        toast.success('Đã thêm vào danh sách yêu thích');
      }
    } catch (error) {
      console.error('Wishlist operation failed:', error);
      toast.error(typeof error === 'string' ? error : 'Không thể cập nhật danh sách yêu thích');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    }
  };

  const productImages = useMemo(() => {
    if (!product || !product.images || !Array.isArray(product.images) || product.images.length === 0) {
      console.log('No valid images found for product');
      return [];
    }
    
    // Sử dụng mảng images trực tiếp từ product
    // TransformProduct đã xử lý mảng này để bao gồm cả ảnh chính và ảnh phụ
    console.log('Product images array:', product.images);
    console.log('Number of images:', product.images.length);
    
    return product.images;
  }, [product]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-700 hover:text-yellow-500 transition-colors"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <FiChevronLeft className="w-5 h-5 text-gray-600" />
              </li>
              <li>
                <Link
                  href="/product"
                  className="text-gray-700 hover:text-yellow-500 transition-colors"
                >
                  Sản phẩm
                </Link>
              </li>
              {product?.category && (
                <>
                  <li>
                    <FiChevronLeft className="w-5 h-5 text-gray-600" />
                  </li>
                  <li>
                    <Link
                      href={`/category/${product.category.id}`}
                      className="text-gray-700 hover:text-yellow-500 transition-colors"
                    >
                      {product.category.name}
                    </Link>
                  </li>
                </>
              )}
            </ol>
          </nav>

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {error}
              </h3>
              <Link
                href="/product"
                className="text-yellow-500 hover:text-yellow-600 transition-colors"
              >
                Quay lại trang sản phẩm
              </Link>
            </div>
          ) : notFound ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy sản phẩm
              </h3>
              <Link
                href="/product"
                className="text-yellow-500 hover:text-yellow-600 transition-colors"
              >
                Quay lại trang sản phẩm
              </Link>
            </div>
          ) : product ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Product images */}
                <div className="space-y-6">
                  <div className="relative aspect-square bg-white rounded-2xl overflow-hidden">
                    {productImages[selectedImage] && (
                      <Image
                        src={productImages[selectedImage]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                    {product.originalPrice !== undefined && product.originalPrice > product.price && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        -{calculateDiscount(product.originalPrice || 0, product.price)}%
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <div className="overflow-x-auto hide-scrollbar">
                      <div className="flex gap-4 py-2" style={{ minWidth: 'min-content' }}>
                        {/* Debug button */}
                        <button
                          onClick={() => {
                            console.log('Product object:', product);
                            console.log('Product images array:', product.images);
                            console.log('ProductImages from useMemo:', productImages);
                          }}
                          className="hidden"
                        >
                          Debug
                        </button>
                        
                        {productImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`relative flex-shrink-0 w-24 aspect-square bg-white rounded-lg overflow-hidden ${
                              selectedImage === index ? 'ring-2 ring-yellow-500' : ''
                            }`}
                          >
                            <Image
                              src={image}
                              alt={`${product.name} - ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product info */}
                <div className="space-y-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                      {product.name}
                    </h1>
                    <div className="mt-6">
                      <div className="space-y-2">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-bold text-yellow-500">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice !== undefined && product.originalPrice > product.price && (
                            <>
                              <span className="text-lg text-gray-700 line-through">
                                {formatPrice(product.originalPrice || 0)}
                              </span>
                              <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-sm font-medium">
                                -{calculateDiscount(product.originalPrice || 0, product.price)}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Thương hiệu:</span>
                      <span className="font-medium text-gray-900">{product.brand}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Danh mục:</span>
                      <span className="font-medium text-gray-900">{product.category.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Tình trạng:</span>
                      <span className={`font-medium ${(product.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(product.stock || 0) > 0 ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                    </div>
                    {(product.stock || 0) > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Số lượng còn lại:</span>
                        <span className="font-medium text-gray-900">{product.stock}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center border-2 border-gray-200 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(quantity - 1)}
                          className="p-3 text-gray-700 hover:text-yellow-500 transition-colors"
                          disabled={quantity <= 1}
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="w-16 text-center font-medium text-gray-900">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(quantity + 1)}
                          className="p-3 text-gray-700 hover:text-yellow-500 transition-colors"
                          disabled={product.stock === undefined || product.stock <= quantity}
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        className={`p-3 rounded-full transition-all duration-300 ${
                          inWishlist
                            ? 'bg-primary/10 text-primary hover:bg-primary/20'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                        onClick={handleToggleWishlist}
                        disabled={wishlistLoading}
                      >
                        {wishlistLoading ? (
                          <CgSpinner className="animate-spin h-5 w-5" />
                        ) : inWishlist ? (
                          <AiFillHeart className="h-5 w-5" />
                        ) : (
                          <AiOutlineHeart className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={handleShare}
                        className="p-3 rounded-lg border-2 border-gray-200 text-gray-600 hover:text-yellow-500 hover:border-yellow-500 transition-colors"
                      >
                        <FiShare2 className="w-6 h-6" />
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      className={`w-full py-5 px-8 rounded-xl flex items-center justify-center space-x-3 font-semibold text-lg ${
                        (product.stock || 0) > 0 
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      } transition-colors shadow-md hover:shadow-lg`}
                      disabled={(product.stock || 0) === 0 || addingToCart}
                    >
                      {addingToCart ? (
                        <CgSpinner className="animate-spin h-6 w-6" />
                      ) : (
                        <>
                          <FiShoppingCart className="w-6 h-6" />
                          <span>{(product.stock || 0) > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}</span>
                        </>
                      )}
                    </button>

                    {/* Product specifications */}
                    {product.specifications && product.specifications.length > 0 && (
                      <div className="mt-8">
                        <div className="flex items-center space-x-3 mb-6">
                          <svg 
                            className="w-6 h-6 text-gray-700" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                            />
                          </svg>
                          <h3 className="text-xl font-bold text-gray-900">
                            Thông số kỹ thuật
                          </h3>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                          <div className="divide-y divide-gray-100">
                            {product.specifications.map((spec, index) => (
                              <div 
                                key={index} 
                                className={`flex flex-col sm:flex-row py-4 px-6 hover:bg-gray-50 transition-colors duration-150 ${
                                  index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                                }`}
                              >
                                <div className="w-full sm:w-1/3 font-medium text-gray-700 mb-2 sm:mb-0 flex items-center">
                                  <span className="inline-block">{spec.name}</span>
                                </div>
                                <div className="w-full sm:w-2/3 text-gray-700 flex items-center">
                                  <span className="inline-block font-normal">{spec.value}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>

              {/* Product description */}
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  Mô tả sản phẩm
                </h2>
                <div className="prose prose-yellow max-w-none text-gray-800 font-medium">
                  {product.description}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;