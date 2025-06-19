# CREATE MEETING DEBUG TEST GUIDE 🔧

## Vấn đề đã được sửa:

- **API call format**: Chuyển từ `body` → `data` để đồng nhất
- **ClassroomId validation**: Thêm check classroomId trước khi call API
- **Debug logging**: Thêm extensive logging để debug
- **Error handling**: Improved error messages và toast management

## 🔍 DEBUGGING STEPS:

### 1. **Mở Developer Console** (F12)

- Check console logs khi click "Tạo phòng học"
- Xem classroomId có được truyền đúng không

### 2. **Expected Console Logs:**

```
🚀 handleCreateMeetingSubmit called with: {topic: "...", password: "..."}
🏫 Current classroom info: {classroomId: "123", classroomName: "...", selectedClassroom: {...}}
🔍 Creating meeting with data: {classroomId: "123", topic: "...", password: "..."}
📡 API Response: {success: true/false, ...}
```

### 3. **Check API Network Tab:**

- Endpoint: POST `/meeting/create`
- Request body should contain: `{classroomId, topic, password}`
- Response: Check success status

## 🧪 TEST CHECKLIST:

### ✅ **Before Clicking "Tạo phòng học":**

1. Classroom ID có trong URL params không?
2. Modal mở được không?
3. Form fields có data default không?

### ✅ **After Clicking "Tạo phòng học":**

1. Console có log debug không?
2. Loading toast hiển thị không?
3. API call được gửi không?
4. Response có success không?
5. Toast success/error hiển thị không?

## 🔧 POSSIBLE ISSUES & SOLUTIONS:

### ❌ **Issue: "Không tìm thấy ID lớp học!"**

- **Cause**: classroomId missing from URL or state
- **Solution**: Check URL has `?classroomId=123` or location.state

### ❌ **Issue: API call fails**

- **Cause**: Wrong endpoint or auth token
- **Solution**: Check network tab for 401/404/500 errors

### ❌ **Issue: "Không tìm thấy thông tin lớp học!"**

- **Cause**: selectedClassroom is null
- **Solution**: Modal state not set properly

## 📝 ENHANCED DEBUG INFO:

### **API Call Details:**

```javascript
// Request format:
{
  endpoint: "meeting/create",
  method: "POST",
  data: {
    classroomId: "classroom_123",
    topic: "Lớp học: Toán 12A1",
    password: "abc123"
  },
  requireToken: true
}

// Expected Response:
{
  success: true,
  data: {
    meetingId: "meeting_456",
    zoomMeetingId: "123456789",
    joinUrl: "https://zoom.us/j/123456789",
    // ... other meeting data
  }
}
```

### **State Management:**

```javascript
// Modal state should be:
isModalOpen: true
selectedClassroom: {
  classroomId: "classroom_123",
  classroomName: "Toán 12A1"
}

// URL should contain:
/meetings?classroomId=123&classroomName=Toán%2012A1
```

## 🎯 SUCCESS CRITERIA:

1. ✅ **Console logs show all debug info**
2. ✅ **API call sent with correct data**
3. ✅ **Response received (success or error)**
4. ✅ **Appropriate toast message shown**
5. ✅ **Modal closes after success**
6. ✅ **Meeting list refreshes**

## 🚨 IF STILL NOT WORKING:

### **Check these common issues:**

1. **Authentication**: User logged in with valid token?
2. **Authorization**: User has permission to create meetings?
3. **Classroom**: Does the classroom exist and belong to user?
4. **API Endpoint**: Is `/meeting/create` endpoint working?
5. **Network**: Any firewall/proxy blocking requests?

### **Debug Commands in Console:**

```javascript
// Check current state
console.log(
  "ClassroomId:",
  new URLSearchParams(window.location.search).get("classroomId")
);
console.log("User token:", localStorage.getItem("token"));

// Test API endpoint manually
fetch("/api/meeting/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + localStorage.getItem("token"),
  },
  body: JSON.stringify({
    classroomId: "test_123",
    topic: "Test Meeting",
    password: "test123",
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

---

**🎉 With these changes, the create meeting functionality should work properly!**

_Last updated: June 19, 2025_
