import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Image, Card } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiLink, FiImage, FiList, FiEye, FiSave } from 'react-icons/fi';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';

const BannerEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [image, setImage] = useState('');
  const [link, setLink] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      const fetchBanner = async () => {
        try {
          setLoading(true);
          const { data } = await axios.get(`/api/banners/${id}`);
          setImage(data.image);
          setLink(data.link || '');
          setOrder(data.order || 0);
          setIsActive(data.isActive);
          setLoading(false);
        } catch (error) {
          setError(
            error.response && error.response.data.message
              ? error.response.data.message
              : 'Không thể tải thông tin banner'
          );
          setLoading(false);
        }
      };
      fetchBanner();
    }
  }, [id, isNew]);

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
      setImage(data.image);
      setUploading(false);
    } catch (error) {
      setError('Lỗi tải lên hình ảnh');
      setUploading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const bannerData = {
        image,
        link,
        order,
        isActive,
      };
      
      if (isNew) {
        await axios.post('/api/banners', bannerData);
        setSuccess('Tạo banner mới thành công');
      } else {
        await axios.put(`/api/banners/${id}`, bannerData);
        setSuccess('Cập nhật banner thành công');
      }
      
      setSaving(false);
      setTimeout(() => {
        navigate('/banners');
      }, 1500);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Không thể lưu banner'
      );
      setSaving(false);
    }
  };

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="page-title m-0 fw-bold">{isNew ? 'Thêm Banner Mới' : 'Chỉnh Sửa Banner'}</h3>
          <p className="text-muted mb-0 mt-1">
            {isNew ? 'Tạo mới banner quảng cáo cho trang web' : 'Cập nhật thông tin banner quảng cáo'}
          </p>
        </div>
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate('/banners')}
          className="d-flex align-items-center gap-2"
        >
          <FiArrowLeft size={16} /> Quay lại
        </Button>
      </div>
      
      {error && <Message variant="danger">{error}</Message>}
      {success && <Message variant="success">{success}</Message>}
      
      {loading ? (
        <Loader />
      ) : (
        <Row>
          <Col md={8}>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <Form onSubmit={submitHandler}>
                  <Form.Group controlId="image" className="mb-3">
                    <Form.Label className="fw-medium">Hình ảnh</Form.Label>
                    <InputGroup>
                      <FiImage className="input-icon" />
                      <Form.Control
                        type="text"
                        placeholder="URL hình ảnh"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="ps-4"
                        required
                      />
                    </InputGroup>
                    <div className="mt-2">
                      <Form.Control
                        type="file"
                        label="Chọn file"
                        onChange={uploadFileHandler}
                        className="form-control-sm"
                      />
                      {uploading && <Loader />}
                    </div>
                  </Form.Group>

                  <Form.Group controlId="link" className="mb-3">
                    <Form.Label className="fw-medium">Link (tùy chọn)</Form.Label>
                    <InputGroup>
                      <FiLink className="input-icon" />
                      <Form.Control
                        type="text"
                        placeholder="URL khi người dùng nhấp vào banner"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="ps-4"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group controlId="order" className="mb-3">
                    <Form.Label className="fw-medium">Thứ tự hiển thị</Form.Label>
                    <InputGroup>
                      <FiList className="input-icon" />
                      <Form.Control
                        type="number"
                        placeholder="Thứ tự hiển thị"
                        value={order}
                        onChange={(e) => setOrder(Number(e.target.value))}
                        className="ps-4"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group controlId="isActive" className="mb-4">
                    <Form.Check
                      type="switch"
                      label="Hiển thị banner"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button 
                      type="submit" 
                      variant="primary"
                      disabled={saving}
                      className="d-flex align-items-center gap-2"
                    >
                      <FiSave size={16} />
                      {saving ? 'Đang lưu...' : 'Lưu banner'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <FiEye size={18} /> Xem trước
                </h5>
                {image ? (
                  <div className="position-relative rounded overflow-hidden" style={{ paddingTop: '56.25%' }}>
                    <Image
                      src={image}
                      alt="Banner preview"
                      className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                    />
                  </div>
                ) : (
                  <div className="text-center text-muted py-5 bg-light rounded">
                    <FiImage size={32} className="mb-2" />
                    <p className="mb-0">Vui lòng tải lên hình ảnh</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
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

export default BannerEditScreen; 