import { FiDollarSign, FiCreditCard, FiSmartphone, FiTruck, FiShield } from 'react-icons/fi';
import Image from 'next/image';

const paymentMethods = [
  {
    icon: <FiTruck className="w-8 h-8" />,
    title: 'Thanh toán khi nhận hàng (COD)',
    description: 'Thanh toán bằng tiền mặt khi nhận hàng tại nhà',
    benefits: [
      'Kiểm tra hàng trước khi thanh toán',
      'Không cần tài khoản ngân hàng',
      'An toàn, tiện lợi'
    ]
  },
  {
    icon: <FiCreditCard className="w-8 h-8" />,
    title: 'Thẻ tín dụng/ghi nợ',
    description: 'Thanh toán online qua cổng thanh toán bảo mật',
    benefits: [
      'Giao dịch được mã hóa SSL',
      'Hỗ trợ tất cả ngân hàng tại Việt Nam',
      'Xác thực 3D Secure'
    ]
  },
  {
    icon: <FiSmartphone className="w-8 h-8" />,
    title: 'Ví điện tử',
    description: 'Thanh toán qua các ví điện tử phổ biến',
    benefits: [
      'Giao dịch nhanh chóng',
      'Nhiều ưu đãi từ ví điện tử',
      'Lưu thông tin thanh toán an toàn'
    ]
  }
];

const banks = [
  'vietcombank.png',
  'techcombank.png',
  'vpbank.png',
  'acb.png',
  'bidv.png',
  'agribank.png'
];

const ewallets = [
  'momo.png',
  'zalopay.png',
  'vnpay.png',
  'shopeepay.png'
];

export default function PaymentMethodsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Phương thức thanh toán
          </h1>
          <p className="text-lg text-gray-600">
            Thanh toán an toàn và tiện lợi với nhiều lựa chọn
          </p>
        </div>

        {/* Payment Methods */}
        <div className="grid gap-8 mb-12">
          {paymentMethods.map((method, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-start">
                <div className="text-yellow-500 mr-6">{method.icon}</div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {method.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{method.description}</p>
                  <ul className="space-y-2">
                    {method.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <FiShield className="w-5 h-5 text-yellow-500 mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Supported Banks */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Ngân hàng hỗ trợ
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {banks.map((bank, index) => (
              <div key={index} className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                <Image
                  src={`/images/banks/${bank}`}
                  alt={bank.replace('.png', '')}
                  width={80}
                  height={40}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* E-wallets */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Ví điện tử
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ewallets.map((wallet, index) => (
              <div key={index} className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                <Image
                  src={`/images/ewallets/${wallet}`}
                  alt={wallet.replace('.png', '')}
                  width={80}
                  height={40}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 rounded-2xl p-6">
          <div className="flex items-start">
            <FiShield className="w-6 h-6 text-yellow-500 mt-1 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Bảo mật thanh toán
              </h3>
              <p className="text-gray-600">
                Mọi thông tin thanh toán của bạn đều được mã hóa và bảo vệ bởi công nghệ SSL.
                Chúng tôi không lưu trữ thông tin thẻ của bạn và tuân thủ các tiêu chuẩn bảo
                mật quốc tế PCI DSS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 