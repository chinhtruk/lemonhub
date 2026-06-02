import React, { useState, useEffect } from 'react';
import { Table, Button, Row, Col, Form, InputGroup, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiUserCheck,
  FiUsers,
  FiUserX,
  FiShield,
  FiMail,
  FiUser
} from 'react-icons/fi';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';

const UserListScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const { data } = await axios.get('/api/users');
      setUsers(data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Không thể tải danh sách người dùng'
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const deleteUserHandler = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        setLoading(true);
        await axios.delete(`/api/users/${id}`);
        setSuccess('Xóa người dùng thành công');
        loadUsers();
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Không thể xóa người dùng'
        );
        setLoading(false);
      }
    }
  };

  // Filter users based on search term and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));
    
    const matchesRole = 
      roleFilter === 'all' || 
      (roleFilter === 'admin' && user.isAdmin) || 
      (roleFilter === 'customer' && !user.isAdmin);
    
    return matchesSearch && matchesRole;
  });

  // Tính các số liệu thống kê
  const stats = {
    totalUsers: users.length,
    adminUsers: users.filter(user => user.isAdmin).length,
    customerUsers: users.filter(user => !user.isAdmin).length
  };

  return (
    <div className="user-list-screen">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="page-title m-0 fw-bold">Quản lý Người dùng</h3>
          <p className="text-muted mb-0 mt-1">
            Quản lý thông tin tài khoản khách hàng và quản trị viên
          </p>
        </div>
        <LinkContainer to="/users/new/edit">
          <Button variant="warning" className="d-flex align-items-center gap-2">
            <FiPlus size={16} /> Thêm Người dùng
          </Button>
        </LinkContainer>
      </div>

      {success && <Message variant="success">{success}</Message>}
      {error && <Message variant="danger">{error}</Message>}

      <Row className="mb-4 g-3">
        <Col lg={4} md={6} sm={6}>
          <div className="dashboard-widget">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="dashboard-widget-icon" 
                   style={{ backgroundColor: 'rgba(33, 150, 243, 0.15)', color: '#2196F3' }}>
                <FiUsers size={20} />
              </div>
            </div>
            <h4 className="dashboard-widget-value mb-1">{stats.totalUsers}</h4>
            <p className="text-muted small mb-0">Tổng số người dùng</p>
          </div>
        </Col>
        
        <Col lg={4} md={6} sm={6}>
          <div className="dashboard-widget">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="dashboard-widget-icon" 
                   style={{ backgroundColor: 'rgba(255, 87, 34, 0.15)', color: '#FF5722' }}>
                <FiShield size={20} />
              </div>
            </div>
            <h4 className="dashboard-widget-value mb-1">{stats.adminUsers}</h4>
            <p className="text-muted small mb-0">Quản trị viên</p>
          </div>
        </Col>
        
        <Col lg={4} md={6} sm={6}>
          <div className="dashboard-widget">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="dashboard-widget-icon" 
                   style={{ backgroundColor: 'rgba(76, 175, 80, 0.15)', color: '#4CAF50' }}>
                <FiUserCheck size={20} />
              </div>
            </div>
            <h4 className="dashboard-widget-value mb-1">{stats.customerUsers}</h4>
            <p className="text-muted small mb-0">Khách hàng</p>
          </div>
        </Col>
      </Row>

      <div className="dashboard-widget mb-4">
        <Row className="mb-4 g-3">
          <Col lg={6} md={6}>
            <InputGroup className="shadow-sm rounded-3 overflow-hidden">
              <InputGroup.Text className="bg-white text-muted border-end-0">
                <FiSearch size={18} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Tìm theo tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-start-0 ps-0 shadow-none"
              />
            </InputGroup>
          </Col>
          <Col lg={4} md={6}>
            <InputGroup className="shadow-sm rounded-3 overflow-hidden">
              <InputGroup.Text className="bg-white text-muted border-end-0">
                <FiFilter size={18} />
              </InputGroup.Text>
              <Form.Select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border-start-0 ps-0 shadow-none"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Quản trị viên</option>
                <option value="customer">Khách hàng</option>
              </Form.Select>
            </InputGroup>
          </Col>
          <Col lg={2} className="d-flex justify-content-end">
            <Button 
              variant="light" 
              onClick={loadUsers} 
              className="shadow-sm d-flex align-items-center justify-content-center px-3 w-100"
              title="Làm mới danh sách"
            >
              <FiRefreshCw size={16} />
            </Button>
          </Col>
        </Row>

        {loading ? (
          <Loader />
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3" style={{ color: '#ccc' }}>
              <FiUserX size={50} />
            </div>
            <h5 className="fw-semibold text-muted mb-2">Không tìm thấy người dùng</h5>
            <p className="text-muted mb-0">Không có người dùng nào phù hợp với tìm kiếm của bạn</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 user-table">
              <thead>
                <tr>
                  <th style={{width: '50px'}}>#</th>
                  <th>Người dùng</th>
                  <th>Liên hệ</th>
                  <th>Đã đăng ký</th>
                  <th>Vai trò</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user._id} className="user-row">
                    <td>{index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="user-avatar me-3 d-flex align-items-center justify-content-center rounded-circle overflow-hidden"
                             style={{ 
                                width: '40px', 
                                height: '40px', 
                                backgroundColor: user.isAdmin ? 'rgba(255, 87, 34, 0.15)' : 'rgba(33, 150, 243, 0.15)',
                                color: user.isAdmin ? '#FF5722' : '#2196F3',
                                fontSize: '18px'
                              }}
                        >
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                          ) : (
                            <FiUser />
                          )}
                        </div>
                        <div>
                          <div className="fw-medium mb-1">{user.name}</div>
                          <div className="small text-muted">ID: {user._id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center mb-1">
                        <FiMail size={14} className="text-muted me-2" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="small text-muted">
                          SĐT: {user.phone}
                        </div>
                      )}
                    </td>
                    <td>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td>
                      {user.isAdmin ? (
                        <Badge bg="warning" className="badge-warning" pill>Quản trị viên</Badge>
                      ) : (
                        <Badge bg="info" className="badge-info" pill>Khách hàng</Badge>
                      )}
                    </td>
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <LinkContainer to={`/users/${user._id}/edit`}>
                          <Button variant="light" size="sm" className="d-flex align-items-center justify-content-center p-2">
                            <FiEdit size={16} />
                          </Button>
                        </LinkContainer>
                        <Button
                          variant="light"
                          size="sm"
                          className="d-flex align-items-center justify-content-center p-2 text-danger"
                          onClick={() => deleteUserHandler(user._id)}
                          disabled={user._id === '64df433f3d629a1f80b61fa1'} // Prevent deleting main admin
                        >
                          <FiTrash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListScreen; 