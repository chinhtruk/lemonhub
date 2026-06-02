'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiMapPin, FiPhone, FiClock, FiNavigation } from 'react-icons/fi';
import { useNearestStore } from '@/hooks/useNearestStore';
import { getAllStores, getStoresByCity } from '@/services/store.service';
import { getFullImageUrl } from '@/utils/image';
import Image from 'next/image';

// Lấy đường dẫn API server
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Function to get final image URL with fallback and logging
const getStoreImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) {
    console.log('No image path provided, using placeholder');
    return '/images/store-placeholder.svg';
  }
  
  console.log('Original image path:', imagePath);
  
  // Nếu là URL tuyệt đối, trả về nguyên bản
  if (imagePath.startsWith('http')) {
    console.log('Using absolute URL:', imagePath);
    return imagePath;
  }
  
  // Nếu đường dẫn bắt đầu bằng /uploads/, sử dụng URL API server
  if (imagePath.startsWith('/uploads/')) {
    const fullUrl = `${API_URL}${imagePath}`;
    console.log('Using API URL for uploads:', fullUrl);
    return fullUrl;
  }
  
  // Đối với đường dẫn khác, sử dụng getFullImageUrl
  const fullUrl = getFullImageUrl(imagePath);
  console.log('Using getFullImageUrl result:', fullUrl);
  return fullUrl;
};

interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  image: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export default function StoreLocations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeError, setStoreError] = useState('');
  const { nearestStore, error, loading: locationLoading, getUserLocation } = useNearestStore();

  const cities = [
    { value: 'all', label: 'Tất cả tỉnh thành' },
    { value: 'hcm', label: 'TP. Hồ Chí Minh' },
    { value: 'hn', label: 'Hà Nội' },
    { value: 'dn', label: 'Đà Nẵng' },
  ];

  // Tải danh sách cửa hàng khi component mount hoặc khi city thay đổi
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        let storesData;
        
        if (selectedCity === 'all') {
          storesData = await getAllStores();
        } else {
          storesData = await getStoresByCity(selectedCity);
        }
        
        setStores(storesData);
        setStoreError('');
      } catch (err) {
        console.error('Error fetching stores:', err);
        setStoreError('Không thể tải danh sách cửa hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [selectedCity]);

  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Hệ Thống Cửa Hàng LemonHub</h1>
            <p className="text-xl text-white/90">Tìm cửa hàng LemonHub gần bạn nhất</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên đường, quận huyện..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-shadow placeholder:text-gray-600 placeholder:font-medium"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-shadow text-gray-700"
            >
              {cities.map(city => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
            <button
              onClick={getUserLocation}
              disabled={locationLoading}
              className="flex items-center justify-center space-x-2 bg-yellow-500 text-white px-6 py-3 rounded-xl hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiNavigation className="w-5 h-5" />
              <span>Tìm cửa hàng gần nhất</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {(error || storeError) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600">{error || storeError}</p>
          </div>
        </div>
      )}

      {/* Nearest Store Section */}
      {nearestStore && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative h-64 md:h-full">
                <Image
                  src={getStoreImageUrl(nearestStore.image)}
                  alt={nearestStore.name}
                  fill
                  className="object-cover"
                  unoptimized={!nearestStore.image?.startsWith('http')}
                  onError={(e) => {
                    console.error('Failed to load store image:', nearestStore.image);
                    e.currentTarget.src = '/images/store-placeholder.svg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500 text-white text-sm font-medium">
                    <FiMapPin className="w-4 h-4 mr-1" />
                    Cửa hàng gần nhất
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{nearestStore.name}</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FiMapPin className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                    <p className="ml-3 text-gray-600">{nearestStore.address}</p>
                  </div>
                  <div className="flex items-center">
                    <FiPhone className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <p className="ml-3 text-gray-600">{nearestStore.phone}</p>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <p className="ml-3 text-gray-600">{nearestStore.hours}</p>
                  </div>
                </div>
                <div className="mt-8 flex space-x-4">
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${nearestStore.location.latitude},${nearestStore.location.longitude}`)}
                    className="flex-1 bg-yellow-500 text-white py-3 px-6 rounded-xl hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FiNavigation className="w-5 h-5" />
                    <span>Chỉ đường</span>
                  </button>
                  <button className="flex-1 border border-yellow-500 text-yellow-500 py-3 px-6 rounded-xl hover:bg-yellow-50 transition-colors">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Store List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Tất cả cửa hàng</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-5 h-5 bg-gray-200 rounded-full mt-1"></div>
                      <div className="ml-3 h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                      <div className="ml-3 h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                      <div className="ml-3 h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="mt-6 flex space-x-4">
                    <div className="flex-1 h-10 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 h-10 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStores.map(store => (
              <div 
                key={store.id} 
                className={`group bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${
                  selectedStore?.id === store.id ? 'ring-2 ring-yellow-500' : ''
                }`}
                onClick={() => setSelectedStore(store)}
              >
                <div className="relative h-48">
                  <Image
                    src={getStoreImageUrl(store.image)}
                    alt={store.name}
                    fill
                    className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                    unoptimized={!store.image?.startsWith('http')} 
                    onError={(e) => {
                      console.error('Failed to load store image:', store.image);
                      e.currentTarget.src = '/images/store-placeholder.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-yellow-500 transition-colors">
                    {store.name}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FiMapPin className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                      <p className="ml-3 text-gray-600 line-clamp-2">{store.address}</p>
                    </div>
                    <div className="flex items-center">
                      <FiPhone className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                      <p className="ml-3 text-gray-600">{store.phone}</p>
                    </div>
                    <div className="flex items-center">
                      <FiClock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                      <p className="ml-3 text-gray-600">{store.hours}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex space-x-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://www.google.com/maps/search/?api=1&query=${store.location.latitude},${store.location.longitude}`);
                      }}
                      className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-xl hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FiNavigation className="w-4 h-4" />
                      <span>Chỉ đường</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStore(store);
                      }}
                      className="flex-1 border border-yellow-500 text-yellow-500 py-2 px-4 rounded-xl hover:bg-yellow-50 transition-colors"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Không tìm thấy cửa hàng nào phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
} 