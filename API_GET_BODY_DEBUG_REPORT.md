## 🔍 API GET Body Data Debug Report

### Vấn đề gốc:

- API Logger không hiển thị data body cho GET request
- Backend báo lỗi "missing classroomId" mặc dù đã truyền trong data body của GET request

### Phân tích vấn đề:

#### 1. **Axios GET with Body Limitation**

Axios hỗ trợ GET request với body data, nhưng có một số điều cần lưu ý:

- Một số HTTP clients/servers không hỗ trợ GET với body
- RFC 7231 không cấm GET với body nhưng khuyến nghị không nên dùng
- Nhiều proxy/cache có thể bỏ qua body trong GET request

#### 2. **API Logger Issue**

API Logger đã được fix và sẽ log body data cho GET request.

#### 3. **Backend Issue**

Backend có thể không đọc body data từ GET request.

### Test để xác định vấn đề:

#### Test 1: Kiểm tra API Logger

```javascript
// Paste vào console
if (window.apiLogger) {
  window.apiLogger.logRequest(
    "GET",
    "test-url",
    { classroomId: "123", test: "data" },
    { page: 1 }
  );
}
```

#### Test 2: Kiểm tra Network Tab

1. Mở DevTools > Network
2. Gọi API meeting/get-meeting
3. Kiểm tra request details:
   - Request Headers
   - Request Payload/Body
   - Query String

#### Test 3: Thay đổi method sang POST

Tạm thời thay GET thành POST để test:

```javascript
// Trong Api.js, test thay đổi:
case METHOD_TYPE.GET:
  // Test: Temporary change to POST for custom APIs with body
  if (data && Object.keys(data).length > 0) {
    console.log('🔄 Converting GET with body to POST for testing');
    result = await axiosClient.post(requestUrl, data, config);
  } else {
    result = await axiosClient.get(requestUrl, config);
  }
  break;
```

### Giải pháp có thể:

#### Giải pháp 1: Chuyển body data thành query parameters

```javascript
// Trong Api.js
if (upperCaseMethod === METHOD_TYPE.GET && data) {
  // Convert body data to query params for GET
  processedQuery = { ...processedQuery, ...data };
  data = null; // Clear data for GET
}
```

#### Giải pháp 2: Sử dụng POST thay vì GET

Thay đổi backend API để sử dụng POST cho các endpoint cần body data.

#### Giải pháp 3: Kiểm tra backend Express middleware

Đảm bảo backend có middleware để đọc body từ GET request:

```javascript
// Backend Express
app.use(express.json({ limit: "50mb" }));

// Middleware đặc biệt cho GET với body
app.use((req, res, next) => {
  if (
    req.method === "GET" &&
    req.headers["content-type"]?.includes("application/json")
  ) {
    // Handle GET with JSON body
  }
  next();
});
```

### Recommended Action:

1. **Immediate Fix**: Test với Network Tab để xác định request có body hay không
2. **Short-term**: Thay đổi method thành POST cho các API cần body data
3. **Long-term**: Chuẩn hóa API theo REST convention

### Test Commands:

```javascript
// 1. Test API Logger
enableAPILogging();
debugAPIGetBody.testAPILoggerDirect();

// 2. Test real API call
debugAPIGetBody.testRealMeetingAPI();

// 3. Test axios directly
debugAPIGetBody.testAxiosGetWithBody();
```
