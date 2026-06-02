import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiSearch } from 'react-icons/fi';

const Header = ({ userInfo, setUserInfo }) => {
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    navigate('/login');
  };

  return (
    <header>
      <Navbar 
        expand="lg" 
        className="py-2" 
        fixed="top"
        style={{ 
          background: 'linear-gradient(135deg, #fdfdfd 0%, #f9f9f9 100%)',
          boxShadow: '0 2px 15px rgba(0, 0, 0, 0.06)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
        }}
      >
        <Container fluid className="px-4">
          <LinkContainer to="/">
            <Navbar.Brand className="d-flex align-items-center">
              <div className="me-2 d-flex align-items-center justify-content-center" 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px', 
                  background: 'linear-gradient(135deg, #FFC107 0%, #FFEB3B 100%)',
                  boxShadow: '0 2px 10px rgba(255, 193, 7, 0.2)'
                }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>L</span>
              </div>
              <span className="fw-bold" style={{ fontSize: '1.2rem', color: '#333', letterSpacing: '-0.5px' }}>
                LemonHub<span style={{ color: '#FFC107' }}> Admin</span> 
              </span>
            </Navbar.Brand>
          </LinkContainer>
          
          <div className="d-none d-lg-flex position-relative mx-auto" style={{ maxWidth: '400px', width: '100%' }}>
            <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
              <FiSearch size={15} />
            </div>
            <input 
              type="search" 
              placeholder="Tìm kiếm..." 
              className="form-control form-control-sm ps-5 py-2" 
              style={{ 
                backgroundColor: '#f5f5f5', 
                border: 'none', 
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}
            />
          </div>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              {userInfo && (
                <NavDropdown 
                  title={
                    <div className="d-inline-flex align-items-center">
                      <div className="rounded-circle d-flex justify-content-center align-items-center me-2" 
                           style={{ 
                             width: '36px', 
                             height: '36px', 
                             overflow: 'hidden',
                             backgroundColor: '#f0f0f0', 
                             border: '2px solid rgba(255, 193, 7, 0.3)'
                           }}>
                        {userInfo.avatar ? (
                          <img src={userInfo.avatar} alt={userInfo.name} className="w-100 h-100 object-cover" />
                        ) : (
                          <FiUser size={16} className="text-secondary" />
                        )}
                      </div>
                      <div className="d-none d-md-block">
                        <div className="fw-medium" style={{ fontSize: '0.85rem', color: '#333', lineHeight: '1.1' }}>{userInfo.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Admin</div>
                      </div>
                    </div>
                  } 
                  id="username"
                  align="end"
                  className="dropdown-menu-end"
                >
                  <div className="px-3 py-2 d-md-none">
                    <div className="fw-medium mb-1">{userInfo.name}</div>
                    <div className="text-muted small">Admin</div>
                  </div>
                  <NavDropdown.Divider className="d-md-none" />
                  <LinkContainer to="/profile">
                    <NavDropdown.Item className="py-2">
                      <FiUser className="me-2" size={16} /> Thông tin cá nhân
                    </NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logoutHandler} className="py-2 text-danger">
                    <FiLogOut className="me-2" size={16} /> Đăng xuất
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header; 