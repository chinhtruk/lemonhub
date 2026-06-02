import React, { useState, useEffect } from 'react';
import { Table, Button, Row, Col, Card, Form, InputGroup, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiSearch, 
  FiRefreshCw,
  FiMapPin,
  FiPhone,
  FiClock,
  FiHome,
  FiCheck,
  FiX,
  FiGrid
} from 'react-icons/fi';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';

const StoreListScreen = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadStores = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const { data } = await axios.get('/api/stores');
      setStores(data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Không thể tải danh sách cửa hàng'
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const deleteStoreHandler = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cửa hàng này?')) {
      try {
        setLoading(true);
        await axios.delete(`/api/stores/${id}`);
        setSuccess('Xóa cửa hàng thành công');
        loadStores();
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Không thể xóa cửa hàng'
        );
        setLoading(false);
      }
    }
  };

  // Filter stores based on search term
  const filteredStores = stores.filter((store) => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (store.address && store.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (store.phone && store.phone.includes(searchTerm))
  );

  // Compute stats
  const stats = {
    totalStores: stores.length,
    activeStores: stores.filter(store => store.isActive).length,
    inactiveStores: stores.filter(store => !store.isActive).length
  };

  return (
    <div className="store-list-screen">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="page-title m-0 fw-bold">Quản lý Cửa hàng</h3>
          <p className="text-muted mb-0 mt-1">
            Quản lý thông tin các cửa hàng vật lý trong hệ thống
          </p>
        </div>
        <LinkContainer to="/stores/new">
          <Button variant="warning" className="d-flex align-items-center gap-2">
            <FiPlus size={16} /> Thêm Cửa hàng
          </Button>
        </LinkContainer>
      </div>

      {success && <Message variant="success">{success}</Message>}
      {error && <Message variant="danger">{error}</Message>}

      <Row className="mb-4 g-3">
        <Col lg={4} md={6} sm={6}>
          <div className="dashboard-widget">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="dashboard-widget-icon" 
                   style={{ backgroundColor: 'rgba(33, 150, 243, 0.15)', color: '#2196F3' }}>
                <FiHome size={20} />
              </div>
            </div>
            <h4 className="dashboard-widget-value mb-1">{stats.totalStores}</h4>
            <p className="text-muted small mb-0">Tổng số cửa hàng</p>
          </div>
        </Col>
        
        <Col lg={4} md={6} sm={6}>
          <div className="dashboard-widget">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="dashboard-widget-icon" 
                   style={{ backgroundColor: 'rgba(76, 175, 80, 0.15)', color: '#4CAF50' }}>
                <FiCheck size={20} />
              </div>
            </div>
            <h4 className="dashboard-widget-value mb-1">{stats.activeStores}</h4>
            <p className="text-muted small mb-0">Đang hoạt động</p>
          </div>
        </Col>
        
        <Col lg={4} md={6} sm={6}>
          <div className="dashboard-widget">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="dashboard-widget-icon" 
                   style={{ backgroundColor: 'rgba(244, 67, 54, 0.15)', color: '#F44336' }}>
                <FiX size={20} />
              </div>
            </div>
            <h4 className="dashboard-widget-value mb-1">{stats.inactiveStores}</h4>
            <p className="text-muted small mb-0">Tạm đóng cửa</p>
          </div>
        </Col>
      </Row>

      <div className="dashboard-widget mb-4">
        <Row className="mb-4 g-3">
          <Col lg={10} md={9}>
            <InputGroup className="shadow-sm rounded-3 overflow-hidden">
              <InputGroup.Text className="bg-white text-muted border-end-0">
                <FiSearch size={18} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Tìm kiếm theo tên, địa chỉ, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-start-0 ps-0 shadow-none"
              />
            </InputGroup>
          </Col>
          <Col lg={2} md={3} className="d-flex justify-content-end">
            <Button 
              variant="light" 
              onClick={loadStores} 
              className="shadow-sm d-flex align-items-center justify-content-center px-3 w-100"
              title="Làm mới danh sách"
            >
              <FiRefreshCw size={16} />
            </Button>
          </Col>
        </Row>

        {loading ? (
          <Loader />
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3" style={{ color: '#ccc' }}>
              <FiHome size={50} />
            </div>
            <h5 className="fw-semibold text-muted mb-2">Không tìm thấy cửa hàng</h5>
            <p className="text-muted mb-0">Không có cửa hàng nào phù hợp với tìm kiếm của bạn</p>
          </div>
        ) : (
          <div className="store-grid">
            <Row className="g-3">
              {filteredStores.map((store) => (
                <Col lg={4} md={6} key={store._id} className="mb-1">
                  <Card className="h-100 store-card border-0 shadow-sm rounded-3 overflow-hidden">
                    <div className="position-relative">
                      <Card.Img 
                        variant="top" 
                        src={store.image || '/images/store-placeholder.jpg'} 
                        className="store-image"
                        style={{ height: '180px', objectFit: 'cover' }}
                      />
                      {store.isActive ? (
                        <div className="position-absolute top-0 end-0 m-2">
                          <Badge bg="success" className="badge-success" pill>Đang hoạt động</Badge>
                        </div>
                      ) : (
                        <div className="position-absolute top-0 end-0 m-2">
                          <Badge bg="danger" className="badge-danger" pill>Tạm đóng cửa</Badge>
                        </div>
                      )}
                    </div>
                    <Card.Body className="p-3">
                      <Card.Title className="mb-3 fw-semibold fs-5">{store.name}</Card.Title>
                      <div className="store-info mb-3">
                        <div className="d-flex mb-2">
                          <FiMapPin className="me-2 text-muted mt-1" />
                          <div className="text-truncate">{store.address}</div>
                        </div>
                        <div className="d-flex mb-2">
                          <FiPhone className="me-2 text-muted mt-1" />
                          <div>{store.phone}</div>
                        </div>
                        <div className="d-flex mb-2">
                          <FiClock className="me-2 text-muted mt-1" />
                          <div>{store.hours}</div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-end gap-2 mt-3">
                        <LinkContainer to={`/stores/${store._id}/edit`}>
                          <Button variant="light" size="sm" className="d-flex align-items-center justify-content-center p-2">
                            <FiEdit size={16} />
                          </Button>
                        </LinkContainer>
                        <Button
                          variant="light"
                          size="sm"
                          className="d-flex align-items-center justify-content-center p-2 text-danger"
                          onClick={() => deleteStoreHandler(store._id)}
                        >
                          <FiTrash2 size={16} />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreListScreen; 