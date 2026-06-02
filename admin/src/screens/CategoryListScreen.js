import React, { useState, useEffect } from 'react';
import { Table, Button, Row, Col, Image, Card, Form, InputGroup, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { 
  FiTrash2, 
  FiEdit, 
  FiPlus, 
  FiStar, 
  FiSearch, 
  FiFilter, 
  FiRefreshCw, 
  FiLayers,
  FiGrid,
  FiBox,
  FiTag,
  FiChevronUp
} from 'react-icons/fi';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';

const CategoryListScreen = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [parentFilter, setParentFilter] = useState('all');

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/categories');
      setCategories(data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Đã xảy ra lỗi khi tải danh mục'
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const deleteHandler = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await axios.delete(`/api/categories/${id}`);
        setSuccess('Xóa danh mục thành công');
        loadCategories();
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Đã xảy ra lỗi khi xóa danh mục'
        );
      }
    }
  };

  const getParentCategoryName = (parentId) => {
    if (!parentId) return 'Danh mục gốc';
    const parent = categories.find((c) => c._id === parentId);
    return parent ? parent.name : 'Không có';
  };

  // Get only parent categories (no parent)
  const parentCategories = categories.filter(category => !category.parentCategory);

  // Filter categories based on search term and filters
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      category.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFeatured = 
      featuredFilter === 'all' || 
      (featuredFilter === 'featured' && category.isFeatured) || 
      (featuredFilter === 'non-featured' && !category.isFeatured);
    
    const matchesParent = 
      parentFilter === 'all' || 
      (parentFilter === 'parent' && !category.parentCategory) ||
      (parentFilter === 'child' && category.parentCategory) ||
      (parentFilter === category.parentCategory);
    
    return matchesSearch && matchesFeatured && matchesParent;
  });

  // Tạo các số liệu thống kê
  const stats = {
    totalCategories: categories.length,
    parentCategories: parentCategories.length,
    childCategories: categories.length - parentCategories.length,
    featuredCategories: categories.filter(cat => cat.isFeatured).length,
  };

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="page-title m-0 fw-bold">Quản lý danh mục</h3>
          <p className="text-muted mb-0 mt-1">
            Quản lý và phân loại danh mục sản phẩm trong hệ thống
          </p>
        </div>
        <LinkContainer to="/categories/new">
          <Button variant="warning" className="d-flex align-items-center gap-2">
            <FiPlus size={16} /> Thêm danh mục
          </Button>
        </LinkContainer>
      </div>

      {success && <Message variant="success" className="mb-4">{success}</Message>}
      {error && <Message variant="danger" className="mb-4">{error}</Message>}

      <Row className="mb-4 g-3">
        <Col lg={3} md={6} sm={6}>
          <div className="dashboard-widget">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="dashboard-widget-icon" 
                   style={{ backgroundColor: 'rgba(33, 150, 243, 0.15)', color: '#2196F3' }}>
                <FiTag size={20} />
              </div>
            </div>
            <h4 className="dashboard-widget-value mb-1">{stats.totalCategories}</h4>
            <p className="text-muted small mb-0">Tổng số danh mục</p>
          </div>
        </Col>
        
        <Col lg={3} md={6} sm={6}>
          <div className="dashboard-widget">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="dashboard-widget-icon" 
                   style={{ backgroundColor: 'rgba(76, 175, 80, 0.15)', color: '#4CAF50' }}>
                <FiLayers size={20} />
              </div>
            </div>
            <h4 className="dashboard-widget-value mb-1">{stats.parentCategories}</h4>
            <p className="text-muted small mb-0">Danh mục gốc</p>
          </div>
        </Col>
        
        <Col lg={3} md={6} sm={6}>
          <div className="dashboard-widget">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="dashboard-widget-icon" 
                   style={{ backgroundColor: 'rgba(156, 39, 176, 0.15)', color: '#9C27B0' }}>
                <FiBox size={20} />
              </div>
            </div>
            <h4 className="dashboard-widget-value mb-1">{stats.childCategories}</h4>
            <p className="text-muted small mb-0">Danh mục con</p>
          </div>
        </Col>
        
        <Col lg={3} md={6} sm={6}>
          <div className="dashboard-widget">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="dashboard-widget-icon" 
                   style={{ backgroundColor: 'rgba(255, 193, 7, 0.15)', color: '#FFC107' }}>
                <FiStar size={20} />
              </div>
            </div>
            <h4 className="dashboard-widget-value mb-1">{stats.featuredCategories}</h4>
            <p className="text-muted small mb-0">Danh mục nổi bật</p>
          </div>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={5} lg={4}>
              <InputGroup className="shadow-sm rounded-3 overflow-hidden">
                <InputGroup.Text className="bg-white text-muted border-end-0">
                  <FiSearch size={18} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm theo tên, slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0 ps-0"
                />
              </InputGroup>
            </Col>
            <Col md={3} lg={3}>
              <InputGroup className="shadow-sm rounded-3 overflow-hidden">
                <InputGroup.Text className="bg-white text-muted border-end-0">
                  <FiLayers size={18} />
                </InputGroup.Text>
                <Form.Select 
                  value={parentFilter}
                  onChange={(e) => setParentFilter(e.target.value)}
                  className="border-start-0 ps-0"
                >
                  <option value="all">Tất cả cấp danh mục</option>
                  <option value="parent">Danh mục gốc</option>
                  <option value="child">Danh mục con</option>
                  {parentCategories.map(category => (
                    <option key={category._id} value={category._id}>Con của: {category.name}</option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={3} lg={3}>
              <InputGroup className="shadow-sm rounded-3 overflow-hidden">
                <InputGroup.Text className="bg-white text-muted border-end-0">
                  <FiStar size={18} />
                </InputGroup.Text>
                <Form.Select 
                  value={featuredFilter}
                  onChange={(e) => setFeaturedFilter(e.target.value)}
                  className="border-start-0 ps-0"
                >
                  <option value="all">Tất cả danh mục</option>
                  <option value="featured">Nổi bật</option>
                  <option value="non-featured">Không nổi bật</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={1} className="d-flex justify-content-end align-items-center ms-auto">
              <Button 
                variant="light" 
                onClick={loadCategories} 
                className="d-flex align-items-center justify-content-center rounded-circle p-2 shadow-sm"
                title="Làm mới danh sách"
              >
                <FiRefreshCw size={18} />
              </Button>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Loader />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-5">
              <FiGrid size={50} className="text-muted mb-3" />
              <h5 className="fw-semibold text-muted mb-2">Không tìm thấy danh mục</h5>
              <p className="text-muted mb-0">Không có danh mục nào phù hợp với tìm kiếm của bạn</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0 category-table">
                <thead className="bg-light">
                  <tr>
                    <th style={{width: '60px'}} className="ps-3 py-3">Icon</th>
                    <th className="py-3">Tên danh mục</th>
                    <th className="py-3">Slug</th>
                    <th className="py-3">Danh mục cha</th>
                    <th className="text-center py-3">
                      <FiChevronUp size={16} className="me-1" />
                      Thứ tự
                    </th>
                    <th className="text-center py-3">Nổi bật</th>
                    <th className="text-center py-3 pe-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category._id} className="category-row border-bottom">
                      <td className="ps-3">
                        <div className="category-icon-container rounded d-flex align-items-center justify-content-center" 
                             style={{ width: '40px', height: '40px', background: '#f8f9fa' }}>
                          {category.icon ? (
                            <Image
                              src={category.icon}
                              alt={category.name}
                              style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                            />
                          ) : (
                            <FiGrid size={18} className="text-muted" />
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold">{category.name}</div>
                        <div className="text-muted small">ID: {category._id.substring(0, 8)}...</div>
                      </td>
                      <td className="text-muted">{category.slug}</td>
                      <td>
                        {category.parentCategory ? (
                          <Badge bg="light" text="dark" className="px-2 py-1 border">
                            {getParentCategoryName(category.parentCategory)}
                          </Badge>
                        ) : (
                          <Badge bg="primary" className="bg-primary-subtle text-primary px-2 py-1 border-0">
                            Danh mục gốc
                          </Badge>
                        )}
                      </td>
                      <td className="text-center">
                        <Badge bg="secondary" className="bg-secondary-subtle text-secondary px-2 py-1 border-0">
                          {category.order || 0}
                        </Badge>
                      </td>
                      <td className="text-center">
                        {category.isFeatured ? (
                          <FiStar className="text-warning" size={18} />
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-2 pe-3">
                          <LinkContainer to={`/categories/${category._id}/edit`}>
                            <Button variant="light" size="sm" className="d-flex align-items-center justify-content-center p-2 shadow-sm">
                              <FiEdit size={16} className="text-primary" />
                            </Button>
                          </LinkContainer>
                          <Button
                            variant="light"
                            size="sm"
                            className="d-flex align-items-center justify-content-center p-2 shadow-sm"
                            onClick={() => deleteHandler(category._id)}
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
        .dashboard-widget {
          background-color: #fff;
          border-radius: 0.5rem;
          padding: 1.25rem;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          height: 100%;
        }
        
        .dashboard-widget-icon {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .dashboard-widget-value {
          font-size: 1.75rem;
          font-weight: 600;
        }
        
        .category-row:hover {
          background-color: #f8f9fa;
        }
        
        .bg-primary-subtle {
          background-color: rgba(13, 110, 253, 0.1);
        }
        
        .bg-secondary-subtle {
          background-color: rgba(108, 117, 125, 0.1);
        }
      `}</style>
    </>
  );
};

export default CategoryListScreen; 