# API Rating Flow Analysis - Updated with Real Data Structure

## 📊 API meeting/get-meeting Response Structure

### Confirmed Data Structure:

```json
{
  "status": "OK",
  "code": 200,
  "success": true,
  "message": "Get meeting successfully",
  "data": {
    "result": {
      "total": 7,
      "items": [
        {
          "meetingId": "52a4f229-fb9e-45b7-ab98-546fc5e2f14f",
          "zoomMeetingId": "79516124830", // ẨN - không hiển thị
          "topic": "Lớp học: Lớp học với gia sư Nguyễn Văn An",
          "startTime": "2025-06-07T01:32:37.000Z",
          "duration": 1,
          "endTime": "2025-06-07T01:33:45.000Z",
          "status": "ENDED", // "IN_SESSION" | "ENDED"
          "classroomId": "0d27f835-83e7-408f-b2ab-d932450afc95",
          "isRating": true, // false = chưa đánh giá, true = đã đánh giá
          "classroom": {
            "classroomId": "0d27f835-83e7-408f-b2ab-d932450afc95",
            "nameOfRoom": "Lớp học với gia sư Nguyễn Văn An",
            "userId": "US00028", // Student ID
            "tutorId": "US00011", // Tutor ID
            "classroomEvaluation": "5.0", // Đánh giá phòng học hiện tại
            "status": "IN_SESSION"
          }
        }
      ]
    }
  }
}
```

## 🎯 Key Fields for Rating APIs

### 1. Đánh Giá Buổi Học (Meeting Rating)

**Required keys từ meeting data:**

- `meetingId`: "52a4f229-fb9e-45b7-ab98-546fc5e2f14f"
- `classroomId`: "0d27f835-83e7-408f-b2ab-d932450afc95"
- `tutorId`: "US00011" (từ classroom.tutorId)

**Payload structure:**

```json
{
  "meetingId": "52a4f229-fb9e-45b7-ab98-546fc5e2f14f",
  "rating": 5, // 1-5 stars
  "description": "Buổi học rất tốt, gia sư giảng dạy dễ hiểu"
}
```

### 2. Đánh Giá Phòng Học (Classroom Rating)

**Required keys từ meeting data:**

- `classroomId`: "0d27f835-83e7-408f-b2ab-d932450afc95"
- `tutorId`: "US00011" (từ classroom.tutorId)
- `userId`: "US00028" (từ classroom.userId)

**Payload structure:**

```json
{
  "classroomId": "0d27f835-83e7-408f-b2ab-d932450afc95",
  "tutorId": "US00011",
  "classroomEvaluation": "4.5", // Rating cho phòng học
  "description": "Gia sư giảng dạy tốt, phòng học được tổ chức chuyên nghiệp"
}
```

## 🔄 Current Rating State Logic

### isRating Field Analysis:

- `isRating: false` → Chưa đánh giá buổi học → Hiển thị nút "Đánh giá"
- `isRating: true` → Đã đánh giá buổi học → Hiển thị "Đã đánh giá"

### Meeting Status Logic:

- `status: "IN_SESSION"` → Buổi học đang diễn ra → Hiển thị nút "Tham gia"
- `status: "ENDED"` → Buổi học đã kết thúc → Hiển thị nút "Đánh giá" (nếu isRating = false)

## 🎨 UI/UX Rating Modal Structure

### Meeting Rating Modal:

```jsx
const handleMeetingRating = (meeting) => {
  setSelectedMeeting({
    meetingId: meeting.meetingId,
    classroomId: meeting.classroomId,
    tutorId: meeting.classroom.tutorId,
    topic: meeting.topic,
    startTime: meeting.startTime,
    endTime: meeting.endTime,
  });
  setShowRatingModal(true);
};
```

### Classroom Rating Modal:

```jsx
const handleClassroomRating = (meeting) => {
  setSelectedClassroom({
    classroomId: meeting.classroomId,
    tutorId: meeting.classroom.tutorId,
    userId: meeting.classroom.userId,
    nameOfRoom: meeting.classroom.nameOfRoom,
    currentEvaluation: meeting.classroom.classroomEvaluation,
  });
  setShowClassroomRatingModal(true);
};
```

## 🔧 Implementation Checklist

### ✅ Completed:

- [x] Ẩn hoàn toàn meetingId và zoomMeetingId
- [x] Đồng bộ UI/UX giữa Tutor và Student pages
- [x] Logic hiển thị nút based on status và isRating
- [x] Modal structure và validation
- [x] Pagination style đồng bộ

### 🚧 Pending Implementation:

- [ ] **API Call cho Meeting Rating**

  ```javascript
  const submitMeetingRating = async (payload) => {
    try {
      const response = await fetch("/api/meeting/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return response.json();
    } catch (error) {
      console.error("Meeting rating failed:", error);
    }
  };
  ```

- [ ] **API Call cho Classroom Rating**

  ```javascript
  const submitClassroomRating = async (payload) => {
    try {
      const response = await fetch("/api/classroom/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return response.json();
    } catch (error) {
      console.error("Classroom rating failed:", error);
    }
  };
  ```

- [ ] **Loading States & Data Refresh**

  - Loading spinner during API calls
  - Refresh meeting list after successful rating
  - Update isRating status locally
  - Error handling và user feedback

- [ ] **Backend Endpoint Verification**
  - Confirm `/api/meeting/rate` endpoint exists
  - Confirm `/api/classroom/rate` endpoint exists
  - Test payload structure compatibility

## 🎯 Next Steps Priority:

1. **Implement Meeting Rating API Call** (High Priority)
2. **Implement Classroom Rating API Call** (High Priority)
3. **Add Loading States & Refresh Logic** (Medium Priority)
4. **Backend Endpoint Testing** (Medium Priority)
5. **Error Handling Enhancement** (Low Priority)

## 📝 Notes:

- Data structure đã được xác nhận từ real API response
- Key mapping đã được identify chính xác
- UI/UX foundation đã sẵn sàng cho implementation
- Chỉ cần implement actual API calls và error handling
