# 📊 LUỒNG API ĐÁNH GIÁ PHÍA NGƯỜI HỌC - PHÂN TÍCH CHI TIẾT

## 🔍 Tổng quan hệ thống đánh giá

Hệ thống có **2 loại đánh giá** riêng biệt:

### 1. 📝 **Đánh giá Buổi học (Meeting Rating)**

- **Mục đích**: Đánh giá chất lượng một buổi học cụ thể
- **Component**: RatingModal (inline trong StudentClassroomPage.jsx)
- **Handler**: `handleMeetingRatingSubmit`

### 2. 🏛️ **Đánh giá Lớp học (Classroom Evaluation)**

- **Mục đích**: Đánh giá tổng thể lớp học
- **Component**: ClassroomEvaluationModal (component riêng)
- **Handler**: `handleEvaluationSubmit`

---

## 📝 CHI TIẾT ĐÁNH GIÁ BUỔI HỌC (Meeting Rating)

### 🔗 **API Endpoint (CHƯA IMPLEMENT)**

```javascript
// TODO: Cần implement API call
const response = await Api({
  endpoint: "meeting/rating", // ❌ Chưa có endpoint thực tế
  method: METHOD_TYPE.POST,
  data: ratingData,
  requireToken: true,
});
```

### 📤 **Dữ liệu truyền lên (Request Body)**

```javascript
{
  meetingId: "string",    // ID của buổi học
  rating: number,         // Số sao (1-5)
  comment: "string"       // Nội dung đánh giá
}
```

### 📋 **Chi tiết các trường**:

- **meetingId**: Lấy từ `meeting.meetingId`
- **rating**: Giá trị từ 0.5 - 5 (có hỗ trợ half star)
- **comment**: Bắt buộc nhập, trim() whitespace

### 📥 **Response mong đợi**:

```javascript
{
  success: true,
  message: "Rating submitted successfully",
  data: {
    ratingId: "string",
    meetingId: "string",
    userId: "string",
    rating: number,
    comment: "string",
    createdAt: "timestamp"
  }
}
```

### 🔄 **Luồng xử lý hiện tại**:

```javascript
const handleMeetingRatingSubmit = async (ratingData) => {
  console.log("Meeting rating submitted:", ratingData);
  // ❌ TODO: Implement API call to submit rating
  toast.success("Đánh giá buổi học đã được gửi thành công!");
  setShowMeetingRatingModal(false);
  setSelectedMeetingForRating(null);
};
```

---

## 🏛️ CHI TIẾT ĐÁNH GIÁ LỚP HỌC (Classroom Evaluation)

### 🔗 **API Endpoint (CHƯA IMPLEMENT)**

```javascript
// TODO: Cần implement API call
const response = await Api({
  endpoint: "classroom/evaluation", // ❌ Chưa có endpoint thực tế
  method: METHOD_TYPE.POST,
  data: evaluationData,
  requireToken: true,
});
```

### 📤 **Dữ liệu truyền lên (Request Body)**

Dữ liệu được truyền từ `ClassroomEvaluationModal` component:

```javascript
{
  classroomId: "string",     // ID của lớp học
  rating: number,            // Đánh giá tổng thể (1-5)
  comment: "string",         // Nhận xét
  // Có thể có thêm các trường khác từ modal
}
```

### 📥 **Response mong đợi**:

```javascript
{
  success: true,
  message: "Evaluation submitted successfully",
  data: {
    evaluationId: "string",
    classroomId: "string",
    userId: "string",
    rating: number,
    comment: "string",
    createdAt: "timestamp"
  }
}
```

### 🔄 **Luồng xử lý hiện tại**:

```javascript
const handleEvaluationSubmit = async (evaluationData) => {
  console.log("Evaluation submitted:", evaluationData);
  // ❌ TODO: Implement API call
  toast.success("Đánh giá đã được gửi thành công!");
  setShowEvaluationModal(false);
  setSelectedClassroomForEvaluation(null);
};
```

---

## 🛠️ PATTERN API CÓ SẴN TRONG FILE

### 📖 **Pattern tham khảo từ các API calls hiện có**:

#### 1. **GET Classrooms**:

```javascript
const response = await Api({
  endpoint: "classroom/search-for-user",
  method: METHOD_TYPE.GET,
  query: queryParams,
  requireToken: true,
});
```

#### 2. **POST Get Meetings**:

```javascript
const response = await Api({
  endpoint: "meeting/get-meeting",
  method: METHOD_TYPE.POST,
  data: { classroomId: classroomId },
  requireToken: true,
});
```

---

## ✅ IMPLEMENTATION SUGGESTIONS

### 📝 **1. Meeting Rating API Implementation**:

```javascript
const handleMeetingRatingSubmit = async (ratingData) => {
  try {
    console.log("Submitting meeting rating:", ratingData);

    const response = await Api({
      endpoint: "meeting/rating",
      method: METHOD_TYPE.POST,
      data: {
        meetingId: ratingData.meetingId,
        rating: ratingData.rating,
        comment: ratingData.comment,
      },
      requireToken: true,
    });

    if (response.success) {
      toast.success("Đánh giá buổi học đã được gửi thành công!");
      setShowMeetingRatingModal(false);
      setSelectedMeetingForRating(null);

      // TODO: Có thể refresh data để update isRating status
      // await fetchMeetings(currentClassroomForMeetings.classroomId);
    } else {
      throw new Error(response.message || "Lỗi khi gửi đánh giá");
    }
  } catch (error) {
    console.error("Error submitting meeting rating:", error);
    toast.error("Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!");
  }
};
```

### 🏛️ **2. Classroom Evaluation API Implementation**:

```javascript
const handleEvaluationSubmit = async (evaluationData) => {
  try {
    console.log("Submitting classroom evaluation:", evaluationData);

    const response = await Api({
      endpoint: "classroom/evaluation",
      method: METHOD_TYPE.POST,
      data: {
        classroomId: selectedClassroomForEvaluation.classroomId,
        ...evaluationData,
      },
      requireToken: true,
    });

    if (response.success) {
      toast.success("Đánh giá lớp học đã được gửi thành công!");
      setShowEvaluationModal(false);
      setSelectedClassroomForEvaluation(null);

      // TODO: Có thể refresh classroom data
      // await fetchClassrooms(true);
    } else {
      throw new Error(response.message || "Lỗi khi gửi đánh giá");
    }
  } catch (error) {
    console.error("Error submitting classroom evaluation:", error);
    toast.error("Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!");
  }
};
```

---

## 🔍 VALIDATION RULES

### 📝 **Meeting Rating Validation** (đã implement):

```javascript
// Trong RatingModal handleSubmit
if (rating === 0) {
  toast.error("Vui lòng chọn số sao đánh giá!");
  return;
}
if (!comment.trim()) {
  toast.error("Vui lòng nhập nội dung đánh giá!");
  return;
}
```

### 🏛️ **Classroom Evaluation Validation**:

- Validation logic trong `ClassroomEvaluationModal` component
- Chi tiết cần kiểm tra component riêng

---

## 📊 BACKEND API REQUIREMENTS

### 🔗 **Cần backend implement các endpoints**:

#### 1. `POST /api/meeting/rating`

- **Request**: `{ meetingId, rating, comment }`
- **Response**: `{ success, message, data }`
- **Auth**: Required (JWT token)

#### 2. `POST /api/classroom/evaluation`

- **Request**: `{ classroomId, rating, comment, ... }`
- **Response**: `{ success, message, data }`
- **Auth**: Required (JWT token)

#### 3. **Optional GET endpoints** để lấy đánh giá đã gửi:

- `GET /api/meeting/rating/:meetingId`
- `GET /api/classroom/evaluation/:classroomId`

---

## 🎯 CURRENT STATUS

### ❌ **Chưa hoàn thành**:

1. Backend API endpoints chưa có
2. Frontend API calls chưa implement
3. Error handling chưa đầy đủ
4. Loading states chưa có
5. Data refresh sau khi đánh giá

### ✅ **Đã có**:

1. UI/UX đầy đủ cho cả 2 loại đánh giá
2. Validation cho meeting rating
3. State management đầy đủ
4. Toast notifications
5. Modal handling logic

---

## 📋 TODO LIST

### 🔧 **Frontend Tasks**:

- [ ] Implement API calls cho cả 2 loại đánh giá
- [ ] Thêm loading states khi submit
- [ ] Thêm error handling đầy đủ
- [ ] Refresh data sau khi đánh giá thành công
- [ ] Kiểm tra và update isRating status

### 🖥️ **Backend Tasks**:

- [ ] Tạo endpoint `POST /api/meeting/rating`
- [ ] Tạo endpoint `POST /api/classroom/evaluation`
- [ ] Database schema cho ratings và evaluations
- [ ] Validation rules trên server
- [ ] Response format chuẩn

### 🧪 **Testing Tasks**:

- [ ] Unit tests cho API calls
- [ ] Integration tests cho đánh giá flow
- [ ] UI testing cho modal interactions
- [ ] Error scenarios testing

---

_Phân tích hoàn thành: 20/06/2025_  
_Tác giả: GitHub Copilot_  
_Phiên bản: API Rating Flow Analysis v1.0_
