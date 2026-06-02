'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaFacebook } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/navigation';
import { login } from '@/services/auth.service';
import { toast } from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
      toast.success('Đăng nhập thành công!');
      router.push('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      toast.error(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
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
            Đăng nhập tài khoản
          </h2>
          <p className="mt-3 text-gray-600">
            Chưa có tài khoản?{' '}
            <Link 
              href="/register" 
              className="text-yellow-500 hover:text-yellow-600 font-medium transition-colors duration-200"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-shadow duration-200 placeholder-gray-600"
                  placeholder="example@gmail.com"
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
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-shadow duration-200 placeholder-gray-600"
                  placeholder="••••••••"
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={formData.remember}
                  onChange={(e) =>
                    setFormData({ ...formData, remember: e.target.checked })
                  }
                  className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300 rounded transition-colors duration-200"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-yellow-500 hover:text-yellow-600 font-medium transition-colors duration-200"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-600 text-base">
                  Hoặc đăng nhập với
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