import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import axios from 'axios';
import { FiUser, FiArrowLeft, FiMail, FiPhone, FiMapPin, FiCalendar, FiUsers } from 'react-icons/fi';
import Loader from '../components/Loader';
import Message from '../components/Message';

const UserEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const isNewUser = id === 'new';

  useEffect(() => {
    if (!isNewUser) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const { data } = await axios.get(`/api/users/${id}`);
          setName(data.name);
          setEmail(data.email);
          setPhone(data.phone || '');
          setAddress(data.address || '');
          setBirthday(data.birthday || '');
          setGender(data.gender || '');
          setIsAdmin(data.isAdmin);
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
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [id, isNewUser]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoadingUpdate(true);
    setError('');
    setSuccess('');

    try {
      let response;
      const userData = {
        name,
        email,
        phone,
        address,
        birthday,
        gender,
        isAdmin,
      };

      if (isNewUser) {
        // Thêm mật khẩu khi tạo người dùng mới
        userData.password = '123456'; // Mật khẩu mặc định, người dùng có thể đổi sau
        response = await axios.post('/api/users', userData);
        setSuccess('Tạo người dùng thành công');
      } else {
        response = await axios.put(`/api/users/${id}`, userData);
        setSuccess('Cập nhật người dùng thành công');
      }

      setLoadingUpdate(false);
      
      // Chờ 1 giây để hiển thị thông báo thành công trước khi chuyển trang
      setTimeout(() => {
        navigate('/users');
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
          <h3 className="page-title m-0 fw-bold">{isNewUser ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}</h3>
          <p className="text-muted mb-0 mt-1">
            {isNewUser ? 'Tạo tài khoản người dùng mới trong hệ thống' : 'Cập nhật thông tin tài khoản người dùng'}
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

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            {success && <Message variant="success">{success}</Message>}
            
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

                  <Form.Group controlId="birthday" className="mb-3">
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

                  <Form.Group controlId="gender" className="mb-3">
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
                </Col>
              </Row>

              <Form.Group controlId="isAdmin" className="mb-4 mt-2">
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
              
              {isNewUser && (
                <div className="mb-4">
                  <Message>
                    Mật khẩu mặc định cho người dùng mới là: <strong>123456</strong>
                  </Message>
                </div>
              )}

              <div className="d-flex justify-content-end gap-2">
                <Button 
                  variant="light" 
                  onClick={() => navigate('/users')}
                  className="fw-medium"
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={loadingUpdate}
                  className="px-4 fw-medium"
                >
                  {loadingUpdate ? 'Đang xử lý...' : (isNewUser ? 'Tạo người dùng' : 'Lưu thay đổi')}
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

export default UserEditScreen; 