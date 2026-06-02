'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaCheckCircle, FaHome, FaBox } from 'react-icons/fa';

interface Order {
  _id: string;
  trackingCode: string;
  createdAt: string;
  totalPrice: number;
  paymentMethod: string;
  isPaid: boolean;
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('Không tìm thấy mã đơn hàng');
        setLoading(false);
        return;
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        
        // Get the token from userInfo stored in localStorage
        const userInfo = localStorage.getItem('userInfo') 
          ? JSON.parse(localStorage.getItem('userInfo')!)
          : null;
        
        const token = userInfo?.token;
        
        if (!token) {
          throw new Error('Vui lòng đăng nhập để xem thông tin đơn hàng');
        }
        
        const response = await fetch(`${baseUrl}/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Không thể tải thông tin đơn hàng');
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Đã xảy ra lỗi khi tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <p className="text-lg">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
          <div className="text-center text-red-500 mb-6">
            <p className="text-xl font-medium">{error || 'Không tìm thấy thông tin đơn hàng'}</p>
          </div>
          <div className="flex justify-center mt-8">
            <Link 
              href="/" 
              className="bg-primary text-white px-6 py-2 rounded-md flex items-center"
            >
              <FaHome className="mr-2" /> Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <div className="text-center text-green-500 mb-6">
          <FaCheckCircle className="text-5xl mx-auto mb-2" />
          <h1 className="text-2xl font-semibold">Đặt hàng thành công!</h1>
        </div>
        
        <div className="border-t border-b border-gray-200 py-4 my-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-700">Mã đơn hàng:</p>
              <p className="font-bold text-black">{order._id}</p>
            </div>
            <div>
              <p className="text-gray-700">Mã theo dõi:</p>
              <p className="font-bold text-black">{order.trackingCode}</p>
            </div>
            <div>
              <p className="text-gray-700">Ngày đặt hàng:</p>
              <p className="font-bold text-black">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
            <div>
              <p className="text-gray-700">Tổng tiền:</p>
              <p className="font-bold text-black">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}</p>
            </div>
            <div>
              <p className="text-gray-700">Phương thức thanh toán:</p>
              <p className="font-bold text-black">{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
          <p className="text-center text-green-700">
            Đơn hàng của bạn đã được xác nhận và đang được xử lý. Giỏ hàng của bạn đã được xóa.
          </p>
        </div>
        
        <p className="text-center text-gray-900 mb-6 font-medium">
          Cảm ơn bạn đã đặt hàng! Chúng tôi sẽ xác nhận đơn hàng của bạn qua email trong thời gian sớm nhất.
        </p>
        
        <div className="flex justify-between flex-wrap">
          <Link 
            href="/" 
            className="bg-primary text-white px-6 py-2 rounded-md flex items-center mb-2 sm:mb-0"
          >
            <FaHome className="mr-2" /> Tiếp tục mua sắm
          </Link>
          <Link 
            href="/my-orders" 
            className="bg-gray-800 text-white px-6 py-2 rounded-md flex items-center"
          >
            <FaBox className="mr-2" /> Xem đơn hàng của tôi
          </Link>
        </div>

        <h2 className="text-xl font-bold text-black mb-4">Chi tiết đơn hàng</h2>
        <div className="border rounded-lg p-4 mb-6">
          <div className="flex justify-between mb-2 text-gray-800">
            <span>Mã đơn hàng:</span>
            <span className="font-bold text-black">{order._id}</span>
          </div>
          <div className="flex justify-between mb-2 text-gray-800">
            <span>Ngày đặt hàng:</span>
            <span className="font-bold text-black">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex justify-between mb-2 text-gray-800">
            <span>Phương thức thanh toán:</span>
            <span className="font-bold text-black">{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Thanh toán online'}</span>
          </div>
          <div className="flex justify-between mb-2 text-gray-800">
            <span>Trạng thái thanh toán:</span>
            <span className={`font-bold ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
              {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </span>
          </div>
          <div className="flex justify-between text-gray-800">
            <span>Tổng tiền:</span>
            <span className="font-bold text-black">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 