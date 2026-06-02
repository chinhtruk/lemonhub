import React, { useState, useEffect } from 'react';
import { Table, Button, Row, Col, Image, Card, Badge, Form, InputGroup, Dropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { 
  FiTrash2, 
  FiEdit, 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiRefreshCw, 
  FiMoreVertical,
  FiEye,
  FiPackage,
  FiDollarSign,
  FiTag,
  FiLayout,
  FiGrid,
  FiList
} from 'react-icons/fi';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';

const ProductListScreen = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    byCategory: {}
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const { data } = await axios.get('/api/products');
      const { data: categoriesData } = await axios.get('/api/categories');
      
      // Calculate statistics
      const statsData = {
        total: data.products.length,
        inStock: data.products.filter(p => p.countInStock > 0).length,
        outOfStock: data.products.filter(p => p.countInStock === 0).length,
        byCategory: {}
      };

      // Calculate products per category
      data.products.forEach(product => {
        if (product.category) {
          const catId = product.category._id;
          if (!statsData.byCategory[catId]) {
            statsData.byCategory[catId] = {
              count: 0,
              name: product.category.name
            };
          }
          statsData.byCategory[catId].count++;
        }
      });
      
      setStats(statsData);
      setCategories(categoriesData);
      setProducts(data.products);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Đã xảy ra lỗi khi tải danh sách sản phẩm'
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const deleteHandler = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        setLoading(true);
        await axios.delete(`/api/products/${id}`);
        setSuccess('Xóa sản phẩm thành công');
        loadProducts();
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Xóa sản phẩm thất bại'
        );
        setLoading(false);
      }
    }
  };

  // Find category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c._id === categoryId);
    return category ? category.name : 'Không phân loại';
  };
  
  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesCategory = 
      categoryFilter === 'all' || 
      product.category?._id === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(value)
      .replace(/\s/g, '');
  };

  // Get stock status badge
  const getStockBadge = (countInStock) => {
    if (countInStock <= 0) {
      return <Badge bg="danger" className="badge-danger" pill>Hết hàng</Badge>;
    } else if (countInStock < 10) {
      return <Badge bg="warning" className="badge-warning" pill>Sắp hết ({countInStock})</Badge>;
    } else {
      return <Badge bg="success" className="badge-success" pill>Còn hàng</Badge>;
    }
  };

  return (
    <div className="product-list-screen">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <h3 className="page-title m-0 fw-bold">Quản lý sản phẩm</h3>
        <div className="d-flex gap-2">
          <div className="btn-group me-2 d-none d-md-flex">
            <Button 
              variant={viewMode === 'list' ? 'light active' : 'light'}
              className="d-flex align-items-center"
              onClick={() => setViewMode('list')}
            >
              <FiList size={16} />
            </Button>
            <Button 
              variant={viewMode === 'grid' ? 'light active' : 'light'}
              className="d-flex align-items-center" 
              onClick={() => setViewMode('grid')}
            >
              <FiGrid size={16} />
            </Button>
          </div>
          <LinkContainer to="/products/new">
            <Button variant="warning" className="d-flex align-items-center gap-2">
              <FiPlus size={16} /> Thêm sản phẩm
            </Button>
          </LinkContainer>
        </div>
      </div>

      {success && <Message variant="success">{success}</Message>}
      {error && <Message variant="danger">{error}</Message>}

      <div className="dashboard-widget mb-4">
        <Row className="mb-4 g-3">
          <Col lg={3} md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="dashboard-widget-icon rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: '50px', height: '50px', backgroundColor: 'rgba(33, 150, 243, 0.15)', color: '#2196F3' }}>
                    <FiPackage size={22} />
                  </div>
                </div>
                <h4 className="fw-bold mb-1">{stats.total}</h4>
                <p className="text-muted small mb-0">Tổng số sản phẩm</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3} md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="dashboard-widget-icon rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: '50px', height: '50px', backgroundColor: 'rgba(76, 175, 80, 0.15)', color: '#4CAF50' }}>
                    <FiDollarSign size={22} />
                  </div>
                </div>
                <h4 className="fw-bold mb-1">{stats.inStock}</h4>
                <p className="text-muted small mb-0">Còn hàng</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3} md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="dashboard-widget-icon rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: '50px', height: '50px', backgroundColor: 'rgba(244, 67, 54, 0.15)', color: '#F44336' }}>
                    <FiTag size={22} />
                  </div>
                </div>
                <h4 className="fw-bold mb-1">{stats.outOfStock}</h4>
                <p className="text-muted small mb-0">Hết hàng</p>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="dashboard-widget-icon rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: '50px', height: '50px', backgroundColor: 'rgba(156, 39, 176, 0.15)', color: '#9C27B0' }}>
                    <FiGrid size={22} />
                  </div>
                </div>
                <h4 className="fw-bold mb-1">{categories.length}</h4>
                <p className="text-muted small mb-0">Danh mục</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4 g-3">
          <Col lg={5} md={6}>
            <InputGroup className="shadow-sm rounded-3 overflow-hidden">
              <InputGroup.Text className="bg-white text-muted border-end-0">
                <FiSearch size={18} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Tìm theo tên, mã, thương hiệu..."
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border-start-0 ps-0 shadow-none"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name} ({stats.byCategory[category._id]?.count || 0})
                  </option>
                ))}
              </Form.Select>
            </InputGroup>
          </Col>
          <Col lg={3} className="d-flex justify-content-end gap-2">
            <Button 
              variant="light" 
              className="shadow-sm d-flex align-items-center justify-content-center px-3"
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              title={viewMode === 'list' ? 'Chuyển sang dạng lưới' : 'Chuyển sang dạng danh sách'}
            >
              {viewMode === 'list' ? <FiGrid size={16} /> : <FiList size={16} />}
            </Button>
            <Button 
              variant="light" 
              className="shadow-sm d-flex align-items-center justify-content-center px-3"
              onClick={loadProducts}
              title="Làm mới danh sách"
            >
              <FiRefreshCw size={16} />
            </Button>
          </Col>
        </Row>

        {loading ? (
          <Loader />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3" style={{ color: '#ccc' }}>
              <FiPackage size={50} />
            </div>
            <h5 className="fw-semibold text-muted mb-2">Không tìm thấy sản phẩm</h5>
            <p className="text-muted mb-0">Không có sản phẩm nào phù hợp với tìm kiếm của bạn</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 product-table">
              <thead>
                <tr>
                  <th style={{width: '60px'}}></th>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá bán</th>
                  <th className="text-center">Tồn kho</th>
                  <th className="text-end" style={{width: '120px'}}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="product-row">
                    <td>
                      <div className="product-image rounded-3 overflow-hidden shadow-sm" style={{ width: '50px', height: '50px', background: '#f8f9fa' }}>
                        <Image
                          src={product.image}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="product-info">
                        <span className="product-name fw-medium d-block">{product.name}</span>
                        <div className="d-flex align-items-center mt-1">
                          <span className="product-brand text-muted small me-2">
                            {product.brand}
                          </span>
                          {product.salePrice > 0 && (
                            <Badge bg="danger" className="badge-danger">Giảm giá</Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge bg="light" className="text-secondary border" pill>
                        {getCategoryName(product.category)}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex flex-column">
                        <span className="fw-semibold" style={{ color: product.salePrice > 0 ? '#F44336' : '#333' }}>
                          {formatCurrency(product.salePrice > 0 ? product.salePrice : product.price)}
                        </span>
                        {product.salePrice > 0 && (
                          <span className="text-muted small text-decoration-line-through">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      {getStockBadge(product.countInStock)}
                    </td>
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <LinkContainer to={`/products/${product._id}/edit`}>
                          <Button variant="light" size="sm" className="d-flex align-items-center justify-content-center p-2">
                            <FiEdit size={16} />
                          </Button>
                        </LinkContainer>
                        <Button 
                          variant="light" 
                          size="sm" 
                          className="d-flex align-items-center justify-content-center p-2 text-danger" 
                          onClick={() => deleteHandler(product._id)}
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
        ) : (
          <Row className="g-3">
            {filteredProducts.map((product) => (
              <Col lg={3} md={4} sm={6} key={product._id}>
                <div className="product-card h-100 p-3 rounded-3 border" style={{ transition: 'all 0.2s ease' }}>
                  <div className="position-relative mb-3">
                    <div className="product-image-grid rounded-3 overflow-hidden" style={{ height: '180px', background: '#f8f9fa' }}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    {product.salePrice > 0 && (
                      <div className="position-absolute top-0 start-0 m-2">
                        <Badge bg="danger" className="badge-danger">
                          -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                        </Badge>
                      </div>
                    )}
                    <div className="position-absolute top-0 end-0 m-2">
                      <Dropdown align="end">
                        <Dropdown.Toggle variant="light" size="sm" className="p-1 border-0 shadow-sm" style={{ width: '30px', height: '30px' }}>
                          <FiMoreVertical size={16} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="shadow-sm">
                          <LinkContainer to={`/products/${product._id}/edit`}>
                            <Dropdown.Item className="d-flex align-items-center">
                              <FiEdit size={14} className="me-2" /> Chỉnh sửa
                            </Dropdown.Item>
                          </LinkContainer>
                          <Dropdown.Item onClick={() => deleteHandler(product._id)} className="d-flex align-items-center text-danger">
                            <FiTrash2 size={14} className="me-2" /> Xóa
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>
                  <div className="product-info-grid">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <Badge bg="light" className="text-secondary border" pill>
                          {getCategoryName(product.category)}
                        </Badge>
                      </div>
                      <div>
                        {getStockBadge(product.countInStock)}
                      </div>
                    </div>
                    <h5 className="product-name text-truncate mb-1" style={{ fontSize: '0.95rem' }}>{product.name}</h5>
                    <div className="product-brand text-muted small mb-2">{product.brand}</div>
                    <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                      <div className="d-flex flex-column">
                        <span className="fw-semibold" style={{ color: product.salePrice > 0 ? '#F44336' : '#333' }}>
                          {formatCurrency(product.salePrice > 0 ? product.salePrice : product.price)}
                        </span>
                        {product.salePrice > 0 && (
                          <span className="text-muted small text-decoration-line-through">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                      </div>
                      <LinkContainer to={`/products/${product._id}/edit`}>
                        <Button 
                          variant="warning" 
                          size="sm" 
                          className="d-flex align-items-center justify-content-center p-1"
                          style={{ width: '32px', height: '32px' }}
                        >
                          <FiEdit size={14} />
                        </Button>
                      </LinkContainer>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default ProductListScreen;