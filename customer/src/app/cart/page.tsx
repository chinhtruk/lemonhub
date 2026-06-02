'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingCart, FiX } from 'react-icons/fi';
import { getCart, updateCartItem, removeCartItem } from '@/services/cart.service';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getFullImageUrl } from '@/utils/image';

interface CartItem {
  id: string;
  product: string;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const data = await getCart();
      
      // Ensure full image paths
      const itemsWithFullImagePaths = (data.items || []).map((item: CartItem) => ({
        ...item,
        image: getFullImageUrl(item.image)
      }));
      
      setCartItems(itemsWithFullImagePaths);
      
      // Calculate total
      const calculatedTotal = itemsWithFullImagePaths.reduce(
        (sum: number, item: CartItem) => sum + (item.price * item.quantity),
        0
      );
      setTotal(calculatedTotal);
    } catch (err: any) {
      console.error('Error fetching cart:', err);
      setError('Không thể tải giỏ hàng. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      const result = await updateCartItem(id, newQuantity);
      
      // Update local state with the new cart data from the server
      if (result && result.items) {
        const updatedItems = result.items.map((item: CartItem) => ({
          ...item,
          image: getFullImageUrl(item.image)
        }));
        setCartItems(updatedItems);
        
        // Recalculate total based on the new cart data
        const newTotal = updatedItems.reduce(
          (sum: number, item: CartItem) => sum + (item.price * item.quantity),
          0
        );
        setTotal(newTotal);
        
        // Force refresh to update header cart count
        router.refresh();
      }
      
      toast.success('Đã cập nhật số lượng');
    } catch (err: any) {
      console.error('Error updating quantity:', err);
      toast.error(err.message || 'Không thể cập nhật số lượng. Vui lòng thử lại.');
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await removeCartItem(id);
      
      // Fetch updated cart data after removal
      await fetchCart();
      
      // Force refresh to update header cart count
      router.refresh();
      
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (err: any) {
      console.error('Error removing item:', err);
      toast.error(err.message || 'Không thể xóa sản phẩm. Vui lòng thử lại.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error}
            </h3>
            <Link
              href="/"
              className="text-yellow-500 hover:text-yellow-600 transition-colors"
            >
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <FiShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Giỏ hàng trống
            </h3>
            <p className="mt-1 text-gray-500">
              Hãy thêm sản phẩm vào giỏ hàng của bạn.
            </p>
            <div className="mt-6">
              <Link
                href="/product"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 transition-colors"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <li key={item.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0 w-32 h-32 bg-gray-100 rounded-xl overflow-hidden relative">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover transform hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/product/${item.product}`}
                          className="text-lg font-medium text-gray-900 hover:text-yellow-500 transition-colors duration-200 line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center border-2 border-gray-200 rounded-lg">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                className="p-2 text-gray-600 hover:text-yellow-500 transition-colors duration-200"
                                disabled={item.quantity <= 1}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="w-12 text-center font-medium text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="p-2 text-gray-600 hover:text-yellow-500 transition-colors duration-200"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-600 transition-colors duration-200 flex items-center space-x-1"
                            >
                              <FiX className="w-4 h-4" />
                              <span>Xóa</span>
                            </button>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-yellow-500">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                            {item.originalPrice > item.price && (
                              <div className="text-sm text-gray-500 line-through">
                                {formatPrice(item.originalPrice * item.quantity)}
                              </div>
                            )}
                            {item.quantity > 1 && (
                              <div className="text-sm text-gray-500">
                                ({formatPrice(item.price)} / sản phẩm)
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Tổng đơn hàng
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính ({cartItems.length} sản phẩm)</span>
                  <span className="font-medium text-gray-900">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="text-green-500 font-medium">Miễn phí</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-900">Tổng cộng</span>
                    <span className="text-xl font-bold text-yellow-500">{formatPrice(total)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    (Đã bao gồm VAT)
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/checkout')}
                className="w-full mt-6 bg-yellow-500 text-white py-4 px-6 rounded-xl font-medium hover:bg-yellow-600 transition-colors"
              >
                Tiến hành thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 