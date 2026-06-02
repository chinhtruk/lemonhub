import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi';

const Message = ({ variant = 'info', children, dismissible = false, onDismiss }) => {
  const getMessageStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'rgba(76, 175, 80, 0.1)',
          border: 'rgba(76, 175, 80, 0.2)',
          text: '#2E7D32',
          icon: <FiCheckCircle size={18} />
        };
      case 'danger':
      case 'error':
        return {
          bg: 'rgba(244, 67, 54, 0.1)',
          border: 'rgba(244, 67, 54, 0.2)',
          text: '#D32F2F',
          icon: <FiXCircle size={18} />
        };
      case 'warning':
        return {
          bg: 'rgba(255, 152, 0, 0.1)',
          border: 'rgba(255, 152, 0, 0.2)',
          text: '#EF6C00',
          icon: <FiAlertCircle size={18} />
        };
      case 'info':
      default:
        return {
          bg: 'rgba(33, 150, 243, 0.1)',
          border: 'rgba(33, 150, 243, 0.2)',
          text: '#1976D2',
          icon: <FiInfo size={18} />
        };
    }
  };

  const styles = getMessageStyles();

  return (
    <div 
      className="p-3 mb-3 rounded-3 fade-in d-flex align-items-start"
      style={{ 
        backgroundColor: styles.bg, 
        borderLeft: `3px solid ${styles.border}`,
        color: styles.text,
      }}
    >
      <div className="me-2 mt-1">
        {styles.icon}
      </div>
      
      <div className="flex-grow-1" style={{ fontSize: '0.9rem' }}>
        {children}
      </div>
      
      {dismissible && (
        <button 
          className="btn-close ms-2" 
          style={{ fontSize: '0.7rem' }}
          onClick={onDismiss}
          aria-label="Close"
        ></button>
      )}
    </div>
  );
};

export default Message;