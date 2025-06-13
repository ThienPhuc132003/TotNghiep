# Enhanced API Logging Guide - FINAL UPDATE

## 🚀 Tổng quan

Hệ thống đã được **HOÀN THIỆN** với enhanced API logging để giúp debug và monitor tất cả API calls một cách chi tiết với color coding và improved formatting.

## ✅ **FIX UNDEFINED RETURN VALUE - COMPLETED**

**QUAN TRỌNG**: Đã sửa lỗi các function console trả về `undefined`. Giờ đây tất cả lệnh đều trả về message xác nhận:

```javascript
enableAPILogging(); // Returns: "✅ API Logging is now ENABLED"
disableAPILogging(); // Returns: "❌ API Logging is now DISABLED"
toggleAPILogging(); // Returns: "✅ ENABLED" hoặc "❌ DISABLED"
getAPILoggingStatus(); // Returns: "✅ API Logging is ENABLED" hoặc "❌ API Logging is DISABLED"
```

**Trước đây**: Các lệnh này trả về `undefined`  
**Bây giờ**: Tất cả đều trả về string message với emoji rõ ràng

## Tính năng chính - MỚI CẬP NHẬT

### 🔍 **Log thông tin Request** (Enhanced):

- **Method**: GET, POST, PUT, DELETE, PATCH với color highlighting
- **Full URL**: Hiển thị đầy đủ URL với baseURL (màu xanh)
- **Query Parameters**: Hiển thị dạng table và query string (màu cam)
- **Request Body**: JSON formatted với syntax highlighting (màu xanh lá)
- **Request ID**: Unique ID để track từng request (màu tím)
- **Timestamp**: Thời gian gửi request
- **Empty Body Indicator**: Hiển thị "Empty" cho requests không có body

### ✅ **Log thông tin Response** (Enhanced):

- **Duration**: Thời gian xử lý request với color highlighting (màu đỏ cam)
- **Response Data Types**:
  - **Array responses**: Hiển thị dạng table (5 items đầu)
  - **Paginated responses**: Hiển thị pagination info
  - **Result.items structure**: HỖ TRỢ MỚI cho format `result.items` (meeting API)
  - **Object responses**: JSON formatted với syntax highlighting (màu xanh lá)
- **Total count**: Hiển thị số lượng items với color highlighting (màu xanh)
- **Color coding**: Màu sắc phân biệt rõ ràng các loại thông tin

### ❌ **Log thông tin Error** (Enhanced):

- **HTTP Status**: Status code và status text với color highlighting (màu đỏ)
- **Error Data**: Chi tiết lỗi từ server với JSON formatting (màu đỏ)
- **Network Errors**: Lỗi mạng không có response
- **Request Config**: Thông tin chi tiết:
  - Method với color highlighting (màu cam)
  - URL với color highlighting (màu cam)
  - Request data nếu có
- **Enhanced error messages**: Error message với color highlighting (màu đỏ đậm)

## ⚡ **ENHANCED ERROR LOGGING - MAJOR UPDATE**

### 🚨 **Cải thiện Error Logging chi tiết:**

**VẤN ĐỀ ĐÃ SỬA**: Trước đây khi API fail, error log không đầy đủ thông tin.

**GIẢI PHÁP MỚI**: Enhanced error logging với format đầy đủ:

```javascript
❌ API Error - 2025-06-13T10:30:45.123Z
🔗 Failed URL: /api/meeting/get-meeting (RED, BOLD)
⏱️ Duration: 1234.56ms (ORANGE, BOLD)
🆔 Request ID: req_1639394245123_a1b2c3d4e (PURPLE, BOLD)

📛 HTTP Error Response:
🔢 Status: 400 Bad Request [với background highlight đỏ]

💬 Server Error Details: [JSON formatted với border]
{
  "error": "Validation failed",
  "details": {
    "classroomId": "Required field missing",
    "token": "Invalid or expired"
  },
  "timestamp": "2025-06-13T10:30:45.123Z"
}

📋 Response Headers: [Table format]
┌─────────────────┬──────────────────────────┐
│ content-type    │ application/json         │
│ content-length  │ 156                      │
│ x-error-code    │ VALIDATION_ERROR         │
└─────────────────┴──────────────────────────┘

🔧 Request Configuration: [Table format]
┌─────────┬──────────────────────────────┐
│ Method  │ GET                          │
│ URL     │ /api/meeting/get-meeting     │
│ BaseURL │ https://api.yourapp.com      │
│ Timeout │ 10000ms                      │
└─────────┴──────────────────────────────┘

📤 Request Data that caused error: [với background highlight cam]
{
  "page": 1,
  "limit": 10,
  "invalidParam": "test"
}
```

### 🔍 **Error Types được hỗ trợ:**

1. **HTTP Response Errors** (400, 401, 404, 500, v.v.):

   - Status code với background highlight
   - Server error data với JSON formatting
   - Response headers trong table format
   - Request config details

2. **Network Errors**:

   - CORS issues
   - Timeout errors
   - Server down/unreachable
   - Connection refused

3. **Request Setup Errors**:
   - Invalid configuration
   - Missing required params
   - Malformed requests

## Cách sử dụng

### 🎛️ **Bật/Tắt Logging từ Console**:

```javascript
// Bật API logging
enableAPILogging();
// hoặc
apiLogger.enable();

// Tắt API logging
disableAPILogging();
// hoặc
apiLogger.disable();

// Toggle (bật/tắt)
toggleAPILogging();
// hoặc
apiLogger.toggle();

// Kiểm tra trạng thái
console.log(apiLogger.isEnabled); // true/false
```

### 📊 **Xem Log trên Browser Console**:

1. **Mở Developer Tools**: F12 hoặc Ctrl+Shift+I
2. **Vào tab Console**
3. **Bật logging**: Gõ `enableAPILogging()`
4. **Thực hiện các action**: Navigate, load data, submit forms
5. **Xem logs**: Tất cả API calls sẽ được log chi tiết với colors

### 🎯 **Ví dụ Log Output** (New Format):

#### Request Log:

```
🚀 [GET] API Request - 2025-06-13T10:30:45.123Z
🔗 URL: https://api.example.com/classroom/search-for-user (BLUE, BOLD)
🆔 Request ID: req_1639394245123_a1b2c3d4e (PURPLE, BOLD)
📋 Query Parameters:
┌─────────┬────────────────┐
│ (index) │ Value          │
├─────────┼────────────────┤
│ page    │ 1              │
│ rpp     │ 1000           │
└─────────┴────────────────┘
🔍 Query String: page=1&rpp=1000 (ORANGE)
📤 Request Body: Empty (GRAY)
```

#### Response Log (Meeting API):

```
✅ API Response - 2025-06-13T10:30:45.456Z
⏱️ Duration: 333.45ms (RED-ORANGE, BOLD)
🆔 Request ID: req_1639394245123_a1b2c3d4e (PURPLE, BOLD)
📥 Response Data:
📄 Result Response:
📊 Total: 5 (BLUE, BOLD)
📋 Items (5 items):
┌─────────┬──────────────┬─────────────────┬──────────────┐
│ (index) │ meetingId    │ topic           │ status       │
├─────────┼──────────────┼─────────────────┼──────────────┤
│ 0       │ abc-123      │ Toán cao cấp    │ ENDED        │
│ 1       │ def-456      │ Vật lý đại cương│ IN_SESSION   │
└─────────┴──────────────┴─────────────────┴──────────────┘
```

#### Error Log:

```
❌ API Error - 2025-06-13T10:30:45.789Z
🔗 Failed URL: https://api.example.com/meeting/get-meeting (RED, BOLD)
⏱️ Duration: 5000.12ms (RED-ORANGE, BOLD)
🆔 Request ID: req_1639394245123_a1b2c3d4e (PURPLE, BOLD)
📛 HTTP Error Response:
🔢 Status: 401 (RED, BOLD)
📄 Status Text: Unauthorized (RED)
💬 Error Data:
{
  "message": "Token không hợp lệ",
  "code": "INVALID_TOKEN"
} (RED)
🔧 Request Config:
Method: GET (ORANGE)
URL: https://api.example.com/meeting/get-meeting (ORANGE)
```

## Các API đang được monitor

### ✅ **Classroom APIs**:

- `classroom/search-for-user` (StudentClassroomPage)
- `classroom/search-for-tutor` (TutorClassroomPage)

### ✅ **Meeting APIs**:

- `meeting/get-meeting` (Cả StudentClassroomPage và TutorClassroomPage) - **UPDATED ENDPOINT**

### ✅ **Auth APIs**:

- `auth/login`
- `auth/logout`
- Zoom OAuth callbacks

### ✅ **All other APIs**: Tất cả API calls qua hệ thống Api.js

## NEW FEATURES

### 🆕 **Improved Result Structure Support**:

- Tự động detect `result.items` structure
- Hiển thị total count từ `result.total`
- Table format cho meeting data
- Support cho nested object structures

### 🆕 **Enhanced Color Coding**:

- **Blue**: URLs, totals, important info
- **Purple**: Request IDs for tracking
- **Orange**: Query strings, config details
- **Green**: Request/response body data
- **Red**: Errors, status codes, durations
- **Gray**: Empty/null values

### 🆕 **Better Error Details**:

- Method và URL highlighting trong error config
- Structured error data display
- Network error detection
- Request setup error handling

## Troubleshooting

### 🔧 **Nếu không thấy logs**:

1. Kiểm tra trạng thái: `console.log(apiLogger.isEnabled)`
2. Bật logging: `enableAPILogging()`
3. Refresh page và thử lại
4. Kiểm tra console filter settings

### 🔧 **Nếu logs quá nhiều**:

1. Tắt logging: `disableAPILogging()`
2. Filter console bằng text: "API Request", "API Response", "API Error"
3. Sử dụng console group collapse

### 🔧 **Debug specific APIs**:

- Filter console bằng endpoint name: "classroom", "meeting", "auth"
- Tìm kiếm bằng Request ID để track complete flow
- Sử dụng color coding để nhanh chóng identify loại thông tin

## Commands cheatsheet

```javascript
// Quick commands - có sẵn ngay khi load page
enableAPILogging(); // Bật
disableAPILogging(); // Tắt
toggleAPILogging(); // Toggle

// Advanced
apiLogger.clearRequestTimes(); // Clear timing data
window.apiLogger; // Access logger object
apiLogger.isEnabled; // Check status

// Helper info - hiện ngay khi load page
// Console sẽ tự động hiển thị available commands
```

## Auto-loaded Help

Khi load page, console sẽ tự động hiển thị:

```
🔊 API Logger Commands:
  • enableAPILogging()  - Enable API logging
  • disableAPILogging() - Disable API logging
  • toggleAPILogging()  - Toggle API logging
  • apiLogger.enable()  - Same as enableAPILogging()
  • apiLogger.disable() - Same as disableAPILogging()
  • apiLogger.toggle()  - Same as toggleAPILogging()

Current status: ✅ ENABLED / ❌ DISABLED
```

---

**Happy Debugging với Enhanced Colors! 🌈🚀** for TutorRevenueStatistics

## Overview

The API logging system has been significantly enhanced to provide comprehensive debugging information for the TutorRevenueStatistics page. This guide explains how to use the enhanced logging features.

## Features Added

### 1. Enhanced API Logger (`src/utils/apiLogger.js`)

- **Request Timing**: Tracks request duration with unique request IDs
- **Detailed Request Logging**: Full URL, query parameters, request body
- **Enhanced Response Logging**: Structured analysis for different data types
- **Comprehensive Error Logging**: Network errors, HTTP errors, request setup errors
- **Specialized Tutor Revenue Logging**: Custom logging for tutor revenue statistics

### 2. API Client Updates (`src/network/Api.js`)

- **Request ID Tracking**: Each request gets a unique ID for correlation
- **Enhanced Timing**: Request duration calculation
- **Better Error Correlation**: Errors are linked to specific requests

### 3. TutorRevenueStatistics Component Updates

- **Specialized Debug Logging**: Custom logging for tutor revenue requests
- **Response Structure Analysis**: Detailed analysis of API response structure
- **Search/Sort Parameter Logging**: Detailed logging of search and sort parameters
- **Error Analysis**: Comprehensive error analysis with context

## How to Use

### 1. Enable API Logging

```javascript
// In browser console
apiLogger.enable();
// or
window.enableAPILogging();
```

### 2. Access Logging Controls

```javascript
// Enable logging
apiLogger.enable();

// Disable logging
apiLogger.disable();

// Toggle logging
apiLogger.toggle();

// Clear request timing data
apiLogger.clearRequestTimes();
```

### 3. View Logs

#### Request Logs

When a request is made, you'll see:

```
🚀 [GET] API Request - 2024-01-01T12:00:00.000Z
  🔗 Full URL: http://localhost:8080/api/manage-payment/search-with-time-for-tutor-revenue
  📋 Query Parameters:
  ┌─────────────────┬─────────────────────────────────────────┐
  │ (index)         │ Values                                  │
  ├─────────────────┼─────────────────────────────────────────┤
  │ rpp             │ 10                                      │
  │ page            │ 1                                       │
  │ periodType      │ 'MONTH'                                 │
  │ periodValue     │ 1                                       │
  │ searchField     │ 'fullname'                             │
  │ searchKeyword   │ 'John'                                  │
  │ sort            │ '[{"key":"totalRevenueWithTime","type":"DESC"}]' │
  └─────────────────┴─────────────────────────────────────────┘
  🔍 Query String: rpp=10&page=1&periodType=MONTH&periodValue=1&searchField=fullname&searchKeyword=John&sort=[%7B%22key%22%3A%22totalRevenueWithTime%22%2C%22type%22%3A%22DESC%22%7D]
  🆔 Request ID: req_1704110400000_abc123def
```

#### Tutor Revenue Specific Logs

```
🎓 TUTOR REVENUE STATISTICS - REQUEST DEBUG
  📅 Timestamp: 2024-01-01T12:00:00.000Z
  🔍 Search Parameters:
  ┌─────────────────┬─────────────────┐
  │ (index)         │ Values          │
  ├─────────────────┼─────────────────┤
  │ searchField     │ 'fullname'      │
  │ searchKeyword   │ 'John'          │
  │ hasSearch       │ true            │
  └─────────────────┴─────────────────┘
  📊 Sort Parameters:
  ┌─────────────────┬─────────────────────────────────────────┐
  │ (index)         │ Values                                  │
  ├─────────────────┼─────────────────────────────────────────┤
  │ sortKey         │ 'totalRevenueWithTime'                  │
  │ sortDirection   │ 'desc'                                  │
  │ sortJSON        │ '[{"key":"totalRevenueWithTime","type":"DESC"}]' │
  └─────────────────┴─────────────────────────────────────────┘
```

#### Response Logs

```
✅ API Response - 2024-01-01T12:00:01.234Z
  ⏱️ Duration: 1234.56ms
  🆔 Request ID: req_1704110400000_abc123def
  📄 Paginated Response:
  📊 Pagination Info: {page: 1, pageSize: 10, totalItems: 100, totalPages: 10}
  📋 Data (5 items):
  ┌─────────┬──────────┬─────────────────┬───────────┬─────────────────────┐
  │ (index) │ userId   │ fullname        │ totalHire │ totalRevenueWithTime │
  ├─────────┼──────────┼─────────────────┼───────────┼─────────────────────┤
  │ 0       │ 'TU001'  │ 'John Doe'      │ 15        │ 15000000            │
  │ 1       │ 'TU002'  │ 'Jane Smith'    │ 12        │ 12000000            │
  └─────────┴──────────┴─────────────────┴───────────┴─────────────────────┘
```

#### Response Analysis Logs

```
🎓 TUTOR REVENUE STATISTICS - API RESPONSE ANALYSIS
  📅 Response Time: 2024-01-01T12:00:01.234Z
  ✅ Raw Response Payload: {success: true, data: {...}}
  🔍 Response Structure Analysis:
  - Has success property: true
  - Success value: true
  - Has data property: true
  📊 Data Structure Analysis:
  - Data type: object
  - Has items property: true
  - Has total property: true
  📋 Items Analysis:
  - Items is array: true
  - Items length: 5
  📄 First Item Structure:
  ┌─────────┬──────────────────────┐
  │ (index) │ Values               │
  ├─────────┼──────────────────────┤
  │ userId  │ 'TU001'              │
  │ fullname│ 'John Doe'           │
  │ totalHire│ 15                  │
  │ totalRevenueWithTime│ 15000000 │
  └─────────┴──────────────────────┘
  📊 Total Items: 100
```

#### Error Logs

```
❌ API Error - 2024-01-01T12:00:01.234Z
  🔗 Failed URL: http://localhost:8080/api/manage-payment/search-with-time-for-tutor-revenue
  ⏱️ Duration: 1234.56ms
  🆔 Request ID: req_1704110400000_abc123def
  📛 HTTP Error Response:
  🔢 Status: 401
  📄 Status Text: Unauthorized
  💬 Error Data: {message: "Token not provided", code: "UNAUTHORIZED"}
```

## Common Debugging Scenarios

### Scenario 1: No Data Returned

1. Check if API request is being made (look for request logs)
2. Verify query parameters are correct
3. Check response structure analysis
4. Verify API endpoint and authentication

### Scenario 2: Search Not Working

1. Check tutor revenue request debug logs
2. Verify search parameters are included in query
3. Check if searchKeyword is being trimmed correctly
4. Verify searchField value ('fullname' or 'userId')

### Scenario 3: Sort Not Working

1. Check sort parameters in tutor revenue debug logs
2. Verify sort JSON structure
3. Check if sort direction is uppercase (DESC/ASC)

### Scenario 4: Authentication Issues

1. Check for 401 errors in error logs
2. Verify token is being sent in request headers
3. Check X-Require-Token header is set

## Performance Monitoring

- Request duration is tracked for each API call
- Long-running requests (>2000ms) can be identified
- Memory usage of request timing storage is managed

## Production Considerations

- Logging can be disabled in production by calling `apiLogger.disable()`
- Request timing data is automatically cleaned up after responses
- Logs are only shown in browser console, not sent to server

## Testing the Enhanced Logging

### Test Search Functionality

```javascript
// In browser console, navigate to TutorRevenueStatistics page
// Enable logging
apiLogger.enable();

// Perform search
// 1. Select search field (fullname or userId)
// 2. Enter search keyword
// 3. Click search button
// 4. Check logs for search parameters

// Clear search
// 1. Click clear button
// 2. Check logs for cleared parameters
```

### Test Sort Functionality

```javascript
// Click on any sortable column header
// Check logs for sort parameters
// Click again to reverse sort direction
// Verify sort direction changes in logs
```

### Test Error Scenarios

```javascript
// Disconnect network
// Perform API request
// Check error logs for network error details

// Or modify token in localStorage to invalid value
// Perform API request
// Check error logs for authentication error details
```

## 🧪 Test Console Commands

### Quick Test - Mở Browser Console (F12) và chạy:

```javascript
// Test basic commands
console.log("1. Enable result:", enableAPILogging());
console.log("2. Status result:", getAPILoggingStatus());
console.log("3. Toggle result:", toggleAPILogging());
console.log("4. Disable result:", disableAPILogging());

// Test alternative commands
console.log("5. Enable alt:", apiLogger.enable());
console.log("6. Status alt:", apiLogger.getStatus());
```

### Expected Output (Không còn undefined):

```
1. Enable result: ✅ API Logging is now ENABLED
2. Status result: ✅ API Logging is ENABLED
3. Toggle result: ❌ API Logging is now DISABLED
4. Disable result: ❌ API Logging is now DISABLED
5. Enable alt: ✅ API Logging is now ENABLED
6. Status alt: ✅ API Logging is ENABLED
```

### Test Demo File:

Mở file `api-logger-console-test.html` trong browser để test trực quan các lệnh với UI đẹp.

## Log Levels and Filtering

The enhanced logging system provides different types of logs:

- 🚀 **Request Logs**: API requests with full details
- ✅ **Response Logs**: API responses with structured data
- ❌ **Error Logs**: API errors with comprehensive details
- 🎓 **Tutor Revenue Logs**: Specialized logs for tutor revenue debugging
- 📊 **Analysis Logs**: Response structure analysis

You can filter these in browser console by searching for the emoji prefixes.

## Conclusion

The enhanced API logging system provides comprehensive debugging capabilities for the TutorRevenueStatistics page. Use this guide to effectively debug API issues, verify data flow, and optimize performance.
