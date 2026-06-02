import React from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { 
  FiHome, 
  FiUsers, 
  FiBox, 
  FiFileText, 
  FiList, 
  FiUser, 
  FiZap, 
  FiImage, 
  FiMapPin,
  FiChevronRight,
  FiLayers,
  FiShoppingBag,
  FiHelpCircle,
  FiLogOut,
  FiCreditCard,
  FiTag,
  FiGrid,
  FiShield,
  FiBarChart2,
  FiSettings,
  FiDollarSign,
  FiGift
} from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Group menu items by sections for better organization
  const menuGroups = [
    {
      title: 'Tổng quan',
      items: [
        { 
          path: '/', 
          icon: <FiHome style={{ strokeWidth: 2 }} />, 
          title: 'Trang chủ',
          iconBg: 'rgba(33, 150, 243, 0.1)',  
          iconColor: '#2196F3'
        },
        { 
          path: '/dashboard', 
          icon: <FiBarChart2 />, 
          title: 'Dashboard',
          iconBg: 'rgba(76, 175, 80, 0.1)',
          iconColor: '#4CAF50'
        },
      ]
    },
    {
      title: 'Quản lý cửa hàng',
      items: [
        { path: '/products', icon: <FiBox />, title: 'Sản phẩm' },
        { path: '/categories', icon: <FiLayers />, title: 'Danh mục' },
        { path: '/orders', icon: <FiShoppingBag />, title: 'Đơn hàng' },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { path: '/banners', icon: <FiImage />, title: 'Banners' },
      ]
    },
    {
      title: 'Người dùng',
      items: [
        { path: '/users', icon: <FiUsers />, title: 'Quản lý người dùng' },
        { path: '/stores', icon: <FiMapPin />, title: 'Cửa hàng', iconBg: 'rgba(158, 158, 158, 0.1)', iconColor: '#607D8B' },
        { path: '/profile', icon: <FiShield />, title: 'Tài khoản', iconBg: 'rgba(244, 67, 54, 0.1)', iconColor: '#F44336' },
      ]
    },
  ];

  return (
    <aside 
      className="col-md-2 p-0 d-flex flex-column" 
      style={{ 
        background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        height: 'calc(100vh - 56px)',
        position: 'sticky',
        top: '56px',
        zIndex: 100,
        overflowY: 'auto',
        overflowX: 'hidden',
        borderRight: '1px solid rgba(0,0,0,0.05)'
      }}
    >
      <div className="flex-grow-1">
        <Nav className="flex-column py-2">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-3">
              <div className="sidebar-heading px-3 py-2" style={{ 
                fontSize: '0.7rem', 
                fontWeight: '600', 
                color: '#6c757d',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {group.title}
              </div>
              
              {group.items.map((item, index) => (
                <LinkContainer 
                  to={item.path} 
                  key={index}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  <Nav.Link 
                    className={`py-2 px-3 d-flex align-items-center ${location.pathname === item.path ? 'active-link' : ''}`}
                    style={{ 
                      fontSize: '0.9rem',
                      color: location.pathname === item.path ? (item.iconColor || '#FFC107') : '#495057',
                      backgroundColor: location.pathname === item.path ? (item.iconBg || 'rgba(255, 193, 7, 0.08)') : 'transparent',
                      borderRadius: '8px',
                      margin: '2px 8px',
                      transition: 'all 0.25s ease',
                      boxShadow: location.pathname === item.path ? '0 2px 5px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    <span className="icon me-3" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: location.pathname === item.path ? (item.iconBg || 'rgba(255, 193, 7, 0.1)') : 'transparent',
                      color: location.pathname === item.path ? (item.iconColor || '#FFC107') : '#6c757d',
                      transition: 'all 0.25s ease',
                      boxShadow: location.pathname === item.path ? '0 2px 5px rgba(0,0,0,0.05)' : 'none'
                    }}>
                      {item.icon}
                    </span>
                    <span style={{ fontWeight: location.pathname === item.path ? '500' : '400' }}>{item.title}</span>
                    {location.pathname === item.path && (
                      <FiChevronRight className="ms-auto" size={14} style={{ opacity: 0.7 }} />
                    )}
                  </Nav.Link>
                </LinkContainer>
              ))}
              
              {groupIndex < menuGroups.length - 1 && (
                <div className="my-2 mx-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}></div>
              )}
            </div>
          ))}
        </Nav>
      </div>
      
      <div className="p-3 border-top bg-white mt-auto">
        <div className="text-center">
          <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
            LemonHub Admin v1.0.0
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 