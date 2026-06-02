import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FiHome, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';

const NotFoundScreen = () => {
  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8} xl={6}>
          <Card className="border-0 shadow-sm py-4 px-3">
            <Card.Body className="text-center">
              <div className="error-icon mb-4">
                <FiAlertCircle size={80} className="text-warning" />
              </div>
              <h1 className="display-1 fw-bold text-primary mb-0">404</h1>
              <h2 className="mb-4 fs-3 fw-medium">Không tìm thấy trang</h2>
              <p className="mb-4 text-muted fs-5">
                Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Button 
                  variant="light" 
                  size="lg"
                  onClick={() => window.history.back()}
                  className="d-inline-flex align-items-center gap-2 px-4 fw-medium"
                >
                  <FiArrowLeft size={18} /> Quay lại
                </Button>
                <LinkContainer to="/">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="d-inline-flex align-items-center gap-2 px-4 fw-medium"
                  >
                    <FiHome size={18} /> Trang chủ
                  </Button>
                </LinkContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <style jsx>{`
        .error-icon {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </Container>
  );
};

export default NotFoundScreen; 
 