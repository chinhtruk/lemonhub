'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ApiCheck() {
  const [status, setStatus] = useState<string>('Đang kiểm tra...');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        console.log('Kiểm tra kết nối với server:', serverUrl);
        
        // Kiểm tra kết nối cơ bản
        const response = await axios.get(serverUrl, { 
          timeout: 5000 
        });
        
        setStatus('Server hoạt động!');
        setData({ baseUrl: response.data });
        
        // Thử kiểm tra các endpoint chính
        try {
          const productsResponse = await axios.get(`${serverUrl}/api/products/featured?limit=2`, { timeout: 5000 });
          setData(prev => ({ ...prev, products: productsResponse.data }));
        } catch (err: any) {
          setData(prev => ({ ...prev, productsError: err.message }));
        }
        
        try {
          const bannersResponse = await axios.get(`${serverUrl}/api/banners`, { timeout: 5000 });
          setData(prev => ({ ...prev, banners: bannersResponse.data }));
        } catch (err: any) {
          setData(prev => ({ ...prev, bannersError: err.message }));
        }
      } catch (err: any) {
        console.error('Lỗi kết nối API:', err);
        setStatus('Server không hoạt động!');
        setError(err.message);
      }
    };

    checkApi();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Kiểm tra kết nối API</h1>
      
      <div className={`p-4 rounded mb-4 ${status.includes('không') ? 'bg-red-100' : 'bg-green-100'}`}>
        <p className="font-bold">Trạng thái: {status}</p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
      
      {data && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Kết quả:</h2>
          <pre className="whitespace-pre-wrap bg-white p-4 rounded overflow-auto max-h-[400px]">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-6 space-y-4">
        <h2 className="font-bold">Hướng dẫn khắc phục:</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Kiểm tra xem server có đang chạy không: <code className="bg-gray-100 px-2 py-1 rounded">cd server && npm run dev</code></li>
          <li>Kiểm tra cổng server (mặc định 5001): <code className="bg-gray-100 px-2 py-1 rounded">server/server.js</code></li>
          <li>Kiểm tra các lỗi trong console của server</li>
          <li>Kiểm tra xem có vấn đề về CORS không</li>
          <li>Đảm bảo cấu hình <code className="bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_API_URL</code> chính xác</li>
        </ol>
      </div>
    </div>
  );
} 