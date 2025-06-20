# ADMIN MICROSOFT OAUTH - LUỒNG MỚI VỚI TRANG RIÊNG

## 🔄 Luồng Microsoft OAuth cho Admin (Cập nhật mới)

Dựa trên gợi ý của backend, đã tạo trang riêng `/admin/MicrosoftOauth` để xử lý callback từ Microsoft.

### 📋 Backend APIs:

1. **`GET /api/admin/auth/get-uri-microsoft`** - Lấy OAuth URL
2. **`POST /api/admin/auth/login`** - Nhận code và trả về token
3. **Backend callback URL**: `https://giasuvlu.click/api/admin/auth/callback`

### 🎯 Luồng chi tiết:

**BƯỚC 1**: User click "Đăng nhập Microsoft" trên AdminLogin

```javascript
// AdminLogin.jsx
const handleMicrosoftLogin = async () => {
  const result = await getMicrosoftAuthUrl(); // GET /api/admin/auth/get-uri-microsoft
  if (result.success) {
    window.location.href = result.authUrl; // Redirect đến Microsoft
  }
};
```

**BƯỚC 2**: Microsoft xử lý đăng nhập

- User đăng nhập trên Microsoft OAuth
- Microsoft redirect về: `https://giasuvlu.click/api/admin/auth/callback?code=xxx&state=xxx`

**BƯỚC 3**: Backend tự động redirect về frontend trang callback

- Backend nhận callback từ Microsoft
- **Backend redirect về**: `https://giasuvlu.click/admin/MicrosoftOauth?code=xxx&state=xxx`

**BƯỚC 4**: Frontend trang `/admin/MicrosoftOauth` xử lý

```javascript
// AdminMicrosoftOAuth.jsx
const code = searchParams.get("code");

// Clean URL ngay lập tức (tránh lỗi 414)
window.history.replaceState({}, document.title, window.location.pathname);

// Gọi API để exchange code → token
const response = await Api({
  endpoint: "/api/admin/auth/login",
  method: METHOD_TYPE.POST,
  data: { code: code },
});

// Lưu token và redirect về dashboard
if (response.success) {
  Cookies.set("token", response.data.token);
  Cookies.set("role", "admin");
  navigate("/admin/dashboard");
}
```

## 📁 Files đã tạo/cập nhật:

### 1. `src/pages/Admin/AdminMicrosoftOAuth.jsx` (MỚI)

- Trang chuyên dụng để xử lý Microsoft OAuth callback
- Lấy code từ URL params
- Gọi API `/api/admin/auth/login` để exchange code → token
- Lưu token và redirect về dashboard
- Error handling và loading UI

### 2. `src/assets/css/Admin/AdminMicrosoftOAuth.style.css` (MỚI)

- CSS cho loading spinner và error states
- Animation keyframes cho spinner

### 3. `src/App.jsx` (CẬP NHẬT)

- Thêm route: `<Route path="/admin/MicrosoftOauth" element={<AdminMicrosoftOAuth />} />`
- Không cần authentication guard cho route này

### 4. `src/pages/Admin/AdminLogin.jsx` (GIỮ NGUYÊN)

- Vẫn sử dụng `getMicrosoftAuthUrl()` để lấy OAuth URL từ backend
- Redirect user đến Microsoft OAuth

### 5. `src/pages/Admin/AdminDashboard.jsx` (CẦN DỌN DẸP)

- Bỏ logic xử lý OAuth callback (không cần nữa)
- Chỉ giữ logic authentication check bình thường

## 🔧 Luồng hoạt động:

```
1. User click "Đăng nhập Microsoft" (AdminLogin.jsx)
   ↓
2. Frontend call API get-uri-microsoft
   ↓
3. Frontend redirect user đến Microsoft OAuth URL
   ↓
4. User đăng nhập Microsoft → Microsoft callback về backend
   ↓
5. Backend redirect về: /admin/MicrosoftOauth?code=xxx
   ↓
6. AdminMicrosoftOAuth.jsx:
   - Clean URL ngay lập tức
   - Extract code từ params
   - Call API login với code
   - Lưu token
   - Redirect về /admin/dashboard
   ↓
7. ✅ Admin đã đăng nhập thành công!
```

## ✅ Lợi ích của luồng mới:

1. **Tách biệt responsibility**: Trang riêng chỉ để xử lý OAuth
2. **URL cleanup ngay lập tức**: Tránh lỗi 414 URL quá dài
3. **Dễ debug**: Logic OAuth tập trung tại một nơi
4. **Không ảnh hưởng dashboard**: AdminDashboard.jsx đơn giản hơn
5. **Theo chuẩn OAuth**: Có callback URL riêng biệt
6. **Backend friendly**: Dễ dàng redirect về URL cố định

## 🚫 Những gì không cần nữa:

- ❌ Xử lý OAuth tại AdminDashboard.jsx
- ❌ Logic phức tạp để detect OAuth params
- ❌ Mixing OAuth logic với dashboard logic

## 📝 Notes quan trọng:

- **Route không cần authentication**: `/admin/MicrosoftOauth` có thể access công khai
- **Clean URL immediately**: Tránh lỗi 414 khi URL quá dài
- **Error handling**: Hiển thị lỗi và cho phép quay lại login page
- **Loading state**: Hiển thị spinner trong khi xử lý

---

**Status**: ✅ HOÀN THÀNH  
**Files created**: 2 files (component + CSS)  
**Files updated**: 1 file (App.jsx routes)  
**Next**: Dọn dẹp AdminDashboard.jsx
