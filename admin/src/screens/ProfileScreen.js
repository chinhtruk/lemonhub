import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';
import Message from '../components/Message';
import Loader from '../components/Loader';

const ProfileScreen = ({ userInfo, setUserInfo }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
      setPhone(userInfo.phone || '');
      setAddress(userInfo.address || '');
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Mật khẩu không khớp');
      return;
    }
    
    setMessage(null);
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        name,
        email,
        phone,
        address,
      };

      if (password) {
        updateData.password = password;
      }

      const { data } = await axios.put('/api/users/profile', updateData);
      
      // Cập nhật thông tin người dùng trong localStorage và state
      const updatedUserInfo = {
        ...userInfo,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      };
      
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      setUserInfo(updatedUserInfo);
      
      setSuccess('Cập nhật thông tin thành công');
      setPassword('');
      setConfirmPassword('');
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Cập nhật thất bại'
      );
      setLoading(false);
    }
  };

  return (
    <Row>
      <Col md={8} className="mx-auto">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
          <div>
            <h3 className="page-title m-0 fw-bold">Thông tin cá nhân</h3>
            <p className="text-muted mb-0 mt-1">
              Cập nhật thông tin tài khoản của bạn
            </p>
          </div>
        </div>
        
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            {message && <Message variant="danger">{message}</Message>}
            {error && <Message variant="danger">{error}</Message>}
            {success && <Message variant="success">{success}</Message>}
            {loading && <Loader />}
            
            <Form onSubmit={submitHandler}>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="name" className="mb-3">
                    <Form.Label className="fw-medium">Họ tên</Form.Label>
                    <InputGroup>
                      <FiUser className="input-icon" />
                      <Form.Control
                        type="text"
                        placeholder="Nhập họ tên"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="ps-4"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group controlId="email" className="mb-3">
                    <Form.Label className="fw-medium">Email</Form.Label>
                    <InputGroup>
                      <FiMail className="input-icon" />
                      <Form.Control
                        type="email"
                        placeholder="Nhập email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="ps-4"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group controlId="phone" className="mb-3">
                    <Form.Label className="fw-medium">Số điện thoại</Form.Label>
                    <InputGroup>
                      <FiPhone className="input-icon" />
                      <Form.Control
                        type="text"
                        placeholder="Nhập số điện thoại"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="ps-4"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="address" className="mb-3">
                    <Form.Label className="fw-medium">Địa chỉ</Form.Label>
                    <InputGroup>
                      <FiMapPin className="input-icon" />
                      <Form.Control
                        type="text"
                        placeholder="Nhập địa chỉ"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="ps-4"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group controlId="password" className="mb-3">
                    <Form.Label className="fw-medium">Mật khẩu mới</Form.Label>
                    <InputGroup>
                      <FiLock className="input-icon" />
                      <Form.Control
                        type="password"
                        placeholder="Để trống nếu không thay đổi"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="ps-4"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group controlId="confirmPassword" className="mb-3">
                    <Form.Label className="fw-medium">Xác nhận mật khẩu</Form.Label>
                    <InputGroup>
                      <FiLock className="input-icon" />
                      <Form.Control
                        type="password"
                        placeholder="Xác nhận mật khẩu mới"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={!password}
                        className="ps-4"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end mt-3">
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={loading}
                  className="d-flex align-items-center gap-2 px-4 fw-medium"
                >
                  <FiRefreshCw size={16} />
                  {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
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
      `}</style>
    </Row>
  );
};

const InputGroup = ({ children }) => {
  return (
    <div className="position-relative">
      {children}
    </div>
  );
};

export default ProfileScreen; 