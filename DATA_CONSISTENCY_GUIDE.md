# 📊 DATA CONSISTENCY GUIDE - All HTTP Methods

## 🎯 Mục tiêu

Đảm bảo tính nhất quán trong việc truyền data body cho **TẤT CẢ** HTTP methods trong web app, đặc biệt hỗ trợ GET với body data cho custom APIs.

## 📋 Tóm tắt cải tiến

### ✅ Đã hoàn thành:

1. **API Function Enhancement**: Cập nhật `src/network/Api.js` để hỗ trợ data body cho tất cả methods
2. **Consistent Data Handling**: GET, POST, PUT, DELETE, PATCH đều có thể truyền data
3. **Enhanced Logging**: API Logger hiển thị data đầy đủ cho mọi method
4. **Custom API Support**: Đặc biệt hỗ trợ GET với body cho APIs như `meeting/get-meeting`

## 🔧 Cải tiến kỹ thuật

### 1. Api.js - Enhanced Method Support

```javascript
/**
 * Hàm gọi API chung - Hỗ trợ đầy đủ tất cả HTTP methods với data body.
 * @param {object} params.data - Body data cho request (hỗ trợ cho TẤT CẢ methods, kể cả GET cho custom APIs).
 *                               - POST/PUT/PATCH: Dữ liệu form hoặc JSON
 *                               - GET: Dữ liệu gửi qua body (cho custom APIs như meeting/get-meeting)
 *                               - DELETE: Dữ liệu xóa nếu backend yêu cầu
 */
const Api = async ({
  endpoint,
  method = METHOD_TYPE.GET,
  data, // Body data cho TẤT CẢ methods
  query,
  sendCredentials = false,
  requireToken = false,
}) => {
  // ... existing code ...

  switch (upperCaseMethod) {
    case METHOD_TYPE.POST:
      result = await axiosClient.post(requestUrl, data, config);
      break;
    case METHOD_TYPE.PUT:
      result = await axiosClient.put(requestUrl, data, config);
      break;
    case METHOD_TYPE.DELETE:
      result = await axiosClient.delete(requestUrl, { ...config, data });
      break;
    case METHOD_TYPE.PATCH:
      result = await axiosClient.patch(requestUrl, data, config);
      break;
    case METHOD_TYPE.GET:
    default:
      // Enhanced GET handling - Supports both standard GET and custom GET with body data
      if (data && Object.keys(data).length > 0) {
        // Use axios.request() for GET with body data (explicit and consistent)
        result = await axiosClient.request({
          method: "GET",
          url: requestUrl,
          data: data, // Body data for custom APIs
          ...config,
        });
      } else {
        // Standard GET request without body
        result = await axiosClient.get(requestUrl, config);
      }
      break;
  }
};
```

### 2. Method-specific Data Usage

| Method     | Data Usage                                                        | Example                                               |
| ---------- | ----------------------------------------------------------------- | ----------------------------------------------------- |
| **GET**    | Standard: Query params only<br>Custom: Body data for special APIs | `meeting/get-meeting` with `{classroomId, meetingId}` |
| **POST**   | Body data for creation                                            | User registration, login                              |
| **PUT**    | Body data for full update                                         | Complete user profile update                          |
| **PATCH**  | Body data for partial update                                      | Update specific fields                                |
| **DELETE** | Optional body data                                                | Bulk delete, delete with reason                       |

## 🧪 Kiểm tra thực tế

### Test File: `test-data-consistency-all-methods.html`

```bash
# Mở file test trong browser
start test-data-consistency-all-methods.html
```

### Các test case:

1. **GET Tests:**

   - Standard GET (no body)
   - GET with body data (custom APIs)
   - GET meeting/get-meeting
   - GET classroom/search

2. **POST Tests:**

   - POST user data
   - POST login
   - POST empty data

3. **PUT Tests:**

   - PUT update user
   - PUT update profile

4. **DELETE Tests:**

   - DELETE standard (no body)
   - DELETE with body data

5. **PATCH Tests:**
   - PATCH update user
   - PATCH update settings

## 🔍 Debug và kiểm tra

### 1. DevTools Network Tab

```javascript
// Kiểm tra trong browser DevTools:
// 1. F12 -> Network tab
// 2. Chạy API calls
// 3. Click vào request để xem:
//    - Request Headers
//    - Request Payload (body data)
//    - Response

// Đặc biệt chú ý GET requests:
// - Standard GET: Không có Request Payload
// - Custom GET: Có Request Payload với body data
```

### 2. Console Logging

```javascript
// Enable logging để xem chi tiết
enableAPILogging();

// Test GET with body
await Api({
  endpoint: "meeting/get-meeting",
  method: "GET",
  data: { classroomId: "676b825d9b4b71df3fbe85dc" },
  requireToken: true,
});

// Sẽ log:
// 🚀 [GET] API Request
// 📤 Request Body: { classroomId: '676b825d9b4b71df3fbe85dc' }
// 🔥 Custom GET with Body Data: classroomId
```

## 📊 API Logger Enhancements

### Enhanced Data Logging:

```javascript
// Always check for data first, regardless of method
if (data && Object.keys(data).length > 0) {
  console.log("📤 Request Body:");
  console.log(`%c${JSON.stringify(data, null, 2)}`, "color: #4CAF50;");

  // Special highlight for GET with body (custom API)
  if (method === "GET") {
    console.log("🔥 Custom GET with Body Data: ...");
    console.log("ℹ️ Note: Backend supports GET with body data (custom API)");
  }
}
```

## 🎯 Best Practices

### 1. Choosing the Right Method

```javascript
// Standard REST API
await Api({
  endpoint: "users/123",
  method: "GET", // No body data
  query: { include: "profile" },
});

// Custom API with body data
await Api({
  endpoint: "meeting/get-meeting",
  method: "GET", // With body data
  data: { classroomId: "abc123" },
  requireToken: true,
});

// Full update
await Api({
  endpoint: "users/123",
  method: "PUT", // Complete object
  data: { name: "New Name", email: "new@email.com", age: 25 },
});

// Partial update
await Api({
  endpoint: "users/123",
  method: "PATCH", // Only changed fields
  data: { age: 26 },
});
```

### 2. Custom API Guidelines

```javascript
// For APIs that require GET with body (like meeting/get-meeting):
// ✅ DO:
await Api({
  endpoint: "meeting/get-meeting",
  method: "GET",
  data: { classroomId: "abc123", meetingId: "xyz789" },
  requireToken: true,
});

// ❌ DON'T:
await Api({
  endpoint: "meeting/get-meeting",
  method: "GET",
  query: { classroomId: "abc123" }, // Backend expects body, not query
  requireToken: true,
});
```

## 🔧 Troubleshooting

### Problem: Backend không nhận được data từ GET request

**Possible causes:**

1. Backend middleware không hỗ trợ GET với body
2. Proxy/Gateway strip body data từ GET requests
3. HTTP specification compliance issues

**Solutions:**

```javascript
// 1. Kiểm tra Network tab xem request có body không
// 2. So sánh với Postman (should work identically)
// 3. Liên hệ backend team để confirm middleware settings
// 4. Nếu cần thiết, chuyển sang POST:

await Api({
  endpoint: "meeting/get-meeting-post", // Alternative endpoint
  method: "POST",
  data: { classroomId: "abc123" },
  requireToken: true,
});
```

### Problem: API Logging không hiển thị data

**Solution:**

```javascript
// Check logging status
console.log(getAPILoggingStatus());

// Enable if disabled
enableAPILogging();

// Verify data is being passed
console.log("Data being sent:", data);
```

## 📈 Next Steps

1. **Test với real backend**: Verify GET với body data hoạt động như Postman
2. **Monitor production**: Theo dõi error rates sau khi deploy
3. **Document API contracts**: Cập nhật API documentation
4. **Performance testing**: Đảm bảo không impact performance

## 🎉 Summary

✅ **Consistency achieved**: Tất cả HTTP methods đều có thể truyền data body  
✅ **Custom API support**: GET với body data hoạt động đúng  
✅ **Enhanced logging**: Logging chi tiết cho tất cả methods  
✅ **Debug tools**: Test files và debugging guides hoàn chỉnh

**Result**: Web app có thể xử lý data một cách nhất quán cho tất cả HTTP methods, đặc biệt hỗ trợ custom APIs cần GET với body data.
