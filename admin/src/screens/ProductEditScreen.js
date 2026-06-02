import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Image } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { FiArrowLeft, FiUpload, FiEdit, FiType, FiDollarSign, FiPackage, FiLayers, 
  FiAlignLeft, FiTag, FiSave, FiStar, FiPlus, FiTrash2, FiList, FiImage, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [specifications, setSpecifications] = useState({});
  
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const isNewProduct = id === 'new';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/categories');
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();

    if (!isNewProduct) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const { data } = await axios.get(`/api/products/${id}`);
          setName(data.name);
          setPrice(data.price);
          setSalePrice(data.salePrice || 0);
          
          // Xử lý ảnh sản phẩm
          if (data.image) {
            setMainImage(data.image);
            // Thêm ảnh chính vào danh sách ảnh
            const allImages = [data.image];
            
            // Thêm các ảnh phụ nếu có
            if (Array.isArray(data.images) && data.images.length > 0) {
              // Chỉ thêm những ảnh không trùng với ảnh chính
              const additionalImages = data.images.filter(img => img !== data.image);
              allImages.push(...additionalImages);
            }
            
            setImages(allImages);
          } else {
            setImages([]);
            setMainImage('');
          }
          
          setBrand(data.brand);
          setCategory(data.category);
          setCountInStock(data.countInStock);
          setDescription(data.description);
          setSlug(data.slug);
          setIsFeatured(data.isFeatured);
          setSpecifications(data.specifications || {});
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
      fetchProduct();
    } else {
      setLoading(false);
    }
  }, [id, isNewProduct]);

  // Auto-generate slug when name changes
  useEffect(() => {
    if (name && !slug) {
      const slugText = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/([^0-9a-z-\s])/g, '')
        .replace(/(\s+)/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(slugText);
    }
  }, [name, slug]);

  const uploadFileHandler = async (e) => {
    const files = Array.from(e.target.files);
    const formData = new FormData();
    
    // Thêm tất cả file vào FormData
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
      setImages(prevImages => [...prevImages, ...data.images]);
      
      // Nếu là ảnh đầu tiên, đặt làm ảnh chính
      if (images.length === 0 && data.images.length > 0) {
        setMainImage(data.images[0]);
      }
      
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const updatedImages = [...images];
    const removedImage = updatedImages[index];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
    
    // Nếu xóa ảnh chính, cập nhật ảnh chính mới nếu còn ảnh
    if (removedImage === mainImage && updatedImages.length > 0) {
      setMainImage(updatedImages[0]);
    } else if (updatedImages.length === 0) {
      setMainImage('');
    }
  };
  
  const setAsMainImage = (index) => {
    setMainImage(images[index]);
  };

  const handleSpecChange = (key, value) => {
    setSpecifications({
      ...specifications,
      [key]: value,
    });
  };

  const addSpecification = () => {
    const newKey = `spec${Object.keys(specifications).length + 1}`;
    setSpecifications({
      ...specifications,
      [newKey]: '',
    });
  };

  const removeSpecification = (key) => {
    const newSpecs = { ...specifications };
    delete newSpecs[key];
    setSpecifications(newSpecs);
  };

  const generateSlug = () => {
    if (!name) {
      toast.error('Vui lòng nhập tên sản phẩm trước khi tạo slug');
      return;
    }
    const slugText = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(slugText);
  };

  // Ensure slug is always validated before submission
  const validateSlug = () => {
    if (!slug && name) {
      const slugText = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/([^0-9a-z-\s])/g, '')
        .replace(/(\s+)/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(slugText);
      return slugText;
    }
    return slug;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoadingUpdate(true);
    setError('');
    setSuccess('');

    try {
      // Đảm bảo ảnh chính đã được chọn
      if (!mainImage && images.length > 0) {
        setMainImage(images[0]);
      }

      // Validate required fields
      if (!name || !price || !category || !brand) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
      }

      // Validate images
      if (!mainImage && (!images || images.length === 0)) {
        throw new Error('Vui lòng tải lên ít nhất một hình ảnh');
      }

      // Validate slug
      const currentSlug = validateSlug();
      if (!currentSlug) {
        throw new Error('Không thể tạo slug từ tên sản phẩm');
      }
      
      // Chuẩn bị dữ liệu sản phẩm, tách ảnh chính và ảnh phụ
      const productData = {
        name,
        slug,
        price: Number(price),
        salePrice: Number(salePrice),
        description,
        image: mainImage,
        // Lọc bỏ ảnh chính khỏi mảng images để tránh lặp lại
        images: images.filter(img => img !== mainImage),
        brand,
        category,
        countInStock: Number(countInStock),
        isFeatured,
        specifications
      };

      console.log('Product data to submit:', JSON.stringify(productData, null, 2));

      if (isNewProduct) {
        const response = await axios.post('/api/products', productData);
        console.log('Create product response:', response.data);
        toast.success('Tạo sản phẩm thành công');
        navigate('/products');
      } else {
        const response = await axios.put(`/api/products/${id}`, productData);
        console.log('Update product response:', response.data);
        toast.success('Cập nhật sản phẩm thành công');
        navigate('/products');
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Thao tác thất bại';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="page-title m-0 fw-bold">{isNewProduct ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}</h3>
          <p className="text-muted mb-0 mt-1">
            {isNewProduct ? 'Tạo sản phẩm mới trong hệ thống' : 'Cập nhật thông tin sản phẩm hiện có'}
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

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          {success && <Message variant="success">{success}</Message>}
          
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-light border-0 py-3 d-flex align-items-center">
              <FiEdit className="text-primary me-2" size={18} />
              <span className="fw-bold">Thông tin sản phẩm</span>
            </Card.Header>
            <Card.Body className="pt-4">
              <Form onSubmit={submitHandler}>
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="d-flex align-items-center">
                        <FiType className="me-2 text-primary" /> Tên sản phẩm
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập tên sản phẩm"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                        }}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="d-flex align-items-center">
                        <FiTag className="me-2 text-primary" /> Slug
                      </Form.Label>
                      <div className="d-flex">
                        <Form.Control
                          type="text"
                          placeholder="url-friendly-name"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          required
                        />
                        <Button
                          variant="outline-secondary"
                          className="ms-2"
                          onClick={generateSlug}
                          type="button"
                        >
                          Tạo Slug
                        </Button>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="d-flex align-items-center">
                        <FiDollarSign className="me-2 text-primary" /> Giá (VNĐ)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Nhập giá sản phẩm"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="d-flex align-items-center">
                        <FiDollarSign className="me-2 text-primary" /> Giá khuyến mãi (VNĐ) (nếu có)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Nhập giá khuyến mãi"
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="d-flex align-items-center">
                        <FiPackage className="me-2 text-primary" /> Thương hiệu
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập thương hiệu"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="d-flex align-items-center">
                        <FiLayers className="me-2 text-primary" /> Danh mục
                      </Form.Label>
                      <Form.Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      >
                        <option value="">Chọn danh mục...</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="d-flex align-items-center">
                        <FiPackage className="me-2 text-primary" /> Số lượng trong kho
                      </Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Nhập số lượng"
                        value={countInStock}
                        onChange={(e) => setCountInStock(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="d-flex align-items-center">
                        <FiAlignLeft className="me-2 text-primary" /> Mô tả
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="Nhập mô tả sản phẩm"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label={
                          <span className="d-flex align-items-center">
                            <FiStar className="me-2 text-warning" /> Sản phẩm nổi bật
                          </span>
                        }
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Images Section */}
                <Row className="mb-4">
                  <Col xs={12}>
                    <h5 className="d-flex align-items-center mb-3">
                      <FiImage className="text-primary me-2" /> Hình ảnh sản phẩm
                    </h5>
                    
                    <div className="border rounded p-3 mb-3 bg-light">
                      <p className="small text-muted mb-2 d-flex align-items-center">
                        <FiInfo className="me-1" /> Tải lên nhiều hình ảnh cho sản phẩm. Hình ảnh đầu tiên sẽ được sử dụng làm ảnh chính.
                      </p>
                      
                      <div className="d-flex align-items-center">
                        <Form.Group controlId="formFile" className="mb-0 flex-grow-1">
                          <Form.Control
                            type="file"
                            onChange={uploadFileHandler}
                            multiple
                            accept="image/*"
                            style={{ paddingTop: "0.375rem" }}
                          />
                        </Form.Group>
                        {uploading && <Loader size="sm" className="ms-2" />}
                      </div>
                    </div>
                    
                    {images.length > 0 && (
                      <div className="mb-3">
                        <p className="mb-2 fw-medium">Đã chọn {images.length} hình ảnh:</p>
                        <Row xs={2} sm={3} md={4} lg={6} className="g-2">
                          {images.map((img, index) => (
                            <Col key={index}>
                              <div 
                                className={`position-relative border rounded overflow-hidden product-image-card ${img === mainImage ? 'border-primary' : ''}`}
                                style={{ height: '120px' }}
                              >
                                <Image
                                  src={img}
                                  alt={`Product image ${index + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                                <div className="position-absolute top-0 end-0 p-1 d-flex gap-1">
                                  {img !== mainImage && (
                                    <Button
                                      variant="light"
                                      size="sm"
                                      className="d-flex align-items-center justify-content-center p-1"
                                      onClick={() => setAsMainImage(index)}
                                      title="Đặt làm ảnh chính"
                                      style={{ width: '26px', height: '26px' }}
                                    >
                                      <FiStar size={14} />
                                    </Button>
                                  )}
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    className="d-flex align-items-center justify-content-center p-1"
                                    onClick={() => removeImage(index)}
                                    title="Xóa hình ảnh"
                                    style={{ width: '26px', height: '26px' }}
                                  >
                                    <FiTrash2 size={14} />
                                  </Button>
                                </div>
                                {img === mainImage && (
                                  <div className="position-absolute bottom-0 start-0 end-0 bg-primary text-white text-center py-1 small">
                                    Ảnh chính
                                  </div>
                                )}
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}
                  </Col>
                </Row>

                {/* Specifications Section */}
                <Row className="mb-4">
                  <Col xs={12}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="d-flex align-items-center m-0">
                        <FiList className="text-primary me-2" /> Thông số kỹ thuật
                      </h5>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={addSpecification}
                        className="d-flex align-items-center gap-1"
                      >
                        <FiPlus size={16} /> Thêm thông số
                      </Button>
                    </div>
                    
                    {Object.keys(specifications).length === 0 && (
                      <p className="text-muted small">Chưa có thông số kỹ thuật nào được thêm vào.</p>
                    )}
                    
                    {Object.keys(specifications).map((key) => (
                      <Row key={key} className="mb-2 align-items-center">
                        <Col xs={12} md={5}>
                          <Form.Control
                            placeholder="Tên thông số (VD: RAM, CPU...)"
                            value={key}
                            onChange={(e) => {
                              const newSpecs = { ...specifications };
                              newSpecs[e.target.value] = newSpecs[key];
                              delete newSpecs[key];
                              setSpecifications(newSpecs);
                            }}
                          />
                        </Col>
                        <Col xs={10} md={6}>
                          <Form.Control
                            placeholder="Giá trị thông số (VD: 8GB, Snapdragon 865...)"
                            value={specifications[key]}
                            onChange={(e) => handleSpecChange(key, e.target.value)}
                          />
                        </Col>
                        <Col xs={2} md={1} className="text-end">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeSpecification(key)}
                            className="d-flex align-items-center justify-content-center p-2"
                          >
                            <FiTrash2 size={16} />
                          </Button>
                        </Col>
                      </Row>
                    ))}
                  </Col>
                </Row>

                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/products')}
                    className="d-flex align-items-center gap-2"
                  >
                    <FiArrowLeft size={16} /> Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="d-flex align-items-center gap-2"
                    disabled={loadingUpdate}
                  >
                    <FiSave size={16} /> {loadingUpdate ? 'Đang lưu...' : 'Lưu sản phẩm'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </>
      )}
    </>
  );
};

export default ProductEditScreen; 