# TEMP UI TESTING - ADDED DIRECT "TẠO PHÒNG HỌC" BUTTON

## 🔧 ĐÃ THÊM VÀO TutorClassroomPage:

### ✅ 1. **Nút "Tạo phòng học (TEST)" trong classroom card:**

```jsx
<button
  className="tcp-action-btn tcp-create-meeting-btn"
  onClick={() =>
    handleOpenCreateMeetingModal(classroom.classroomId, classroom.nameOfRoom)
  }
  disabled={!classroom.classroomId}
  style={{ marginLeft: "10px", backgroundColor: "#28a745" }}
>
  <i className="fas fa-plus"></i>
  Tạo phòng học (TEST)
</button>
```

### ✅ 2. **Alert debug trong handleOpenCreateMeetingModal:**

```jsx
// TEMP: Add alert to confirm function is called
alert(
  `🔍 TEMP DEBUG: Function called with classroomId=${classroomId}, classroomName=${classroomName}`
);
```

### ✅ 3. **Visual debug indicator ở góc màn hình:**

```jsx
<div
  style={{
    position: "fixed",
    top: "10px",
    right: "10px",
    background: "red",
    color: "white",
    padding: "10px",
    zIndex: 10000,
    fontSize: "12px",
  }}
>
  Modal Debug: isOpen={isModalOpen?.toString()}, hasClassroom=
  {!!selectedClassroom}
</div>
```

## 🎯 BÂY GIỜ BẠN CÓ THỂ TEST:

### **Step 1: Kiểm tra nút**

1. Vào trang quản lý lớp học gia sư
2. ✅ Mỗi classroom card bây giờ có 2 nút:
   - "Xem phòng học" (màu xanh)
   - "Tạo phòng học (TEST)" (màu xanh lá)

### **Step 2: Test click nút**

1. Nhấn nút "Tạo phòng học (TEST)"
2. ✅ Sẽ hiển thị alert với thông tin classroom
3. ✅ Console sẽ log debug information
4. ✅ Góc phải màn hình hiển thị modal state

### **Step 3: Kiểm tra modal**

1. Sau khi nhấn nút
2. ✅ Modal phải xuất hiện
3. ✅ Debug indicator sẽ hiển thị "isOpen=true, hasClassroom=true"
4. ✅ Form phải có tên lớp học đúng

### **Step 4: Test form submit**

1. Điền form và nhấn submit
2. ✅ Toast sẽ hiển thị dữ liệu form
3. ✅ Modal sẽ đóng

## 🔍 TROUBLESHOOTING:

### **Nếu alert không hiện:**

- Nút chưa được render
- Check console error
- Check className conflict

### **Nếu alert hiện nhưng modal không mở:**

- Check debug indicator ở góc màn hình
- Check console logs từ forceOpenModal
- CSS modal có thể bị ẩn

### **Nếu modal hiện nhưng không có data:**

- Check selectedClassroom trong debug
- Check classroomName prop trong CreateMeetingModal

## 📁 FILES MODIFIED:

- `src/pages/User/TutorClassroomPage.jsx` - Added test button and debug code

## ✅ STATUS: TEMP UI TESTING MODE WITH DIRECT BUTTON

**Bây giờ có thể test modal trực tiếp từ classroom list mà không cần vào meeting view!**
