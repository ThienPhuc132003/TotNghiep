# TUTOR MEETING DEBUG - FIX "KHÔNG HIỂN THỊ"

## 🔍 NGUYÊN NHÂN VẤN ĐỀ

### Data Structure (Cả Tutor và Student giống nhau):

```json
{
  "result": {
    "total": 5,
    "items": [
      { "status": "ENDED", "meetingId": "52a4f229-...", ... },
      { "status": "ENDED", "meetingId": "41b44620-...", ... },
      { "status": "ENDED", "meetingId": "97262857-...", ... },
      { "status": "ENDED", "meetingId": "22523e7e-...", ... },
      { "status": "ENDED", "meetingId": "d17c10f3-...", ... }
    ]
  }
}
```

### ❌ VẤN ĐỀ: Default Tab vs Actual Data

- **Default Tab**: "IN_SESSION"
- **Actual Data**: Tất cả meetings đều `status: "ENDED"`
- **Kết quả**: Filter IN_SESSION → 0 items → Empty state

## ✅ GIẢI PHÁP ĐÃ ÁP DỤNG

### 1. **Đổi Default Tab**

```javascript
// TutorClassroomPage.jsx
const [activeMeetingTab, setActiveMeetingTab] = useState("ENDED"); // Phù hợp với data thực tế
```

### 2. **Cải thiện Data Priority**

```javascript
// Ưu tiên result.items vì cả 2 API đều trả về ở đó
if (response.result && response.result.items) {
  allMeetingsData = response.result.items;
} else if (response.data && response.data.items) {
  allMeetingsData = response.data.items; // fallback
}
```

### 3. **Thêm Debug Log Chi Tiết**

```javascript
console.log("🔍 TUTOR DEBUG - Meetings status breakdown:", {
  allStatuses: allMeetingsData.map((m) => m.status),
  inSessionCount: allMeetingsData.filter(
    (m) => m.status === "IN_SESSION" || m.status === "PENDING" || !m.status
  ).length,
  endedCount: allMeetingsData.filter(
    (m) =>
      m.status === "ENDED" ||
      m.status === "COMPLETED" ||
      m.status === "CANCELLED"
  ).length,
});
```

## 🔬 TEST VERIFICATION

### Expected Console Log:

```
🔍 TUTOR DEBUG - Raw meetings data: [5 items]
🔍 TUTOR DEBUG - Meetings status breakdown: {
  allStatuses: ["ENDED", "ENDED", "ENDED", "ENDED", "ENDED"],
  inSessionCount: 0,
  endedCount: 5
}
🔍 TUTOR DEBUG - About to filter with tab: ENDED
🔍 TUTOR DEBUG - Filtered result: {
  totalItems: 5,
  filteredItems: 5,
  activeTab: "ENDED",
  resultTotal: 5
}
```

### Expected UI:

```
📋 Quản lý phòng học của gia sư
├── 🔵 Phòng học đang hoạt động (0)
├── 🔴 Phòng học đã kết thúc (5) ← Active & shows 5 meetings
└── ➕ Tạo phòng học
```

## 🚀 NEXT STEPS

1. **Test on browser**:

   - Login tutor → Click "Xem phòng học"
   - Should see "Phòng học đã kết thúc" tab active
   - Should display 5 meetings

2. **Check console logs**:

   - Verify data breakdown shows endedCount: 5
   - Verify filtered result shows 5 items

3. **Compare with Student**:
   - Student page should behave identically
   - Both should show same meetings data

## 📝 CONCLUSION

**Vấn đề "không hiển thị" do mismatch giữa:**

- Default tab: "IN_SESSION"
- Actual data: Toàn "ENDED"

**Giải pháp:**

- ✅ Đổi default tab thành "ENDED"
- ✅ Ưu tiên `result.items`
- ✅ Debug log chi tiết
- ✅ Giữ logic filter đơn giản

**Kết quả mong đợi:**
Tutor page sẽ load và hiển thị ngay 5 meetings trong tab "Phòng học đã kết thúc".
