# SO SÁNH LUỒNG STUDENT VS TUTOR MEETING VIEW

## 📊 PHÂN TÍCH KHÁC BIỆT

### STUDENT CLASSROOM PAGE (hoạt động bình thường)

```javascript
// Default tab
const [activeMeetingTab, setActiveMeetingTab] = useState("IN_SESSION");

// API Call - giống nhau
const response = await Api({
  endpoint: "meeting/get-meeting",
  method: METHOD_TYPE.POST,
  data: { classroomId: classroomId },
  requireToken: true,
});

// Data handling - ưu tiên response.data.items trước
if (response.data && response.data.items) {
  allMeetingsData = response.data.items;
} else if (response.result && response.result.items) {
  allMeetingsData = response.result.items;
}

// UI: CHỈ 2 TAB
- "Phòng học đang hoạt động" (IN_SESSION) ← DEFAULT
- "Phòng học đã kết thúc" (ENDED)

// KHÔNG CÓ AUTO-SWITCH LOGIC
```

### TUTOR CLASSROOM PAGE (đã fix)

```javascript
// Default tab
const [activeMeetingTab, setActiveMeetingTab] = useState("ENDED");

// API Call - giống nhau
const response = await Api({
  endpoint: "meeting/get-meeting",
  method: METHOD_TYPE.POST,
  data: { classroomId: classroomId },
  requireToken: true,
});

// Data handling - ưu tiên response.result.items trước
if (response.result && response.result.items) {
  allMeetingsData = response.result.items;
} else if (response.data && response.data.items) {
  allMeetingsData = response.data.items;
}

// UI: CHỈ 2 TAB
- "Phòng học đang hoạt động" (IN_SESSION)
- "Phòng học đã kết thúc" (ENDED) ← DEFAULT

// CÓ AUTO-SWITCH LOGIC
if (activeMeetingTab === "IN_SESSION" && inSessionMeetings.length === 0) {
  setActiveMeetingTab("ENDED");
}
```

## 🔍 TẠI SAO STUDENT "CHẠY BÌNH THƯỜNG"?

### 1. **Thứ tự ưu tiên data khác nhau**

- **Student**: `response.data.items` TRƯỚC, `response.result.items` SAU
- **Tutor**: `response.result.items` TRƯỚC, `response.data.items` SAU

### 2. **Default tab khác nhau**

- **Student**: Default "IN_SESSION" → nếu có meeting nào thì hiển thị
- **Tutor**: Default "ENDED" → phù hợp với data thực tế (toàn ENDED)

### 3. **Auto-switch logic**

- **Student**: KHÔNG có auto-switch → giữ nguyên tab được chọn
- **Tutor**: CÓ auto-switch → tự động chuyển nếu không có data phù hợp

## 💡 KẾT LUẬN

**Student page "chạy bình thường" vì:**

1. **Đơn giản hơn**: Không có logic phức tạp
2. **Ổn định hơn**: Không tự động chuyển tab
3. **Thứ tự data**: Có thể API trả về data ở vị trí khác nhau

## 🎯 KIẾN NGHỊ

### Option 1: ĐỒNG BỘ HÓA (làm giống Student)

```javascript
// TutorClassroomPage.jsx
const [activeMeetingTab, setActiveMeetingTab] = useState("IN_SESSION");

// Ưu tiên response.data.items trước
if (response.data && response.data.items) {
  allMeetingsData = response.data.items;
} else if (response.result && response.result.items) {
  allMeetingsData = response.result.items;
}

// XÓA auto-switch logic
```

### Option 2: GIỮ NGUYÊN (phù hợp với data)

```javascript
// Giữ default "ENDED" vì data thực tế toàn ENDED
// Giữ auto-switch để UX tốt hơn
// Ưu tiên response.result.items theo API mới
```

## 🔧 TEST STEPS

1. **Test Student page**: Click "Xem danh sách phòng học" → Check console log
2. **Test Tutor page**: Click "Xem phòng học" → Check console log
3. **So sánh API response**: Xem data ở đâu (`data.items` vs `result.items`)
4. **Quyết định**: Đồng bộ hóa hay giữ khác biệt hợp lý
