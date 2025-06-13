# Sửa lỗi API Include trong Tutor Classroom Detail

## Vấn đề đã phát hiện

- TutorClassroomPage đang sử dụng parameter `include` trong API call để lấy nested data (user, tutor, major, etc.)
- API không hỗ trợ parameter `include` này nên không trả về đầy đủ thông tin nested
- Dẫn đến việc hiển thị thông tin học viên trong chi tiết lớp học bị thiếu dữ liệu

## Giải pháp đã áp dụng

Chuyển sang cách tiếp cận giống như StudentClassroomPage:

### 1. Loại bỏ parameter `include` không được hỗ trợ

**File: `src/pages/User/TutorClassroomPage.jsx`**

```javascript
// BEFORE (lỗi)
const queryParams = {
  page: 1,
  rpp: 1000,
  include: "user,tutor,user.major,tutor.major,tutor.subject,tutor.tutorLevel",
};

// AFTER (đã sửa)
const queryParams = {
  page: 1,
  rpp: 1000,
  // Remove include parameter as API doesn't support it properly
};
```

### 2. Sử dụng data có sẵn thay vì gọi API riêng

**Trước đây:** Gọi `fetchClassroomDetail()` để lấy chi tiết với include parameter

```javascript
// BEFORE (lỗi)
const handleShowClassroomDetail = async (classroom) => {
  const detailedClassroom = await fetchClassroomDetail(classroom.classroomId);
  if (detailedClassroom) {
    setCurrentClassroomDetail(detailedClassroom);
  } else {
    setCurrentClassroomDetail(classroom);
  }
  // ...
};
```

**Hiện tại:** Sử dụng data có sẵn từ classroom object

```javascript
// AFTER (đã sửa)
const handleShowClassroomDetail = (classroom) => {
  // Use data from the list instead of calling separate API
  setCurrentClassroomDetail(classroom);
  setShowClassroomDetail(true);
  // ...
};
```

### 3. Cải thiện URL restoration để tìm full classroom object

```javascript
// BEFORE: Chỉ sử dụng basic data từ URL
setCurrentClassroomDetail({
  classroomId: decodeURIComponent(classroomId),
  nameOfRoom: decodeURIComponent(classroomName),
});

// AFTER: Tìm full classroom object từ allClassrooms nếu có
const foundClassroom = allClassrooms.find(
  (c) => c.classroomId === decodedClassroomId
);
if (foundClassroom) {
  setCurrentClassroomDetail(foundClassroom);
} else {
  setCurrentClassroomDetail({
    classroomId: decodedClassroomId,
    nameOfRoom: decodedClassroomName,
  });
}
```

### 4. Loại bỏ function không cần thiết

- Xóa function `fetchClassroomDetail()` vì không còn sử dụng
- Sửa dependency array của useEffect để bao gồm `allClassrooms`

## Lợi ích của giải pháp

1. **Hiệu suất tốt hơn:** Không cần gọi thêm API khi xem chi tiết
2. **Tính nhất quán:** Sử dụng cùng cách tiếp cận với StudentClassroomPage
3. **Ổn định hơn:** Không phụ thuộc vào API không được hỗ trợ
4. **UX tốt hơn:** Hiển thị chi tiết nhanh hơn vì sử dụng data đã có

## Data hiển thị trong chi tiết

Thông tin học viên được lấy từ `classroom.user`:

- Tên: `classroom.user?.fullname`
- Email: `classroom.user?.personalEmail || classroom.user?.workEmail`
- Số điện thoại: `classroom.user?.phoneNumber`
- Ngày sinh: `classroom.user?.birthday`
- Địa chỉ: `classroom.user?.homeAddress`
- Ngành học: `classroom.user?.major?.majorName`
- Học phí: `classroom.tutor?.coinPerHours`

## Kiểm tra sau khi fix

- [x] Không còn lỗi compile/lint
- [x] Logic hiển thị chi tiết hoạt động bình thường
- [x] URL persistence vẫn hoạt động
- [x] Navigation giữa các view vẫn mượt mà
- [x] Sử dụng cùng pattern với StudentClassroomPage

## Kết quả

Bây giờ TutorClassroomPage sẽ hiển thị đúng thông tin học viên trong chi tiết lớp học mà không cần phụ thuộc vào API include parameter không được hỗ trợ.
