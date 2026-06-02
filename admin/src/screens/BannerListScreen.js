import React, { useState, useEffect } from 'react';
import { Table, Button, Row, Col, Image, Form, InputGroup, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiRefreshCw,
  FiImage,
  FiChevronsRight,
  FiGrid,
  FiLayers,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';

const BannerListScreen = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadBanners = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const { data } = await axios.get('/api/banners');
      setBanners(data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Không thể tải danh sách banner'
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const deleteBannerHandler = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa banner này?')) {
      try {
        setLoading(true);
        await axios.delete(`/api/banners/${id}`);
        setSuccess('Xóa banner thành công');
        loadBanners();
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Không thể xóa banner'
        );
        setLoading(false);
      }
    }
  };

  // Filter banners based on search term and status filter
  const filteredBanners = banners.filter((banner) => {
    const matchesSearch = searchTerm === '' || 
      (banner.link && banner.link.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && banner.isActive) || 
      (statusFilter === 'inactive' && !banner.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Tính các số liệu thống kê
  const stats = {
    totalBanners: banners.length,
    activeBanners: banners.filter(banner => banner.isActive).length,
    inactiveBanners: banners.filter(banner => !banner.isActive).length
  };

  return (
    <div className="banner-list-screen">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="page-title m-0 fw-bold">Quản lý Banner</h3>
          <p className="text-muted mb-0 mt-1">
            Quản lý banner quảng cáo hiển thị trên trang web
          </p>
        </div>
        <LinkContainer to="/banners/new/edit">
          <Button variant="warning" className="d-flex align-items-center gap-2">
            <FiPlus size={16} /> Thêm Banner
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
                <FiLayers size={20} />
              </div>
            </div>
            <h4 className="dashboard-widget-value mb-1">{stats.totalBanners}</h4>
            <p className="text-muted small mb-0">Tổng số banner</p>
          </div>
        </Col>
        
        <Col lg={4} md={6} sm={6}>
          <div className="dashboard-widget">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="dashboard-widget-icon" 
                   style={{ backgroundColor: 'rgba(76, 175, 80, 0.15)', color: '#4CAF50' }}>
                <FiEye size={20} />
              </div>
            </div>
            <h4 className="dashboard-widget-value mb-1">{stats.activeBanners}</h4>
            <p className="text-muted small mb-0">Banner hiển thị</p>
          </div>
        </Col>
        
        <Col lg={4} md={6} sm={6}>
          <div className="dashboard-widget">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="dashboard-widget-icon" 
                   style={{ backgroundColor: 'rgba(158, 158, 158, 0.15)', color: '#9E9E9E' }}>
                <FiEyeOff size={20} />
              </div>
            </div>
            <h4 className="dashboard-widget-value mb-1">{stats.inactiveBanners}</h4>
            <p className="text-muted small mb-0">Banner ẩn</p>
          </div>
        </Col>
      </Row>

      <div className="dashboard-widget mb-4">
        <Row className="mb-4 g-3">
          <Col lg={6} md={6}>
            <InputGroup className="shadow-sm rounded-3 overflow-hidden">
              <InputGroup.Text className="bg-white text-muted border-end-0">
                <FiSearch size={18} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Tìm theo đường dẫn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-start-0 ps-0 shadow-none"
              />
            </InputGroup>
          </Col>
          <Col lg={4} md={6}>
            <InputGroup className="shadow-sm rounded-3 overflow-hidden">
              <InputGroup.Text className="bg-white text-muted border-end-0">
                <FiFilter size={18} />
              </InputGroup.Text>
              <Form.Select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-start-0 ps-0 shadow-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hiển thị</option>
                <option value="inactive">Ẩn</option>
              </Form.Select>
            </InputGroup>
          </Col>
          <Col lg={2} className="d-flex justify-content-end">
            <Button 
              variant="light" 
              onClick={loadBanners} 
              className="shadow-sm d-flex align-items-center justify-content-center px-3 w-100"
              title="Làm mới danh sách"
            >
              <FiRefreshCw size={16} />
            </Button>
          </Col>
        </Row>

        {loading ? (
          <Loader />
        ) : filteredBanners.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3" style={{ color: '#ccc' }}>
              <FiImage size={48} />
            </div>
            <p className="text-muted">Không tìm thấy banner nào</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th style={{ width: '120px' }}>Hình ảnh</th>
                  <th>Đường dẫn</th>
                  <th style={{ width: '100px' }}>Thứ tự</th>
                  <th style={{ width: '120px' }}>Trạng thái</th>
                  <th style={{ width: '120px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredBanners.map((banner, index) => (
                  <tr key={banner._id}>
                    <td>{index + 1}</td>
                    <td>
                      <Image 
                        src={banner.image} 
                        alt="Banner" 
                        style={{ width: '100px', height: '50px', objectFit: 'cover' }}
                        className="rounded"
                      />
                    </td>
                    <td>
                      <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                        {banner.link || 'Không có đường dẫn'}
                      </a>
                    </td>
                    <td>{banner.order}</td>
                    <td>
                      <Badge bg={banner.isActive ? 'success' : 'secondary'}>
                        {banner.isActive ? 'Hiển thị' : 'Ẩn'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <LinkContainer to={`/banners/${banner._id}/edit`}>
                          <Button variant="light" size="sm" className="d-flex align-items-center">
                            <FiEdit size={16} />
                          </Button>
                        </LinkContainer>
                        <Button
                          variant="light"
                          size="sm"
                          onClick={() => deleteBannerHandler(banner._id)}
                          className="d-flex align-items-center text-danger"
                        >
                          <FiTrash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerListScreen; 