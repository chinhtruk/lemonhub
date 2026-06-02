import Link from 'next/link';
import { FiFacebook, FiInstagram, FiYoutube, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribe:', email);
    setEmail('');
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">
              <span className="text-yellow-500">Lemon</span>Hub
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Hệ thống bán lẻ điện thoại, laptop, tablet và phụ kiện chính hãng
            </p>
            <div className="space-y-4">
              <a 
                href="tel:19001234" 
                className="flex items-center text-gray-400 hover:text-yellow-500 transition-colors duration-200 group"
              >
                <FiPhone className="h-5 w-5 mr-3 text-yellow-500 group-hover:scale-110 transform transition-transform duration-200" />
                <span>1900 1234</span>
              </a>
              <a 
                href="mailto:support@lemonhub.vn" 
                className="flex items-center text-gray-400 hover:text-yellow-500 transition-colors duration-200 group"
              >
                <FiMail className="h-5 w-5 mr-3 text-yellow-500 group-hover:scale-110 transform transition-transform duration-200" />
                <span>support@lemonhub.vn</span>
              </a>
              <div className="flex items-center text-gray-400 group">
                <FiMapPin className="h-5 w-5 mr-3 text-yellow-500 group-hover:scale-110 transform transition-transform duration-200" />
                <span>Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Thông tin</h3>
            <ul className="space-y-4">
              <li>
                <Link 
                  href="/gioi-thieu" 
                  className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 flex items-center group"
                >
                  <span className="h-1 w-4 bg-yellow-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link 
                  href="/lien-he" 
                  className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 flex items-center group"
                >
                  <span className="h-1 w-4 bg-yellow-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Hỗ trợ khách hàng</h3>
            <ul className="space-y-4">
              <li>
                <Link 
                  href="/chinh-sach-van-chuyen" 
                  className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 flex items-center group"
                >
                  <span className="h-1 w-4 bg-yellow-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link 
                  href="/chinh-sach-bao-hanh" 
                  className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 flex items-center group"
                >
                  <span className="h-1 w-4 bg-yellow-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link 
                  href="/phuong-thuc-thanh-toan" 
                  className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 flex items-center group"
                >
                  <span className="h-1 w-4 bg-yellow-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  Phương thức thanh toán
                </Link>
              </li>
              <li>
                <Link 
                  href="/cau-hoi-thuong-gap" 
                  className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 flex items-center group"
                >
                  <span className="h-1 w-4 bg-yellow-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Kết nối với chúng tôi</h3>
            <div className="flex space-x-4 mb-8">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-3 rounded-full hover:bg-yellow-500 transition-colors duration-200 group"
              >
                <FiFacebook className="h-5 w-5 group-hover:scale-110 transform transition-transform duration-200" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-3 rounded-full hover:bg-yellow-500 transition-colors duration-200 group"
              >
                <FiInstagram className="h-5 w-5 group-hover:scale-110 transform transition-transform duration-200" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-3 rounded-full hover:bg-yellow-500 transition-colors duration-200 group"
              >
                <FiYoutube className="h-5 w-5 group-hover:scale-110 transform transition-transform duration-200" />
              </a>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Đăng ký nhận tin</h4>
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email của bạn"
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-shadow duration-200"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200 text-sm font-medium"
                >
                  Đăng ký
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} LemonHub. Tất cả quyền được bảo lưu.
            </p>
            <div>
              <ul className="flex flex-wrap justify-center space-x-6 text-sm">
                <li>
                  <Link 
                    href="/privacy" 
                    className="text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                  >
                    Chính sách bảo mật
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/terms" 
                    className="text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                  >
                    Điều khoản sử dụng
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/sitemap" 
                    className="text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                  >
                    Sơ đồ website
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 