import React, { useState, useEffect } from 'react';
import { Row, Col, ListGroup, Card, Button, Form, Badge, Image, Alert } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { 
  FiPackage, 
  FiUser, 
  FiMapPin, 
  FiCreditCard, 
  FiCalendar, 
  FiClock,
  FiTruck,
  FiCheck,
  FiX, 
  FiDollarSign,
  FiArrowLeft,
  FiShoppingBag,
  FiEdit,
  FiEdit2,
  FiPhone,
  FiMail
} from 'react-icons/fi';

const OrderScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [successUpdate, setSuccessUpdate] = useState('');
  const [status, setStatus] = useState('');
  const [paymentUpdateSuccess, setPaymentUpdateSuccess] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/orders/${id}`);
        setOrder(data);
        setStatus(data.status);
        setLoading(false);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Không thể tải thông tin đơn hàng'
        );
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const updateToDeliveredHandler = async () => {
    try {
      setLoadingUpdate(true);
      await axios.put(`/api/orders/${id}/deliver`);
      
      const { data } = await axios.get(`/api/orders/${id}`);
      setOrder(data);
      setStatus(data.status);
      
      setSuccessUpdate('Đơn hàng đã được cập nhật thành đã giao');
      setLoadingUpdate(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Cập nhật thất bại'
      );
      setLoadingUpdate(false);
    }
  };

  const updateStatusHandler = async () => {
    try {
      setLoadingUpdate(true);
      await axios.put(`/api/orders/${id}/status`, { status });
      
      const { data } = await axios.get(`/api/orders/${id}`);
      setOrder(data);
      
      setSuccessUpdate('Trạng thái đơn hàng đã được cập nhật');
      setLoadingUpdate(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Cập nhật thất bại'
      );
      setLoadingUpdate(false);
    }
  };

  const updatePaymentStatus = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(`/api/orders/${id}/pay`, {});
      setOrder(data);
      setPaymentUpdateSuccess(true);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Không thể cập nhật trạng thái thanh toán'
      );
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(value)
      .replace(/\s/g, '');
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <Badge bg="warning" className="badge-warning">Chờ xử lý</Badge>;
      case 'processing':
        return <Badge bg="info" className="badge-info">Đang xử lý</Badge>;
      case 'shipped':
        return <Badge bg="primary" className="badge-primary">Đang giao</Badge>;
      case 'delivered':
        return <Badge bg="success" className="badge-success">Đã giao</Badge>;
      case 'cancelled':
        return <Badge bg="danger" className="badge-danger">Đã hủy</Badge>;
      default:
        return <Badge bg="secondary">Không xác định</Badge>;
    }
  };

  // Thêm các phương thức thanh toán online
  const onlinePaymentMethods = ['momo', 'zalopay', 'vnpay', 'online', 'credit-card'];

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="page-title m-0 fw-bold">Chi tiết đơn hàng</h3>
          {order && (
            <p className="text-muted mb-0 mt-1">
              Mã đơn: <span className="fw-medium">{order.trackingCode || order._id.substring(0, 8)}</span>
            </p>
          )}
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/orders')}
            className="d-flex align-items-center gap-2"
          >
            <FiArrowLeft size={16} /> Quay lại
          </Button>
          {order && getStatusBadge(order.status)}
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          {successUpdate && <Message variant="success" className="mb-4">{successUpdate}</Message>}
          
          <Row className="g-4">
            <Col lg={8}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-light border-0 py-3">
                  <div className="d-flex align-items-center">
                    <FiUser className="text-primary me-2" size={18} />
                    <h5 className="fw-medium m-0">Thông tin khách hàng</h5>
                  </div>
                </Card.Header>
                <Card.Body className="p-4">
                  <Row className="g-4">
                    <Col md={6}>
                      <div className="p-3 rounded-3 h-100" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                        <p className="text-muted small mb-2">Thông tin người đặt</p>
                        <div className="fw-medium mb-3">{order.user.name}</div>
                        <div className="d-flex align-items-center text-muted small mb-2">
                          <FiCreditCard size={14} className="me-2" />
                          ID: {order.user._id.substring(0, 8)}...
                        </div>
                        <div className="d-flex align-items-center text-muted small">
                          <FiCalendar size={14} className="me-2" />
                          Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="p-3 rounded-3 h-100" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                        <p className="text-muted small mb-2">Thông tin liên hệ</p>
                        <div className="mb-2">Email: <span className="fw-medium">{order.user.email}</span></div>
                        <div>Điện thoại: <span className="fw-medium">{order.shippingAddress.phone || 'Không có'}</span></div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-light border-0 py-3">
                  <div className="d-flex align-items-center">
                    <FiMapPin className="text-primary me-2" size={18} />
                    <h5 className="fw-medium m-0">Thông tin giao hàng</h5>
                  </div>
                </Card.Header>
                <Card.Body className="p-4">
                  <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <p className="text-muted small mb-2">Địa chỉ giao hàng</p>
                    <div className="fw-medium mb-2">{order.shippingAddress.address}</div>
                    <div className="d-flex align-items-center text-muted mb-2">
                      {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                    </div>
                  </div>
                  
                  <div className="delivery-status p-3 rounded-3 d-flex align-items-center" 
                       style={{ backgroundColor: order.isDelivered ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)' }}>
                    {order.isDelivered ? (
                      <>
                        <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" 
                            style={{ width: '40px', height: '40px', backgroundColor: 'rgba(76, 175, 80, 0.2)' }}>
                          <FiCheck size={20} style={{ color: '#4CAF50' }} />
                        </div>
                        <div>
                          <div className="fw-medium" style={{ color: '#4CAF50' }}>Đã giao hàng</div>
                          <div className="small" style={{ color: '#4CAF50' }}>
                            {new Date(order.deliveredAt).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" 
                            style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255, 152, 0, 0.2)' }}>
                          <FiClock size={20} style={{ color: '#FF9800' }} />
                        </div>
                        <div>
                          <div className="fw-medium" style={{ color: '#FF9800' }}>Chưa giao hàng</div>
                          <div className="small" style={{ color: '#FF9800' }}>
                            Đơn hàng đang trong quá trình xử lý
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-light border-0 py-3">
                  <div className="d-flex align-items-center">
                    <FiCreditCard className="text-primary me-2" size={18} />
                    <h5 className="fw-medium m-0">Thông tin thanh toán</h5>
                  </div>
                </Card.Header>
                <Card.Body className="p-4">
                  <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <p className="text-muted small mb-2">Phương thức thanh toán</p>
                    <div className="fw-medium mb-2">
                      {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 
                      order.paymentMethod === 'card' ? 'Thẻ tín dụng/Ghi nợ' : 
                      order.paymentMethod === 'momo' ? 'Ví MoMo' : order.paymentMethod}
                    </div>
                  </div>
                  
                  <div className="payment-status p-3 rounded-3 d-flex align-items-center" 
                       style={{ backgroundColor: order.isPaid ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)' }}>
                    {order.isPaid ? (
                      <>
                        <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" 
                            style={{ width: '40px', height: '40px', backgroundColor: 'rgba(76, 175, 80, 0.2)' }}>
                          <FiCheck size={20} style={{ color: '#4CAF50' }} />
                        </div>
                        <div>
                          <div className="fw-medium" style={{ color: '#4CAF50' }}>Đã thanh toán</div>
                          <div className="small" style={{ color: '#4CAF50' }}>
                            {new Date(order.paidAt).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" 
                            style={{ width: '40px', height: '40px', backgroundColor: 'rgba(244, 67, 54, 0.2)' }}>
                          <FiX size={20} style={{ color: '#F44336' }} />
                        </div>
                        <div>
                          <div className="fw-medium" style={{ color: '#F44336' }}>Chưa thanh toán</div>
                          <div className="small" style={{ color: '#F44336' }}>
                            {order.paymentMethod === 'cod' ? 'Sẽ thanh toán khi nhận hàng' : 'Thanh toán đang chờ xử lý'}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-light border-0 py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <FiShoppingBag className="text-primary me-2" size={18} />
                      <h5 className="fw-medium m-0">Danh sách sản phẩm</h5>
                    </div>
                    <div className="small text-muted">
                      {order.orderItems.length} sản phẩm
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="p-4">
                  <div className="order-items">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="order-item p-3 rounded-3 mb-3" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                        <div className="d-flex">
                          <div className="me-3 rounded-3 overflow-hidden" style={{ width: '60px', height: '60px' }}>
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-100 h-100"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                          <div className="flex-grow-1 d-flex flex-column justify-content-between">
                            <div className="fw-medium mb-2">{item.name}</div>
                            <div className="d-flex justify-content-between align-items-end">
                              <div className="text-muted small">SL: {item.qty}</div>
                              <div className="fw-medium" style={{ color: '#f44336' }}>
                                {formatCurrency(item.price)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={4}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-light border-0 py-3">
                  <div className="d-flex align-items-center">
                    <FiDollarSign className="text-primary me-2" size={18} />
                    <h5 className="fw-medium m-0">Tổng đơn hàng</h5>
                  </div>
                </Card.Header>
                <Card.Body className="p-4">
                  <div className="order-summary p-3 rounded-3" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <div className="d-flex justify-content-between mb-3">
                      <div className="text-muted">Tổng tiền hàng:</div>
                      <div className="fw-medium">{formatCurrency(order.totalPrice - order.shippingPrice - order.taxPrice)}</div>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <div className="text-muted">Phí vận chuyển:</div>
                      <div className="fw-medium">{formatCurrency(order.shippingPrice)}</div>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <div className="text-muted">Thuế:</div>
                      <div className="fw-medium">{formatCurrency(order.taxPrice)}</div>
                    </div>
                    <div className="border-top pt-3 mt-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="fw-medium">Tổng thanh toán:</div>
                        <div className="fs-5 fw-semibold" style={{ color: '#f44336' }}>{formatCurrency(order.totalPrice)}</div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light border-0 py-3">
                  <div className="d-flex align-items-center">
                    <FiEdit className="text-primary me-2" size={18} />
                    <h5 className="fw-medium m-0">Cập nhật trạng thái</h5>
                  </div>
                </Card.Header>
                <Card.Body className="p-4">
                  <Form>
                    <Form.Group controlId="status" className="mb-3">
                      <Form.Label className="fw-medium">Trạng thái đơn hàng</Form.Label>
                      <Form.Select 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value)}
                        className="shadow-none"
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="shipped">Đang giao</option>
                        <option value="delivered">Đã giao</option>
                        <option value="cancelled">Đã hủy</option>
                      </Form.Select>
                    </Form.Group>
                    
                    <div className="d-grid gap-2">
                      <Button 
                        variant="warning" 
                        onClick={updateStatusHandler}
                        disabled={loadingUpdate}
                        className="d-flex align-items-center justify-content-center gap-2 fw-medium"
                      >
                        <FiEdit size={16} />
                        {loadingUpdate ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                      </Button>
                      
                      {!order.isDelivered && (
                        <Button 
                          variant="success" 
                          onClick={updateToDeliveredHandler}
                          disabled={loadingUpdate}
                          className="d-flex align-items-center justify-content-center gap-2 fw-medium"
                        >
                          <FiTruck size={16} />
                          {loadingUpdate ? 'Đang cập nhật...' : 'Đánh dấu đã giao hàng'}
                        </Button>
                      )}
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              {!order.isPaid && onlinePaymentMethods.includes(order.paymentMethod) && (
                <Button 
                  variant="success" 
                  className="d-flex align-items-center gap-2 mb-3"
                  onClick={updatePaymentStatus}
                >
                  <FiCheck size={16} /> Cập nhật thành đã thanh toán
                </Button>
              )}

              {paymentUpdateSuccess && (
                <Alert variant="success" className="mt-3">
                  Đã cập nhật thành công trạng thái thanh toán thành "Đã thanh toán"
                </Alert>
              )}
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default OrderScreen; 