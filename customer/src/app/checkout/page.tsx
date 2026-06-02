'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiCreditCard, FiDollarSign, FiTruck, FiUser, FiMapPin, FiPhone, FiMail, FiHome, FiInfo } from 'react-icons/fi';
import { getCart, clearCart } from '@/services/cart.service';
import { isAuthenticated } from '@/services/auth.service';
import { getCurrentUser } from '@/services/user.service';
import { toast } from 'react-hot-toast';
import { getFullImageUrl } from '@/utils/image';

// Custom styles
import './checkout.css';

interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
  product: number;
}

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  paymentMethod: 'cod' | 'bank-transfer' | 'credit-card';
  note: string;
}

export default function Checkout() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    paymentMethod: 'cod',
    note: '',
  });
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    const checkAuth = () => {
      const auth = isAuthenticated();
      if (!auth) {
        toast.error('Vui lòng đăng nhập để tiếp tục thanh toán');
        router.push('/login?redirect=checkout');
        return false;
      }
      return true;
    };

    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (!checkAuth()) return;

        // Fetch cart items
        const cartData = await getCart();
        if (!cartData.items || cartData.items.length === 0) {
          toast.error('Giỏ hàng của bạn đang trống');
          router.push('/cart');
          return;
        }
        const itemsWithFullImagePaths = (cartData.items || []).map((item: CartItem) => ({
          ...item,
          image: getFullImageUrl(item.image),
          price: item.price,
          originalPrice: item.originalPrice || item.price
        }));
        setCartItems(itemsWithFullImagePaths);

        // Fetch user info
        const userData = await getCurrentUser();
        setUserInfo(userData);

        // Pre-fill form with user data
        setFormData(prev => ({
          ...prev,
          fullName: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
        }));

        // Calculate and set total using flash sale prices
        const calculatedTotal = itemsWithFullImagePaths.reduce(
          (sum: number, item: CartItem) => sum + item.price * item.quantity,
          0
        );
        setSubtotal(calculatedTotal);
      } catch (err) {
        console.error('Error fetching checkout data:', err);
        setError('Không thể tải thông tin thanh toán. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const getFullImagePath = (imagePath: string): string => {
    if (!imagePath) return '/placeholder-image.jpg';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    if (imagePath.startsWith('/')) {
      return `${baseUrl}${imagePath}`;
    } else {
      return `${baseUrl}/${imagePath}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Validate form
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      setIsProcessing(false);
      return;
    }

    try {
      // Calculate order total
      const shipping = 0; // Free shipping
      const total = subtotal + shipping;

      // Prepare order data
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item.product,
          name: item.name,
          image: item.image,
          price: item.price,
          qty: item.quantity,
        })),
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          ward: formData.ward,
          phone: formData.phone,
          email: formData.email,
        },
        paymentMethod: formData.paymentMethod,
        itemsPrice: subtotal,
        shippingPrice: shipping,
        taxPrice: 0,
        totalPrice: total,
        note: formData.note,
      };

      // Call the API to place the order
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      
      // Get the token from userInfo stored in localStorage
      const userInfo = localStorage.getItem('userInfo') 
        ? JSON.parse(localStorage.getItem('userInfo')!)
        : null;
      
      const token = userInfo?.token;
      
      if (!token) {
        throw new Error('Bạn chưa đăng nhập, vui lòng đăng nhập để tiếp tục.');
      }
      
      const response = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể đặt hàng');
      }

      const createdOrder = await response.json();
      
      // Xóa giỏ hàng sau khi đặt hàng thành công
      try {
        await clearCart(); // Gọi API xóa giỏ hàng
        console.log('Giỏ hàng đã được xóa thành công');
      } catch (clearCartError) {
        console.error('Lỗi khi xóa giỏ hàng:', clearCartError);
        // Chỉ ghi log lỗi mà không hiển thị cho người dùng
        // vì đơn hàng đã được tạo thành công
      }
      
      // Redirect to order success page with real order ID
      router.push(`/order-success?id=${createdOrder._id}`);
      toast.success('Đặt hàng thành công!');
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="mt-2 text-gray-700">Hoàn tất đơn hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main content - form */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-8" id="checkout-form">
              {/* Shipping information */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <FiTruck className="h-5 w-5 mr-2 text-yellow-500" />
                  Thông tin giao hàng
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên người nhận <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-gray-600" />
                      </div>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="block w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 dark-placeholder"
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="h-5 w-5 text-gray-600" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="block w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 dark-placeholder"
                        placeholder="0912 345 678"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-600" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 dark-placeholder"
                        placeholder="example@gmail.com"
                      />
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiHome className="h-5 w-5 text-gray-600" />
                      </div>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="block w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 dark-placeholder"
                        placeholder="123 Đường ABC, Phường XYZ"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="block w-full py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 dark-placeholder"
                      required
                    >
                      <option value="" className="text-gray-700">Chọn Tỉnh/Thành phố</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Hải Phòng">Hải Phòng</option>
                      <option value="Cần Thơ">Cần Thơ</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="block w-full py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 dark-placeholder"
                      required
                    >
                      <option value="" className="text-gray-700">Chọn Quận/Huyện</option>
                      <option value="Quận 1">Quận 1</option>
                      <option value="Quận 2">Quận 2</option>
                      <option value="Quận 3">Quận 3</option>
                      <option value="Quận Bình Thạnh">Quận Bình Thạnh</option>
                      <option value="Quận Tân Bình">Quận Tân Bình</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="ward"
                      name="ward"
                      value={formData.ward}
                      onChange={handleInputChange}
                      className="block w-full py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 dark-placeholder"
                      required
                    >
                      <option value="" className="text-gray-700">Chọn Phường/Xã</option>
                      <option value="Phường Bến Nghé">Phường Bến Nghé</option>
                      <option value="Phường Bến Thành">Phường Bến Thành</option>
                      <option value="Phường Cầu Kho">Phường Cầu Kho</option>
                      <option value="Phường Đa Kao">Phường Đa Kao</option>
                      <option value="Phường Nguyễn Thái Bình">Phường Nguyễn Thái Bình</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2">
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      id="note"
                      name="note"
                      rows={3}
                      value={formData.note}
                      onChange={handleInputChange}
                      className="block w-full py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 dark-placeholder"
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay địa điểm giao hàng chi tiết hơn."
                    />
                  </div>
                </div>
              </div>

              {/* Payment methods */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <FiCreditCard className="h-5 w-5 mr-2 text-yellow-500" />
                  Phương thức thanh toán
                </h2>
                
                <div className="space-y-4">
                  <div className="relative border border-gray-200 rounded-lg p-4 cursor-pointer transition-colors hover:bg-yellow-50">
                    <input
                      type="radio"
                      id="payment-cod"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="absolute h-5 w-5 left-4 top-1/2 transform -translate-y-1/2"
                    />
                    <div className="pl-8">
                      <label htmlFor="payment-cod" className="font-medium text-gray-900 cursor-pointer">
                        Thanh toán khi nhận hàng (COD)
                      </label>
                      <p className="text-sm text-gray-700 mt-1">
                        Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative border border-gray-200 rounded-lg p-4 cursor-pointer transition-colors hover:bg-yellow-50">
                    <input
                      type="radio"
                      id="payment-bank"
                      name="paymentMethod"
                      value="bank-transfer"
                      checked={formData.paymentMethod === 'bank-transfer'}
                      onChange={handleInputChange}
                      className="absolute h-5 w-5 left-4 top-1/2 transform -translate-y-1/2"
                    />
                    <div className="pl-8">
                      <label htmlFor="payment-bank" className="font-medium text-gray-900 cursor-pointer">
                        Chuyển khoản ngân hàng
                      </label>
                      <p className="text-sm text-gray-700 mt-1">
                        Thực hiện thanh toán vào tài khoản ngân hàng của chúng tôi. Vui lòng sử dụng ID đơn hàng làm mã tham chiếu thanh toán.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative border border-gray-200 rounded-lg p-4 cursor-pointer transition-colors hover:bg-yellow-50">
                    <input
                      type="radio"
                      id="payment-credit"
                      name="paymentMethod"
                      value="credit-card"
                      checked={formData.paymentMethod === 'credit-card'}
                      onChange={handleInputChange}
                      className="absolute h-5 w-5 left-4 top-1/2 transform -translate-y-1/2"
                    />
                    <div className="pl-8">
                      <label htmlFor="payment-credit" className="font-medium text-gray-900 cursor-pointer">
                        Thẻ tín dụng / Thẻ ghi nợ
                      </label>
                      <p className="text-sm text-gray-700 mt-1">
                        Thanh toán an toàn với thẻ của bạn
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:hidden">
                <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Tổng đơn hàng
                  </h2>
                  
                  <div className="flex justify-between text-gray-700">
                    <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-700">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-500">Miễn phí</span>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Tổng cộng</span>
                      <span className="text-xl font-bold text-yellow-500">{formatPrice(total)}</span>
                    </div>
                    <p className="text-xs text-gray-700 mt-1">(Đã bao gồm VAT)</p>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-6 bg-yellow-500 text-white py-4 px-6 rounded-xl hover:bg-yellow-600 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Đang xử lý...' : 'Đặt hàng'}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar - order summary */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Đơn hàng của bạn
              </h2>
              
              <div className="max-h-[400px] overflow-y-auto pr-2 mb-6">
                <ul className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <li key={item.id} className="py-4 flex items-center space-x-4">
                      <div className="flex-shrink-0 relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                        <Image
                          src={getFullImagePath(item.image)}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                          {item.quantity}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-700">
                          {formatPrice(item.price)} x {item.quantity}
                        </p>
                      </div>
                      
                      <div className="text-sm font-bold text-yellow-500">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-gray-700">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-500">Miễn phí</span>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Tổng cộng</span>
                    <span className="text-xl font-bold text-yellow-500">{formatPrice(total)}</span>
                  </div>
                  <p className="text-xs text-gray-700 mt-1">(Đã bao gồm VAT)</p>
                </div>
              </div>
              
              <button
                type="submit"
                form="checkout-form"
                disabled={isProcessing}
                className="w-full mt-6 bg-yellow-500 text-white py-4 px-6 rounded-xl hover:bg-yellow-600 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 