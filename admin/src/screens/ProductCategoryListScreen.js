import React, { useState, useEffect } from 'react';
import { Table, Button, Row, Col, Form, InputGroup, Badge, Card } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiGrid,
  FiTag,
  FiPackage,
  FiShoppingBag,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';

const ProductCategoryListScreen = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const { data } = await axios.get('/api/product-categories');
      setCategories(data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Không thể tải danh sách danh mục'
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const deleteCategoryHandler = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        setLoading(true);
        await axios.delete(`/api/product-categories/${id}`);
        setSuccess('Xóa danh mục thành công');
        loadCategories();
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Không thể xóa danh mục'
        );
        setLoading(false);
      }
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Compute stats
  const stats = {
    totalCategories: categories.length,
    activeCategories: categories.filter(category => category.isActive).length,
    inactiveCategories: categories.filter(category => !category.isActive).length
  };

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="page-title m-0 fw-bold">Quản lý Danh mục</h3>
          <p className="text-muted mb-0 mt-1">
            Quản lý danh mục sản phẩm trong hệ thống
          </p>
        </div>
        <LinkContainer to="/product-categories/new/edit">
          <Button variant="outline-primary" className="d-flex align-items-center gap-2 fw-medium">
            <FiPlus size={16} /> Thêm Danh mục
          </Button>
        </LinkContainer>
      </div>

      {success && <Message variant="success" className="mb-4">{success}</Message>}
      {error && <Message variant="danger" className="mb-4">{error}</Message>}

      <Row className="mb-4 g-3">
        <Col lg={4} md={6} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="dashboard-widget-icon rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '50px', height: '50px', backgroundColor: 'rgba(33, 150, 243, 0.15)', color: '#2196F3' }}>
                  <FiTag size={22} />
                </div>
              </div>
              <h4 className="fw-bold mb-1">{stats.totalCategories}</h4>
              <p className="text-muted small mb-0">Tổng số danh mục</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4} md={6} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="dashboard-widget-icon rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '50px', height: '50px', backgroundColor: 'rgba(76, 175, 80, 0.15)', color: '#4CAF50' }}>
                  <FiEye size={22} />
                </div>
              </div>
              <h4 className="fw-bold mb-1">{stats.activeCategories}</h4>
              <p className="text-muted small mb-0">Đang hiển thị</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4} md={6} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="dashboard-widget-icon rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '50px', height: '50px', backgroundColor: 'rgba(244, 67, 54, 0.15)', color: '#F44336' }}>
                  <FiEyeOff size={22} />
                </div>
              </div>
              <h4 className="fw-bold mb-1">{stats.inactiveCategories}</h4>
              <p className="text-muted small mb-0">Đang ẩn</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-light border-0 py-3">
          <h5 className="m-0 fw-medium d-flex align-items-center">
            <FiTag className="text-primary me-2" size={18} />
            Danh sách danh mục
          </h5>
        </Card.Header>
        <Card.Body className="p-4">
          <Row className="mb-4 g-3">
            <Col lg={10} md={9}>
              <InputGroup className="shadow-sm rounded-3 overflow-hidden">
                <InputGroup.Text className="bg-white text-muted border-end-0">
                  <FiSearch size={18} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc mô tả danh mục..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0 ps-0 shadow-none"
                />
              </InputGroup>
            </Col>
            <Col lg={2} md={3} className="d-flex justify-content-end">
              <Button 
                variant="light" 
                onClick={loadCategories} 
                className="shadow-sm d-flex align-items-center justify-content-center rounded-circle p-2"
                title="Làm mới danh sách"
              >
                <FiRefreshCw size={18} />
              </Button>
            </Col>
          </Row>

          {loading ? (
            <Loader />
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3" style={{ color: '#ccc' }}>
                <FiGrid size={50} />
              </div>
              <h5 className="fw-semibold text-muted mb-2">Không tìm thấy danh mục</h5>
              <p className="text-muted mb-0">Không có danh mục nào phù hợp với tìm kiếm của bạn</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0 category-table">
                <thead className="bg-light">
                  <tr>
                    <th style={{width: '50px'}} className="ps-3 py-3">#</th>
                    <th className="py-3">Danh mục</th>
                    <th className="py-3">Trạng thái</th>
                    <th className="py-3">Sản phẩm</th>
                    <th className="py-3">Ngày tạo</th>
                    <th className="text-end py-3 pe-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category, index) => (
                    <tr key={category._id} className="category-row border-bottom">
                      <td className="ps-3">{index + 1}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="category-icon me-3 d-flex align-items-center justify-content-center rounded overflow-hidden"
                               style={{ 
                                  width: '45px', 
                                  height: '45px', 
                                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                }}
                          >
                            {category.image ? (
                              <img src={category.image} alt={category.name} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                            ) : (
                              <FiPackage size={20} className="text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="fw-medium mb-1">{category.name}</div>
                            {category.description && (
                              <div className="small text-muted text-truncate" style={{ maxWidth: '350px' }}>
                                {category.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        {category.isActive ? (
                          <Badge bg="success" className="bg-success-subtle text-success border-0" pill>Hiển thị</Badge>
                        ) : (
                          <Badge bg="danger" className="bg-danger-subtle text-danger border-0" pill>Ẩn</Badge>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FiShoppingBag size={14} className="text-muted me-2" />
                          <span>
                            {category.productCount || 0} sản phẩm
                          </span>
                        </div>
                      </td>
                      <td>
                        {category.createdAt ? new Date(category.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-2 pe-3">
                          <LinkContainer to={`/product-categories/${category._id}/edit`}>
                            <Button variant="light" size="sm" className="d-flex align-items-center justify-content-center p-2 shadow-sm">
                              <FiEdit size={16} className="text-primary" />
                            </Button>
                          </LinkContainer>
                          <Button
                            variant="light"
                            size="sm"
                            className="d-flex align-items-center justify-content-center p-2 shadow-sm"
                            onClick={() => deleteCategoryHandler(category._id)}
                          >
                            <FiTrash2 size={16} className="text-danger" />
                          </Button>
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
        .dashboard-widget-icon {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .category-row:hover {
          background-color: #f8f9fa;
        }

        .bg-success-subtle {
          background-color: rgba(76, 175, 80, 0.1);
        }
        
        .bg-danger-subtle {
          background-color: rgba(244, 67, 54, 0.1);
        }
      `}</style>
    </>
  );
};

export default ProductCategoryListScreen;