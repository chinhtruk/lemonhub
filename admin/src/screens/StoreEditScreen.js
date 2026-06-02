import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';

const StoreEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('');
  const [image, setImage] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const isNewStore = !id || id === 'new';

  useEffect(() => {
    if (!isNewStore) {
      const fetchStore = async () => {
        try {
          setLoading(true);
          const { data } = await axios.get(`/api/stores/${id}`);
          setName(data.name);
          setAddress(data.address);
          setPhone(data.phone);
          setHours(data.hours);
          setImage(data.image);
          setCity(data.city);
          setLatitude(data.location?.latitude || '');
          setLongitude(data.location?.longitude || '');
          setIsActive(data.isActive);
          setLoading(false);
        } catch (error) {
          setError(
            error.response && error.response.data.message
              ? error.response.data.message
              : 'Đã xảy ra lỗi khi tải thông tin cửa hàng'
          );
          setLoading(false);
          console.error('Lỗi chi tiết:', error);
          console.error('Phản hồi từ server:', error.response?.data);
        }
      };
      
      fetchStore();
    }
  }, [id, isNewStore]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Kiểm tra kích thước file
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > 5) {
      setError(`Kích thước file quá lớn (${fileSizeMB.toFixed(2)}MB). Vui lòng chọn file nhỏ hơn 5MB.`);
      return;
    }
    
    // Kiểm tra định dạng file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError(`Định dạng file không được hỗ trợ (${file.type}). Vui lòng chọn file ảnh.`);
      return;
    }
    
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    setError('');
    setSuccess('');
    
    // Hiển thị thông báo đang upload
    setSuccess(`Đang tải ảnh lên... (0%)`);
    
    try {
      // Lấy token từ localStorage
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        setError('Bạn cần đăng nhập để thực hiện chức năng này');
        setUploading(false);
        return;
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setSuccess(`Đang tải ảnh lên... (${percentCompleted}%)`);
        }
      };

      console.log('Uploading file:', file.name, 'size:', (file.size / 1024).toFixed(2) + 'KB', 'type:', file.type);
      
      // Sử dụng endpoint /api/upload/store cho upload ảnh cửa hàng
      const { data } = await axios.post('/api/upload/store', formData, config);
      console.log('Upload response:', data);
      
      // Lấy đường dẫn ảnh từ response
      let imagePath = '';
      if (data && typeof data === 'object' && data.image) {
        imagePath = data.image;
        console.log('Image path from data.image:', imagePath);
      } else if (data && typeof data === 'string') {
        imagePath = data;
        console.log('Image path from string:', imagePath);
      } else if (data && data.url) {
        imagePath = data.url;
        console.log('Image path from data.url:', imagePath);
      } else if (data && data.path) {
        imagePath = data.path;
        console.log('Image path from data.path:', imagePath);
      } else {
        console.warn('Could not extract image path from response:', data);
      }
      
      // Đảm bảo đường dẫn đúng format
      if (imagePath && !imagePath.startsWith('/') && !imagePath.startsWith('http')) {
        imagePath = `/${imagePath}`;
      }
      
      console.log('Final image path:', imagePath);
      setImage(imagePath);
      setUploading(false);
      setSuccess('Tải ảnh lên thành công');
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = 'Lỗi khi tải ảnh lên. ';
      
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        console.error('Error data:', error.response.data);
        
        if (error.response.status === 401) {
          errorMessage += 'Bạn không có quyền thực hiện thao tác này.';
        } else if (error.response.status === 413) {
          errorMessage += 'File ảnh quá lớn.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage += error.response.data.message;
        } else {
          errorMessage += `Lỗi server (${error.response.status}).`;
        }
      } else if (error.request) {
        console.error('Error request (no response):', error.request);
        errorMessage += 'Không nhận được phản hồi từ server.';
      } else {
        console.error('Error message:', error.message);
        errorMessage += error.message;
      }
      
      setError(errorMessage);
      setUploading(false);
      setSuccess('');
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    // Validate fields
    if (!name || !address || !phone || !hours || !city || !latitude || !longitude) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    
    const storeData = {
      name,
      address,
      phone,
      hours,
      image,
      city,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      isActive
    };
    
    console.log('Submitting store data with image:', image);
    
    try {
      setLoading(true);
      setError('');
      
      if (isNewStore) {
        await axios.post('/api/stores', storeData);
        setSuccess('Tạo cửa hàng mới thành công');
      } else {
        await axios.put(`/api/stores/${id}`, storeData);
        setSuccess('Cập nhật cửa hàng thành công');
      }
      
      setLoading(false);
      
      // Chờ 1 giây để hiển thị thông báo thành công trước khi chuyển trang
      setTimeout(() => {
        navigate('/stores');
      }, 1500);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Đã xảy ra lỗi khi lưu thông tin cửa hàng'
      );
      setLoading(false);
      console.error('Lỗi chi tiết:', error);
      console.error('Phản hồi từ server:', error.response?.data);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>{isNewStore ? 'Thêm cửa hàng mới' : 'Chỉnh sửa cửa hàng'}</h1>
        <LinkContainer to="/stores">
          <Button variant="outline-secondary">Quay lại</Button>
        </LinkContainer>
      </div>
      
      {error && <Message variant="danger">{error}</Message>}
      {success && <Message variant="success">{success}</Message>}
      
      {loading ? (
        <Loader />
      ) : (
        <Card>
          <Card.Body>
            <Form onSubmit={submitHandler}>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="name" className="mb-3">
                    <Form.Label>Tên cửa hàng <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập tên cửa hàng"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group controlId="city" className="mb-3">
                    <Form.Label>Thành phố <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập thành phố"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group controlId="address" className="mb-3">
                <Form.Label>Địa chỉ <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập địa chỉ đầy đủ"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="phone" className="mb-3">
                    <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập số điện thoại"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group controlId="hours" className="mb-3">
                    <Form.Label>Giờ mở cửa <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="VD: 8:00 - 21:00"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="latitude" className="mb-3">
                    <Form.Label>Vĩ độ (Latitude) <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="number"
                      step="any"
                      placeholder="VD: 10.7725"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group controlId="longitude" className="mb-3">
                    <Form.Label>Kinh độ (Longitude) <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="number"
                      step="any"
                      placeholder="VD: 106.6980"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group controlId="image" className="mb-3">
                <Form.Label>Hình ảnh cửa hàng</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="URL hình ảnh"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Nhập URL hình ảnh hoặc tải lên ảnh mới bên dưới
                </Form.Text>
              </Form.Group>

              <Form.Group controlId="imageFile" className="mb-3">
                <Form.Label>Hoặc tải lên hình ảnh mới</Form.Label>
                <Form.Control
                  type="file"
                  onChange={uploadFileHandler}
                  accept="image/*"
                />
                {uploading && <Loader />}
                {image && !uploading && (
                  <div className="mt-3">
                    <p className="mb-1">Xem trước ảnh:</p>
                    <div className="border rounded p-2">
                      <img 
                        src={image.startsWith('http') ? image : `${window.location.origin}${image}`} 
                        alt="Store preview" 
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                        onError={(e) => {
                          console.error('Image loading error');
                          e.target.src = '/placeholder-store.jpg';
                          e.target.style.opacity = 0.5;
                        }}
                      />
                      <div className="mt-2">
                        <small className="text-muted d-block">Đường dẫn ảnh: {image}</small>
                      </div>
                    </div>
                  </div>
                )}
              </Form.Group>

              <Form.Group controlId="isActive" className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Cửa hàng đang hoạt động"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
              </Form.Group>

              <div className="d-flex justify-content-end mt-4">
                <Button
                  type="button"
                  variant="outline-secondary"
                  className="me-2"
                  onClick={() => navigate('/stores')}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : (isNewStore ? 'Tạo cửa hàng' : 'Cập nhật')}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default StoreEditScreen; 