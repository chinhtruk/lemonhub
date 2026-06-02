'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiPackage, FiClock, FiTruck, FiCheckCircle, FiXCircle, FiUser, FiMapPin, FiPhone, FiMail, FiHome } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { isAuthenticated } from '@/services/auth.service';
import { getOrderById, transformOrder } from '@/services/order.service';

// Import custom styles
import './order-details.css';

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
    email?: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  note?: string;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        toast.error('Vui lòng đăng nhập để xem chi tiết đơn hàng');
        router.push('/login?redirect=my-orders');
        return false;
      }
      return true;
    };

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const isLoggedIn = await checkAuth();
        if (!isLoggedIn) return;

        const orderData = await getOrderById(id as string);
        const transformedOrder = transformOrder(orderData);
        setOrder(transformedOrder);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id, router]);

  const formatPrice = (price?: number) => {
    if (price === undefined) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status?: Order['status']) => {
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

  const getStatusText = (status?: Order['status']) => {
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

  const getStatusClass = (status?: Order['status']) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="text-red-500 text-center mb-6">
          <p className="text-xl font-semibold">{error || 'Không tìm thấy thông tin đơn hàng'}</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Thử lại
          </button>
          <Link
            href="/my-orders"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition-colors flex items-center"
          >
            <FiArrowLeft className="mr-2" /> Quay lại đơn hàng của tôi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/my-orders"
            className="inline-flex items-center text-yellow-500 hover:text-yellow-600 transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Quay lại đơn hàng của tôi
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Chi tiết đơn hàng</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Thông tin đơn hàng */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thông tin cơ bản */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <div className="flex items-center mb-2">
                    <h2 className="text-xl font-semibold text-gray-900 mr-3">
                      #{order.trackingCode}
                    </h2>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full ${getStatusClass(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Ngày đặt hàng: {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center">
                  {getStatusIcon(order.status)}
                  <span className="ml-2 font-medium">{getStatusText(order.status)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Trạng thái đơn hàng</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiPackage className="text-black mr-2" />
                      <span className="font-semibold text-black">Đơn hàng</span>
                    </div>
                    <p className="text-sm text-gray-800 font-medium">
                      {order.status === 'cancelled' ? 'Đã hủy' : 'Đã xác nhận'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiClock className="text-black mr-2" />
                      <span className="font-semibold text-black">Thanh toán</span>
                    </div>
                    <p className="text-sm text-gray-800 font-medium">
                      {order.isPaid ? `Đã thanh toán (${formatDate(order.paidAt)})` : 'Chưa thanh toán'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiTruck className="text-black mr-2" />
                      <span className="font-semibold text-black">Vận chuyển</span>
                    </div>
                    <p className="text-sm text-gray-800 font-medium">
                      {order.isDelivered 
                        ? `Đã giao hàng (${formatDate(order.deliveredAt)})` 
                        : order.status === 'shipped' 
                          ? 'Đang vận chuyển' 
                          : 'Chưa giao hàng'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiUser className="text-black mr-2" />
                      <span className="font-semibold text-black">Phương thức thanh toán</span>
                    </div>
                    <p className="text-sm text-gray-800 font-medium">
                      {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin sản phẩm */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sản phẩm đã đặt</h3>
              <div className="divide-y divide-gray-200">
                {order.orderItems.map((item) => (
                  <div key={item._id} className="py-4 flex items-center">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">{item.name}</h4>
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-700">
                          {formatPrice(item.price)} x {item.qty}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(item.price * item.qty)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ghi chú đơn hàng */}
            {order.note && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ghi chú</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{order.note}</p>
              </div>
            )}
          </div>

          {/* Thông tin bên phải */}
          <div className="space-y-6">
            {/* Thông tin giao hàng */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin giao hàng</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <FiUser className="mt-1 text-gray-700 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-800">Người nhận</p>
                    <p className="text-gray-800 font-medium">{order.shippingAddress.fullName}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiPhone className="mt-1 text-gray-700 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-800">Số điện thoại</p>
                    <p className="text-gray-800 font-medium">{order.shippingAddress.phone}</p>
                  </div>
                </div>
                {order.shippingAddress.email && (
                  <div className="flex items-start">
                    <FiMail className="mt-1 text-gray-700 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-800">Email</p>
                      <p className="text-gray-800 font-medium">{order.shippingAddress.email}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start">
                  <FiMapPin className="mt-1 text-gray-700 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-800">Địa chỉ</p>
                    <p className="text-gray-800">
                      {order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tóm tắt đơn hàng */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tóm tắt đơn hàng</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-gray-800">Tổng tiền sản phẩm</p>
                  <p className="font-medium">{formatPrice(order.itemsPrice)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-800">Phí vận chuyển</p>
                  <p className="font-medium">{formatPrice(order.shippingPrice)}</p>
                </div>
                {order.taxPrice > 0 && (
                  <div className="flex justify-between">
                    <p className="text-gray-800">Thuế</p>
                    <p className="font-medium">{formatPrice(order.taxPrice)}</p>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-900">Tổng cộng</p>
                    <p className="font-medium text-red-600">{formatPrice(order.totalPrice)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nút tác động */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <Link
                href={`/track-order?code=${order.trackingCode}`}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <FiPackage className="mr-2" /> Theo dõi đơn hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 