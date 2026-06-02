"use client";

import React, { useState } from 'react';
import { FiPlus, FiMinus, FiShoppingCart, FiTruck, FiRefreshCw, FiCreditCard } from 'react-icons/fi';

interface Question {
  question: string;
  answer: string;
}

interface Category {
  icon: React.ReactNode;
  title: string;
  questions: Question[];
}

const faqCategories: Category[] = [
  {
    icon: <FiShoppingCart className="w-6 h-6" />,
    title: 'Mua hàng',
    questions: [
      {
        question: 'Làm thế nào để đặt hàng trên website?',
        answer: 'Để đặt hàng, bạn có thể thực hiện theo các bước sau: 1) Chọn sản phẩm và thêm vào giỏ hàng, 2) Nhấn vào giỏ hàng và kiểm tra đơn hàng, 3) Điền thông tin giao hàng, 4) Chọn phương thức thanh toán, 5) Xác nhận đặt hàng.'
      },
      {
        question: 'Tôi có thể mua hàng mà không cần đăng ký tài khoản không?',
        answer: 'Có, bạn có thể mua hàng với tư cách khách vãng lai. Tuy nhiên, chúng tôi khuyến khích bạn đăng ký tài khoản để dễ dàng theo dõi đơn hàng và nhận được nhiều ưu đãi hơn.'
      },
      {
        question: 'Làm sao để hủy đơn hàng?',
        answer: 'Bạn có thể hủy đơn hàng trong vòng 24 giờ sau khi đặt hàng và trước khi đơn hàng được giao cho đơn vị vận chuyển. Để hủy đơn hàng, vui lòng truy cập vào mục "Đơn hàng của tôi" hoặc liên hệ với tổng đài hỗ trợ.'
      }
    ]
  },
  {
    icon: <FiTruck className="w-6 h-6" />,
    title: 'Vận chuyển',
    questions: [
      {
        question: 'Thời gian giao hàng mất bao lâu?',
        answer: 'Thời gian giao hàng thông thường từ 1-3 ngày làm việc đối với khu vực nội thành và 3-5 ngày làm việc đối với khu vực ngoại thành. Thời gian có thể thay đổi tùy thuộc vào địa điểm giao hàng và tình trạng sản phẩm.'
      },
      {
        question: 'Phí vận chuyển được tính như thế nào?',
        answer: 'Phí vận chuyển được tính dựa trên khoảng cách và khối lượng hàng hóa. Đơn hàng từ 500.000đ trở lên sẽ được miễn phí vận chuyển cho khu vực nội thành. Chi tiết phí vận chuyển sẽ được hiển thị khi bạn nhập địa chỉ giao hàng.'
      },
      {
        question: 'Có thể thay đổi địa chỉ giao hàng sau khi đặt hàng không?',
        answer: 'Bạn có thể thay đổi địa chỉ giao hàng trong vòng 24 giờ sau khi đặt hàng và trước khi đơn hàng được giao cho đơn vị vận chuyển. Vui lòng liên hệ với tổng đài hỗ trợ để được giúp đỡ.'
      }
    ]
  },
  {
    icon: <FiRefreshCw className="w-6 h-6" />,
    title: 'Đổi trả & Bảo hành',
    questions: [
      {
        question: 'Chính sách đổi trả như thế nào?',
        answer: 'LemonHub áp dụng chính sách đổi trả trong vòng 15 ngày kể từ ngày nhận hàng. Sản phẩm phải còn nguyên vẹn, đầy đủ phụ kiện và hộp sản phẩm. Một số sản phẩm có điều kiện đổi trả riêng, vui lòng xem chi tiết tại trang Chính sách đổi trả.'
      },
      {
        question: 'Làm sao để kiểm tra thời hạn bảo hành?',
        answer: 'Bạn có thể kiểm tra thời hạn bảo hành bằng cách: 1) Nhập số serial của sản phẩm vào mục "Kiểm tra bảo hành" trên website, 2) Liên hệ trực tiếp với tổng đài hỗ trợ, 3) Mang sản phẩm đến cửa hàng LemonHub gần nhất.'
      },
      {
        question: 'Chi phí đổi trả như thế nào?',
        answer: 'Trong trường hợp lỗi do nhà sản xuất hoặc do vận chuyển, chúng tôi sẽ chịu toàn bộ chi phí đổi trả. Nếu đổi trả vì lý do cá nhân, khách hàng sẽ chịu chi phí vận chuyển hai chiều.'
      }
    ]
  },
  {
    icon: <FiCreditCard className="w-6 h-6" />,
    title: 'Thanh toán',
    questions: [
      {
        question: 'Có những phương thức thanh toán nào?',
        answer: 'LemonHub chấp nhận nhiều phương thức thanh toán bao gồm: Thanh toán khi nhận hàng (COD), chuyển khoản ngân hàng, thẻ tín dụng/ghi nợ, và các ví điện tử như Momo, ZaloPay, VNPay.'
      },
      {
        question: 'Làm sao để biết thanh toán đã thành công?',
        answer: 'Sau khi thanh toán thành công, bạn sẽ nhận được email xác nhận và có thể kiểm tra trạng thái đơn hàng trong tài khoản của mình. Đối với thanh toán COD, bạn sẽ nhận được biên lai khi thanh toán cho shipper.'
      },
      {
        question: 'Có an toàn khi thanh toán online không?',
        answer: 'Có, mọi giao dịch thanh toán trên LemonHub đều được bảo mật bằng công nghệ SSL và tuân thủ các tiêu chuẩn bảo mật quốc tế PCI DSS. Chúng tôi không lưu trữ thông tin thẻ của khách hàng.'
      }
    ]
  }
];

export default function FAQPage() {
  const [openCategory, setOpenCategory] = useState<number>(-1);
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({});

  const toggleCategory = (index: number) => {
    setOpenCategory(openCategory === index ? -1 : index);
  };

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Câu hỏi thường gặp
          </h1>
          <p className="text-lg text-gray-600">
            Tìm câu trả lời nhanh chóng cho các thắc mắc của bạn
          </p>
        </div>

        <div className="space-y-6">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left"
                onClick={() => toggleCategory(categoryIndex)}
              >
                <div className="flex items-center">
                  <div className="text-yellow-500 mr-3">{category.icon}</div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {category.title}
                  </h2>
                </div>
                <div className="text-yellow-500">
                  {openCategory === categoryIndex ? (
                    <FiMinus className="w-6 h-6" />
                  ) : (
                    <FiPlus className="w-6 h-6" />
                  )}
                </div>
              </button>

              {openCategory === categoryIndex && (
                <div className="px-6 pb-6">
                  <div className="space-y-4">
                    {category.questions.map((item, questionIndex) => (
                      <div key={questionIndex} className="border-b border-gray-200 last:border-0">
                        <button
                          className="w-full py-4 flex items-center justify-between text-left"
                          onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                        >
                          <h3 className="text-lg font-medium text-gray-900 pr-8">
                            {item.question}
                          </h3>
                          <div className="text-yellow-500 flex-shrink-0">
                            {openQuestions[`${categoryIndex}-${questionIndex}`] ? (
                              <FiMinus className="w-5 h-5" />
                            ) : (
                              <FiPlus className="w-5 h-5" />
                            )}
                          </div>
                        </button>
                        {openQuestions[`${categoryIndex}-${questionIndex}`] && (
                          <div className="pb-4 text-gray-600">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Additional Support */}
        <div className="mt-12 bg-yellow-50 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Không tìm thấy câu trả lời bạn cần?
          </h2>
          <p className="text-gray-600 mb-6">
            Liên hệ với chúng tôi để được hỗ trợ trực tiếp
          </p>
          <a
            href="/lien-he"
            className="inline-block bg-yellow-500 text-white px-8 py-3 rounded-md hover:bg-yellow-600 transition-colors"
          >
            Liên hệ hỗ trợ
          </a>
        </div>
      </div>
    </div>
  );
}