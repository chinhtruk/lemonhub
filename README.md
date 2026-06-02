# LemonHub E-commerce

Dự án website thương mại điện tử LemonHub với đầy đủ tính năng từ frontend đến backend và admin dashboard.

## Cấu trúc dự án

- `customer/`: Frontend Next.js cho người dùng
- `server/`: Backend API với Express.js
- `admin/`: Admin dashboard với React.js

## Yêu cầu hệ thống

- Node.js >= 14.x
- npm >= 6.x
- MongoDB

## Cài đặt và chạy dự án

### Bước 1: Clone dự án

```bash
git clone <repository-url>
cd LemonHub
```

### Bước 2: Cài đặt và chạy server (Backend)

```bash
cd server
npm install
npm run dev
```

Backend API sẽ chạy ở địa chỉ: http://localhost:5000

### Bước 3: Cài đặt và chạy frontend

```bash
cd customer
npm install
npm run dev
```

Frontend sẽ chạy ở địa chỉ: http://localhost:3000

### Bước 4: Cài đặt và chạy admin panel

```bash
cd admin
npm install
npm start
```

Admin dashboard sẽ chạy ở địa chỉ: http://localhost:3001

## Tạo tài khoản admin

Để tạo tài khoản admin đầu tiên, bạn có thể sử dụng API:

1. Đăng ký tài khoản người dùng thông thường trước qua API `/api/users`
2. Vào MongoDB sửa trường `isAdmin` thành `true` cho user vừa tạo
3. Sử dụng tài khoản này để đăng nhập vào trang admin

## Kết nối với MongoDB

Tạo file `server/.env` từ `server/.env.example`, sau đó điền MongoDB connection string và JWT secret của bạn:

```bash
cp server/.env.example server/.env
```

Không commit file `.env` hoặc connection string thật lên GitHub.

## API Endpoints

### User API
- `POST /api/users` - Đăng ký
- `POST /api/users/login` - Đăng nhập
- `GET /api/users/profile` - Lấy thông tin người dùng
- `PUT /api/users/profile` - Cập nhật thông tin người dùng
- `GET /api/users` - Lấy danh sách người dùng (Admin)
- `DELETE /api/users/:id` - Xóa người dùng (Admin)
- `GET /api/users/:id` - Lấy thông tin người dùng theo id (Admin)
- `PUT /api/users/:id` - Cập nhật thông tin người dùng (Admin)

### Product API
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/top` - Lấy sản phẩm được đánh giá cao
- `GET /api/products/featured` - Lấy sản phẩm nổi bật
- `GET /api/products/category/:id` - Lấy sản phẩm theo danh mục
- `GET /api/products/slug/:slug` - Lấy sản phẩm theo slug
- `GET /api/products/:id` - Lấy thông tin sản phẩm
- `POST /api/products` - Tạo sản phẩm mới (Admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)
- `POST /api/products/:id/reviews` - Đánh giá sản phẩm

### Order API
- `POST /api/orders` - Tạo đơn hàng mới
- `GET /api/orders/myorders` - Lấy đơn hàng của người dùng
- `GET /api/orders/track/:trackingCode` - Tra cứu đơn hàng theo mã
- `GET /api/orders/:id` - Lấy thông tin đơn hàng
- `PUT /api/orders/:id/pay` - Cập nhật trạng thái thanh toán
- `PUT /api/orders/:id/deliver` - Cập nhật trạng thái giao hàng (Admin)
- `PUT /api/orders/:id/status` - Cập nhật trạng thái đơn hàng (Admin)
- `GET /api/orders` - Lấy danh sách đơn hàng (Admin)

### Category API
- `GET /api/categories` - Lấy danh sách danh mục
- `GET /api/categories/featured` - Lấy danh mục nổi bật
- `GET /api/categories/slug/:slug` - Lấy danh mục theo slug
- `GET /api/categories/:id` - Lấy thông tin danh mục
- `POST /api/categories` - Tạo danh mục mới (Admin)
- `PUT /api/categories/:id` - Cập nhật danh mục (Admin)
- `DELETE /api/categories/:id` - Xóa danh mục (Admin)

### Upload API
- `POST /api/upload` - Upload ảnh (Admin)
- `POST /api/upload/multiple` - Upload nhiều ảnh (Admin)

## Tác giả

Nguyễn Chính Trực
