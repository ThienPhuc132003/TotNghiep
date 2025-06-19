# 🧪 DEBUG: Kiểm tra Zoom OAuth Redirect Logic

## 🎯 Mục tiêu

Kiểm tra tại sao logic redirect đến Zoom OAuth chưa hoạt động.

## 📋 Các bước debug:

### Bước 1: Xóa Zoom Token

```javascript
// Mở Console (F12) và chạy:
localStorage.removeItem("zoomAccessToken");
localStorage.clear(); // Xóa tất cả để chắc chắn
console.log("Zoom token cleared:", localStorage.getItem("zoomAccessToken"));
```

### Bước 2: Truy cập trang Meetings

1. Đăng nhập vào app
2. Vào trang quản lý lớp học: `/tai-khoan/ho-so/quan-ly-lop-hoc`
3. Chọn một lớp học và nhấn "Xem phòng học"
4. Hoặc trực tiếp vào: `/tai-khoan/ho-so/quan-ly-phong-hoc?classroomId=123&classroomName=Test`

### Bước 3: Kiểm tra Console Log

Khi trang load, bạn sẽ thấy:

```
🔍 Checking Zoom connection: { hasToken: false, tokenLength: undefined }
❌ Zoom not connected
```

### Bước 4: Nhấn "Tạo phòng học"

Khi nhấn nút, console sẽ hiển thị:

```
🔍 Opening create meeting modal for classroom: [ID] [Name]
🔍 Checking Zoom access token before opening modal: { hasToken: false, tokenLength: undefined }
❌ No Zoom access token found - redirecting to Zoom OAuth
🔗 Zoom OAuth URL: http://localhost:8080/api/zoom/authorize
```

### Bước 5: Kiểm tra kết quả

- **Nếu redirect hoạt động**: Browser sẽ chuyển đến `http://localhost:8080/api/zoom/authorize`
- **Nếu không hoạt động**: Kiểm tra xem có lỗi gì trong console

## 🔍 Các vấn đề có thể xảy ra:

### 1. Backend không chạy port 8080

```bash
# Kiểm tra backend có chạy không:
curl http://localhost:8080/api/zoom/authorize
# hoặc mở trực tiếp trong browser
```

### 2. Logic bị can thiệp bởi code khác

Kiểm tra xem có function nào khác đang override `handleOpenCreateMeetingModal` không.

### 3. Modal vẫn mở thay vì redirect

Nếu modal vẫn mở, có nghĩa là logic kiểm tra token không hoạt động.

## 🛠️ Debug Script

Chạy script này trong console để test:

```javascript
// Test logic ngay trong console
function testZoomRedirect() {
  const classroomId = "test-123";
  const classroomName = "Test Classroom";

  console.log(
    "🔍 Opening create meeting modal for classroom:",
    classroomId,
    classroomName
  );

  if (!classroomId || !classroomName) {
    console.error("❌ Missing classroom info");
    return;
  }

  // Check Zoom access token first
  const zoomAccessToken = localStorage.getItem("zoomAccessToken");
  console.log("🔍 Checking Zoom access token before opening modal:", {
    hasToken: !!zoomAccessToken,
    tokenLength: zoomAccessToken?.length,
  });

  if (!zoomAccessToken) {
    console.log("❌ No Zoom access token found - redirecting to Zoom OAuth");

    // Store return state
    const returnState = {
      returnPath: `/tai-khoan/lop-hoc/meetings?classroomId=${classroomId}&classroomName=${encodeURIComponent(
        classroomName
      )}`,
      classroomId,
      classroomName,
    };
    localStorage.setItem("zoomOAuthReturnState", JSON.stringify(returnState));

    // Redirect to Zoom OAuth endpoint
    const apiBaseUrl = window.location.origin.includes("localhost")
      ? "http://localhost:8080"
      : window.location.origin;
    const zoomOAuthUrl = `${apiBaseUrl}/api/zoom/authorize`;

    console.log("🔗 Zoom OAuth URL:", zoomOAuthUrl);

    if (confirm(`Will redirect to: ${zoomOAuthUrl}\nContinue?`)) {
      window.location.href = zoomOAuthUrl;
    }
    return;
  }

  console.log("✅ Zoom token found - would open modal normally");
}

// Chạy test
testZoomRedirect();
```

## 📝 Kết quả mong đợi:

1. Console hiển thị đúng log
2. Confirm dialog xuất hiện
3. Khi nhấn OK → redirect đến Zoom OAuth
4. Khi nhấn Cancel → không redirect

## ⚠️ Lưu ý:

- Đảm bảo backend đang chạy trên port 8080
- Kiểm tra endpoint `/api/zoom/authorize` có tồn tại không
- Nếu vẫn không work, có thể cần kiểm tra lại cấu trúc code hoặc có conflict với logic khác
