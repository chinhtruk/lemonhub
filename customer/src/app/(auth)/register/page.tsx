'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaFacebook } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/navigation';
import { register } from '@/services/auth.service';
import { toast } from 'react-hot-toast';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Kiểm tra mật khẩu khớp nhau
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    
    // Kiểm tra đồng ý điều khoản
    if (!formData.terms) {
      setError('Vui lòng đồng ý với điều khoản sử dụng');
      toast.error('Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(formData.name, formData.email, formData.password);
      toast.success('Đăng ký thành công!');
      router.push('/');
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      toast.error(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 py-16">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo and title */}
        <div className="text-center mb-10">
          <Link 
            href="/" 
            className="inline-block transform hover:scale-105 transition-transform duration-200"
          >
            <h1 className="text-4xl font-bold">
              <span className="text-yellow-500">LemonHub</span> 
            </h1>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Đăng ký tài khoản
          </h2>
          <p className="mt-3 text-gray-600">
            Đã có tài khoản?{' '}
            <Link 
              href="/login" 
              className="text-yellow-500 hover:text-yellow-600 font-medium transition-colors duration-200"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        {/* Register form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Họ tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-shadow duration-200 placeholder-gray-700"
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-shadow duration-200 placeholder-gray-700"
                  placeholder="example@gmail.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Số điện thoại
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-shadow duration-200 placeholder-gray-700"
                  placeholder="0123456789"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-shadow duration-200 placeholder-gray-700"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-600 hover:text-gray-800" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-600 hover:text-gray-800" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">Mật khẩu phải có ít nhất 6 ký tự</p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-shadow duration-200 placeholder-gray-700"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-600 hover:text-gray-800" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-600 hover:text-gray-800" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                checked={formData.terms}
                onChange={(e) =>
                  setFormData({ ...formData, terms: e.target.checked })
                }
                className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300 rounded transition-colors duration-200"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-700"
              >
                Tôi đồng ý với{' '}
                <Link
                  href="/terms"
                  className="text-yellow-500 hover:text-yellow-600 font-medium transition-colors duration-200"
                >
                  Điều khoản sử dụng
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-700 text-base">
                  Hoặc đăng ký với
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2] transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <FaFacebook className="w-5 h-5 text-[#1877F2] mr-2" />
                Facebook
              </button>
              <button
                type="button"
                className="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <FcGoogle className="w-5 h-5 mr-2" />
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}