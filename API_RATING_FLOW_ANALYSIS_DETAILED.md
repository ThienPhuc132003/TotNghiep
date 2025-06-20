# API Rating Flow Analysis - Detailed Implementation Guide

## 1. Meeting API Response Structure Analysis

### API Endpoint: `meeting/get-meeting`

**Response Structure:**

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
          "zoomMeetingId": "79516124830", // ẨN TRONG UI
          "classroomId": "0d27f835-83e7-408f-b2ab-d932450afc95",
          "status": "ENDED",
          "isRating": true,
          "classroom": {
            "classroomId": "0d27f835-83e7-408f-b2ab-d932450afc95",
            "tutorId": "US00011",
            "classroomEvaluation": "5.0", // SỐ SAO ĐÁNH GIÁ HIỆN TẠI
            "nameOfRoom": "Lớp học với gia sư Nguyễn Văn An"
          }
        }
      ]
    }
  }
}
```

## 2. Key Fields for Rating API Implementation

### Từ Meeting API Response, cần lấy các key sau:

#### **A. Required Keys for Rating API:**

1. **`meetingId`** - ID của buổi học cần đánh giá
2. **`classroomId`** - ID của phòng học
3. **`classroom.tutorId`** - ID của gia sư được đánh giá
4. **`classroom.classroomEvaluation`** - Điểm đánh giá hiện tại (để hiển thị)

#### **B. Additional Keys for UI/Logic:**

1. **`status`** - Trạng thái meeting ("ENDED", "IN_SESSION")
2. **`isRating`** - Đã đánh giá hay chưa (true/false)
3. **`classroom.nameOfRoom`** - Tên phòng học (để hiển thị)

#### **C. Hidden Keys (Not Displayed in UI):**

1. **`zoomMeetingId`** - ẨN HOÀN TOÀN
2. **`meetingId`** - ẨN TRONG UI (chỉ dùng cho API)

## 3. Rating API Implementation Structure

### Expected Rating API Payload:

```javascript
// API Call để đánh giá phòng học
const ratingPayload = {
  meetingId: meeting.meetingId, // Từ meeting response
  classroomId: meeting.classroomId, // Từ meeting response
  tutorId: meeting.classroom.tutorId, // Từ meeting.classroom
  classroomEvaluation: selectedRating, // Số sao người dùng chọn (1-5)
  description: ratingComment, // Nội dung đánh giá từ textarea
};

// API Endpoint (dự kiến): POST /api/classroom/rate hoặc /api/rating/submit
```

## 4. Implementation in StudentClassroomPage.jsx

### Current State Analysis:

- ✅ Meeting ID và Zoom Meeting ID đã được ẨN hoàn toàn
- ✅ Modal đánh giá đã có UI sẵn với star rating và textarea
- ✅ Logic `isRating` đã được xử lý đúng
- ✅ Chỉ hiển thị nút đánh giá khi `status === "ENDED" && !isRating`

### Required Implementation Steps:

#### **Step 1: Extract Rating Data from Meeting**

```javascript
const handleOpenRatingModal = (meeting) => {
  const ratingData = {
    meetingId: meeting.meetingId,
    classroomId: meeting.classroomId,
    tutorId: meeting.classroom.tutorId,
    currentRating: meeting.classroom.classroomEvaluation,
    classroomName: meeting.classroom.nameOfRoom,
  };

  setSelectedMeetingForRating(ratingData);
  setIsRatingModalOpen(true);
};
```

#### **Step 2: Submit Rating API Call**

```javascript
const handleSubmitRating = async () => {
  try {
    const payload = {
      meetingId: selectedMeetingForRating.meetingId,
      classroomId: selectedMeetingForRating.classroomId,
      tutorId: selectedMeetingForRating.tutorId,
      classroomEvaluation: rating.toString(), // Convert to string như backend expect
      description: comment,
    };

    const response = await fetch("/api/classroom/rate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      // Refresh meeting list để update isRating = true
      await loadMeetings();
      setIsRatingModalOpen(false);
      // Show success message
    }
  } catch (error) {
    console.error("Rating submission failed:", error);
  }
};
```

## 5. UI/UX Considerations

### **Hidden Elements (Đã implement):**

- ❌ Meeting ID - KHÔNG hiển thị
- ❌ Zoom Meeting ID - KHÔNG hiển thị
- ✅ Topic/Room Name - Hiển thị
- ✅ Status - Hiển thị
- ✅ Duration - Hiển thị
- ✅ Rating Button - Chỉ khi ENDED && !isRating

### **Rating Modal Elements:**

- ✅ Star Rating Component (1-5 stars)
- ✅ Comment Textarea
- ✅ Submit/Cancel Buttons
- ✅ Current Rating Display (từ classroomEvaluation)

## 6. Data Flow Summary

```
1. User clicks "Đánh giá" button
   ↓
2. Extract meeting data (meetingId, classroomId, tutorId)
   ↓
3. Open rating modal with extracted data
   ↓
4. User selects stars + enters comment
   ↓
5. Submit to Rating API with payload
   ↓
6. Refresh meeting list (isRating becomes true)
   ↓
7. Hide rating button for that meeting
```

## 7. Error Handling

- Network errors during rating submission
- Invalid rating values
- Missing required fields
- API response validation
- UI state management during loading

## 8. Testing Checklist

- [ ] Meeting ID/Zoom ID hoàn toàn ẩn trong UI
- [ ] Rating modal mở với đúng meeting data
- [ ] Star rating component hoạt động
- [ ] Comment textarea accept input
- [ ] API call gửi đúng payload structure
- [ ] Success: isRating updates, button disappears
- [ ] Error handling displays proper messages
- [ ] Modal closes after successful submission

## 9. Next Steps

1. **Implement Rating API Call** - Tích hợp API thực tế
2. **Add Loading States** - Spinner during API calls
3. **Success/Error Messages** - User feedback
4. **Validation** - Ensure required fields
5. **Testing** - End-to-end rating flow

---

**Status**: ✅ Analysis Complete - Ready for API Implementation
**Files**: StudentClassroomPage.jsx, Rating Modal Components
**Dependencies**: Rating API endpoint, Authentication token
