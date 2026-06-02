import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import CustomInputGroup from '../components/forms/CustomInputGroup';
import { FiArrowLeft, FiUpload, FiPlus, FiType, FiDollarSign, FiPackage, FiLayers, FiAlignLeft, FiTag, FiSave, FiStar, FiInfo } from 'react-icons/fi';

const ProductCreateScreen = () => {
  const navigate = useNavigate();
  
  // Product states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Categories for dropdown
  const [categories, setCategories] = useState([]);
  
  // Loading and error states
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    // Fetch categories for dropdown
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/categories');
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Generate slug from name
  const generateSlug = (nameValue) => {
    const slugText = nameValue
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
  
  // Auto-generate slug when name changes
  useEffect(() => {
    if (name) {
      const newSlug = generateSlug(name);
      setSlug(newSlug);
    }
  }, [name]);
  
  // Ensure slug is always set before submitting
  const validateSlug = () => {
    if (!slug && name) {
      const newSlug = generateSlug(name);
      setSlug(newSlug);
      return newSlug;
    }
    return slug;
  };
  
  const uploadFileHandler = async (e) => {
    const files = Array.from(e.target.files);
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('images', file);
    });
    
    setUploading(true);
    
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      const { data } = await axios.post('/api/upload/multiple', formData, config);
      // Extract image paths from response
      const uploadedImages = data.images || [];
      setImages(prevImages => [...prevImages, ...uploadedImages]);
      setUploading(false);
    } catch (error) {
      console.error(error);
      setError('Lỗi khi tải ảnh lên');
      setUploading(false);
    }
  };
  
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      // Validate required fields
      if (!name || !price || !category || !brand) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
      }

      // Validate images
      if (!images || images.length === 0) {
        throw new Error('Vui lòng tải lên ít nhất một hình ảnh');
      }

      // Ensure slug exists
      const currentSlug = validateSlug();
      if (!currentSlug) {
        throw new Error('Không thể tạo slug từ tên sản phẩm');
      }
      
      // Chuẩn bị dữ liệu sản phẩm
      const productData = {
        name,
        slug: currentSlug,
        price: Number(price),
        description,
        image: images[0], // Ảnh chính là ảnh đầu tiên
        images: images.slice(1), // Các ảnh còn lại là ảnh phụ
        brand,
        category,
        countInStock: Number(countInStock),
        isFeatured
      };

      console.log('Product data to submit:', JSON.stringify(productData, null, 2));

      const response = await axios.post('/api/products', productData);
      console.log('Create product response:', response.data);
      setSuccess('Tạo sản phẩm thành công');
      
      // Navigate back after 2 seconds
      setTimeout(() => {
        navigate('/products');
      }, 2000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Không thể tạo sản phẩm';
      console.error('Error creating product:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="page-title m-0 fw-bold">Thêm sản phẩm mới</h3>
          <p className="text-muted mb-0 mt-1">
            Tạo sản phẩm mới trong hệ thống
          </p>
        </div>
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate('/products')}
          className="d-flex align-items-center gap-2"
        >
          <FiArrowLeft size={16} /> Quay lại
        </Button>
      </div>
      
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-light border-0 py-3 d-flex align-items-center">
          <FiPlus className="text-primary me-2" size={18} />
          <h5 className="m-0 fw-medium">Thông tin sản phẩm</h5>
        </Card.Header>
        <Card.Body className="p-4">
          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : success ? (
            <Message variant="success">{success}</Message>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Tên sản phẩm</Form.Label>
                    <CustomInputGroup>
                      <FiType className="input-icon" />
                      <Form.Control
                        type="text"
                        placeholder="Nhập tên sản phẩm"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="ps-4"
                      />
                    </CustomInputGroup>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Slug</Form.Label>
                    <CustomInputGroup>
                      <FiTag className="input-icon" />
                      <Form.Control
                        type="text"
                        placeholder="slug-san-pham"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="ps-4"
                        required
                      />
                    </CustomInputGroup>
                    <Form.Text className="text-muted">
                      Slug được tạo tự động từ tên sản phẩm, có thể chỉnh sửa nếu cần
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Giá</Form.Label>
                    <CustomInputGroup>
                      <FiDollarSign className="input-icon" />
                      <Form.Control
                        type="number"
                        placeholder="Nhập giá sản phẩm"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className="ps-4"
                      />
                    </CustomInputGroup>
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">Thương hiệu</Form.Label>
                        <CustomInputGroup>
                          <FiPackage className="input-icon" />
                          <Form.Control
                            type="text"
                            placeholder="Nhập thương hiệu"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            className="ps-4"
                          />
                        </CustomInputGroup>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">Số lượng trong kho</Form.Label>
                        <CustomInputGroup>
                          <FiLayers className="input-icon" />
                          <Form.Control
                            type="number"
                            placeholder="Nhập số lượng"
                            value={countInStock}
                            onChange={(e) => setCountInStock(e.target.value)}
                            required
                            className="ps-4"
                          />
                        </CustomInputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Danh mục</Form.Label>
                    <CustomInputGroup>
                      <FiLayers className="input-icon" />
                      <Form.Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="ps-4"
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </Form.Select>
                    </CustomInputGroup>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Mô tả</Form.Label>
                    <CustomInputGroup>
                      <FiAlignLeft className="input-icon" />
                      <Form.Control
                        as="textarea"
                        rows={6}
                        placeholder="Nhập mô tả sản phẩm"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="ps-4"
                      />
                    </CustomInputGroup>
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className="bg-light border-0 py-3">
                      <h6 className="m-0 fw-medium">Hình ảnh sản phẩm</h6>
                    </Card.Header>
                    <Card.Body className="p-3">
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">Hình ảnh sản phẩm</Form.Label>
                        <div className="image-upload-container">
                          <div className="mb-3">
                            <label className="upload-btn btn btn-outline-primary d-flex align-items-center gap-2">
                              <FiUpload size={16} /> Chọn nhiều ảnh
                              <Form.Control
                                type="file"
                                onChange={uploadFileHandler}
                                className="d-none"
                                multiple
                                accept="image/*"
                              />
                            </label>
                            {uploading && <Loader size="sm" className="mt-2" />}
                          </div>
                          
                          {images.length > 0 && (
                            <div className="selected-images mt-3">
                              <div style={{ 
                                maxHeight: '200px', 
                                overflowX: 'auto',
                                overflowY: 'hidden',
                                padding: '5px',
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '10px'
                              }}>
                                {images.map((img, index) => (
                                  <div key={index} className="position-relative" style={{ 
                                    flexShrink: 0,
                                    width: '150px'
                                  }}>
                                    <div style={{ 
                                      paddingTop: '75%', 
                                      position: 'relative',
                                      overflow: 'hidden',
                                      borderRadius: '0.375rem',
                                      border: '1px solid #dee2e6'
                                    }}>
                                      <Image 
                                        src={img}
                                        alt={`Product image ${index + 1}`}
                                        style={{
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'contain',
                                          padding: '0.25rem'
                                        }}
                                      />
                                    </div>
                                    <Button 
                                      variant="danger" 
                                      size="sm" 
                                      className="position-absolute top-0 end-0 m-1 p-0 d-flex align-items-center justify-content-center"
                                      style={{ width: '20px', height: '20px', minWidth: 'unset' }}
                                      onClick={() => removeImage(index)}
                                    >
                                      ×
                                    </Button>
                                    {index === 0 && (
                                      <div className="position-absolute bottom-0 start-0 end-0 bg-primary text-white text-center py-1 small">
                                        Ảnh chính
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div className="text-muted mt-2 small">
                                <FiInfo className="me-1" /> Ảnh đầu tiên sẽ là ảnh chính hiển thị trong danh sách sản phẩm
                              </div>
                            </div>
                          )}
                        </div>
                      </Form.Group>
                    </Card.Body>
                  </Card>
                  
                  <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className="bg-light border-0 py-3">
                      <h6 className="m-0 fw-medium">Cài đặt</h6>
                    </Card.Header>
                    <Card.Body className="p-3">
                      <Form.Group className="mb-0">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="featuredSwitch"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                          />
                          <label className="form-check-label fw-medium" htmlFor="featuredSwitch">
                            <FiStar className="me-1" size={16} /> Sản phẩm nổi bật
                          </label>
                        </div>
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button 
                  variant="light" 
                  onClick={() => navigate('/products')}
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
                  Tạo sản phẩm
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
      
      <style>
        {`
          .input-icon {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 10;
            color: #6c757d;
            font-size: 1rem;
          }
        `}
      </style>
    </>
  );
};

export default ProductCreateScreen; 