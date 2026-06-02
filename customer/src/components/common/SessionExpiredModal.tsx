import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertTriangle } from 'react-icons/fi';

interface SessionExpiredModalProps {
  onClose: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ onClose }) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hiệu ứng fade in
    setIsVisible(true);
  }, []);

  const handleLogin = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      router.push('/login');
    }, 300);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          style={{ opacity: isVisible ? 1 : 0 }}
          onClick={handleClose}
        ></div>
        
        <div 
          className={`relative bg-white rounded-lg shadow-xl transform transition-all max-w-md w-full p-6 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="flex items-center justify-center mb-6">
            <div className="bg-yellow-100 p-3 rounded-full">
              <FiAlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-center text-gray-900 mb-4">
            Phiên đăng nhập đã hết hạn
          </h3>
          
          <p className="text-gray-700 text-center mb-6">
            Vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ.
          </p>
          
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleLogin}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal; 