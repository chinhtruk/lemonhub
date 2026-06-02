import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Row, Col, Form, InputGroup, Card } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { 
  FiEye, 
  FiSearch, 
  FiFilter, 
  FiRefreshCw,
  FiShoppingBag,
  FiCalendar,
  FiCreditCard,
  FiUsers,
  FiTruck,
  FiPackage,
  FiDollarSign,
  FiClipboard,
  FiCheck,
  FiInfo
} from 'react-icons/fi';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';

const OrderListScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.get('/api/orders');
      setOrders(data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Không thể tải danh sách đơn hàng'
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const getPaymentBadge = (isPaid) => {
    return isPaid ? (
      <Badge bg="success" className="badge-success" pill>Đã thanh toán</Badge>
    ) : (
      <Badge bg="danger" className="badge-danger" pill>Chưa thanh toán</Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(value)
      .replace(/\s/g, '');
  };

  // Filter orders based on search term, status filter, and payment filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      (order.trackingCode && order.trackingCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order._id && order._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.user && order.user.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const matchesPayment = paymentFilter === 'all' || 
      (paymentFilter === 'paid' && order.isPaid) || 
      (paymentFilter === 'unpaid' && !order.isPaid);
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Tính các số liệu thống kê
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(order => order.status === 'pending').length,
    processingOrders: orders.filter(order => order.status === 'processing').length,
    shippedOrders: orders.filter(order => order.status === 'shipped').length,
    deliveredOrders: orders.filter(order => order.status === 'delivered').length,
    cancelledOrders: orders.filter(order => order.status === 'cancelled').length,
    totalRevenue: orders.filter(order => order.isPaid).reduce((acc, order) => acc + order.totalPrice, 0),
    unpaidOnlineOrders: orders.filter(order => 
      ['momo', 'zalopay', 'vnpay', 'online', 'credit-card'].includes(order.paymentMethod) && 
      !order.isPaid
    ).length,
    paidOrders: orders.filter(order => order.isPaid).length
  };

  // Hàm cập nhật tất cả đơn hàng thanh toán online nhưng chưa được đánh dấu là thanh toán
  const updateOnlinePaymentOrders = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      const { data } = await axios.put('/api/orders/update-online-to-paid');
      
      setSuccessMessage(data.message);
      fetchOrders(); // Tải lại danh sách đơn hàng sau khi cập nhật
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Không thể cập nhật đơn hàng'
      );
      setLoading(false);
    }
  };

  // Hàm cập nhật tất cả đơn hàng COD đã giao nhưng chưa thanh toán
  const updateDeliveredCODOrders = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      const { data } = await axios.put('/api/orders/update-delivered-to-paid');
      
      setSuccessMessage(data.message);
      fetchOrders(); // Tải lại danh sách đơn hàng sau khi cập nhật
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Không thể cập nhật đơn hàng'
      );
      setLoading(false);
    }
  };

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="page-title m-0 fw-bold">Quản lý đơn hàng</h3>
          <p className="text-muted mb-0 mt-1">
            Quản lý và xử lý các đơn hàng trong hệ thống
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button 
            variant="outline-primary" 
            className="d-flex align-items-center gap-2"
            onClick={updateOnlinePaymentOrders}
          >
            <FiCreditCard size={16} /> Cập nhật thanh toán online
          </Button>
          <Button 
            variant="outline-success" 
            className="d-flex align-items-center gap-2"
            onClick={updateDeliveredCODOrders}
          >
            <FiCheck size={16} /> Cập nhật COD đã giao
          </Button>
          <Button 
            variant="outline-secondary" 
            className="d-flex align-items-center gap-2"
            onClick={fetchOrders}
          >
            <FiRefreshCw size={16} /> Làm mới
          </Button>
        </div>
      </div>

      {error && <Message variant="danger">{error}</Message>}
      {successMessage && <Message variant="success">{successMessage}</Message>}
      
      <Card className="border-0 shadow-sm mb-4 bg-light">
        <Card.Body className="p-3">
          <div className="d-flex align-items-center">
            <FiInfo size={18} className="text-primary me-2" />
            <p className="mb-0 small">
              <span className="fw-medium">Chính sách thanh toán: </span>
              Đơn hàng thanh toán online (MoMo, ZaloPay, VNPay, Thẻ tín dụng) được đánh dấu thanh toán ngay khi tạo đơn.
              Đơn hàng COD được đánh dấu thanh toán khi giao hàng thành công.
              <span className="d-block mt-1 fw-medium">Doanh thu được tính từ tất cả đơn hàng đã thanh toán.</span>
              {stats.unpaidOnlineOrders > 0 && (
                <span className="text-danger fw-medium ms-2">
                  Hiện có {stats.unpaidOnlineOrders} đơn hàng thanh toán online chưa được đánh dấu thanh toán.
                </span>
              )}
            </p>
          </div>
        </Card.Body>
      </Card>
      
      <Row className="mb-4 g-3">
        <Col lg={3} md={6} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="dashboard-widget-icon rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ width: '50px', height: '50px', backgroundColor: 'rgba(33, 150, 243, 0.15)', color: '#2196F3' }}>
                  <FiShoppingBag size={22} />
                </div>
              </div>
              <h4 className="fw-bold mb-1">{stats.totalOrders}</h4>
              <p className="text-muted small mb-0">Tổng số đơn hàng</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="dashboard-widget-icon rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ width: '50px', height: '50px', backgroundColor: 'rgba(76, 175, 80, 0.15)', color: '#4CAF50' }}>
                  <FiTruck size={22} />
                </div>
              </div>
              <h4 className="fw-bold mb-1">{stats.deliveredOrders}</h4>
              <p className="text-muted small mb-0">Đơn hàng đã giao</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="dashboard-widget-icon rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ width: '50px', height: '50px', backgroundColor: 'rgba(255, 193, 7, 0.15)', color: '#FFC107' }}>
                  <FiCreditCard size={22} />
                </div>
              </div>
              <h4 className="fw-bold mb-1">{stats.paidOrders}</h4>
              <p className="text-muted small mb-0">Đơn hàng đã thanh toán</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="dashboard-widget-icon rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ width: '50px', height: '50px', backgroundColor: 'rgba(244, 67, 54, 0.15)', color: '#F44336' }}>
                  <FiDollarSign size={22} />
                </div>
              </div>
              <h4 className="fw-bold mb-1">{formatCurrency(stats.totalRevenue)}</h4>
              <p className="text-muted small mb-0">Tổng doanh thu</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-light border-0 py-3">
          <h5 className="m-0 fw-medium d-flex align-items-center">
            <FiShoppingBag className="text-primary me-2" size={18} />
            Danh sách đơn hàng
          </h5>
        </Card.Header>
        <Card.Body className="p-4">
          <Row className="mb-4 g-3">
            <Col lg={5} md={6}>
              <InputGroup className="shadow-sm rounded-3 overflow-hidden">
                <InputGroup.Text className="bg-white text-muted border-end-0">
                  <FiSearch size={18} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm mã đơn hàng, ID hoặc tên khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0 ps-0 shadow-none"
                />
              </InputGroup>
            </Col>
            <Col md={3} lg={3}>
              <InputGroup className="shadow-sm rounded-3 overflow-hidden">
                <InputGroup.Text className="bg-white text-muted border-end-0">
                  <FiTruck size={18} />
                </InputGroup.Text>
                <Form.Select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border-start-0 ps-0 shadow-none"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="shipped">Đang giao</option>
                  <option value="delivered">Đã giao</option>
                  <option value="cancelled">Đã hủy</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={3} lg={3}>
              <InputGroup className="shadow-sm rounded-3 overflow-hidden">
                <InputGroup.Text className="bg-white text-muted border-end-0">
                  <FiCreditCard size={18} />
                </InputGroup.Text>
                <Form.Select 
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="border-start-0 ps-0 shadow-none"
                >
                  <option value="all">Tất cả thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="unpaid">Chưa thanh toán</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col lg={1} className="d-flex justify-content-end">
              <Button 
                variant="light" 
                className="shadow-sm d-flex align-items-center justify-content-center px-3 w-100"
                onClick={fetchOrders}
                title="Làm mới danh sách"
              >
                <FiRefreshCw size={16} />
              </Button>
            </Col>
          </Row>

          {loading ? (
            <Loader />
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3" style={{ color: '#ccc' }}>
                <FiPackage size={50} />
              </div>
              <h5 className="fw-semibold text-muted mb-2">Không tìm thấy đơn hàng</h5>
              <p className="text-muted mb-0">Không có đơn hàng nào phù hợp với tìm kiếm của bạn</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0 order-table">
                <thead className="bg-light">
                  <tr>
                    <th className="py-3">Mã đơn hàng</th>
                    <th className="py-3">Khách hàng</th>
                    <th className="py-3">Ngày đặt</th>
                    <th className="py-3">Tổng tiền</th>
                    <th className="py-3">Thanh toán</th>
                    <th className="py-3">Trạng thái</th>
                    <th className="text-end py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="order-row border-bottom">
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="order-icon rounded-circle bg-light d-flex align-items-center justify-content-center shadow-sm me-3" 
                              style={{ width: '40px', height: '40px' }}>
                            <FiClipboard size={18} className="text-primary" />
                          </div>
                          <div>
                            <div className="fw-medium">{order.trackingCode || order._id.substring(0, 8)}</div>
                            <div className="text-muted small">{order._id.substring(0, 12)}...</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="user-avatar me-2 bg-light d-flex align-items-center justify-content-center" 
                               style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden' }}>
                            <FiUsers size={16} className="text-secondary" />
                          </div>
                          <div>{order.user && order.user.name ? order.user.name : 'Khách hàng'}</div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FiCalendar size={14} className="me-2 text-muted" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold" style={{ color: '#F44336' }}>
                          {formatCurrency(order.totalPrice)}
                        </div>
                        <small className="text-muted">
                          {order.paymentMethod === 'cod' 
                            ? 'Thanh toán khi nhận' 
                            : order.paymentMethod === 'momo' 
                              ? 'MoMo' 
                              : order.paymentMethod === 'zalopay' 
                                ? 'ZaloPay' 
                                : order.paymentMethod === 'vnpay' 
                                  ? 'VNPay'
                                  : order.paymentMethod === 'credit-card'
                                    ? 'Thẻ tín dụng'
                                    : 'Thanh toán online'}
                        </small>
                      </td>
                      <td>
                        {getPaymentBadge(order.isPaid)}
                        {order.isPaid && (
                          <div className="text-muted small mt-1">
                            {formatDate(order.paidAt)}
                          </div>
                        )}
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>
                        <div className="d-flex justify-content-end">
                          <LinkContainer to={`/orders/${order._id}`}>
                            <Button variant="light" size="sm" className="d-flex align-items-center justify-content-center p-2 shadow-sm">
                              <FiEye size={16} className="text-primary" />
                            </Button>
                          </LinkContainer>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

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
        
        .order-row:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </>
  );
};

export default OrderListScreen; 