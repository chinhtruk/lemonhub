import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import axios from 'axios';
import { FiMail, FiLock, FiLogIn, FiShield } from 'react-icons/fi';

const LoginScreen = ({ setUserInfo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;

    if (userInfo && userInfo.isAdmin) {
      navigate('/');
    }
  }, [navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Đường dẫn API chính xác /api/users/login khi sử dụng proxy
      const { data } = await axios.post('/api/users/login', { email, password });
      
      if (!data.isAdmin) {
        setError('Bạn không có quyền truy cập trang quản trị');
        setLoading(false);
        return;
      }
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUserInfo(data);
      setLoading(false);
      
      // Kiểm tra redirect URL từ query params
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');
      
      // Kiểm tra redirect URL từ localStorage
      const savedRedirectUrl = localStorage.getItem('adminRedirectAfterLogin');
      
      // Xác định đường dẫn chuyển hướng
      let redirectPath = '/';
      
      if (redirectUrl) {
        // Ưu tiên redirect từ URL query
        redirectPath = redirectUrl;
        console.log('Chuyển hướng đến đường dẫn từ URL:', redirectPath);
      } else if (savedRedirectUrl) {
        // Sử dụng redirect từ localStorage
        redirectPath = savedRedirectUrl;
        console.log('Chuyển hướng đến đường dẫn đã lưu:', redirectPath);
        // Xóa redirect URL từ localStorage sau khi sử dụng
        localStorage.removeItem('adminRedirectAfterLogin');
      }
      
      // Chuyển hướng người dùng
      navigate(redirectPath);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Đăng nhập thất bại: ' + error.message
      );
      setLoading(false);
    }
  };

  return (
    <div 
      style={{ 
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        padding: 0,
        margin: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'auto'
      }}
    >
      <Container fluid="sm" className="px-4">
        <Row className="justify-content-center">
          <Col xs={12} sm={8} md={6} lg={5} xl={4}>
            <div 
              style={{ 
                background: '#fff',
                borderRadius: '10px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                padding: '40px 30px',
                width: '100%',
                maxWidth: '450px',
                margin: '0 auto',
                border: '1px solid rgba(0,0,0,0.08)'
              }}
            >
              <div className="text-center mb-4">
                <div 
                  style={{ 
                    width: '70px', 
                    height: '70px', 
                    borderRadius: '15px', 
                    background: 'linear-gradient(135deg, #FFC107 0%, #FFEB3B 100%)',
                    boxShadow: '0 8px 20px rgba(255, 193, 7, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 15px auto'
                  }}
                >
                  <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>L</span>
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
                  Lemon<span style={{ color: '#FFC107' }}>Hub</span>
                </h1>
                <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '25px' }}>
                  Trang quản trị hệ thống
                </p>
              </div>
              
              {error && <Message variant="danger">{error}</Message>}
              
              {loading ? (
                <div className="text-center py-4">
                  <Loader size="default" text="Đang xác thực..." />
                </div>
              ) : (
                <Form onSubmit={submitHandler}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '500', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                      Email
                    </Form.Label>
                    <div 
                      style={{
                        display: 'flex',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        overflow: 'hidden'
                      }}
                    >
                      <div 
                        style={{
                          background: '#f8f9fa',
                          padding: '10px 15px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <FiMail color="#6c757d" />
                      </div>
                      <Form.Control
                        type="email"
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                          border: 'none',
                          borderRadius: '0',
                          boxShadow: 'none',
                          padding: '10px 15px'
                        }}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label style={{ fontWeight: '500', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                      Mật khẩu
                    </Form.Label>
                    <div 
                      style={{
                        display: 'flex',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        overflow: 'hidden'
                      }}
                    >
                      <div 
                        style={{
                          background: '#f8f9fa',
                          padding: '10px 15px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <FiLock color="#6c757d" />
                      </div>
                      <Form.Control
                        type="password"
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                          border: 'none',
                          borderRadius: '0',
                          boxShadow: 'none',
                          padding: '10px 15px'
                        }}
                      />
                    </div>
                  </Form.Group>

                  <div style={{ marginBottom: '20px' }}>
                    <Form.Check 
                      type="checkbox" 
                      id="rememberMe"
                      label="Ghi nhớ đăng nhập" 
                      style={{ fontSize: '14px' }}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    style={{ 
                      width: '100%',
                      background: '#FFC107',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '5px',
                      fontWeight: '500',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)'
                    }}
                  >
                    <FiLogIn style={{ marginRight: '8px' }} /> Đăng nhập
                  </Button>
                  
                  <div 
                    style={{ 
                      textAlign: 'center', 
                      marginTop: '30px', 
                      paddingTop: '20px', 
                      borderTop: '1px solid #eee',
                      fontSize: '13px',
                      color: '#6c757d'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                      <FiShield style={{ marginRight: '5px' }} size={14} />
                      <span>Kết nối bảo mật</span>
                    </div>
                    <p style={{ fontSize: '12px', margin: 0 }}>
                      © {new Date().getFullYear()} LemonHub. Tất cả quyền được bảo lưu.
                    </p>
                  </div>
                </Form>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginScreen; 