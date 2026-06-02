import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';
import UserCreateScreen from './screens/UserCreateScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import ProductCreateScreen from './screens/ProductCreateScreen';
import OrderListScreen from './screens/OrderListScreen';
import OrderScreen from './screens/OrderScreen';
import CategoryListScreen from './screens/CategoryListScreen';
import CategoryEditScreen from './screens/CategoryEditScreen';
import CategoryCreateScreen from './screens/CategoryCreateScreen';
import ProfileScreen from './screens/ProfileScreen';
import NotFoundScreen from './screens/NotFoundScreen';
import BannerListScreen from './screens/BannerListScreen';
import BannerEditScreen from './screens/BannerEditScreen';
import StoreListScreen from './screens/StoreListScreen';
import StoreEditScreen from './screens/StoreEditScreen';
import axios from 'axios';
import './styles/main.css'; // Add this for global styles
import DashboardScreen from './screens/DashboardScreen';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Cấu hình axios
// Lưu ý: Không cần đặt baseURL vì đã cấu hình proxy trong package.json
// axios.defaults.baseURL = 'http://localhost:5001/api';

function App() {
  const [userInfo, setUserInfo] = useState(
    localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null
  );

  // Set auth token for all requests
  useEffect(() => {
    if (userInfo && userInfo.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${userInfo.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [userInfo]);

  // Kiểm tra xác thực
  const isAuthenticated = !!userInfo && userInfo.isAdmin;

  // Component cho layout admin
  const AdminLayout = ({ setUserInfo }) => {
    // Nếu chưa đăng nhập, chuyển hướng đến trang login
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return (
      <>
        <Header userInfo={userInfo} setUserInfo={setUserInfo} />
        <div className="d-flex main-wrapper" style={{ marginTop: "56px" }}>
          <Sidebar />
          <main className="flex-fill p-3 p-md-4">
            <Container fluid className="px-0">
              <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/dashboard" element={<DashboardScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/products" element={<ProductListScreen />} />
                <Route path="/products/new" element={<ProductCreateScreen />} />
                <Route path="/products/:id/edit" element={<ProductEditScreen />} />
                <Route path="/orders" element={<OrderListScreen />} />
                <Route path="/orders/:id" element={<OrderScreen />} />
                <Route path="/users" element={<UserListScreen />} />
                <Route path="/users/new" element={<UserCreateScreen />} />
                <Route path="/users/:id/edit" element={<UserEditScreen />} />
                <Route path="/categories" element={<CategoryListScreen />} />
                <Route path="/categories/new" element={<CategoryCreateScreen />} />
                <Route path="/categories/:id/edit" element={<CategoryEditScreen />} />
                <Route path="/banners" element={<BannerListScreen />} />
                <Route path="/banners/new" element={<BannerEditScreen />} />
                <Route path="/banners/:id/edit" element={<BannerEditScreen />} />
                <Route path="/stores" element={<StoreListScreen />} />
                <Route path="/stores/new" element={<StoreEditScreen />} />
                <Route path="/stores/:id/edit" element={<StoreEditScreen />} />
                <Route path="*" element={<NotFoundScreen />} />
              </Routes>
            </Container>
          </main>
        </div>
      </>
    );
  };

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <Routes>
        <Route path="/login" element={<LoginScreen setUserInfo={setUserInfo} />} />
        <Route path="/*" element={<AdminLayout setUserInfo={setUserInfo} />} />
      </Routes>
    </Router>
  );
}

export default App; 