# Trang Thống Kê Gia Sư - Hướng Dẫn Sử Dụng

## Tổng Quan

Trang thống kê gia sư là một trang tổng hợp cho phép gia sư xem thống kê chi tiết về:

1. **Doanh thu** - Theo dõi tất cả các giao dịch và thu nhập
2. **Lượt thuê** - Xem các yêu cầu đặt lịch từ học viên
3. **Đánh giá** - Theo dõi đánh giá và phản hồi từ học viên

## Đường Dẫn

```
/tai-khoan/ho-so/thong-ke-tong-hop
```

## Các API Endpoints

### 1. API Thống Kê Doanh Thu

```
GET /manage-payment/search-with-time-by-tutor
```

**Parameters:**

- `tutorId`: ID của gia sư
- `startDate` (optional): Ngày bắt đầu lọc
- `endDate` (optional): Ngày kết thúc lọc

**Response Structure:**

```json
{
  "status": "OK",
  "code": 200,
  "success": true,
  "message": "Manage Payment with time fetch successfully",
  "data": {
    "total": 1,
    "items": [
      {
        "managePaymentId": "225bab1d-09dd-4a80-8884-fb141a66238d",
        "userId": "US00028",
        "tutorId": "US00011",
        "coinOfUserPayment": 2700,
        "coinOfTutorReceive": 2430,
        "coinOfWebReceive": 270,
        "createdAt": "2025-06-02T11:18:28.200Z",
        "user": {
          "userId": "US00028",
          "userDisplayName": "Trần Thị Thanh",
          "fullname": "Trần Thị Thảo"
        }
      }
    ],
    "totalRevenue": 2430
  }
}
```

### 2. API Thống Kê Lượt Thuê

```
GET /booking-request/search-with-time-for-tutor
```

**Parameters:**

- `tutorId`: ID của gia sư
- `startDate` (optional): Ngày bắt đầu lọc
- `endDate` (optional): Ngày kết thúc lọc

**Response Structure:**

```json
{
  "status": "OK",
  "code": 200,
  "success": true,
  "message": "Booking Request with time fetch successfully",
  "data": {
    "total": 1,
    "items": [
      {
        "bookingRequestId": "7b92be8d-3e63-40a2-8ab2-8a77e3865ce3",
        "userId": "US00028",
        "tutorId": "US00011",
        "lessonsPerWeek": 1,
        "totalLessons": 10,
        "hoursPerLesson": "1.50",
        "totalcoins": 2700,
        "startDay": "2025-06-01",
        "status": "ACCEPT",
        "createdAt": "2025-05-31T10:27:43.998Z"
      }
    ]
  }
}
```

### 3. API Thống Kê Đánh Giá

```
GET /classroom-assessment/search-with-time-for-tutor
```

**Parameters:**

- `tutorId`: ID của gia sư
- `startDate` (optional): Ngày bắt đầu lọc
- `endDate` (optional): Ngày kết thúc lọc

**Response Structure:**

```json
{
  "status": "OK",
  "code": 200,
  "success": true,
  "message": "Assessment with time fetched successfully",
  "data": {
    "total": 1,
    "items": [
      {
        "classroomAssessmentId": "7f90af13-7ab0-403a-a9b8-265676e0901f",
        "userId": "US00028",
        "tutorId": "US00011",
        "classroomId": "0d27f835-83e7-408f-b2ab-d932450afc95",
        "classroomEvaluation": "5.0",
        "description": "gia sư dạy tốt",
        "createdAt": "2025-06-17T04:23:35.376Z"
      }
    ],
    "averageRatingWithTime": 5
  }
}
```

## Cấu Trúc Components

### 1. TutorStatistics.jsx (Component chính)

- Chứa tabs và tổng quan thống kê
- Hiển thị 4 thẻ tổng quan: Doanh thu, Lượt thuê, Đánh giá trung bình, Số đánh giá
- Quản lý việc chuyển đổi giữa các tab

### 2. TutorRevenueStatistics.jsx

- Hiển thị chi tiết doanh thu
- Bảng danh sách các giao dịch
- Bộ lọc theo thời gian và tìm kiếm
- Xuất Excel

### 3. TutorBookingStatistics.jsx

- Hiển thị chi tiết lượt thuê
- Bảng danh sách các yêu cầu đặt lịch
- Bộ lọc theo trạng thái và thời gian
- Thống kê theo trạng thái (Chấp nhận, Chờ, Từ chối)

### 4. TutorRatingStatistics.jsx

- Hiển thị chi tiết đánh giá
- Biểu đồ phân bố đánh giá
- Bảng danh sách các đánh giá
- Bộ lọc theo mức đánh giá và thời gian

## Tính Năng

### 1. Dashboard Tổng Quan

- **Tổng doanh thu**: Hiển thị tổng số tiền gia sư nhận được
- **Tổng lượt thuê**: Số lượng yêu cầu đặt lịch
- **Đánh giá trung bình**: Điểm đánh giá trung bình từ học viên
- **Số đánh giá**: Tổng số lượt đánh giá

### 2. Bộ Lọc Thông Minh

- **Tìm kiếm**: Tìm kiếm theo nhiều trường khác nhau
- **Lọc thời gian**: Hôm nay, tuần này, tháng này, năm này
- **Lọc tùy chỉnh**: Chọn khoảng thời gian cụ thể
- **Lọc trạng thái**: Áp dụng cho các tab có trạng thái

### 3. Xuất Dữ Liệu

- Xuất Excel cho tất cả các tab
- Định dạng dữ liệu chuẩn
- Bao gồm cả dữ liệu đã lọc

### 4. Giao Diện Responsive

- Tối ưu cho desktop, tablet và mobile
- Material-UI design system
- Gradient backgrounds và hover effects

## Cách Sử Dụng

### 1. Truy Cập Trang

1. Đăng nhập với tài khoản gia sư
2. Vào "Tài khoản" → "Hồ sơ"
3. Chọn "Thống kê tổng hợp"

### 2. Xem Tổng Quan

- Các thẻ tổng quan hiển thị số liệu tự động cập nhật
- Click vào từng tab để xem chi tiết

### 3. Sử Dụng Bộ Lọc

- **Tìm kiếm**: Nhập từ khóa vào ô tìm kiếm
- **Lọc thời gian**: Chọn từ dropdown
- **Tùy chỉnh ngày**: Chọn "Từ ngày" và "Đến ngày"
- Click "Làm mới" để tải lại dữ liệu

### 4. Xuất Dữ Liệu

- Click nút "Xuất Excel" ở góc phải
- File sẽ được tải về với tên tương ứng tab

## Quyền Truy Cập

- **Chỉ dành cho gia sư**: Trang này chỉ hiển thị cho người dùng có vai trò gia sư
- **Dữ liệu cá nhân**: Mỗi gia sư chỉ xem được thống kê của chính mình
- **Bảo mật**: Tất cả API call đều được xác thực

## Xử Lý Lỗi

- **Không phải gia sư**: Hiển thị thông báo "Trang thống kê chỉ dành cho gia sư"
- **API lỗi**: Hiển thị toast error và thông báo chi tiết
- **Không có dữ liệu**: Hiển thị thông báo "Không có dữ liệu"
- **Loading states**: Hiển thị spinner khi đang tải

## Tối Ưu Hóa Performance

- **Lazy loading**: Components được tải theo yêu cầu
- **Memoization**: Sử dụng useMemo cho các tính toán phức tạp
- **Parallel API calls**: Gọi 3 API đồng thời cho trang tổng quan
- **Client-side filtering**: Lọc dữ liệu ở frontend để giảm tải server

## Kiểm Tra

Để kiểm tra trang hoạt động đúng, có thể:

1. Chạy script test: `tutor-statistics-test.js`
2. Kiểm tra console logs
3. Verify API responses
4. Test các tính năng filter và export

## Support

Nếu gặp vấn đề, hãy kiểm tra:

1. Console logs để xem lỗi
2. Network tab để kiểm tra API calls
3. User role và permissions
4. Dữ liệu trả về từ backend
