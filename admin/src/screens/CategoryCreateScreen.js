import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { FiArrowLeft, FiPlus, FiType, FiAlignLeft, FiList, FiStar, FiSave, FiSmartphone, FiMonitor, FiHeadphones, FiWatch, FiTablet, FiCpu, FiHardDrive, FiWifi, FiCamera, FiPrinter, FiTool, FiPackage } from 'react-icons/fi';
import { FaLaptop, FaMobileAlt, FaTshirt, FaHome, FaBook, FaBaby, FaUtensils, FaCar, FaGamepad, FaCamera, FaTools } from 'react-icons/fa';
import { toast } from 'react-toastify';

const CategoryCreateScreen = () => {
  const navigate = useNavigate();
  
  // Category states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const icons = [
    { icon: <FiSmartphone size={24} />, label: 'Điện thoại', value: 'smartphone' },
    { icon: <FiMonitor size={24} />, label: 'Máy tính', value: 'monitor' },
    { icon: <FiHeadphones size={24} />, label: 'Âm thanh', value: 'headphones' },
    { icon: <FiWatch size={24} />, label: 'Đồng hồ thông minh', value: 'watch' },
    { icon: <FiTablet size={24} />, label: 'Máy tính bảng', value: 'tablet' },
    { icon: <FiCpu size={24} />, label: 'Linh kiện', value: 'cpu' },
    { icon: <FiHardDrive size={24} />, label: 'Thiết bị lưu trữ', value: 'storage' },
    { icon: <FiWifi size={24} />, label: 'Thiết bị mạng', value: 'network' },
    { icon: <FiCamera size={24} />, label: 'Máy ảnh', value: 'camera' },
    { icon: <FiPrinter size={24} />, label: 'Máy in', value: 'printer' },
    { icon: <FiTool size={24} />, label: 'Phụ kiện', value: 'accessories' },
    { icon: <FiPackage size={24} />, label: 'Thiết bị khác', value: 'other' }
  ];
  
  // Auto-suggest icon based on category name
  useEffect(() => {
    if (name) {
      const nameLower = name.toLowerCase();
      // Try to find a matching icon based on name
      const matchedIcon = icons.find(icon => 
        nameLower.includes(icon.label.toLowerCase()) || 
        icon.label.toLowerCase().includes(nameLower)
      );
      
      if (matchedIcon) {
        setSelectedIcon(matchedIcon.value);
      }
    }
  }, [name]);
  
  // Auto-generate slug when name changes
  useEffect(() => {
    if (name) {
      const newSlug = generateSlug(name);
      setSlug(newSlug);
    }
  }, [name]);
  
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const { data } = await axios.post('/api/upload', formData, config);
      setImage(data);
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };
  
  // Generate slug from name
  const generateSlug = (text) => {
    if (!text) return '';
    
    const slugText = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slugText;
  };
  
  // Handle name change and auto-generate slug
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    setSlug(generateSlug(newName));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!slug) {
      setError('Slug là bắt buộc');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Chuẩn bị dữ liệu để gửi
      const categoryData = {
        name,
        slug,
        description,
        icon: selectedIcon,
        order,
        isFeatured
      };
      
      // Chỉ thêm hình ảnh nếu có
      if (image) {
        categoryData.image = image;
      }
      
      await axios.post('/api/categories', categoryData);
      
      toast.success('Tạo danh mục thành công');
      navigate('/categories');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo danh mục');
      setLoading(false);
    }
  };
  
  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="page-title m-0 fw-bold">Thêm danh mục mới</h3>
          <p className="text-muted mb-0 mt-1">
            Tạo danh mục sản phẩm mới cho hệ thống
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
      
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-light border-0 py-3 d-flex align-items-center">
          <FiPlus className="text-primary me-2" size={18} />
          <h5 className="m-0 fw-medium">Thông tin danh mục</h5>
        </Card.Header>
        <Card.Body className="p-4">
          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col lg={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Tên danh mục</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập tên danh mục"
                      value={name}
                      onChange={handleNameChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Slug</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Slug sẽ được tự động tạo"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                    />
                    <Form.Text className="text-muted">
                      Slug sẽ được sử dụng trong URL. Ví dụ: dien-thoai-di-dong
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Hình ảnh</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={uploadFileHandler}
                      accept="image/*"
                    />
                    {uploading && <Loader />}
                    {image && (
                      <Image
                        src={image}
                        alt="Category preview"
                        className="mt-2"
                        style={{ maxWidth: '200px' }}
                      />
                    )}
                    <Form.Text className="text-muted">
                      Tải lên hình ảnh cho danh mục (không bắt buộc)
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Mô tả</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Nhập mô tả danh mục (không bắt buộc)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="ps-4"
                    />
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">Thứ tự hiển thị</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Nhập thứ tự hiển thị"
                          value={order}
                          onChange={(e) => setOrder(Number(e.target.value))}
                          required
                          className="ps-4"
                        />
                        <Form.Text className="text-muted">
                          Số nhỏ hơn sẽ hiển thị trước
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3 mt-2">
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
                        {icons.map((item) => (
                          <Col key={item.value} xs={6} sm={4} md={3}>
                            <Card 
                              className={`text-center p-3 cursor-pointer ${selectedIcon === item.value ? 'border-primary' : ''}`}
                              onClick={() => setSelectedIcon(item.value)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="mb-2">{item.icon}</div>
                              <small>{item.label}</small>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                    <Form.Text className="text-muted">
                      Hệ thống đã tự động chọn biểu tượng phù hợp với tên danh mục. Bạn có thể chọn một biểu tượng khác nếu muốn.
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
                  variant="primary" 
                  type="submit"
                  className="d-flex align-items-center gap-2 px-4 fw-medium"
                >
                  <FiSave size={16} />
                  Tạo danh mục
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
      
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

export default CategoryCreateScreen; 