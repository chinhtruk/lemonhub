import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Liên hệ với chúng tôi</h1>
        
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin liên hệ</h2>
              
              <div className="flex items-start space-x-4">
                <FiMapPin className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Địa chỉ</h3>
                  <p className="text-gray-600">123 Đường ABC, Quận 1, TP.HCM</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <FiPhone className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Điện thoại</h3>
                  <p className="text-gray-600">1800.2097</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <FiMail className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <p className="text-gray-600">info@lemonhub.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <FiClock className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Giờ làm việc</h3>
                  <p className="text-gray-600">Thứ 2 - Chủ nhật: 8:00 - 21:00</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Nội dung
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                Gửi tin nhắn
              </button>
            </form>
          </div>

          {/* Map */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bản đồ</h2>
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241674197956!2d106.69877857475236!3d10.77772005927447!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3a9d8d1bb3%3A0x1b3da80e47f2f0d1!2zMTIzIMSQxrDhu51uZyBBQkMsIFF14bqtbiAxLCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmg!5e0!3m2!1svi!2s!4v1647327436789!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 