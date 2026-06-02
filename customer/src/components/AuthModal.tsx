'use client';

import { useState, useEffect } from 'react';
import { FiX, FiUser, FiKey, FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { login, register } from '@/services/auth.service';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'register';
  redirectUrl?: string;
  message?: string;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  mode = 'login', 
  redirectUrl = '/', 
  message = 'Vui lòng đăng nhập để tiếp tục'
}: AuthModalProps) {
  const [currentMode, setCurrentMode] = useState<'login' | 'register'>(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // Close modal when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Logging in with:', email);
      await login(email, password);
      toast.success('Đăng nhập thành công');
      
      // Redirect after successful login
      if (redirectUrl) {
        console.log('Redirecting to:', redirectUrl);
        router.push(redirectUrl);
      }
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    try {
      setLoading(true);
      await register(name, email, password);
      toast.success('Đăng ký thành công');
      
      // Automatically login after registration
      await login(email, password);
      
      // Redirect after successful registration and login
      if (redirectUrl) {
        router.push(redirectUrl);
      }
      onClose();
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-yellow-500">
          <h2 className="text-xl font-bold text-white flex items-center">
            {currentMode === 'login' ? (
              <>
                <FiLogIn className="mr-2" /> Đăng nhập
              </>
            ) : (
              <>
                <FiUser className="mr-2" /> Đăng ký
              </>
            )}
          </h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          {message && (
            <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          
          {currentMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-600" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="example@example.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiKey className="text-gray-600" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="••••••"
                    required
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-70"
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-600" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-600" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="example@example.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-600" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="••••••"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-600" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="••••••"
                    required
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-70"
                >
                  {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-6 text-center text-sm">
            {currentMode === 'login' ? (
              <p>
                Bạn chưa có tài khoản?{' '}
                <button
                  onClick={() => setCurrentMode('register')}
                  className="text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Đăng ký ngay
                </button>
              </p>
            ) : (
              <p>
                Bạn đã có tài khoản?{' '}
                <button
                  onClick={() => setCurrentMode('login')}
                  className="text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Đăng nhập
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 