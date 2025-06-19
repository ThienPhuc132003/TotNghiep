# 🐛 ZOOM TOKEN DEBUG GUIDE

## 📋 VẤN ĐỀ

Bạn đã có `zoomAccessToken` sau khi đăng nhập OAuth thành công, nhưng khi tạo phòng học, API `meeting/create` vẫn không nhận được token này đúng cách.

---

## 🔍 DEBUGGING STEPS

### Bước 1: Kiểm tra Token trong Browser

1. **Mở DevTools (F12) → Console**
2. **Chạy lệnh sau:**
   ```javascript
   console.log("zoomAccessToken:", localStorage.getItem("zoomAccessToken"));
   console.log("zoomRefreshToken:", localStorage.getItem("zoomRefreshToken"));
   ```
3. **Kết quả mong đợi:** Phải thấy token tồn tại

### Bước 2: Debug axiosClient Interceptor

1. **Đã thêm debug logs vào `axiosClient.js`**
2. **Khi gọi API `meeting/create`, quan sát Console logs:**

```javascript
// Expected logs:
🔍 axiosClient interceptor - URL: meeting/create
🔍 User token: EXISTS/NOT_FOUND
🔍 Zoom token: EXISTS/NOT_FOUND
🔍 Endpoint detection:
   - isNoAuthEndpoint: false
   - needsZoomToken: true
   - zoomTokenEndpoints: ["meeting/create", "meeting/signature", "meeting/search"]
🔑 Meeting API detected - setting Zoom token only
📝 URL: meeting/create
📝 Zoom token available: true
📝 Full Zoom token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ Authorization header set with Zoom token
```

### Bước 3: Kiểm tra Network Tab

1. **Mở DevTools → Network Tab**
2. **Thực hiện tạo phòng học**
3. **Tìm request `meeting/create`**
4. **Kiểm tra Request Headers:**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Content-Type: application/json
   ```

---

## 🚨 CÁC TRƯỜNG HỢP LỖI THƯỜNG GẶP

### Case 1: Token không tồn tại

**Triệu chứng:** Console log `🔍 Zoom token: NOT_FOUND`
**Nguyên nhân:** OAuth chưa hoàn thành hoặc token bị xóa
**Giải pháp:** Thực hiện lại OAuth flow

### Case 2: needsZoomToken = false

**Triệu chứng:** Console log `needsZoomToken: false`
**Nguyên nhân:** Endpoint `meeting/create` không được detect đúng
**Giải pháp:** Kiểm tra `zoomTokenEndpoints` array

### Case 3: Authorization header không được set

**Triệu chứng:** Network tab không thấy `Authorization: Bearer ...`
**Nguyên nhân:** Logic trong `axiosClient.js` có vấn đề
**Giải pháp:** Debug chi tiết hơn

### Case 4: Backend không nhận token

**Triệu chứng:** Backend trả về 401 Unauthorized
**Nguyên nhân:** Backend expected format khác
**Giải pháp:** Kiểm tra backend API documentation

---

## 🧪 TEST FILES

### 1. **zoom-token-debug-test.html**

- Kiểm tra token status
- Mô phỏng API call structure
- Hướng dẫn debug

### 2. **Enhanced axiosClient.js**

- Thêm chi tiết debug logs
- Track endpoint detection
- Monitor token availability

---

## 🎯 ACTION PLAN

### Immediate Actions:

1. **Test với debug version:**

   ```bash
   # Mở file test
   open zoom-token-debug-test.html
   ```

2. **Thực hiện tạo phòng học và quan sát logs:**

   - Console logs từ axiosClient
   - Network requests trong DevTools
   - Response từ backend

3. **So sánh với working flow:**
   - Kiểm tra các luồng khác (LoginZoomButton.jsx)
   - Đảm bảo consistency

### Expected Results:

✅ **axiosClient logs hiển thị đúng endpoint detection**
✅ **Zoom token được retrieve và set vào Authorization header**  
✅ **Network request chứa correct Bearer token**
✅ **Backend nhận được token và response thành công**

---

## 📞 NEXT STEPS

1. **Chạy test và ghi lại kết quả**
2. **Share console logs nếu vẫn có issue**
3. **Kiểm tra backend logs (nếu có access)**
4. **Compare với working CreateMeetingPage flow**

---

## 🔧 TEMPORARY WORKAROUND

Nếu cần test nhanh, có thể temporarily log toàn bộ request config:

```javascript
// Thêm vào axiosClient.js interceptor
console.log(
  "🔍 Full request config:",
  JSON.stringify(
    {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
    },
    null,
    2
  )
);
```

Điều này sẽ cho thấy chính xác request structure được gửi đi.
