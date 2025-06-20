# FIX ZOOM OAUTH CALLBACK - QUẢN LÝ PHÒNG HỌC

## Vấn Đề

Khi gia sư đăng nhập Zoom thành công và quay về path `/tai-khoan/ho-so/quan-ly-phong-hoc`, trang không hiển thị gì vì:

- Các phòng học được call từ ID của lớp học
- Khi quay lại từ Zoom OAuth callback, không có context của lớp học nào đang được chọn
- Trang hiển thị message "Thông tin lớp học không hợp lệ."

## Root Cause Analysis

### Component: TutorClassroomMeetingsPage.jsx

- **Issue**: Component yêu cầu `classroomId` và `classroomName` để load meetings
- **Check**: `if (!classroomId || !classroomName)` → return error message
- **API Call**: `fetchMeetings()` có điều kiện `if (!classroomId || isLoading) return;`

### Flow Problem:

1. Gia sư ở trang quản lý phòng học của 1 lớp cụ thể
2. Click "Kết nối Zoom" → redirect to Zoom OAuth
3. Zoom OAuth success → redirect back to `/tai-khoan/ho-so/quan-ly-phong-hoc`
4. ❌ **KHÔNG có classroomId** → trang trống

## Giải Pháp Implemented

### Strategy: Classroom Selection Interface

Khi không có `classroomId`, hiển thị danh sách lớp học để gia sư chọn, sau đó navigate tới quản lý phòng học của lớp đó.

### 1. ✅ New State Management

```jsx
// New states for classroom selection when no classroomId provided
const [availableClassrooms, setAvailableClassrooms] = useState([]);
const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false);
const [classroomSelectionError, setClassroomSelectionError] = useState(null);
```

### 2. ✅ Fetch Available Classrooms Function

```jsx
const fetchAvailableClassrooms = useCallback(async () => {
  // Use same API as TutorClassroomPage.jsx
  const response = await Api({
    endpoint: "classroom/search-for-tutor",
    method: METHOD_TYPE.GET,
    query: { page: 1, rpp: 1000 },
    requireToken: true,
  });
  // Handle response and set availableClassrooms
}, [currentUser?.userId]);
```

### 3. ✅ Classroom Selection Handler

```jsx
const handleClassroomSelect = useCallback(
  (classroom) => {
    // Navigate to same page with classroomId and classroomName
    navigate(`/tai-khoan/ho-so/quan-ly-phong-hoc`, {
      state: {
        classroomId: classroom.classroomId,
        classroomName: classroom.className,
      },
    });
  },
  [navigate]
);
```

### 4. ✅ Auto-Load Logic

```jsx
useEffect(() => {
  if (!classroomId && currentUser?.userId) {
    console.log("🔄 No classroomId provided, loading available classrooms...");
    fetchAvailableClassrooms();
  }
}, [classroomId, currentUser?.userId, fetchAvailableClassrooms]);
```

### 5. ✅ Updated UI Render Logic

Thay đổi render khi `!classroomId || !classroomName`:

**Before:**

```jsx
if (!classroomId || !classroomName) {
  return (
    <div>
      <p>Thông tin lớp học không hợp lệ.</p>
      <button onClick={handleBackToClassrooms}>Quay lại</button>
    </div>
  );
}
```

**After:**

```jsx
if (!classroomId || !classroomName) {
  return (
    <div>
      {!classroomId && <ClassroomSelectionInterface />}
      {classroomId && !classroomName && <InvalidClassroomMessage />}
    </div>
  );
}
```

### 6. ✅ Classroom Selection Interface

- **Loading State**: Spinner + "Đang tải danh sách lớp học..."
- **Error State**: Error message + "Thử lại" button
- **Empty State**: "Bạn chưa có lớp học nào" + Back button
- **Grid Layout**: Cards hiển thị thông tin lớp học
  - Tên lớp học
  - Môn học
  - Học viên
  - Trạng thái (Đang học/Không hoạt động)
  - "Xem phòng học" action

### 7. ✅ CSS Styling

Added comprehensive styles in `TutorClassroomPage.style.css`:

- `.classroom-selection-container`
- `.classrooms-grid`
- `.classroom-card` with hover effects
- Loading, error, empty states
- Responsive design for mobile

## User Experience Flow

### Before Fix:

1. Gia sư ở trang quản lý phòng học lớp A
2. Click "Kết nối Zoom"
3. Zoom OAuth success → quay về `/quan-ly-phong-hoc`
4. ❌ **Trang trống** - "Thông tin lớp học không hợp lệ"

### After Fix:

1. Gia sư ở trang quản lý phòng học lớp A
2. Click "Kết nối Zoom"
3. Zoom OAuth success → quay về `/quan-ly-phong-hoc`
4. ✅ **Hiển thị danh sách lớp học** để chọn
5. Gia sư click chọn lớp A
6. ✅ **Navigate to quản lý phòng học lớp A** với full context

## Files Modified

- ✅ `src/pages/User/TutorClassroomMeetingsPage.jsx`
  - Added new states for classroom selection
  - Added `fetchAvailableClassrooms()` function
  - Added `handleClassroomSelect()` function
  - Updated render logic for classroom selection
- ✅ `src/assets/css/TutorClassroomPage.style.css`
  - Added comprehensive CSS for classroom selection interface

## Benefits

1. **No More Blank Page**: User always sees meaningful content
2. **Clear Navigation**: Easy classroom selection interface
3. **Preserved Context**: After selecting classroom, full functionality restored
4. **Better UX**: Visual feedback for loading/error states
5. **Responsive Design**: Works on mobile devices
6. **Consistent API**: Uses same endpoint as main classroom page

## Testing Scenarios

1. ✅ **Direct Navigation**: `/tai-khoan/ho-so/quan-ly-phong-hoc` → Shows classroom selection
2. ✅ **Zoom OAuth Return**: After Zoom login → Shows classroom selection
3. ✅ **Classroom Selection**: Click classroom → Navigate with context
4. ✅ **Error Handling**: API errors → Show retry option
5. ✅ **Empty State**: No classrooms → Show appropriate message
6. ✅ **Mobile**: Responsive design works

---

_Status: COMPLETED_
_Date: 21/06/2025_
_Impact: Resolves Zoom OAuth callback blank page issue_
