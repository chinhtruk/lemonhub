import { useState, useEffect } from 'react';
import { getAllStores, findNearestStore } from '@/services/store.service';

interface Location {
  latitude: number;
  longitude: number;
}

interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  image: string;
  location: Location;
}

// Calculate distance between two points using Haversine formula
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

export function useNearestStore() {
  const [stores, setStores] = useState<Store[]>([]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [nearestStore, setNearestStore] = useState<Store | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Tải danh sách cửa hàng khi component mount
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storesData = await getAllStores();
        setStores(storesData);
      } catch (err) {
        setError('Không thể tải danh sách cửa hàng. Vui lòng thử lại sau.');
        console.error('Error fetching stores:', err);
      }
    };

    fetchStores();
  }, []);

  const findNearestStoreLocal = (location: Location) => {
    if (stores.length === 0) {
      return null;
    }

    let nearest = stores[0];
    let minDistance = getDistance(
      location.latitude,
      location.longitude,
      nearest.location.latitude,
      nearest.location.longitude
    );

    stores.forEach(store => {
      const distance = getDistance(
        location.latitude,
        location.longitude,
        store.location.latitude,
        store.location.longitude
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = store;
      }
    });

    return nearest;
  };

  const getUserLocation = async () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Trình duyệt của bạn không hỗ trợ định vị');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setUserLocation(location);
        
        try {
          // Gọi API để tìm cửa hàng gần nhất
          const nearestStoreData = await findNearestStore(location.latitude, location.longitude);
          setNearestStore(nearestStoreData);
        } catch (err) {
          console.error('Error finding nearest store from API:', err);
          // Fallback: sử dụng tính toán local nếu API lỗi
          const nearest = findNearestStoreLocal(location);
          setNearestStore(nearest);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Vui lòng cho phép truy cập vị trí của bạn');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Không thể xác định vị trí của bạn');
            break;
          case error.TIMEOUT:
            setError('Hết thời gian yêu cầu vị trí');
            break;
          default:
            setError('Đã xảy ra lỗi khi xác định vị trí');
        }
        setLoading(false);
      }
    );
  };

  return {
    stores,
    userLocation,
    nearestStore,
    error,
    loading,
    getUserLocation
  };
}