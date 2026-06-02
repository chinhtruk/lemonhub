import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import {
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiPackage,
  FiTruck,
  FiEye,
  FiBarChart2,
  FiPieChart,
  FiCalendar,
  FiArrowUp,
  FiArrowDown,
  FiClock,
  FiCreditCard,
  FiCheckCircle,
  FiCheck
} from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

// Đăng ký các thành phần Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

const DashboardScreen = () => {
  // State cho dữ liệu thống kê
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    deliveredOrders: 0,
    paidOrders: 0,
    totalProducts: 0,
    totalUsers: 0
  });
  
  // State cho dữ liệu đơn hàng và biểu đồ
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesByMonth, setSalesByMonth] = useState({});
  const [categoryStats, setCategoryStats] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  
  // State loading và error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Thêm state cho biểu đồ sản phẩm bán chạy
  const [topProductsChart, setTopProductsChart] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Hàm fetch dữ liệu dashboard từ API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Bắt đầu tải dữ liệu dashboard...');
      
      // Trong thực tế, sẽ gọi API từ server
      // Giả lập việc lấy dữ liệu
      const { data: orders } = await axios.get('/api/orders');
      console.log('Đã tải được dữ liệu đơn hàng:', orders?.length || 0, 'đơn');
      
      // Giả lập dữ liệu sản phẩm và người dùng
      const { data: productsResponse } = await axios.get('/api/products');
      const products = productsResponse?.products || [];
      console.log('Đã tải được dữ liệu sản phẩm:', products?.length || 0, 'sản phẩm');
      
      const { data: users } = await axios.get('/api/users');
      console.log('Đã tải được dữ liệu người dùng:', users?.length || 0, 'người dùng');
      
      // Tính toán thống kê
      const deliveredOrders = orders.filter(order => order.status === 'delivered');
      
      // Tính tổng doanh thu từ các đơn hàng đã thanh toán
      const paidOrders = orders.filter(order => order.isPaid);
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      console.log('Tổng doanh thu:', totalRevenue, 'từ', paidOrders.length, 'đơn hàng đã thanh toán');
      
      // Tính doanh thu theo tháng
      const monthlyRevenue = generateMonthlySalesData(paidOrders);
      
      // Tính thống kê theo danh mục sản phẩm thay vì phương thức thanh toán
      const categoryStats = calculateCategoryStats(products);
      
      // Lấy các đơn hàng mới nhất
      const latestOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
      
      // Tìm các sản phẩm bán chạy nhất
      const bestSellingProducts = findBestSellingProducts(orders, products);

      // Tạo dữ liệu cho biểu đồ sản phẩm bán chạy nhất
      const topProductsChartData = {
        labels: bestSellingProducts.map(p => p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name),
        datasets: [
          {
            label: 'Số lượng bán ra',
            data: bestSellingProducts.map(p => p.soldCount),
            backgroundColor: 'rgba(76, 175, 80, 0.7)',
            borderColor: 'rgba(76, 175, 80, 1)',
            borderWidth: 1,
          }
        ]
      };

      // Cập nhật state với dữ liệu đã tính toán
      setStats({
        totalRevenue,
        totalOrders: orders.length,
        deliveredOrders: deliveredOrders.length,
        paidOrders: paidOrders.length,
        totalProducts: products.length,
        totalUsers: users.length,
        topSellingProduct: bestSellingProducts.length > 0 ? bestSellingProducts[0] : null
      });
      
      setRecentOrders(latestOrders);
      setSalesByMonth(monthlyRevenue);
      setCategoryStats(categoryStats);
      setTopProducts(bestSellingProducts);
      setTopProductsChart(topProductsChartData);
      
      console.log('Đã tải xong dữ liệu dashboard');
      setLoading(false);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu dashboard:', err);
      setError('Không thể tải dữ liệu thống kê: ' + (err.message || 'Lỗi không xác định'));
      setLoading(false);
    }
  };

  // Tạo dữ liệu doanh thu theo tháng
  const generateMonthlySalesData = (paidOrders) => {
    try {
      if (!Array.isArray(paidOrders)) {
        console.error('Dữ liệu đơn hàng không hợp lệ để tính doanh thu theo tháng');
        return {
          labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
          datasets: [{ 
            label: 'Doanh thu (triệu)', 
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            borderColor: 'rgba(33, 150, 243, 1)',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        };
      }
      
      // Tạo mảng cho 12 tháng
      const monthlyData = Array(12).fill(0);
      
      // Tính tổng doanh thu cho mỗi tháng
      paidOrders.forEach(order => {
        if (order && order.createdAt) {
          try {
            const orderDate = new Date(order.createdAt);
            const month = orderDate.getMonth();
            if (!isNaN(month) && month >= 0 && month < 12) {
              monthlyData[month] += (order.totalPrice || 0);
            }
          } catch (error) {
            console.warn('Lỗi xử lý ngày đơn hàng:', error);
          }
        }
      });
      
      console.log('Doanh thu theo tháng:', monthlyData);
      
      // Định dạng dữ liệu cho biểu đồ
      return {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [
          {
            label: 'Doanh thu (triệu)',
            data: monthlyData.map(value => value / 1000000), // Chuyển sang đơn vị triệu
            borderColor: 'rgba(33, 150, 243, 1)',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }
        ]
      };
    } catch (error) {
      console.error('Lỗi khi tạo dữ liệu doanh thu theo tháng:', error);
      return {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [{ 
          label: 'Doanh thu (triệu)', 
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          borderColor: 'rgba(33, 150, 243, 1)',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      };
    }
  };

  // Thay đổi hàm tính thống kê phương thức thanh toán thành thống kê danh mục
  const calculateCategoryStats = (products) => {
    try {
      if (!Array.isArray(products)) {
        console.error('Dữ liệu sản phẩm không hợp lệ cho thống kê danh mục');
        return {
          labels: [],
          datasets: [{ data: [], backgroundColor: [], borderColor: [], borderWidth: 1 }]
        };
      }
      
      // Đếm số lượng sản phẩm theo danh mục
      const categoryCounts = products.reduce((acc, product) => {
        const category = product.category?.name || 'Khác';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      const categories = Object.keys(categoryCounts);
      const counts = Object.values(categoryCounts);
      const total = counts.reduce((sum, count) => sum + count, 0);
      const percentages = counts.map(count => (count / total) * 100);
      
      // Định dạng dữ liệu cho biểu đồ
      return {
        labels: categories,
        datasets: [
          {
            data: percentages,
            backgroundColor: [
              'rgba(255, 183, 77, 0.7)',   // Điện thoại
              'rgba(100, 181, 246, 0.7)',  // Laptop
              'rgba(129, 199, 132, 0.7)',  // Tablet
              'rgba(186, 104, 200, 0.7)',  // Phụ kiện
              'rgba(229, 115, 115, 0.7)'   // Khác
            ],
            borderColor: [
              'rgba(255, 183, 77, 1)',
              'rgba(100, 181, 246, 1)',
              'rgba(129, 199, 132, 1)',
              'rgba(186, 104, 200, 1)',
              'rgba(229, 115, 115, 1)'
            ],
            borderWidth: 1,
          },
        ],
      };
    } catch (error) {
      console.error('Lỗi khi tính thống kê danh mục:', error);
      return {
        labels: ['Lỗi dữ liệu'],
        datasets: [{ data: [1], backgroundColor: ['rgba(244, 67, 54, 0.7)'], borderWidth: 0 }]
      };
    }
  };

  // Tìm các sản phẩm bán chạy nhất
  const findBestSellingProducts = (orders, products) => {
    try {
      // Tạo map đếm số lượng bán của mỗi sản phẩm
      const productSales = {};
      
      if (!Array.isArray(orders) || !Array.isArray(products)) {
        console.error('Dữ liệu không hợp lệ để tính sản phẩm bán chạy:', 
          { ordersIsArray: Array.isArray(orders), productsIsArray: Array.isArray(products) });
        return [];
      }
      
      // Đếm số lượng bán cho mỗi sản phẩm
      orders.forEach(order => {
        if (order.orderItems && Array.isArray(order.orderItems)) {
          order.orderItems.forEach(item => {
            if (item.product) {
              if (productSales[item.product]) {
                productSales[item.product] += item.qty;
              } else {
                productSales[item.product] = item.qty;
              }
            }
          });
        }
      });
      
      // Thêm thông tin chi tiết và sắp xếp theo số lượng bán
      const productsWithSales = products
        .filter(product => product && product._id) // Đảm bảo product không null và có _id
        .map(product => ({
          ...product,
          soldCount: productSales[product._id] || 0
        }))
        .sort((a, b) => b.soldCount - a.soldCount);
      
      // Trả về 5 sản phẩm bán chạy nhất
      return productsWithSales.slice(0, 5);
    } catch (error) {
      console.error('Lỗi khi tính toán sản phẩm bán chạy:', error);
      return [];
    }
  };

  // Format tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(value)
      .replace(/\s/g, '');
  };
  
  // Format ngày
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  // Hiển thị badge trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning" className="badge-warning" pill>Chờ xử lý</Badge>;
      case 'processing':
        return <Badge bg="info" className="badge-info" pill>Đang xử lý</Badge>;
      case 'shipped':
        return <Badge bg="primary" className="badge-primary" pill>Đang giao</Badge>;
      case 'delivered':
        return <Badge bg="success" className="badge-success" pill>Đã giao</Badge>;
      case 'cancelled':
        return <Badge bg="danger" className="badge-danger" pill>Đã hủy</Badge>;
      default:
        return <Badge bg="secondary" pill>Không xác định</Badge>;
    }
  };
  
  // Hiển thị badge phương thức thanh toán
  const getPaymentMethodBadge = (method) => {
    switch (method) {
      case 'cod':
        return <Badge bg="warning" className="badge-warning" pill>Tiền mặt (COD)</Badge>;
      case 'card':
        return <Badge bg="info" className="badge-info" pill>Thẻ tín dụng</Badge>;
      case 'qr':
        return <Badge bg="success" className="badge-success" pill>QR Code</Badge>;
      default:
        return <Badge bg="secondary" pill>Khác</Badge>;
    }
  };
  
  // Cấu hình chung cho biểu đồ
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };
  
  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="page-title m-0 fw-bold">Bảng Điều Khiển</h3>
          <p className="text-muted mb-0 mt-1">
            Tổng quan về số liệu và thống kê của hệ thống
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button 
            variant="outline-secondary" 
            className="d-flex align-items-center gap-2"
            onClick={fetchDashboardData}
          >
            <FiClock size={16} /> Cập nhật
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          {/* Thống kê tổng quan */}
          <Row className="mb-4 g-3">
            <Col lg={3} md={6} sm={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="dashboard-widget-icon rounded-circle d-flex align-items-center justify-content-center" 
                         style={{ width: '50px', height: '50px', backgroundColor: 'rgba(33, 150, 243, 0.15)', color: '#2196F3' }}>
                      <FiDollarSign size={22} />
                    </div>
                    <div className="d-flex align-items-center">
                      <FiArrowUp className="text-success me-1" size={16} />
                      <span className="small text-success">{stats.paidOrders} đơn đã thanh toán</span>
                    </div>
                  </div>
                  <h4 className="fw-bold mb-1">{formatCurrency(stats.totalRevenue)}</h4>
                  <p className="text-muted small mb-0">Tổng doanh thu</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6} sm={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="dashboard-widget-icon rounded-circle d-flex align-items-center justify-content-center" 
                         style={{ width: '50px', height: '50px', backgroundColor: 'rgba(76, 175, 80, 0.15)', color: '#4CAF50' }}>
                      <FiShoppingBag size={22} />
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="small text-muted">{stats.deliveredOrders} đã giao</span>
                    </div>
                  </div>
                  <h4 className="fw-bold mb-1">{stats.totalOrders}</h4>
                  <p className="text-muted small mb-0">Tổng đơn hàng</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6} sm={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="dashboard-widget-icon rounded-circle d-flex align-items-center justify-content-center" 
                         style={{ width: '50px', height: '50px', backgroundColor: 'rgba(76, 175, 80, 0.15)', color: '#4CAF50' }}>
                      <FiPackage size={22} />
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="small text-success">{stats.topSellingProduct?.soldCount || 0} đã bán</span>
                    </div>
                  </div>
                  <h4 className="fw-bold mb-1 text-truncate" style={{maxWidth: '100%'}} title={stats.topSellingProduct?.name}>
                    {stats.topSellingProduct?.name ? 
                      (stats.topSellingProduct.name.length > 20 ? 
                        stats.topSellingProduct.name.substring(0, 20) + '...' : 
                        stats.topSellingProduct.name) : 
                      'Không có dữ liệu'}
                  </h4>
                  <p className="text-muted small mb-0">Sản phẩm bán chạy nhất</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6} sm={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="dashboard-widget-icon rounded-circle d-flex align-items-center justify-content-center" 
                        style={{ width: '50px', height: '50px', backgroundColor: 'rgba(156, 39, 176, 0.15)', color: '#9C27B0' }}>
                      <FiUsers size={22} />
                    </div>
                  </div>
                  <h4 className="fw-bold mb-1">{stats.totalUsers}</h4>
                  <p className="text-muted small mb-0">Tổng người dùng</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Biểu đồ và thống kê chi tiết */}
          <Row className="mb-4 g-4">
            <Col lg={8}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-light border-0 py-3">
                  <h5 className="m-0 fw-medium d-flex align-items-center">
                    <FiBarChart2 className="text-primary me-2" size={18} />
                    Doanh thu theo tháng
                  </h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <div className="text-muted small mb-3">
                    <FiCheck className="me-1 text-success" /> Chỉ tính từ đơn đã thanh toán
                  </div>
                  <div style={{ height: '300px' }}>
                    <Line 
                      data={salesByMonth} 
                      options={{
                        ...chartOptions,
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }} 
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-light border-0 py-3">
                  <h5 className="m-0 fw-medium d-flex align-items-center">
                    <FiPieChart className="text-primary me-2" size={18} />
                    Phân loại sản phẩm
                  </h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <div style={{ height: '300px' }}>
                    <Pie data={categoryStats} options={chartOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Hàng cuối: Đơn hàng gần đây và sản phẩm bán chạy */}
          <Row className="g-4 mb-4">
            <Col lg={12}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-light border-0 py-3 d-flex justify-content-between align-items-center">
                  <h5 className="m-0 fw-medium d-flex align-items-center">
                    <FiBarChart2 className="text-primary me-2" size={18} />
                    Top 5 sản phẩm bán chạy
                  </h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <div style={{ height: '300px' }}>
                    <Bar 
                      data={topProductsChart} 
                      options={{
                        ...chartOptions,
                        indexAxis: 'y',
                        scales: {
                          x: {
                            beginAtZero: true
                          }
                        }
                      }} 
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Hàng cuối cùng: Chi tiết đơn hàng và sản phẩm */}
          <Row className="g-4">
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-light border-0 py-3 d-flex justify-content-between align-items-center">
                  <h5 className="m-0 fw-medium d-flex align-items-center">
                    <FiShoppingBag className="text-primary me-2" size={18} />
                    Đơn hàng gần đây
                  </h5>
                  <LinkContainer to="/orders">
                    <Button variant="outline-primary" size="sm">
                      Xem tất cả
                    </Button>
                  </LinkContainer>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="ps-4 py-3">Mã đơn</th>
                          <th className="py-3">Ngày đặt</th>
                          <th className="py-3">Giá trị</th>
                          <th className="py-3">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order._id} className="border-bottom">
                            <td className="ps-4">
                              <div className="fw-medium">{order._id.substring(0, 8)}</div>
                            </td>
                            <td>{formatDate(order.createdAt)}</td>
                            <td className="fw-medium" style={{ color: '#F44336' }}>
                              {formatCurrency(order.totalPrice)}
                            </td>
                            <td>{getStatusBadge(order.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-light border-0 py-3 d-flex justify-content-between align-items-center">
                  <h5 className="m-0 fw-medium d-flex align-items-center">
                    <FiPackage className="text-primary me-2" size={18} />
                    Chi tiết sản phẩm bán chạy
                  </h5>
                  <LinkContainer to="/products">
                    <Button variant="outline-primary" size="sm">
                      Xem tất cả
                    </Button>
                  </LinkContainer>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="ps-4 py-3">Sản phẩm</th>
                          <th className="py-3">Giá</th>
                          <th className="py-3">Kho</th>
                          <th className="py-3">Đã bán</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((product) => (
                          <tr key={product._id} className="border-bottom">
                            <td className="ps-4 fw-medium">{product.name}</td>
                            <td>{formatCurrency(product.price)}</td>
                            <td>{product.countInStock}</td>
                            <td className="fw-medium" style={{ color: '#4CAF50' }}>
                              {product.soldCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
      
      <style jsx>{`
        .badge-warning {
          background-color: rgba(255, 193, 7, 0.1);
          color: #FFC107;
          border: 1px solid rgba(255, 193, 7, 0.2);
        }
        
        .badge-info {
          background-color: rgba(33, 150, 243, 0.1);
          color: #2196F3;
          border: 1px solid rgba(33, 150, 243, 0.2);
        }
        
        .badge-primary {
          background-color: rgba(63, 81, 181, 0.1);
          color: #3F51B5;
          border: 1px solid rgba(63, 81, 181, 0.2);
        }
        
        .badge-success {
          background-color: rgba(76, 175, 80, 0.1);
          color: #4CAF50;
          border: 1px solid rgba(76, 175, 80, 0.2);
        }
        
        .badge-danger {
          background-color: rgba(244, 67, 54, 0.1);
          color: #F44336;
          border: 1px solid rgba(244, 67, 54, 0.2);
        }
      `}</style>
    </>
  );
};

export default DashboardScreen; 