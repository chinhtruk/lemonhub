import { FiShield, FiClock, FiCheckCircle, FiAlertTriangle, FiTool } from 'react-icons/fi';

const warrantyPeriods = [
  {
    category: 'Điện thoại, Tablet',
    period: '12 tháng',
    details: 'Bảo hành chính hãng, 1 đổi 1 trong 30 ngày đầu nếu lỗi phần cứng'
  },
  {
    category: 'Laptop',
    period: '24 tháng',
    details: 'Bảo hành chính hãng, hỗ trợ cài đặt phần mềm trọn đời'
  },
  {
    category: 'Phụ kiện',
    period: '6-12 tháng',
    details: 'Thời gian bảo hành tùy theo từng sản phẩm cụ thể'
  },
  {
    category: 'Smart Watch',
    period: '12 tháng',
    details: 'Bảo hành chính hãng, 1 đổi 1 trong 15 ngày đầu nếu lỗi'
  }
];

const warrantyProcess = [
  {
    icon: <FiCheckCircle className="w-6 h-6" />,
    title: 'Kiểm tra điều kiện bảo hành',
    description: 'Sản phẩm trong thời hạn bảo hành, tem và phiếu bảo hành còn nguyên vẹn'
  },
  {
    icon: <FiTool className="w-6 h-6" />,
    title: 'Gửi sản phẩm bảo hành',
    description: 'Mang sản phẩm đến trung tâm bảo hành hoặc cửa hàng LemonHub gần nhất'
  },
  {
    icon: <FiClock className="w-6 h-6" />,
    title: 'Thời gian xử lý',
    description: '3-7 ngày làm việc tùy theo tình trạng sản phẩm'
  }
];

export default function WarrantyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Chính sách bảo hành
          </h1>
          <p className="text-lg text-gray-600">
            Cam kết bảo hành chính hãng, hỗ trợ khách hàng tận tâm
          </p>
        </div>

        {/* Warranty Periods */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Thời gian bảo hành theo sản phẩm
          </h2>
          <div className="grid gap-6">
            {warrantyPeriods.map((item, index) => (
              <div
                key={index}
                className="flex items-start p-4 border border-gray-200 rounded-lg"
              >
                <div className="text-yellow-500 mr-4">
                  <FiShield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.category}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Thời gian:</span> {item.period}
                  </p>
                  <p className="text-gray-600">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warranty Process */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Quy trình bảo hành
          </h2>
          <div className="grid gap-8">
            {warrantyProcess.map((step, index) => (
              <div key={index} className="flex items-start">
                <div className="text-yellow-500 mr-4">{step.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warranty Terms */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Điều kiện bảo hành
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                <FiCheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Điều kiện được bảo hành
              </h3>
              <ul className="space-y-2 text-gray-600 ml-7">
                <li>• Sản phẩm còn trong thời hạn bảo hành</li>
                <li>• Tem bảo hành và phiếu bảo hành còn nguyên vẹn</li>
                <li>• Lỗi do nhà sản xuất</li>
                <li>• Sử dụng đúng hướng dẫn</li>
              </ul>
            </div>

            <div>
              <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                <FiAlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                Điều kiện không được bảo hành
              </h3>
              <ul className="space-y-2 text-gray-600 ml-7">
                <li>• Sản phẩm hết thời hạn bảo hành</li>
                <li>• Tem bảo hành bị rách, mờ hoặc chỉnh sửa</li>
                <li>• Sản phẩm bị va đập, rơi vỡ</li>
                <li>• Sản phẩm bị vào nước hoặc cháy nổ</li>
                <li>• Sử dụng sai hướng dẫn</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 