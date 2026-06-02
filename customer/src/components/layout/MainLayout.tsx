import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import SessionExpiredModal from '../common/SessionExpiredModal';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  useEffect(() => {
    // Kiểm tra cờ token hết hạn trong sessionStorage
    const checkSessionExpired = () => {
      const tokenExpired = sessionStorage.getItem('token_expired') === 'true';
      if (tokenExpired) {
        // Xóa cờ
        sessionStorage.removeItem('token_expired');
        // Hiển thị modal
        setShowSessionExpired(true);
      }
    };

    // Kiểm tra khi component mount
    checkSessionExpired();

    // Đăng ký event listener cho storage changes
    const handleStorageChange = () => {
      checkSessionExpired();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Kiểm tra định kỳ
    const intervalId = setInterval(checkSessionExpired, 10000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      
      {showSessionExpired && (
        <SessionExpiredModal onClose={() => setShowSessionExpired(false)} />
      )}
    </div>
  );
};

export default MainLayout; 