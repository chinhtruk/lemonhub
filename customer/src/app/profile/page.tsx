'use client';

import { useState, useEffect } from 'react';
import { FiUser, FiEdit2, FiSave, FiX, FiLock, FiLogOut, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { 
  getCurrentUser, 
  updateUserProfile,
  uploadAvatar
} from '@/services/user.service';
import { changePassword } from '@/services/auth.service';
import UserAvatar from '@/components/UserAvatar';

interface User {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  address: string;
  wishlist: Product[];
  birthday: string;
  gender: 'male' | 'female';
  orders?: any[]; // Add orders property to fix the type error
}

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  } catch (e) {
    console.error('Invalid date format:', dateString);
    return 'N/A';
  }
};

export default function ProfilePage() {
  const [user, setUser] = useState<User>({
    name: '',
    email: '',
    phone: '',
    avatar: '/images/avatar-placeholder.svg',
    address: '',
    wishlist: [],
    birthday: '',
    gender: 'male',
    orders: [], // Initialize orders array
  });

  const [editedUser, setEditedUser] = useState<User>({
    name: '',
    email: '',
    phone: '',
    avatar: '/images/avatar-placeholder.svg',
    address: '',
    wishlist: [],
    birthday: '',
    gender: 'male',
    orders: [], // Initialize orders array
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Track login state
  
  // Thêm state cho phần đổi mật khẩu
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  // Tải thông tin người dùng khi component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Kiểm tra nếu localStorage có userInfo
        const userInfoStr = localStorage.getItem('userInfo');
        if (!userInfoStr) {
          console.warn('No userInfo found in localStorage');
          setIsLoggedIn(false);
          setError('Vui lòng đăng nhập để xem thông tin cá nhân');
          setLoading(false);
          return;
        }
        
        // Giải mã token và kiểm tra tính hợp lệ cơ bản
        try {
          const userInfo = JSON.parse(userInfoStr);
          if (!userInfo || !userInfo.token) {
            console.warn('Invalid userInfo or missing token');
            setIsLoggedIn(false);
            setError('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing userInfo:', e);
          setIsLoggedIn(false);
          setError('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }
        
        // Gọi API để lấy thông tin user
        const userData = await getCurrentUser();
        
        if (!userData || !userData.email) {
          console.error('Invalid user data or user not logged in:', userData);
          setIsLoggedIn(false);
          setError('Vui lòng đăng nhập để xem thông tin cá nhân');
          return;
        }
        
        console.log('User data loaded successfully:', userData);
        
        // Đảm bảo tất cả các mảng tồn tại
        const safeUserData = {
          ...userData,
          orders: userData.orders || [],
          wishlist: userData.wishlist || []
        };
        
        setUser(safeUserData);
        setEditedUser(safeUserData);
        setIsLoggedIn(true);
      } catch (err: unknown) {
        console.error('Error fetching user data:', err);
        
        // Kiểm tra lỗi chi tiết hơn
        let errorMessage = 'Không thể tải thông tin người dùng. Vui lòng thử lại sau.';
        let isAuthError = false;
        
        // Kiểm tra lỗi 401 Unauthorized
        if (err && typeof err === 'object') {
          // Kiểm tra lỗi từ Axios
          if ('response' in err && 
              err.response && typeof err.response === 'object' && 
              'status' in err.response && err.response.status === 401) {
            errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
            isAuthError = true;
          }
          // Kiểm tra lỗi từ error.details (định dạng lỗi riêng)
          else if ('details' in err && 
                  err.details && typeof err.details === 'object' && 
                  'status' in err.details && err.details.status === 401) {
            errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
            isAuthError = true;
          }
          // Kiểm tra thông điệp lỗi
          else if ('message' in err && typeof err.message === 'string' && 
                  (err.message.includes('phiên') || 
                   err.message.includes('đăng nhập') || 
                   err.message.includes('xác thực') ||
                   err.message.toLowerCase().includes('auth'))) {
            errorMessage = err.message;
            isAuthError = true;
          }
        }
        
        // Đặt trạng thái lỗi và hiển thị cho người dùng
        setError(errorMessage);
        setIsLoggedIn(!isAuthError); // Chỉ đặt isLoggedIn = false nếu lỗi xác thực
        
        // Hiển thị thông báo lỗi bằng toast
        toast.error(errorMessage);
        
        // Không tự động xóa userInfo, để người dùng có cơ hội thử lại hoặc đăng nhập lại bằng nút
      } finally {
        setLoading(false);
      }
    };

    // Kiểm tra session storage cho auth_warning
    const checkAuthWarning = () => {
      if (typeof window !== 'undefined') {
        const authWarning = sessionStorage.getItem('auth_warning');
        if (authWarning === 'true') {
          // Xóa cảnh báo
          sessionStorage.removeItem('auth_warning');
          // Hiển thị toast để người dùng biết
          toast.error('Phiên đăng nhập có thể đã hết hạn. Hãy thử đăng nhập lại nếu gặp vấn đề.');
        }
      }
    };

    fetchUserData();
    checkAuthWarning();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      // Make a deep copy of the editedUser to ensure we're not mutating the original state
      const userToUpdate = { ...editedUser };
      
      // Call the API to update the user profile
      const updatedUser = await updateUserProfile(userToUpdate);
      
      // Update the local state with the response from the server
      setUser(prevUser => ({
        ...prevUser,
        ...updatedUser
      }));
      
      setIsEditing(false);
      toast.success('Cập nhật thông tin thành công');
    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      toast.error('Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  // Xử lý đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Mật khẩu mới không khớp với xác nhận mật khẩu');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Đổi mật khẩu thành công');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
    } catch (err: any) {
      console.error('Change password error:', err);
      setPasswordError(err.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
    }
  };

  // Set user avatar
  const handleAvatarUpload = async (file: File) => {
    if (!file) return;
    
    // Check file type
    const fileType = file.type;
    if (!fileType.includes('image')) {
      toast.error('Chỉ chấp nhận tệp hình ảnh');
      return;
    }
    
    // Check file size (max 2MB)
    const fileSize = file.size / 1024 / 1024; // in MB
    if (fileSize > 2) {
      toast.error('Kích thước tệp không được vượt quá 2MB');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Upload avatar
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Không thể tải lên ảnh đại diện');
      }
      
      const data = await response.json();
      
      // Update user state
      setUser((prev) => ({
        ...prev,
        avatar: data.avatar
      }));
      
      // Update local storage
      try {
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          if (userInfo && typeof userInfo === 'object') {
            userInfo.avatar = data.avatar;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
          }
        }
      } catch (error: unknown) {
        console.error('Lỗi khi cập nhật avatar trong localStorage:', error);
      }
      
      toast.success('Đã cập nhật ảnh đại diện');
    } catch (error: unknown) {
      console.error('Lỗi khi tải lên avatar:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể tải lên ảnh đại diện');
    } finally {
      setLoading(false);
    }
  };

  // safeUser object to prevent UI errors when properties might be undefined
  const safeUser = {
    ...user,
    wishlist: Array.isArray(user.wishlist) ? user.wishlist : [],
    orders: Array.isArray(user.orders) ? user.orders : [],
  };

  // Render UI dựa trên trạng thái
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị trạng thái lỗi khi chưa đăng nhập
  if (!isLoggedIn || error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm">
            <div className="text-center mb-6">
              <FiUser className="text-yellow-500 mx-auto w-16 h-16" />
              <h1 className="text-2xl font-bold mt-4 text-gray-900">
                Thông tin cá nhân
              </h1>
              <p className="mt-2 text-red-500">{error}</p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full bg-yellow-500 text-white py-3 rounded-xl font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center"
              >
                <FiLogOut className="mr-2" /> Đăng nhập
              </button>
              
              <button
                onClick={() => {
                  // Cố gắng tải lại dữ liệu mà không chuyển hướng đến trang đăng nhập
                  window.location.reload();
                }}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <FiRefreshCw className="mr-2" /> Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 p-4 rounded-lg text-red-600 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Tài khoản của tôi</h1>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar */}
              <div className="lg:w-80 flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                  {/* Avatar section - ở trên cùng và ở giữa */}
                  <div className="text-center flex flex-col items-center justify-center w-full">
                    <div className="relative mx-auto mb-4 flex justify-center items-center w-full">
                      <UserAvatar
                        name={safeUser.name || ''}
                        avatar={safeUser.avatar}
                        size={120}
                        onChangeAvatar={handleAvatarUpload}
                        className="mx-auto"
                      />
                    </div>
                    <h2 className="text-xl font-medium text-gray-900 text-center">{safeUser.name || 'Tài khoản'}</h2>
                    <p className="text-sm text-gray-600 mt-1 text-center">{safeUser.email || ''}</p>
                  </div>

                  {/* Phần đổi mật khẩu */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-medium text-gray-900 flex items-center">
                        <FiLock className="w-5 h-5 mr-2" />
                        Mật khẩu
                      </h3>
                      {!isChangingPassword ? (
                        <button
                          onClick={() => setIsChangingPassword(true)}
                          className="text-sm text-yellow-500 hover:text-yellow-600 font-medium transition-colors"
                        >
                          Đổi mật khẩu
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setIsChangingPassword(false);
                            setPasswordError('');
                            setPasswordData({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            });
                          }}
                          className="text-sm text-gray-500 hover:text-gray-600 font-medium transition-colors"
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                    
                    {isChangingPassword && (
                      <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
                        {passwordError && (
                          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                            {passwordError}
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu hiện tại
                          </label>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu mới
                          </label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                            minLength={6}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Xác nhận mật khẩu mới
                          </label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                            minLength={6}
                            required
                          />
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                          >
                            Cập nhật mật khẩu
                          </button>
                        </div>
                      </form>
                    )}
                    
                    {!isChangingPassword && (
                      <p className="text-gray-600 text-sm">
                        Để đảm bảo an toàn tài khoản, hãy đổi mật khẩu định kỳ.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1">
                <div className="bg-white rounded-2xl shadow-sm">
                  {/* Profile tab */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Thông tin cá nhân
                      </h2>
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center text-yellow-500 hover:text-yellow-600 transition-colors"
                        >
                          <FiEdit2 className="w-5 h-5 mr-2" />
                          Chỉnh sửa
                        </button>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 transition-colors"
                          >
                            <FiX className="w-5 h-5" />
                            Hủy
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            className="flex items-center space-x-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                          >
                            <FiSave className="w-5 h-5" />
                            Lưu
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Họ và tên
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedUser.name || ''}
                            onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                          />
                        ) : (
                          <p className="text-gray-900">{safeUser.name || ''}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={editedUser.email || ''}
                            onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                          />
                        ) : (
                          <p className="text-gray-900">{safeUser.email || ''}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số điện thoại
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editedUser.phone || ''}
                            onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                          />
                        ) : (
                          <p className="text-gray-900">{safeUser.phone || ''}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày sinh
                        </label>
                        {isEditing ? (
                          <input
                            type="date"
                            value={editedUser.birthday || ''}
                            onChange={(e) => setEditedUser({ ...editedUser, birthday: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                          />
                        ) : (
                          <p className="text-gray-900">{safeUser.birthday ? formatDate(safeUser.birthday) : ''}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giới tính
                        </label>
                        {isEditing ? (
                          <div className="flex space-x-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="gender"
                                value="male"
                                checked={editedUser.gender === 'male'}
                                onChange={(e) => setEditedUser({ ...editedUser, gender: e.target.value as 'male' | 'female' })}
                                className="w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-500"
                              />
                              <span className="ml-2 text-gray-700">Nam</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="gender"
                                value="female"
                                checked={editedUser.gender === 'female'}
                                onChange={(e) => setEditedUser({ ...editedUser, gender: e.target.value as 'male' | 'female' })}
                                className="w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-500"
                              />
                              <span className="ml-2 text-gray-700">Nữ</span>
                            </label>
                          </div>
                        ) : (
                          <p className="text-gray-900">{safeUser.gender === 'male' ? 'Nam' : 'Nữ'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 