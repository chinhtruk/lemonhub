import { FiTruck, FiClock, FiDollarSign, FiMap } from 'react-icons/fi';

const shippingMethods = [
  {
    icon: <FiTruck className="w-8 h-8" />,
    title: 'Giao hàng tiêu chuẩn',
    time: '1-3 ngày (nội thành), 3-5 ngày (ngoại thành)',
    fee: 'Miễn phí cho đơn hàng từ 500.000đ'
  },
  {
    icon: <FiClock className="w-8 h-8" />,
    title: 'Giao hàng nhanh',
    time: '2-4 giờ (nội thành), 24 giờ (ngoại thành)',
    fee: 'Phụ thu theo khoảng cách'
  }
];

const shippingAreas = [
  {
    region: 'Khu vực 1',
    areas: 'TP.HCM, Hà Nội, Đà Nẵng',
    time: '1-3 ngày làm việc',
    fee: '20.000đ - 40.000đ'
  },
  {
    region: 'Khu vực 2',
    areas: 'Các tỉnh thành khác',
    time: '3-5 ngày làm việc',
    fee: '30.000đ - 50.000đ'
  }
];

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Chính sách vận chuyển
        </h1>

        {/* Shipping Methods */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Phương thức vận chuyển
          </h2>
          <div className="grid gap-8">
            {shippingMethods.map((method, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="text-yellow-500">{method.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {method.title}
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p className="flex items-center">
                      <FiClock className="w-5 h-5 mr-2 text-yellow-500" />
                      Thời gian: {method.time}
                    </p>
                    <p className="flex items-center">
                      <FiDollarSign className="w-5 h-5 mr-2 text-yellow-500" />
                      Phí vận chuyển: {method.fee}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Areas */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Khu vực giao hàng
          </h2>
          <div className="grid gap-6">
            {shippingAreas.map((area, index) => (
              <div key={index} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {area.region}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
                  <p className="flex items-center">
                    <FiMap className="w-5 h-5 mr-2 text-yellow-500" />
                    {area.areas}
                  </p>
                  <p className="flex items-center">
                    <FiClock className="w-5 h-5 mr-2 text-yellow-500" />
                    {area.time}
                  </p>
                  <p className="flex items-center">
                    <FiDollarSign className="w-5 h-5 mr-2 text-yellow-500" />
                    {area.fee}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Điều khoản vận chuyển
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              1. LemonHub cam kết giao hàng đúng thời gian và địa điểm theo thỏa thuận với khách hàng.
            </p>
            <p>
              2. Trong trường hợp có sự chậm trễ, chúng tôi sẽ thông báo cho khách hàng và có phương án xử lý phù hợp.
            </p>
            <p>
              3. Khách hàng có thể theo dõi đơn hàng thông qua mã vận đơn được cung cấp sau khi đặt hàng.
            </p>
            <p>
              4. Miễn phí giao hàng cho đơn hàng từ 500.000đ (áp dụng cho giao hàng tiêu chuẩn).
            </p>
            <p>
              5. Phí giao hàng có thể thay đổi tùy theo khu vực và khối lượng hàng hóa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 