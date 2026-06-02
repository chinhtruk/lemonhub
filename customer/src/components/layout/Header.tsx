'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiPhone, FiMapPin, FiPackage, FiGrid, FiZap, FiLogOut } from 'react-icons/fi';
import { BiHeadphone, BiLaptop, BiMobile, BiDesktop, BiTv } from 'react-icons/bi';
import { useNearestStore } from '@/hooks/useNearestStore';
import { useCategory, CategoryId } from '@/hooks/useCategory';
import { useRouter } from 'next/navigation';
import { isAuthenticated, logout } from '@/services/auth.service';
import { getCart } from '@/services/cart.service';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { getUserLocation, loading, error } = useNearestStore();
  const { setSelectedCategory } = useCategory();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Kiểm tra đăng nhập khi component được mount
    const userInfo = isAuthenticated();
    setUser(userInfo);

    // Thêm event listener để lắng nghe thay đổi trong localStorage
    const handleStorageChange = () => {
      const updatedUserInfo = isAuthenticated();
      setUser(updatedUserInfo);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Cũng kiểm tra mỗi khi component re-render để cập nhật UI
    const checkAuth = () => {
      const userInfo = isAuthenticated();
      setUser(userInfo);
    };
    
    // Kiểm tra định kỳ trạng thái đăng nhập
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Lấy số lượng sản phẩm trong giỏ hàng
  useEffect(() => {
    const fetchCartItems = async () => {
      if (user) {
        try {
          const cartData = await getCart();
          const itemCount = cartData.items ? cartData.items.length : 0;
          setCartItemCount(itemCount);
        } catch (error) {
          console.error('Error fetching cart:', error);
        }
      } else {
        setCartItemCount(0);
      }
    };

    fetchCartItems();

    // Cập nhật số lượng sản phẩm trong giỏ hàng mỗi 5 giây
    const interval = setInterval(fetchCartItems, 5000);

    return () => clearInterval(interval);
  }, [user]);

  // Thêm effect để đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setDropdownOpen(false);
    router.push('/');
  };

  const categories = [
    { id: 'phone-tablet' as CategoryId, name: 'Điện thoại, Tablet', icon: <BiMobile className="w-5 h-5" /> },
    { id: 'laptop' as CategoryId, name: 'Laptop', icon: <BiLaptop className="w-5 h-5" /> },
    { id: 'audio' as CategoryId, name: 'Âm thanh', icon: <BiHeadphone className="w-5 h-5" /> },
    { id: 'watch-camera' as CategoryId, name: 'Đồng hồ, Camera', icon: <FiPackage className="w-5 h-5" /> },
    { id: 'pc-monitor' as CategoryId, name: 'PC, Màn hình', icon: <BiDesktop className="w-5 h-5" /> },
    { id: 'tv' as CategoryId, name: 'Tivi', icon: <BiTv className="w-5 h-5" /> },
  ];

  const handleFindNearestStore = async () => {
    getUserLocation();
    router.push('/he-thong-cua-hang');
  };

  const handleCategoryClick = (categoryId: CategoryId) => {
    setSelectedCategory(categoryId);
    router.push('/product');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/product?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className={`bg-white sticky top-0 z-50 transition-shadow duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
      {/* Top header */}
      <div className="bg-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center space-x-6">
              <Link 
                href="/he-thong-cua-hang" 
                className="text-white text-sm hover:text-yellow-100 flex items-center transition-colors duration-200"
              >
                <FiMapPin className="w-4 h-4 mr-1.5" />
                Hệ thống cửa hàng
              </Link>
              <a 
                href="tel:1800.067" 
                className="text-white text-sm hover:text-yellow-100 flex items-center transition-colors duration-200"
              >
                <FiPhone className="w-4 h-4 mr-1.5" />
                Gọi mua hàng: 1800.067
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and All Products button */}
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center group">
                <span className="text-2xl font-bold text-yellow-500 group-hover:text-yellow-600 transition-colors duration-200">
                  LemonHub
                </span>
              </Link>
              <Link 
                href="/product" 
                className="hidden md:flex items-center px-4 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors duration-200"
              >
                <FiGrid className="w-4 h-4 mr-2" />
                Danh mục
              </Link>
            </div>

            {/* Search */}
            <div className="hidden md:block flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Bạn cần tìm gì?"
                  className="w-full pl-4 pr-12 py-2.5 border-2 border-yellow-500 rounded-full focus:outline-none focus:border-yellow-600 transition-colors duration-200 placeholder-gray-700"
                />
                <button 
                  type="submit"
                  className="absolute right-0 top-0 h-full px-4 text-yellow-500 hover:text-yellow-600 transition-colors duration-200"
                >
                  <FiSearch className="h-5 w-5" />
                </button>
              </form>
            </div>

            {/* Right navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/cart" 
                className="flex flex-col items-center text-gray-700 hover:text-yellow-500 transition-colors duration-200 group"
              >
                <div className="relative">
                  <FiShoppingCart className="h-6 w-6 text-yellow-500" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center group-hover:bg-red-600 transition-colors duration-200">
                    {cartItemCount}
                  </span>
                </div>
                <span className="text-xs font-medium mt-1">Giỏ</span>
                <span className="text-xs font-bold">hàng</span>
              </Link>
              {user ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex flex-col items-center text-gray-700 hover:text-yellow-500 transition-colors duration-200"
                  >
                    <FiUser className="h-6 w-6 text-yellow-500" />
                    <span className="text-xs font-medium mt-1">Tài khoản</span>
                    <span className="text-xs font-bold">{user.name}</span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-500"
                      >
                        Thông tin tài khoản
                      </Link>
                      <Link
                        href="/my-orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-500"
                      >
                        Đơn hàng của tôi
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-yellow-50"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="flex flex-col items-center text-gray-700 hover:text-yellow-500 transition-colors duration-200"
                >
                  <FiUser className="h-6 w-6 text-yellow-500" />
                  <span className="text-xs font-medium mt-1">Đăng</span>
                  <span className="text-xs font-bold">nhập</span>
                </Link>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500"
            >
              {isMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-2 pb-3 space-y-3">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Bạn cần tìm gì?"
                className="w-full pl-4 pr-12 py-2.5 border-2 border-yellow-500 rounded-full focus:outline-none focus:border-yellow-600 transition-colors duration-200 placeholder-gray-700"
              />
              <button 
                type="submit"
                className="absolute right-0 top-0 h-full px-4 text-yellow-500 hover:text-yellow-600 transition-colors duration-200"
              >
                <FiSearch className="h-5 w-5" />
              </button>
            </form>
            
            <Link
              href="/product"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-yellow-600 hover:bg-gray-50"
            >
              <FiGrid className="inline-block w-4 h-4 mr-2" />
              Tất cả sản phẩm
            </Link>
            {/* Add other mobile menu items here */}
          </div>
        </div>
      )}
    </header>
  );
} 