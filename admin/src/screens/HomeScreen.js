import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { 
  FiUsers, 
  FiBox, 
  FiShoppingCart, 
  FiDollarSign, 
  FiArrowRight, 
  FiArrowUp,
  FiArrowDown,
  FiCalendar,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiCreditCard,
  FiBarChart2
} from 'react-icons/fi';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';

const HomeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    userCount: 0,
    productCount: 0,
    orderCount: 0,
    totalSales: 0,
    totalSalesLastMonth: 0,
    newUsersThisMonth: 0,
    totalOrdersThisMonth: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topSpenders, setTopSpenders] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch user count
        let userData, productsData, ordersData;
        
        try {
          const { data } = await axios.get('/api/users');
          userData = data;
          console.log('Đã tải dữ liệu người dùng:', userData.length);
        } catch (err) {
          console.error('Lỗi khi tải dữ liệu người dùng:', err);
          userData = [];
        }
        
        // Fetch product count
        try {
          const { data } = await axios.get('/api/products');
          productsData = data;
          console.log('Đã tải dữ liệu sản phẩm:', productsData.products?.length);
        } catch (err) {
          console.error('Lỗi khi tải dữ liệu sản phẩm:', err);
          productsData = { products: [] };
        }
        
        // Fetch orders
        try {
          const { data } = await axios.get('/api/orders');
          ordersData = data;
          console.log('Đã tải dữ liệu đơn hàng:', ordersData.length);
        } catch (err) {
          console.error('Lỗi khi tải dữ liệu đơn hàng:', err);
          ordersData = [];
        }
        
        // Calculate stats
        const userCount = userData.length || 0;
        const productCount = productsData.products?.length || 0;
        const orderCount = ordersData.length || 0;
        
        // Chỉ tính doanh thu từ các đơn hàng đã thanh toán
        const paidOrders = ordersData.filter(order => order.isPaid) || [];
        const totalSales = paidOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        
        // Tính toán các số liệu khác
        const currentDate = new Date();
        const lastMonthDate = new Date();
        lastMonthDate.setMonth(currentDate.getMonth() - 1);
        
        // Tính đơn hàng và doanh thu tháng trước
        const lastMonthOrders = paidOrders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() === lastMonthDate.getMonth() &&
                 orderDate.getFullYear() === lastMonthDate.getFullYear();
        });
        
        const totalSalesLastMonth = lastMonthOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        
        // Tính người dùng mới trong tháng này
        const thisMonthUsers = userData.filter(user => {
          const userDate = new Date(user.createdAt);
          return userDate.getMonth() === currentDate.getMonth() &&
                 userDate.getFullYear() === currentDate.getFullYear();
        });
        
        const newUsersThisMonth = thisMonthUsers.length;
        
        // Tính đơn hàng mới trong tháng này
        const thisMonthOrders = ordersData.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() === currentDate.getMonth() &&
                 orderDate.getFullYear() === currentDate.getFullYear();
        });
        
        const totalOrdersThisMonth = thisMonthOrders.length;
        
        setStats({
          userCount,
          productCount,
          orderCount,
          totalSales,
          totalSalesLastMonth,
          newUsersThisMonth,
          totalOrdersThisMonth,
        });
        
        // Lấy danh sách đơn hàng gần đây (5 đơn hàng mới nhất)
        const recentOrdersList = [...ordersData]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
          
        setRecentOrders(recentOrdersList);
        
        // Tính người dùng chi tiêu nhiều nhất
        const userSpending = {};
        const userInfoMap = {};
        
        // Tính tổng chi tiêu của mỗi người dùng từ các đơn hàng đã thanh toán
        paidOrders.forEach(order => {
          if (order.user && order.user._id) {
            const userId = order.user._id;
            if (!userSpending[userId]) {
              userSpending[userId] = 0;
              userInfoMap[userId] = {
                _id: userId,
                name: order.user.name || 'Người dùng',
                email: order.user.email || '',
                avatar: order.user.avatar || '',
              };
            }
            userSpending[userId] += order.totalPrice || 0;
          }
        });
        
        // Chuyển thành mảng để sắp xếp
        const topUsers = Object.keys(userSpending).map(userId => ({
          ...userInfoMap[userId],
          totalSpent: userSpending[userId]
        }));
        
        // Sắp xếp theo tổng chi tiêu giảm dần và lấy 5 người dùng chi tiêu nhiều nhất
        topUsers.sort((a, b) => b.totalSpent - a.totalSpent);
        setTopSpenders(topUsers.slice(0, 5));
        
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu thống kê:', error);
        setError('Không thể tải dữ liệu. Vui lòng tải lại trang hoặc kiểm tra kết nối.');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format currency
  const formatCurrency = (value) => {
    // Rút gọn số lớn thành triệu hoặc tỷ nếu số quá lớn
    if (value >= 1000000000) {
      return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        maximumFractionDigits: 1,
        minimumFractionDigits: 1
      })
        .format(value / 1000000000)
        .replace(/\s/g, '')
        .replace('₫', '') + ' tỷ';
    } else if (value >= 1000000) {
      return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        maximumFractionDigits: 1,
        minimumFractionDigits: 1
      })
        .format(value / 1000000)
        .replace(/\s/g, '')
        .replace('₫', '') + ' tr';
    } else {
      return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND'
      })
        .format(value)
        .replace(/\s/g, '');
    }
  };

  // Calculate percentage changes
  const salesGrowth = Math.round(((stats.totalSales - stats.totalSalesLastMonth) / stats.totalSalesLastMonth) * 100) || 0;

  return (
    <div className="dashboard-container">
      {/* Header với ngày hiện tại */}
      <div className="welcome-section bg-white rounded-3 shadow-sm p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div>
            <h3 className="page-title m-0 fw-bold">
              <span className="text-primary">LemonHub</span> - Tổng quan hệ thống
            </h3>
            <p className="text-muted mb-0 mt-1">Xin chào, chào mừng quay trở lại!</p>
          </div>
          <div className="d-flex align-items-center bg-light rounded-pill px-4 py-2">
            <FiCalendar size={16} className="text-primary me-2" />
            <span className="text-muted me-2" style={{ fontSize: '0.9rem' }}>Hôm nay:</span>
            <span className="fw-medium" style={{ fontSize: '0.9rem' }}>{new Date().toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>
        
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          {/* Thẻ thống kê tổng quan */}
          <div className="mb-4">
            <h5 className="section-title d-flex align-items-center mb-3 text-dark">
              <FiBarChart2 className="me-2 text-primary" /> Thống kê tổng quan
            </h5>
            <Row className="gy-4">
              <Col lg={3} md={6}>
                <div className="dashboard-widget">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="dashboard-widget-icon" 
                         style={{ backgroundColor: 'rgba(255, 193, 7, 0.15)', color: '#FFC107' }}>
                      <FiUsers size={20} />
                    </div>
                  </div>
                  <h4 className="dashboard-widget-value mb-1">{stats.userCount}</h4>
                  <p className="text-muted small mb-0">Tổng người dùng</p>
                  <div className="mt-3 pt-2 border-top">
                    <div className="d-flex align-items-center text-success" style={{ fontSize: '0.8rem' }}>
                      <FiTrendingUp size={14} className="me-1" />
                      <span className="fw-medium">{stats.newUsersThisMonth} người dùng mới</span>
                    </div>
                  </div>
                </div>
              </Col>

              <Col lg={3} md={6}>
                <div className="dashboard-widget">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="dashboard-widget-icon" 
                         style={{ backgroundColor: 'rgba(33, 150, 243, 0.15)', color: '#2196F3' }}>
                      <FiBox size={20} />
                    </div>
                  </div>
                  <h4 className="dashboard-widget-value mb-1">{stats.productCount}</h4>
                  <p className="text-muted small mb-0">Tổng sản phẩm</p>
                  <div className="mt-3 pt-2 border-top">
                    <LinkContainer to="/products">
                      <div className="d-flex align-items-center text-primary" 
                           style={{ fontSize: '0.8rem', cursor: 'pointer' }}>
                        <span className="fw-medium me-1">Quản lý sản phẩm</span>
                        <FiArrowRight size={14} />
                      </div>
                    </LinkContainer>
                  </div>
                </div>
              </Col>

              <Col lg={3} md={6}>
                <div className="dashboard-widget">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="dashboard-widget-icon" 
                         style={{ backgroundColor: 'rgba(76, 175, 80, 0.15)', color: '#4CAF50' }}>
                      <FiShoppingCart size={20} />
                    </div>
                  </div>
                  <h4 className="dashboard-widget-value mb-1">{stats.orderCount}</h4>
                  <p className="text-muted small mb-0">Tổng đơn hàng</p>
                  <div className="mt-3 pt-2 border-top">
                    <div className="d-flex align-items-center text-success" style={{ fontSize: '0.8rem' }}>
                      <FiCheckCircle size={14} className="me-1" />
                      <span className="fw-medium">{stats.totalOrdersThisMonth} đơn hàng mới</span>
                    </div>
                  </div>
                </div>
              </Col>

              <Col lg={3} md={6}>
                <div className="dashboard-widget">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="dashboard-widget-icon" 
                         style={{ backgroundColor: 'rgba(244, 67, 54, 0.15)', color: '#F44336' }}>
                      <FiDollarSign size={20} />
                    </div>
                    <div className="d-flex align-items-center">
                      <span className={`badge bg-${salesGrowth >= 0 ? 'success' : 'danger'} bg-opacity-10 text-${salesGrowth >= 0 ? 'success' : 'danger'} d-flex align-items-center px-2 py-1`}
                            style={{ fontSize: '0.7rem', fontWeight: '500' }}>
                        {salesGrowth >= 0 ? <FiArrowUp size={12} className="me-1" /> : <FiArrowDown size={12} className="me-1" />}
                        {Math.abs(salesGrowth)}%
                      </span>
                    </div>
                  </div>
                  <h4 className="dashboard-widget-value mb-1">{formatCurrency(stats.totalSales)}</h4>
                  <p className="text-muted small mb-0">Tổng doanh thu</p>
                  <div className="mt-3 pt-2 border-top">
                    <div className="d-flex align-items-center text-primary" style={{ fontSize: '0.8rem' }}>
                      <FiCreditCard size={14} className="me-1" />
                      <span className="fw-medium">{formatCurrency(stats.totalSales - stats.totalSalesLastMonth)}</span>
                      <span className="text-muted ms-1">tháng này</span>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {/* Đơn hàng và Người dùng */}
          <div className="mb-4">
            <h5 className="section-title d-flex align-items-center mb-3 text-dark">
              <FiShoppingCart className="me-2 text-primary" /> Đơn hàng và Người dùng
            </h5>
            <Row className="gy-4">
              {/* Đơn hàng gần đây */}
              <Col lg={6}>
                <div className="dashboard-widget h-100 rounded-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="card-title fw-semibold m-0">Đơn hàng gần đây</h5>
                    <LinkContainer to="/orders">
                      <button className="btn btn-sm btn-outline-primary rounded-pill">
                        <FiArrowRight className="me-1" /> Xem tất cả
                      </button>
                    </LinkContainer>
                  </div>
                  
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <FiClock size={40} className="mb-3 opacity-50" />
                      <p>Chưa có đơn hàng nào</p>
                    </div>
                  ) : (
                    <div className="recent-orders">
                      {recentOrders.map((order) => (
                        <div key={order._id} className="recent-order-item p-3 mb-2 rounded-3 transition-hover" 
                            style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <span className="fw-medium d-block mb-1">{order.user?.name || 'Người dùng'}</span>
                              <div className="text-muted small">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                            </div>
                            <div className="text-end">
                              <div className="fw-semibold text-primary mb-1">{formatCurrency(order.totalPrice)}</div>
                              <span className={`badge bg-${order.isPaid ? 'success' : 'warning'} bg-opacity-10 text-${order.isPaid ? 'success' : 'warning'}`}>
                                {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Col>

              {/* Người dùng chi tiêu nhiều nhất */}
              <Col lg={6}>
                <div className="dashboard-widget h-100 rounded-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="card-title fw-semibold m-0">Người dùng chi tiêu nhiều nhất</h5>
                    <LinkContainer to="/users">
                      <button className="btn btn-sm btn-outline-primary rounded-pill">
                        <FiArrowRight className="me-1" /> Quản lý người dùng
                      </button>
                    </LinkContainer>
                  </div>
                  
                  {topSpenders.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <FiUsers size={40} className="mb-3 opacity-50" />
                      <p>Chưa có dữ liệu chi tiêu</p>
                    </div>
                  ) : (
                    <div className="top-spenders">
                      {topSpenders.map((user) => {
                        // Phân loại người dùng theo mức chi tiêu
                        let userBadge, badgeColor;
                        let avatarBg = 'primary';
                        
                        if (user.totalSpent > 50000000) {
                          userBadge = "Khách hàng VIP";
                          badgeColor = "danger";
                          avatarBg = "warning";
                        } else if (user.totalSpent >= 30000000) {
                          userBadge = "Member";
                          badgeColor = "success";
                        } else if (user.totalSpent < 10000000) {
                          userBadge = "New";
                          badgeColor = "secondary";
                        }
                        
                        return (
                          <div key={user._id} className="top-spender-item p-3 mb-2 rounded-3 transition-hover" 
                             style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                <div className={`me-3 rounded-circle bg-${avatarBg} text-white d-flex align-items-center justify-content-center`}
                                   style={{ width: '40px', height: '40px', fontSize: '18px' }}>
                                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                  <span className="fw-medium d-block">{user.name}</span>
                                  <div className="text-muted small">{user.email}</div>
                                </div>
                              </div>
                              <div className="text-end">
                                <div className="fw-semibold text-primary mb-1">{formatCurrency(user.totalSpent)}</div>
                                {userBadge && (
                                  <span className={`badge bg-${badgeColor} bg-opacity-10 text-${badgeColor}`}>
                                    {userBadge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        </>
      )}

      <style jsx>{`
        .section-title {
          font-size: 1.25rem;
          padding-bottom: 0.5rem;
          position: relative;
        }
        
        .dashboard-widget {
          background-color: #fff;
          padding: 1.5rem;
          height: 100%;
          transition: all 0.3s;
        }
        
        .dashboard-widget-icon {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .dashboard-widget-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #333;
          word-break: break-word;
          overflow-wrap: break-word;
          max-width: 100%;
        }
        
        .transition-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .welcome-section {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 1)), url('/images/pattern.svg');
          background-size: cover;
          border-left: 4px solid #2196F3;
        }
      `}</style>
    </div>
  );
};

export default HomeScreen;