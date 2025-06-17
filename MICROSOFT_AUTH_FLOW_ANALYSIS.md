# 🔐 Phân Tích Luồng Đăng Nhập Microsoft - Người Học & Admin

## 📋 Tổng Quan Hệ Thống

Hệ thống hỗ trợ **2 loại đăng nhập Microsoft** riêng biệt:

- **Người học (User)**: Học viên và Gia sư
- **Quản trị (Admin)**: Quản lý hệ thống

---

## 🎯 Luồng Đăng Nhập Microsoft - NGƯỜI HỌC

### 1. **Bước Khởi Tạo (User Login Page)**

📍 **File**: `src/pages/User/Login.jsx`
📍 **Route**: `/login`

**Quy trình:**

```javascript
handleMicrosoftLogin() {
  // 1. Tạo CSRF state token ngẫu nhiên
  const state = generateRandomString(20);

  // 2. Lưu state vào cookie (10 phút)
  Cookies.set("microsoft_auth_state", state, { expires: 1/24/6 });

  // 3. Gọi API lấy Microsoft Auth URL
  const response = await Api({
    endpoint: "user/auth/get-uri-microsoft",
    method: METHOD_TYPE.GET,
  });

  // 4. Chuyển hướng đến Microsoft với state
  window.location.href = `${response.data.authUrl}&state=${state}`;
}
```

### 2. **Bước Xác Thực Microsoft**

- User được chuyển đến Microsoft OAuth2 page
- Microsoft xác thực danh tính
- Microsoft redirect về callback URL với `code` và `state`

### 3. **Bước Callback (Microsoft Callback)**

📍 **File**: `src/pages/MicrosoftCallback.jsx`
📍 **Route**: `/user/auth/callback`

**Quy trình:**

```javascript
processMicrosoftCallback() {
  // 1. Lấy code và state từ URL
  const code = urlParams.get("code");
  const state = urlParams.get("state");

  // 2. Xác minh CSRF state
  const storedState = Cookies.get("microsoft_auth_state");
  if (state !== storedState) {
    // Lỗi bảo mật - redirect về /signin
    return;
  }

  // 3. Đổi code lấy token
  const authResponse = await Api({
    endpoint: "user/auth/callback",
    method: METHOD_TYPE.POST,
    data: { code }
  });

  // 4. Lưu token và role
  Cookies.set("token", authResponse.data.token, { expires: 7 });
  Cookies.set("role", "user", { expires: 7 });

  // 5. Lấy profile user
  const profileResponse = await Api({
    endpoint: "user/get-profile",
    method: METHOD_TYPE.GET,
  });

  // 6. Cập nhật Redux store
  dispatch(setUserProfile(profileResponse.data));

  // 7. Redirect đến dashboard
  navigate("/dashboard", { replace: true });
}
```

### 4. **Bước Bảo Vệ Route (User)**

📍 **File**: `src/route/ProtectRoute.jsx`

**Cách hoạt động:**

```javascript
// Kiểm tra authentication từ Redux
const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
const userProfile = useSelector((state) => state.user.userProfile);

// Nếu chưa đăng nhập -> redirect /login
if (!isAuthenticated) {
  return <Navigate to="/login" state={{ from: location }} replace />;
}

// Nếu cần role cụ thể (VD: TUTOR)
if (requiredRole && currentUserRole !== requiredRole) {
  return <Navigate to="/trang-chu" replace />;
}
```

---

## 🛡️ Luồng Đăng Nhập Microsoft - ADMIN

### 1. **Bước Khởi Tạo (Admin Login Page)**

📍 **File**: `src/pages/Admin/AdminLogin.jsx`
📍 **Route**: `/admin/login`

**Quy trình:**

```javascript
handleMicrosoftLogin() {
  // 1. Tạo CSRF state token
  const state = generateRandomString(20);

  // 2. Lưu state vào cookie (10 phút)
  Cookies.set("microsoft_auth_state", state, {
    secure: true,
    sameSite: "Lax",
    expires: 1/24/6
  });

  // 3. Gọi API lấy Microsoft Auth URL cho ADMIN
  const response = await Api({
    endpoint: "admin/auth/get-uri-microsoft", // ⚠️ Khác endpoint
    method: METHOD_TYPE.GET,
  });

  // 4. Chuyển hướng với state
  window.location.href = `${response.data.authUrl}&state=${state}`;
}
```

### 2. **Bước Callback (Admin Callback)**

📍 **File**: `src/pages/MicrosoftCallback.jsx`
📍 **Route**: `/admin/auth/callback`

**Quy trình tương tự User nhưng khác endpoints:**

```javascript
// Xác định role dựa trên URL path
if (path.startsWith("/admin/auth/callback")) {
  roleFromPath = "admin";
  callbackEndpoint = "admin/auth/callback"; // ⚠️ Khác endpoint
  profileEndpoint = "admin/get-profile"; // ⚠️ Khác endpoint
  dashboardPath = "/admin/dashboard"; // ⚠️ Khác redirect
}

// Cập nhật Redux khác slice
dispatch(setAdminProfile(profileResponse.data)); // ⚠️ Khác action
```

### 3. **Bước Bảo Vệ Route (Admin)**

📍 **File**: `src/route/AdminPrivateRoutes.jsx`

**Cách hoạt động:**

```javascript
// Kiểm tra từ Cookies (không dùng Redux)
const isAuth = Cookies.get("token");
const userRole = Cookies.get("role");

// Phải có token VÀ role = "admin"
if (isAuth && userRole === "admin") {
  return <Outlet />; // Cho phép truy cập
} else {
  return <Navigate to="/admin/login" replace />;
}
```

---

## 🗂️ Cấu Trúc File & Routes

### **User Routes (Protected)**

```
/tai-khoan/ho-so/ (ProtectRoute)
├── thong-tin-ca-nhan (Profile)
├── gia-su-yeu-thich (FavoriteTutors)
├── giao-trinh-ca-nhan (Curriculum)
├── lop-hoc-cua-toi (StudentClassroom)
├── vi-ca-nhan (Wallet)
├── phong-hoc (TutorMeetingRoom)
├── thong-ke-doanh-thu (TutorRevenue)
└── thong-ke-tong-hop (TutorStatistics)

/tai-khoan/ho-so/ (ProtectRoute + role="TUTOR")
├── ho-so-gia-su (TutorRegister)
├── quan-ly-lop-hoc (TutorClassroom)
└── yeu-cau-day (TutorBookingRequests)
```

### **Admin Routes (Protected)**

```
/admin/ (AdminPrivateRoutes)
├── dashboard (AdminDashboard)
├── profile (AdminProfile)
├── nhan-vien (ListOfAdmin)
├── nganh (ListOfMajor)
├── tai-khoan-gia-su (ListOfRequest)
├── nguoi-hoc (ListOfStudent)
├── gia-su (ListOfTutor)
├── hang-gia-su (ListOfTutorLevel)
├── mon-hoc (ListOfSubject)
├── giao-trinh (ListOfCurriculumn)
├── goi-thanh-toan (ListOfValueConfigs)
├── thanh-toan-cho-gia-su (ListOfTutorPayments)
├── rut-tien (ListOfWithdrawalRequests)
├── doanh-thu (RevenueStatistics)
├── luot-thue-gia-su (TutorHireStatistics)
├── doanh-thu-gia-su (TutorRevenueStatistics)
├── danh-gia-gia-su (TutorAssessmentStatistics)
└── nap-vi-nguoi-dung (ListOfTransactions)
```

---

## 🔄 Redux State Management

### **User State (userSlice.js)**

```javascript
{
  userProfile: {
    userId: "...",
    email: "...",
    fullName: "...",
    roleId: "USER" | "TUTOR",
    roles: [...],
    // ... other user data
  },
  isAuthenticated: true/false,
  profileLoading: false,
  profileError: null
}
```

### **Admin State (adminSlice.js)**

```javascript
{
  adminProfile: {
    adminId: "...",
    email: "...",
    fullName: "...",
    // ... other admin data
  }
}
```

---

## 🛡️ Bảo Mật & Xác Thực

### **CSRF Protection**

- Sử dụng `state` parameter để chống CSRF
- State được tạo ngẫu nhiên và lưu cookie
- Xác minh state khi callback

### **Token Management**

- JWT token lưu trong HTTP-only cookies (7 ngày)
- Role lưu trong cookies để phân quyền
- Tự động refresh token khi cần

### **Route Protection**

- **User routes**: Redux-based authentication
- **Admin routes**: Cookie-based authentication
- Role-based access control (RBAC)

---

## 🔍 Debugging & Monitoring

### **Console Logs**

```javascript
// Microsoft Login Initiation
"Redirecting to Microsoft for admin login:";

// Callback Processing
"Processing callback for role: user/admin";
"Auth callback response:";
"Profile response:";

// Authentication Success
"User/Admin profile dispatched to Redux";
"Authentication successful. Navigating to /dashboard";
```

### **Common Issues**

1. **CSRF State mismatch**: Cookie expired hoặc bị xóa
2. **Token không nhận được**: API backend lỗi
3. **Profile load fail**: Network issue hoặc token invalid
4. **Redirect loop**: Role và route không khớp

---

## 📊 API Endpoints Summary

### **User Endpoints**

- `GET /user/auth/get-uri-microsoft` - Lấy Microsoft Auth URL
- `POST /user/auth/callback` - Đổi code lấy token
- `GET /user/get-profile` - Lấy profile user

### **Admin Endpoints**

- `GET /admin/auth/get-uri-microsoft` - Lấy Microsoft Auth URL
- `POST /admin/auth/callback` - Đổi code lấy token
- `GET /admin/get-profile` - Lấy profile admin

---

## ✅ Kết Luận

Hệ thống có **2 luồng đăng nhập Microsoft hoàn toàn tách biệt**:

1. **User Flow**: Sử dụng Redux, route protection phức tạp, hỗ trợ role TUTOR
2. **Admin Flow**: Sử dụng Cookies, route protection đơn giản, chỉ admin role

Cả 2 luồng đều có:

- ✅ CSRF protection với state parameter
- ✅ Secure token storage
- ✅ Automatic profile loading
- ✅ Proper error handling
- ✅ Clean redirect flows
