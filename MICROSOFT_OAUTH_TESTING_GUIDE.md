# Microsoft OAuth Testing Guide - Hướng Dẫn Kiểm Tra

## 🎯 MỤC TIÊU TESTING

Kiểm tra hoàn toàn luồng đăng nhập Microsoft sau khi đã sửa lỗi 414 Request-URI Too Large và các vấn đề redirect.

## 🏁 QUICK START - KIỂM TRA NHANH

### 1. **Khởi chạy ứng dụng**

```bash
cd "c:\Users\PHUC\Documents\GitHub\TotNghiep"
npm run dev
# hoặc
npm start
```

### 2. **Mở Developer Tools**

- Nhấn `F12` hoặc `Ctrl+Shift+I`
- Chuyển sang tab `Console` và `Network`

### 3. **Chạy test script**

- Copy nội dung file `microsoft-oauth-test-script.js`
- Paste vào Console và nhấn Enter

## 📋 CHI TIẾT TESTING

### ✅ **TEST CASE 1: User Login Flow**

#### Bước 1: Truy cập trang đăng nhập User

```
URL: http://localhost:5173/login
```

#### Bước 2: Click "Đăng nhập Microsoft"

- **Mong đợi**: Redirect tới Microsoft OAuth
- **Kiểm tra**: URL có chứa `login.microsoftonline.com`
- **Kiểm tra**: State được set trong cookie `microsoft_auth_state`

#### Bước 3: Hoàn thành đăng nhập Microsoft

- Nhập email/password Microsoft
- Cho phép ứng dụng truy cập

#### Bước 4: Callback handling

- **Mong đợi**: Redirect về `http://localhost:5173/auth/callback?code=...&state=...`
- **Kiểm tra Network tab**: KHÔNG có lỗi 414
- **Kiểm tra Console**: Không có lỗi JavaScript

#### Bước 5: Final redirect

- **Mong đợi**: Redirect cuối cùng tới `http://localhost:5173/trang-chu`
- **Kiểm tra**: User profile được load
- **Kiểm tra**: Token và role cookies được set

---

### ✅ **TEST CASE 2: Admin Login Flow**

#### Bước 1: Truy cập trang đăng nhập Admin

```
URL: http://localhost:5173/admin/login
```

#### Bước 2: Click "Đăng nhập Microsoft"

- **Mong đợi**: Redirect tới Microsoft OAuth
- **Kiểm tra**: State được set trong cookie

#### Bước 3: Hoàn thành đăng nhập Microsoft

- Nhập email/password Microsoft admin
- Cho phép ứng dụng truy cập

#### Bước 4: Callback handling

- **Mong đợi**: Redirect về `http://localhost:5173/admin/auth/callback?code=...&state=...`
- **Kiểm tra Network tab**: KHÔNG có lỗi 414
- **Kiểm tra Console**: Không có lỗi JavaScript

#### Bước 5: Final redirect

- **Mong đợi**: Redirect cuối cùng tới `http://localhost:5173/admin/dashboard`
- **Kiểm tra**: Admin profile được load
- **Kiểm tra**: Token và role cookies được set

---

### ⚠️ **TEST CASE 3: Error Scenarios**

#### Test 3.1: State Mismatch Error

```javascript
// Trong Console, xóa cookie state để test
document.cookie =
  "microsoft_auth_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
// Sau đó trigger callback manually
```

- **Mong đợi**: Redirect về đúng trang login (`/login` hoặc `/admin/login`)
- **Kiểm tra**: Hiển thị lỗi CSRF state mismatch

#### Test 3.2: Missing Code Error

```
Truy cập trực tiếp: http://localhost:5173/auth/callback (không có ?code=...)
```

- **Mong đợi**: Hiển thị lỗi "Thiếu mã xác thực"
- **Mong đợi**: Redirect về `/login` sau 3 giây

#### Test 3.3: API Error Simulation

- Tắt backend server để test network error
- **Mong đợi**: Hiển thị lỗi connection
- **Mong đợi**: Redirect về đúng trang login

---

### 🛡️ **TEST CASE 4: Security & Performance**

#### Test 4.1: URL Cleanup (414 Prevention)

```javascript
// Trong Console, kiểm tra URL sau callback
console.log("Current URL:", window.location.href);
// Mong đợi: Không còn query parameters ?code=...&state=...
```

#### Test 4.2: CSRF State Security

```javascript
// Kiểm tra cookie state
console.log(
  "Auth State Cookie:",
  document.cookie.includes("microsoft_auth_state")
);
// Mong đợi: Cookie được xóa sau khi verify
```

#### Test 4.3: Token Storage

```javascript
// Kiểm tra tokens
console.log("Token Cookie:", document.cookie.includes("token="));
console.log("Role Cookie:", document.cookie.includes("role="));
```

---

## 🔍 DEBUGGING TOOLS

### Sử dụng Debug Tools

Sau khi chạy test script, có thể dùng:

```javascript
// Kiểm tra trạng thái auth hiện tại
microsoftAuthDebug.checkAuthState();

// Test logic redirect
microsoftAuthDebug.testRedirectLogic("/admin/auth/callback");

// Simulate URL cleanup
microsoftAuthDebug.simulateCleanup();
```

### Network Tab Monitoring

Theo dõi các request quan trọng:

- `GET` tới Microsoft OAuth
- `POST` tới `/user/auth/callback` hoặc `/admin/auth/callback`
- `GET` tới `/user/get-profile` hoặc `/admin/get-profile`

### Console Log Monitoring

Tìm các log messages:

- "Processing callback for role: user/admin"
- "CSRF State verified successfully"
- "Authentication successful. Navigating to..."

---

## 📊 EXPECTED RESULTS - KẾT QUẢ MONG ĐỢI

### ✅ **Thành công (SUCCESS)**

```
✅ User login → redirect tới /trang-chu
✅ Admin login → redirect tới /admin/dashboard
✅ Không có lỗi 414 Request-URI Too Large
✅ Không có lỗi JavaScript trong Console
✅ Token và role cookies được set đúng
✅ URL được clean sau callback (không còn query params)
✅ CSRF state được verify và cleanup
```

### ❌ **Thất bại (FAILURE)**

```
❌ Lỗi 414 trong Network tab
❌ JavaScript errors trong Console
❌ Redirect sai trang (user vẫn về /dashboard thay vì /trang-chu)
❌ Cookies không được set
❌ State verification failed
❌ API call errors
```

---

## 🚨 TROUBLESHOOTING

### Nếu gặp lỗi 414:

1. Kiểm tra file `MicrosoftCallback.jsx` có chứa:
   ```javascript
   const cleanUrl = window.location.pathname;
   window.history.replaceState({}, document.title, cleanUrl);
   ```

### Nếu User redirect sai:

1. Kiểm tra biến `dashboardPath` trong `MicrosoftCallback.jsx`:
   ```javascript
   let dashboardPath = "/trang-chu"; // ✅ Must be /trang-chu
   ```

### Nếu có lỗi CSRF:

1. Kiểm tra cookie `microsoft_auth_state` được set khi login
2. Kiểm tra state verification logic trong callback

### Nếu có syntax errors:

1. Chạy: `npm run build` để check compilation
2. Kiểm tra file `MicrosoftCallback.jsx` có syntax đúng

---

## 📞 LIÊN HỆ SUPPORT

Nếu có vấn đề trong quá trình testing:

1. Copy error message từ Console
2. Copy Network tab requests/responses
3. Copy URL hiện tại và expected URL
4. Ghi rõ test case nào đang thực hiện

**STATUS: READY FOR TESTING** ✅
