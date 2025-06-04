# API Logging - Hướng dẫn sử dụng (Updated - Simple & Clean)

## 🚀 Tổng quan những gì đã cập nhật

### **PHIÊN BẢN MỚI - LOGGING NGẮN GỌN**

Thay vì logging chi tiết phức tạp, bây giờ hệ thống chỉ hiển thị thông tin cần thiết:

1. **URL của API**
2. **Data truyền vào API** (nếu có)
3. **Data trả về**
4. **Method của API đó**
5. **Query parameters** (cho những API hay thay đổi query)

### 1. **Enhanced API.js Logging** ✅

- ✅ Logging ngắn gọn với format: `🚀 [METHOD] URL`
- ✅ Hiển thị query params nếu có: `📋 Query: {...}`
- ✅ Hiển thị request data nếu có: `📤 Data: {...}`
- ✅ Response đơn giản: `✅ Response: {...}`
- ✅ Error logging: `❌ Error: {...}`

### 2. **Enhanced axiosClient.js Logging** ✅

- ✅ Loại bỏ logging chi tiết không cần thiết
- ✅ Chỉ giữ lại authentication logic cần thiết
- ✅ Error logging đơn giản: `❌ [STATUS] METHOD URL`

### 3. **API Logger Utility** ✅

- ✅ Centralized logging control
- ✅ Có thể bật/tắt logging dễ dàng
- ✅ Exposed to window object cho console access
- Quick test suites

### 4. **API Logger Controls**

- Có thể bật/tắt logging từ browser console
- Lưu setting trong localStorage
- Global functions để control

---

## 🔧 Cách sử dụng API Logging

### **Từ Browser Console:**

1. **Kiểm tra tokens:**

   ```javascript
   inspectAllTokens();
   ```

2. **Test nhanh toàn bộ hệ thống:**

   ```javascript
   runQuickTests();
   ```

3. **Test specific APIs:**

   ```javascript
   testClassroomsAPI(); // Test classroom list
   testMeetingAPI("classroom-id-here"); // Test meeting get
   testMeetingCreateAPI(); // Test meeting create
   ```

4. **Control logging:**
   ```javascript
   enableAPILogging(); // Bật chi tiết logs
   disableAPILogging(); // Tắt logs
   toggleAPILogging(); // Chuyển đổi
   ```

---

## 📋 API Call Logging Format

### **Request Log:**

```
🚀 [API CALL] POST meeting/create
🌐 Full URL: http://localhost:3000/api/meeting/create
📤 Method: POST
📋 Query Params: {}
📦 Request Body: {topic: "Test", password: "123", classroomId: "abc"}
⚙️ Config Headers: {Authorization: "Bearer ...", Content-Type: "application/json"}
🔐 Send Credentials: false
🎫 Require Token: true
⏰ Request Time: 2025-06-04T10:30:00.000Z
```

### **Success Response Log:**

```
✅ [API RESPONSE SUCCESS]
📥 Response Data: {success: true, data: {...}}
📊 Data Type: object
📈 Response Size: 1234 characters
⏰ Response Time: 2025-06-04T10:30:01.000Z
🎯 API Success Status: true
💬 API Message: "Meeting created successfully"
```

### **Error Response Log:**

```
❌ [API RESPONSE ERROR]
🚨 Error Object: {message: "Network Error", ...}
📛 Error Message: Network Error
🔢 HTTP Status: 500
📄 Error Response: {success: false, message: "Server error"}
🌐 Request URL: /api/meeting/create
⏰ Error Time: 2025-06-04T10:30:01.000Z
```

---

## 🎯 Debugging Meeting APIs

### **Bước 1: Kiểm tra Authentication**

```javascript
inspectAllTokens();
// Sẽ hiển thị:
// 🍪 User Token from Cookie: EXISTS ✅
// 🎯 Zoom Token from localStorage: EXISTS ✅
```

### **Bước 2: Test Classroom API**

```javascript
testClassroomsAPI();
// Sẽ tự động test và hiển thị danh sách lớp học
// Sau đó tự động test meeting API với classroom đầu tiên
```

### **Bước 3: Test Meeting Creation**

```javascript
testMeetingCreateAPI("My Meeting", "pass123", "real-classroom-id");
```

---

## 🔍 Troubleshooting Common Issues

### **1. Không thấy logs chi tiết:**

```javascript
enableAPILogging(); // Rồi refresh page
```

### **2. Token không tồn tại:**

- User token: Đăng nhập lại
- Zoom token: Kết nối Zoom trong settings

### **3. API trả về 401/403:**

- Kiểm tra token expiry
- Kiểm tra token đúng loại (User vs Zoom)

### **4. Meeting API trả về empty:**

- Chắc chắn classroom có meetings
- Thử tạo meeting trước rồi test lại

---

## 📱 Quick Start

1. **Mở website trong development mode**
2. **Mở Developer Tools (F12)**
3. **Gõ trong Console:**
   ```javascript
   runQuickTests();
   ```
4. **Xem chi tiết logs và debug theo cần thiết**

---

## 💡 Tips & Best Practices

- Luôn kiểm tra tokens trước khi test APIs
- Sử dụng `runQuickTests()` để có overview nhanh
- Bật API logging khi cần debug chi tiết
- Tắt API logging trong production để tránh spam console
- Sử dụng test functions để verify API payloads

---

**Note:** Script debug chỉ auto-load trong localhost/development environment.
