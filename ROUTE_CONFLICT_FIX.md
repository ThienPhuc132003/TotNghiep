# Khắc phục xung đột Route giữa Gia sư và Học viên

## Vấn đề đã được giải quyết:

Trước đây, cả trang lớp học của gia sư và học viên đều sử dụng cùng một route path `"lop-hoc-cua-toi"`, gây ra xung đột trong routing.

## Giải pháp:

1. **Gia sư**: Đổi path từ `"lop-hoc-cua-toi"` thành `"quan-ly-lop-hoc"`
2. **Học viên**: Giữ nguyên path `"lop-hoc-cua-toi"`

## Các thay đổi:

### 1. App.jsx

- Route cho gia sư: `/tai-khoan/ho-so/quan-ly-lop-hoc` → `TutorClassroomPage`
- Route cho học viên: `/tai-khoan/ho-so/lop-hoc-cua-toi` → `StudentClassroomPage`

### 2. AccountPageLayout.jsx

- Menu gia sư: "Quản lý lớp học" (path: quan-ly-lop-hoc)
- Menu học viên: "Lớp học của tôi" (path: lop-hoc-cua-toi)

## API Endpoints đã được xác nhận:

- **TutorClassroomPage**: `classroom/search-for-tutor` ✅
- **StudentClassroomPage**: `classroom/search-for-user` ✅

## Kết quả:

- Gia sư và học viên giờ có các route riêng biệt
- Không còn xung đột routing
- Mỗi trang sử dụng đúng API endpoint tương ứng
