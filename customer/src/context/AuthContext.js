import React, { useReducer, useEffect } from 'react';
import { authReducer, initialState } from '../reducers/authReducer';
import { toast } from 'react-hot-toast';

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Kiểm tra token khi component mount
  useEffect(() => {
    const checkUserAuth = () => {
      // Kiểm tra xem có userInfo trong localStorage không
      const userInfoFromStorage = localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null;

      // Kiểm tra nếu có thông báo cảnh báo xác thực
      const authWarning = sessionStorage.getItem('auth_warning');
      const authWarningMessage = sessionStorage.getItem('auth_warning_message');
      
      if (authWarning === 'true') {
        // Hiển thị thông báo
        toast.error(authWarningMessage || 'Phiên đăng nhập có thể đã hết hạn. Vui lòng đăng nhập lại.');
        // Xóa cảnh báo
        sessionStorage.removeItem('auth_warning');
        sessionStorage.removeItem('auth_warning_message');
      }

      if (userInfoFromStorage) {
        console.log('User info found in storage:', {
          id: userInfoFromStorage._id,
          name: userInfoFromStorage.name,
          hasToken: !!userInfoFromStorage.token,
          tokenLength: userInfoFromStorage.token ? userInfoFromStorage.token.length : 0
        });
        
        // Kiểm tra nếu token đã hết hạn từ session storage
        const tokenExpired = sessionStorage.getItem('token_expired') === 'true';
        
        if (tokenExpired) {
          console.warn('Token expired flag found, logging out user');
          // Xóa flag
          sessionStorage.removeItem('token_expired');
          // Dispatch logout action
          dispatch({ type: 'USER_LOGOUT' });
          // Xóa userInfo từ localStorage
          localStorage.removeItem('userInfo');
          // Hiển thị thông báo
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          // Chuyển hướng đến trang đăng nhập sau 1 giây
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
          return;
        }
        
        // Kiểm tra token
        if (userInfoFromStorage.token) {
          dispatch({
            type: 'USER_LOGIN_SUCCESS',
            payload: userInfoFromStorage,
          });
        } else {
          console.warn('User info exists but token is missing');
          // Không tự động logout nhưng đánh dấu là cần xác thực lại
          sessionStorage.setItem('auth_warning', 'true');
        }
      }
    };
    
    checkUserAuth();
    
    // Kiểm tra token định kỳ (mỗi 3 phút)
    const tokenCheckInterval = setInterval(checkUserAuth, 3 * 60 * 1000);
    
    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, []);

  // Đảm bảo token được lưu trong sessionStorage để sử dụng trong API calls
  useEffect(() => {
    if (state.userInfo) {
      // Cập nhật sessionStorage để user.service.js có thể truy cập
      sessionStorage.setItem('user', JSON.stringify({
        id: state.userInfo._id,
        name: state.userInfo.name,
        avatar: state.userInfo.avatar
      }));
      
      // Đảm bảo token luôn được lưu trong localStorage
      const currentStorage = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (!currentStorage.token && state.userInfo.token) {
        localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        console.log('Updated token in localStorage');
      }
    }
  }, [state.userInfo]);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}; 