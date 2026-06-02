import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export const useAuth = () => {
  const { state, dispatch } = useContext(AuthContext);

  const isLoggedIn = !!state.userInfo;

  const openAuthModal = () => {
    toast.error('Vui lòng đăng nhập để thực hiện chức năng này');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  };

  const logout = () => {
    dispatch({ type: 'USER_LOGOUT' });
    localStorage.removeItem('userInfo');
    toast.success('Đã đăng xuất');
    window.location.href = '/login';
  };

  return {
    user: state.userInfo,
    isLoggedIn,
    openAuthModal,
    logout,
    loading: state.loading
  };
}; 