import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Image } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { FiArrowLeft, FiTag, FiLayers, FiType, FiAlignLeft, FiStar, FiList, FiSave } from 'react-icons/fi';
import { FaLaptop, FaMobileAlt, FaHeadphones, FaTshirt, 
  FaHome, FaBook, FaBaby, FaUtensils, FaCar, FaGamepad, FaCamera, FaTools } from 'react-icons/fa';

const CategoryEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategory, setParentCategory] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [order, setOrder] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState('');
  
  const [categories, setCategories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const isNewCategory = id === 'new';

  // Predefined icons for categories
  const categoryIcons = [
    { id: 'laptop', name: 'Máy tính', icon: <FaLaptop size={30} />, value: 'FaLaptop' },
    { id: 'mobile', name: 'Điện thoại', icon: <FaMobileAlt size={30} />, value: 'FaMobileAlt' },
    { id: 'headphones', name: 'Âm thanh', icon: <FaHeadphones size={30} />, value: 'FaHeadphones' },
    { id: 'clothing', name: 'Thời trang', icon: <FaTshirt size={30} />, value: 'FaTshirt' },
    { id: 'home', name: 'Nhà cửa', icon: <FaHome size={30} />, value: 'FaHome' },
    { id: 'book', name: 'Sách', icon: <FaBook size={30} />, value: 'FaBook' },
    { id: 'baby', name: 'Mẹ & Bé', icon: <FaBaby size={30} />, value: 'FaBaby' },
    { id: 'food', name: 'Thực phẩm', icon: <FaUtensils size={30} />, value: 'FaUtensils' },
    { id: 'car', name: 'Ô tô', icon: <FaCar size={30} />, value: 'FaCar' },
    { id: 'game', name: 'Game', icon: <FaGamepad size={30} />, value: 'FaGamepad' },
    { id: 'camera', name: 'Máy ảnh', icon: <FaCamera size={30} />, value: 'FaCamera' },
    { id: 'tool', name: 'Công cụ', icon: <FaTools size={30} />, value: 'FaTools' },
  ];
  
  // Auto-suggest icon based on category name
  useEffect(() => {
    if (name && !selectedIcon) {
      const nameLower = name.toLowerCase();
      // Try to find a matching icon based on name
      const matchedIcon = categoryIcons.find(icon => 
        nameLower.includes(icon.name.toLowerCase()) || 
        icon.name.toLowerCase().includes(nameLower)
      );
      
      if (matchedIcon) {
        setSelectedIcon(matchedIcon.value);
      }
    }
  }, [name, selectedIcon]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/categories');
        // Filter out the current category to avoid self-referencing in parent selection
        const filteredCategories = isNewCategory 
          ? data 
          : data.filter(category => category._id !== id);
        setCategories(filteredCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();

    if (!isNewCategory) {
      const fetchCategory = async () => {
        try {
          setLoading(true);
          const { data } = await axios.get(`/api/categories/${id}`);
          setName(data.name);
          setSlug(data.slug);
          setDescription(data.description || '');
          setParentCategory(data.parentCategory || '');
          setIsFeatured(data.isFeatured);
          setOrder(data.order || 0);
          
          // Extract icon name from path if it exists
          if (data.icon) {
            const iconName = data.icon.split('/').pop().replace('.svg', '');
            setSelectedIcon(iconName);
          }
          
          setLoading(false);
        } catch (error) {
          setError(
            error.response && error.response.data.message
              ? error.response.data.message
              : 'Đã xảy ra lỗi'
          );
          setLoading(false);
        }
      };
      fetchCategory();
    } else {
      setLoading(false);
    }
  }, [id, isNewCategory]);

  const generateSlug = () => {
    const slugText = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    setSlug(slugText);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoadingUpdate(true);
    setError('');
    setSuccess('');

    try {
      // Generate icon URL based on selected icon
      const iconUrl = selectedIcon ? `/icons/${selectedIcon}.svg` : '';
      
      const categoryData = {
        name,
        slug,
        icon: iconUrl,
        description,
        parentCategory: parentCategory || null,
        isFeatured,
        order,
      };

      if (isNewCategory) {
        await axios.post('/api/categories', categoryData);
        setSuccess('Tạo danh mục thành công');
      } else {
        await axios.put(`/api/categories/${id}`, categoryData);
        setSuccess('Cập nhật danh mục thành công');
      }

      setLoadingUpdate(false);
      setTimeout(() => {
        navigate('/categories');
      }, 1000);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Cập nhật thất bại'
      );
      setLoadingUpdate(false);
    }
  };

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="page-title m-0 fw-bold">{isNewCategory ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}</h3>
          <p className="text-muted mb-0 mt-1">
            {isNewCategory ? 'Tạo danh mục mới trong hệ thống' : 'Cập nhật thông tin danh mục hiện có'}
          </p>
        </div>
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate('/categories')}
          className="d-flex align-items-center gap-2"
        >
          <FiArrowLeft size={16} /> Quay lại
        </Button>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Card className="border-0 shadow-sm">
          {success && <Message variant="success">{success}</Message>}
          <Card.Header className="bg-light border-0 py-3 d-flex align-items-center">
            <FiTag className="text-primary me-2" size={18} />
            <h5 className="m-0 fw-medium">Thông tin danh mục</h5>
          </Card.Header>
          <Card.Body className="p-4">
            <Form onSubmit={submitHandler}>
              <Row>
                <Col lg={6}>
                  <Form.Group controlId="name" className="mb-3">
                    <Form.Label className="fw-medium">Tên danh mục</Form.Label>
                    <InputGroup>
                      <FiType className="input-icon" />
                      <Form.Control
                        type="text"
                        placeholder="Nhập tên danh mục"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="ps-4"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group controlId="slug" className="mb-3">
                    <Form.Label className="fw-medium">Slug</Form.Label>
                    <div className="d-flex">
                      <InputGroup className="flex-grow-1">
                        <FiTag className="input-icon" />
                        <Form.Control
                          type="text"
                          placeholder="slug-danh-muc"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          required
                          className="ps-4 rounded-end-0"
                        />
                      </InputGroup>
                      <Button 
                        variant="outline-secondary" 
                        className="rounded-start-0"
                        onClick={generateSlug}
                      >
                        Tạo
                      </Button>
                    </div>
                  </Form.Group>

                  <Form.Group controlId="parentCategory" className="mb-3">
                    <Form.Label className="fw-medium">Danh mục cha</Form.Label>
                    <InputGroup>
                      <FiLayers className="input-icon" />
                      <Form.Select
                        value={parentCategory}
                        onChange={(e) => setParentCategory(e.target.value)}
                        className="ps-4"
                      >
                        <option value="">Không có</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </Form.Select>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group controlId="description" className="mb-3">
                    <Form.Label className="fw-medium">Mô tả</Form.Label>
                    <InputGroup>
                      <FiAlignLeft className="input-icon" />
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Nhập mô tả danh mục"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="ps-4"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Row className="mb-4">
                    <Col md={6}>
                      <Form.Group controlId="order">
                        <Form.Label className="fw-medium">Thứ tự sắp xếp</Form.Label>
                        <InputGroup>
                          <FiList className="input-icon" />
                          <Form.Control
                            type="number"
                            value={order}
                            onChange={(e) => setOrder(Number(e.target.value))}
                            className="ps-4"
                          />
                        </InputGroup>
                        <Form.Text className="text-muted">
                          Số thấp hơn sẽ được hiển thị trước
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="isFeatured" className="mb-3 mt-2">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="featuredSwitch"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                          />
                          <label className="form-check-label fw-medium" htmlFor="featuredSwitch">
                            <FiStar className="me-1" size={16} /> Danh mục nổi bật
                          </label>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>

                <Col lg={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium d-block">Biểu tượng danh mục</Form.Label>
                    <div className="mb-3">
                      <Row className="g-3">
                        {categoryIcons.map((iconObj) => (
                          <Col key={iconObj.id} xs={4} sm={3} md={3}>
                            <Card 
                              className={`text-center p-2 h-100 icon-card ${selectedIcon === iconObj.value ? 'selected-icon' : ''}`}
                              onClick={() => setSelectedIcon(iconObj.value)}
                            >
                              <div className="d-flex flex-column align-items-center justify-content-center">
                                {iconObj.icon}
                                <small className="mt-2">{iconObj.name}</small>
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                    <Form.Text className="text-muted">
                      Chọn biểu tượng phù hợp với danh mục của bạn
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button 
                  variant="light" 
                  onClick={() => navigate('/categories')}
                  className="fw-medium"
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={loadingUpdate}
                  className="d-flex align-items-center gap-2 px-4 fw-medium"
                >
                  <FiSave size={16} />
                  {loadingUpdate ? 'Đang lưu...' : 'Lưu danh mục'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      <style jsx>{`
        .input-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          color: #6c757d;
          font-size: 1rem;
        }
        
        .icon-card {
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid #dee2e6;
        }
        
        .icon-card:hover {
          border-color: #adb5bd;
          background-color: #f8f9fa;
        }
        
        .selected-icon {
          background-color: #0d6efd;
          color: white;
          border-color: #0d6efd;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </>
  );
};

const InputGroup = ({ children }) => {
  return (
    <div className="position-relative">
      {children}
    </div>
  );
};

export default CategoryEditScreen; 