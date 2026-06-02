import React, { useState } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiUsers, FiLock, FiArrowLeft, FiUserPlus } from 'react-icons/fi';
import Loader from '../components/Loader';
import Message from '../components/Message';

const UserCreateScreen = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await axios.post('/api/users', {
        name,
        email,
        password,
        phone,
        address,
        birthday,
        gender,
        isAdmin
      });
      
      setSuccess('Tạo người dùng thành công');
      setLoading(false);
      
      // Navigate back after 2 seconds
      setTimeout(() => {
        navigate('/users');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo người dùng');
      setLoading(false);
    }
  };
  
  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="page-title m-0 fw-bold">Thêm người dùng mới</h3>
          <p className="text-muted mb-0 mt-1">
            Tạo tài khoản người dùng mới trong hệ thống
          </p>
        </div>
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate('/users')}
          className="d-flex align-items-center gap-2"
        >
          <FiArrowLeft size={16} /> Quay lại
        </Button>
      </div>
      
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-light border-0 py-3 d-flex align-items-center">
          <FiUserPlus className="text-primary me-2" size={20} />
          <h5 className="m-0 fw-medium">Thông tin người dùng</h5>
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
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Tên người dùng</Form.Label>
                    <InputGroup>
                      <FiUser className="input-icon" />
                      <Form.Control
                        type="text"
                        placeholder="Nhập tên người dùng"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="ps-4"
                      />
                    </InputGroup>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
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
                  
                  <Form.Group className="mb-3">
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
                  
                  <Form.Group className="mb-3">
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
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Ngày sinh</Form.Label>
                    <InputGroup>
                      <FiCalendar className="input-icon" />
                      <Form.Control
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        className="ps-4"
                      />
                    </InputGroup>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Giới tính</Form.Label>
                    <InputGroup>
                      <FiUsers className="input-icon" />
                      <Form.Select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="ps-4"
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                      </Form.Select>
                    </InputGroup>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Mật khẩu</Form.Label>
                    <InputGroup>
                      <FiLock className="input-icon" />
                      <Form.Control
                        type="password"
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="ps-4"
                      />
                    </InputGroup>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Xác nhận mật khẩu</Form.Label>
                    <InputGroup>
                      <FiLock className="input-icon" />
                      <Form.Control
                        type="password"
                        placeholder="Xác nhận mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="ps-4"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-4 mt-2">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="adminSwitch"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                  />
                  <label className="form-check-label fw-medium" htmlFor="adminSwitch">
                    Quyền quản trị viên
                  </label>
                </div>
              </Form.Group>
              
              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button 
                  variant="light" 
                  onClick={() => navigate('/users')}
                  className="fw-medium"
                >
                  Hủy
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  className="d-flex align-items-center gap-2 px-4 fw-medium"
                >
                  <FiUserPlus size={16} />
                  Tạo người dùng
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

export default UserCreateScreen; 