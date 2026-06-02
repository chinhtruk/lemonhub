'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiShoppingBag, FiChevronRight, FiXCircle, FiClock, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { isAuthenticated } from '@/services/auth.service';
import { getUserOrders } from '@/services/order.service';
import '../order/[id]/order-details.css';

interface OrderItem {
  _id: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  product: string;
}

interface Order {
  _id: string;
  createdAt: string;
  totalPrice: number;
  trackingCode: string;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  orderItems: OrderItem[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    district: string;
    ward: string;
    phone: string;
  };
}

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        toast.error('Vui lòng đăng nhập để xem đơn hàng của bạn');
        router.push('/login?redirect=my-orders');
        return false;
      }
      return true;
    };

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const isLoggedIn = await checkAuth();
        if (!isLoggedIn) return;

        const data = await getUserOrders();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <FiClock className="text-yellow-500" />;
      case 'processing':
        return <FiClock className="text-blue-500" />;
      case 'shipped':
        return <FiTruck className="text-blue-500" />;
      case 'delivered':
        return <FiCheckCircle className="text-green-500" />;
      case 'cancelled':
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đang vận chuyển';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const getStatusClass = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => 
    order.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="text-red-500 text-center mb-6">
          <p className="text-xl font-semibold">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Đơn hàng của tôi</h1>
          <p className="mt-2 text-gray-700">Quản lý và theo dõi các đơn hàng của bạn</p>
        </div>

        {/* Tìm kiếm đơn hàng */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-700" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-150 ease-in-out"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Danh sách đơn hàng */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Bạn chưa có đơn hàng nào</h3>
            <p className="text-gray-700 mb-6">Hãy mua sắm để bắt đầu đặt đơn hàng</p>
            <Link
              href="/product"
              className="inline-block bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden bg-white shadow-md rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Đơn hàng
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Ngày đặt
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            {order.orderItems[0] && (
                              <Image
                                src={getFullImagePath(order.orderItems[0].image)}
                                alt={order.orderItems[0].name}
                                fill
                                className="rounded-full object-cover"
                              />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              #{order.trackingCode}
                            </div>
                            <div className="text-sm text-gray-700">
                              {order.orderItems.length} sản phẩm
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        Ngày đặt: {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="mr-2">
                            {getStatusIcon(order.status)}
                          </div>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/order/${order._id}`}
                          className="text-yellow-600 hover:text-yellow-900 inline-flex items-center"
                        >
                          Chi tiết <FiChevronRight className="ml-1" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 