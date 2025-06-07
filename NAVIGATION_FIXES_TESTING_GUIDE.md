# 🛠️ Navigation Fix Testing Guide

## ✅ Issues Fixed

### 1. **Tutor Black Screen Issue**

- **Problem**: Tutor gets stuck at `/tai-khoan/ho-so/phong-hop-zoom` with black screen
- **Root Cause**: Missing error handling and debug info during Zoom signature fetch
- **Solution**: Added enhanced loading state, error display, and retry mechanism

### 2. **Student Redirect Issue**

- **Problem**: Student clicks "Vào lớp học" but gets redirected to homepage
- **Root Cause**: Missing role differentiation - student trying to join as host
- **Solution**: Added `userRole` parameter to properly identify student vs tutor

## 🧪 Manual Testing Steps

### Test 1: Tutor Meeting Flow

1. **Login as Tutor**
2. **Go to**: `/tai-khoan/ho-so/quan-ly-lop-hoc`
3. **Create meeting** for a classroom
4. **Click**: "Vào phòng học" button
5. **Expected Results**:
   - Should navigate to `/tai-khoan/ho-so/phong-hop-zoom`
   - Loading state shows debug info:
     - Meeting ID: [displayed]
     - Role: Gia sư (Host)
     - Signature: ⏳ Đang lấy... → ✅
     - SDK Key: ⏳ Đang lấy... → ✅
   - Zoom loads with tutor as host
   - Back button: "Quay lại quản lý lớp học"

### Test 2: Student Meeting Flow

1. **Login as Student**
2. **Go to**: `/tai-khoan/ho-so/lop-hoc-cua-toi`
3. **Find classroom** with status "IN_SESSION"
4. **Click**: "Vào lớp học" button
5. **Expected Results**:
   - Should navigate to `/tai-khoan/ho-so/phong-hop-zoom`
   - Loading state shows:
     - Meeting ID: [displayed]
     - Role: Học viên (Participant)
     - Signature: ⏳ Đang lấy... → ✅
     - SDK Key: ⏳ Đang lấy... → ✅
   - Zoom loads with student as participant
   - Back button: "Quay lại lớp học của tôi"

### Test 3: Error Handling

1. **Test without Zoom token**:

   - Clear localStorage: `localStorage.removeItem("zoomAccessToken")`
   - Try to enter meeting
   - Should show Zoom connection screen

2. **Test signature fetch error**:
   - Use browser dev tools to block `meeting/signature` API
   - Should show error with retry button

## 🔧 Code Changes Summary

### StudentClassroomPage.jsx

```javascript
// Added userRole in navigation state
navigate("/tai-khoan/ho-so/phong-hop-zoom", {
  state: {
    meetingData: meetingData,
    classroomName: classroomName,
    classroomId: classroomId,
    userRole: "student", // 🆕 Added role indicator
  },
});
```

### TutorMeetingRoomPage.jsx

```javascript
// 🆕 Added role state management
const [userRole, setUserRole] = useState("host");

// 🆕 Role-based signature fetch
const roleValue = userRole === "host" ? 1 : 0;

// 🆕 Enhanced loading state with debug info
<div style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
  <p>Meeting ID: {meetingData.zoomMeetingId}</p>
  <p>Role: {userRole === "host" ? "Gia sư (Host)" : "Học viên (Participant)"}</p>
  <p>Signature: {zoomSignature ? "✅" : "⏳ Đang lấy..."}</p>
  <p>SDK Key: {zoomSdkKey ? "✅" : "⏳ Đang lấy..."}</p>
</div>

// 🆕 Role-based navigation and UI
userName={userRole === "host"
  ? `Gia sư - ${classroomInfo?.name || "Phòng học"}`
  : `Học viên - ${classroomInfo?.name || "Phòng học"}`
}
```

## 🔍 Debug Console Commands

Run in browser console to debug:

```javascript
// Check navigation state
console.log("Location state:", window.history.state);

// Check localStorage
console.log("Zoom token:", localStorage.getItem("zoomAccessToken"));

// Check current user role in meeting page
console.log("User role:", document.querySelector(".tutor-meeting-room-page"));
```

## ✅ Success Criteria

### For Tutors:

- [ ] No black screen at meeting page
- [ ] Loads as host (role: 1)
- [ ] Can control meeting settings
- [ ] Back button leads to classroom management

### For Students:

- [ ] No redirect to homepage
- [ ] Loads as participant (role: 0)
- [ ] Cannot control meeting settings
- [ ] Back button leads to student classroom page

### Error Handling:

- [ ] Clear error messages when issues occur
- [ ] Retry button functions properly
- [ ] Debug info helps identify problems
- [ ] Graceful fallback when tokens missing

## 🚀 Next Steps

1. **Test both user flows manually**
2. **Verify API calls in Network tab**
3. **Check console for any errors**
4. **Test error scenarios**
5. **Confirm proper role-based permissions in Zoom**
