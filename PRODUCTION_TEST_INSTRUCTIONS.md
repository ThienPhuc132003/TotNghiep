# HƯỚNG DẪN TEST BLACK SCREEN FIX TRÊN PRODUCTION

## 🌐 Test trên Domain: https://giasuvlu.click

### Bước 1: Chuẩn bị test

1. Mở browser và truy cập `https://giasuvlu.click`
2. Đăng nhập vào hệ thống
3. Navigate đến trang meeting room (tutor hoặc student)

### Bước 2: Load test script

1. Mở Developer Tools (F12)
2. Chuyển đến tab Console
3. Copy và paste nội dung file `PRODUCTION_BLACK_SCREEN_TESTER.js` vào console
4. Bạn sẽ thấy message: "🔧 Console error handler initialized - Google Maps and CORS errors will be handled gracefully"

### Bước 3: Chạy test

```javascript
// Chạy test đầy đủ
ProductionBlackScreenTester.runTest();

// Xem thông tin trang hiện tại
ProductionBlackScreenTester.showPageInfo();

// Test click button (có simulation)
ProductionBlackScreenTester.testButtonClick(true);
```

### Bước 4: Kiểm tra kết quả

#### ✅ Kết quả mong muốn (PASS):

- Button "Bắt đầu phòng học" được tìm thấy
- **Student/Participant role**: Button enabled ngay lập tức
- **Host/Tutor role**: Button disabled cho đến khi có OAuth token
- Khi click button: Zoom interface load chính xác (không có black screen)

#### ❌ Các vấn đề có thể gặp (FAIL):

- Button bị disabled khi không nên
- Black screen xuất hiện sau khi click
- Zoom SDK không load
- Network requests bị lỗi

### Bước 5: Scenarios cần test

#### Scenario 1: Student Join Meeting

```
1. Đăng nhập với tài khoản student
2. Navigate đến classroom page
3. Click "Bắt đầu phòng học"
4. Expected: Zoom interface load ngay (no black screen)
```

#### Scenario 2: Tutor Host Meeting

```
1. Đăng nhập với tài khoản tutor
2. Navigate đến meeting room page
3. Verify OAuth requirements
4. Click "Bắt đầu phòng học"
5. Expected: Meeting starts properly (no black screen)
```

### Bước 6: Debug nếu có lỗi

#### Nếu button bị disabled:

```javascript
// Check lý do button disabled
ProductionBlackScreenTester.testUserRoleDetection();
ProductionBlackScreenTester.testMeetingData();
```

#### Nếu có black screen:

```javascript
// Monitor network requests
const stopMonitoring = ProductionBlackScreenTester.monitorNetworkRequests();
// Click button
ProductionBlackScreenTester.testButtonClick(true);
// Wait 5 seconds, then stop monitoring
setTimeout(() => stopMonitoring(), 5000);
```

### Bước 7: So sánh với fix của chúng ta

**Code fix đã apply:**

```jsx
// TutorMeetingRoomPage.jsx line 360-361
disabled={!meetingData || (userRole === "host" && !isZoomConnected)}
```

**Logic này có nghĩa:**

- `!meetingData`: Button disabled nếu không có meeting data
- `(userRole === "host" && !isZoomConnected)`: Button disabled nếu là host BUT chưa có OAuth token
- Student/Participant: Chỉ cần meeting data, không cần OAuth

### Bước 8: Report kết quả

Sau khi test, báo cáo:

1. User role của bạn (student/tutor)
2. Button state (enabled/disabled)
3. Click behavior (black screen hay không)
4. Console errors (nếu có)
5. Network requests status

### Commands hữu ích:

```javascript
// Show tất cả buttons trên page
ProductionBlackScreenTester.showPageInfo();

// Test individual components
ProductionBlackScreenTester.testCurrentEnvironment();
ProductionBlackScreenTester.testMeetingRoomElements();
ProductionBlackScreenTester.testUserRoleDetection();
ProductionBlackScreenTester.testMeetingData();
ProductionBlackScreenTester.testZoomSDK();

// Enable network monitoring
const stop = ProductionBlackScreenTester.monitorNetworkRequests();
// Do something...
stop(); // Stop monitoring
```

## 🔍 Troubleshooting

### Issue 1: Script không load

- Đảm bảo paste đúng toàn bộ content của file PRODUCTION_BLACK_SCREEN_TESTER.js
- Check console có errors không

### Issue 2: Button không tìm thấy

- Đảm bảo bạn đang ở đúng trang meeting room
- Try navigate to different meeting page

### Issue 3: Role detection sai

- Check URL path hiện tại
- Check localStorage/sessionStorage cho user info

### Issue 4: Network requests fail

- Check CORS settings
- Check API endpoints availability
- Check authentication status

Lưu ý: Test này sẽ help identify chính xác vấn đề black screen trên production environment!
