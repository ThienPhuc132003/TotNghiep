# 📊 LUỒNG DATA RATING PHÒNG HỌC - CHI TIẾT

## 🎯 TỔNG QUAN LUỒNG DATA

```
1. Classroom List Loading → 2. Meeting View → 3. Rating Button → 4. Rating Modal → 5. API Submit → 6. Data Refresh
```

---

## 🔄 BƯỚC 1: CLASSROOM LIST LOADING

### API Call: `classroom/search-for-user`

```javascript
// Endpoint: GET /classroom/search-for-user
// Headers: Authorization: Bearer {token}
// Response path: response.data.items

const response = await Api({
  endpoint: "classroom/search-for-user",
  method: METHOD_TYPE.GET,
  requireToken: true,
});

// Data structure nhận được:
const classroomData = {
  classroomId: "class-123",
  nameOfRoom: "Toán học cơ bản",
  status: "COMPLETED", // IN_SESSION, PENDING, COMPLETED, CANCELLED
  isRating: false, // ⭐ KEY: Xác định đã đánh giá chưa
  classroomEvaluation: null, // Number 1-5 nếu đã đánh giá
  tutor: {
    userId: "tutor-456",
    fullname: "Nguyễn Văn A",
    avatar: "...",
    // ...other tutor info
  },
  startDay: "2024-01-01",
  endDay: "2024-06-30",
  // ...other classroom info
};
```

### State Update:

```javascript
setAllClassrooms(allClassroomsData); // Store cho filtering
setClassrooms(filteredItems); // Display items
```

---

## 🔄 BƯỚC 2: MEETING VIEW LOADING

### Trigger: Click "Xem danh sách phòng học"

```javascript
// Function call:
handleGoToMeetingView(classroomId, classroomName);
// hoặc
handleViewMeetings(classroomId, classroomName, classroom, page);
```

### API Call: `meeting/get-meeting`

```javascript
// Endpoint: POST /meeting/get-meeting
// Body: { classroomId: "class-123" }
// Headers: Authorization: Bearer {token}
// Response path: response.data.result.items ⚠️ QUAN TRỌNG

const requestData = { classroomId: classroomId };
const response = await Api({
  endpoint: "meeting/get-meeting",
  method: METHOD_TYPE.POST,
  data: requestData,
  requireToken: true,
});

// Data structure nhận được:
const meetingData = {
  meetingId: "meeting-789",
  topic: "Buổi học số 1",
  startTime: "2024-01-15T09:00:00Z",
  endTime: "2024-01-15T10:30:00Z",
  status: "COMPLETED", // COMPLETED, ENDED, FINISHED, IN_SESSION, PENDING
  joinUrl: "https://zoom.us/j/...",
  password: "123456",
  // ...other meeting info
};
```

### State Update:

```javascript
setMeetingList(allMeetingsData); // All meetings from API
setCurrentClassroomForMeetings({
  // ⭐ KEY: Classroom context
  classroomId,
  nameOfRoom: classroomName,
  // ❌ THIẾU: isRating, classroomEvaluation, tutor info
});
setShowMeetingView(true);
```

### ⚠️ VẤN ĐỀ PHÁT HIỆN:

`currentClassroomForMeetings` chỉ có `classroomId` và `nameOfRoom`, **THIẾU** các thông tin quan trọng:

- `isRating` (để check đã đánh giá chưa)
- `classroomEvaluation` (số sao đã đánh giá)
- `tutor` object (cần cho API submit)

---

## 🔄 BƯỚC 3: RATING BUTTON RENDER

### Component: MeetingView

```javascript
// Meeting list render:
{
  filteredMeetings.map((meeting, index) => {
    return (
      <li key={index} className="scp-meeting-item">
        {/* Meeting info... */}

        {/* Rating Section */}
        <div className="scp-meeting-rating">
          {currentClassroomForMeetings &&
          currentClassroomForMeetings.isRating ? (
            // ❌ LUÔN FALSE vì currentClassroomForMeetings không có isRating
            <div className="scp-rating-display">...</div>
          ) : (
            // ✅ LUÔN HIỂN THỊ vì condition trên luôn false
            <button
              onClick={() =>
                handleOpenRatingModal(meeting, currentClassroomForMeetings)
              }
            >
              Đánh giá
            </button>
          )}
        </div>
      </li>
    );
  });
}
```

### ⚠️ VẤN ĐỀ:

- Button luôn hiển thị vì `currentClassroomForMeetings.isRating` undefined
- Không thể check đã đánh giá hay chưa

---

## 🔄 BƯỚC 4: RATING MODAL TRIGGER

### Click Event: Nút "Đánh giá"

```javascript
onClick={() => {
  console.log("🔍 RATING BUTTON CLICKED:", {
    meeting: meeting?.meetingId,
    classroom: currentClassroomForMeetings?.classroomId,
    isRating: currentClassroomForMeetings?.isRating // ❌ undefined
  });
  handleOpenRatingModal(meeting, currentClassroomForMeetings);
}}
```

### Function: handleOpenRatingModal

```javascript
const handleOpenRatingModal = (meeting, classroom) => {
  console.log("🔍 RATING DEBUG - Opening rating modal:", {
    meetingId: meeting.meetingId, // ✅ OK
    classroomId: classroom.classroomId, // ✅ OK
    tutorId: classroom.tutor?.userId, // ❌ undefined - THIẾU tutor info
    isRating: classroom.isRating, // ❌ undefined - THIẾU isRating
  });

  setSelectedMeetingForRating(meeting); // ✅ OK
  setCurrentClassroomForRating(classroom); // ❌ THIẾU data
  setShowRatingModal(true); // ✅ OK
};
```

### ⚠️ VẤN ĐỀ:

- `classroom.tutor` undefined → Không có tutorId cho API
- `classroom.isRating` undefined → Không check được status

---

## 🔄 BƯỚC 5: RATING MODAL RENDER

### Component: RatingModal

```javascript
const RatingModal = () => {
  console.log("🔍 RATING MODAL DEBUG - Render check:", {
    showRatingModal, // ✅ true
    selectedMeetingForRating: selectedMeetingForRating?.meetingId, // ✅ OK
    currentClassroomForRating: currentClassroomForRating?.classroomId, // ✅ OK
    shouldShow:
      showRatingModal && selectedMeetingForRating && currentClassroomForRating, // ✅ true
  });

  if (
    !showRatingModal ||
    !selectedMeetingForRating ||
    !currentClassroomForRating
  ) {
    console.log("❌ RATING MODAL - Not showing because conditions not met");
    return null; // ❌ RETURN NULL vì currentClassroomForRating thiếu data
  }

  return (
    <div className="scp-modal-overlay">
      <div className="scp-modal-content">
        <p>
          <strong>Gia sư:</strong> {currentClassroomForRating.tutor?.fullname}
        </p>
        {/* ❌ undefined vì không có tutor info */}
      </div>
    </div>
  );
};
```

### ⚠️ VẤN ĐỀ CHÍNH:

Modal **KHÔNG HIỂN THỊ** vì `currentClassroomForRating` thiếu thông tin cần thiết!

---

## 🔄 BƯỚC 6: API SUBMIT (NẾU MODAL HIỂN THỊ)

### Function: handleSubmitRating

```javascript
const handleSubmitRating = async () => {
  const ratingData = {
    tutorId: currentClassroomForRating.tutor.userId, // ❌ undefined
    classroomEvaluation: ratingValue, // ✅ OK (1-5)
    description: ratingDescription.trim(), // ✅ OK
    meetingId: selectedMeetingForRating.meetingId, // ✅ OK
  };

  // API Call:
  const response = await Api({
    endpoint: `classroom-assessment/create/${currentClassroomForRating.classroomId}`,
    method: METHOD_TYPE.POST,
    data: ratingData,
    requireToken: true,
  });
};
```

---

## 🛠️ ROOT CAUSE ANALYSIS

### ❌ VẤN ĐỀ CHÍNH: DATA MISSING

`currentClassroomForMeetings` chỉ có:

```javascript
{
  classroomId: "class-123",
  nameOfRoom: "Toán học cơ bản"
  // ❌ THIẾU: isRating, classroomEvaluation, tutor
}
```

### 💡 GIẢI PHÁP: TRUYỀN ĐẦY ĐỦ CLASSROOM DATA

#### Option 1: Fix handleViewMeetings

```javascript
const handleViewMeetings = async (
  classroomId,
  classroomName,
  classroom = null,
  page = 1
) => {
  // ...API call...

  setCurrentClassroomForMeetings({
    classroomId,
    nameOfRoom: classroomName,
    // ✅ THÊM: Truyền full classroom data
    isRating: classroom?.isRating || false,
    classroomEvaluation: classroom?.classroomEvaluation || null,
    tutor: classroom?.tutor || null,
    status: classroom?.status || null,
  });
};
```

#### Option 2: Find classroom in allClassrooms

```javascript
const handleOpenRatingModal = (meeting, classroom) => {
  // ✅ Tìm full classroom data từ allClassrooms
  const fullClassroom = allClassrooms.find(
    (c) => c.classroomId === classroom.classroomId
  );

  setCurrentClassroomForRating(fullClassroom || classroom);
  // ...rest
};
```

---

## 🎯 LUỒNG DATA ĐÚNG (SAU KHI FIX)

```
1. Classroom List Load → allClassrooms = [full classroom objects]
                      ↓
2. Meeting View      → currentClassroomForMeetings = {id, name, isRating, tutor, ...}
                      ↓
3. Rating Button     → if (!isRating) show button; else show stars
                      ↓
4. Rating Modal      → Modal shows with full data (tutor name, etc.)
                      ↓
5. API Submit        → POST with tutorId from classroom.tutor.userId
                      ↓
6. Data Refresh      → Reload classrooms, isRating = true
```

---

## 🔍 DEBUG COMMANDS

```javascript
// 1. Check classroom data trong allClassrooms
console.log("All classrooms:", allClassrooms);
console.log("First classroom:", allClassrooms[0]);

// 2. Check currentClassroomForMeetings
console.log("Current classroom for meetings:", currentClassroomForMeetings);

// 3. Check modal render conditions
console.log("Modal conditions:", {
  showRatingModal,
  selectedMeetingForRating: !!selectedMeetingForRating,
  currentClassroomForRating: !!currentClassroomForRating,
  hasRequiredData: !!currentClassroomForRating?.tutor?.userId,
});

// 4. Find full classroom data
const classroomId = currentClassroomForMeetings?.classroomId;
const fullClassroom = allClassrooms.find((c) => c.classroomId === classroomId);
console.log("Full classroom data:", fullClassroom);
```

---

**CONCLUSION:** Vấn đề chính là `currentClassroomForMeetings` thiếu data. Cần fix để truyền đầy đủ thông tin classroom từ `allClassrooms` array.
