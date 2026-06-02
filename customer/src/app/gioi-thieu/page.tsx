export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Giới thiệu về LemonHub</h1>
        
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Về chúng tôi</h2>
            <p className="text-gray-600 leading-relaxed">
              LemonHub là một trong những cửa hàng công nghệ hàng đầu tại Việt Nam, chuyên cung cấp các sản phẩm công nghệ chính hãng với chất lượng cao và giá cả cạnh tranh.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Sứ mệnh</h2>
            <p className="text-gray-600 leading-relaxed">
              Chúng tôi cam kết mang đến cho khách hàng những sản phẩm công nghệ tốt nhất với dịch vụ chuyên nghiệp, tận tâm và đáng tin cậy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Giá trị cốt lõi</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Chất lượng sản phẩm là ưu tiên hàng đầu</li>
              <li>Dịch vụ khách hàng tận tâm</li>
              <li>Giá cả cạnh tranh và minh bạch</li>
              <li>Bảo hành chuyên nghiệp</li>
              <li>Đội ngũ nhân viên có chuyên môn cao</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Thành tựu</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">10K+</div>
                <div className="text-gray-600">Khách hàng tin tưởng</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">1K+</div>
                <div className="text-gray-600">Sản phẩm đa dạng</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">50+</div>
                <div className="text-gray-600">Nhân viên tận tâm</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 