# FIX EXCEL EXPORT - TRANG STATISTICS

## Vấn Đề Được Báo Cáo

Người dùng báo cáo 2 trang statistics không xuất được Excel:

1. ❌ **DANH SÁCH DOANH THU** (`ListOfTutorRevenue.jsx`)
2. ❌ **LƯỢT THUÊ GIA SƯ** (`TutorHireStatistics.jsx`)

Trong khi 2 trang khác vẫn hoạt động bình thường: 3. ✅ **DOANH THU GIA SƯ** (`TutorRevenueStatistics.jsx`) 4. ✅ **THỐNG KÊ ĐÁNH GIÁ GIA SƯ** (`TutorAssessmentStatistics.jsx`)

## Phân Tích Nguyên Nhân

### Root Cause Discovery

Function `exportToExcel` **bắt buộc** phải có parameter `columns` vì:

1. Line 88: `const colCount = columns.length;`
2. Line 154: `columns.forEach((column, index) => {`
3. Line 172: `columns.forEach((column, colIndex) => {`

### Files Analysis

- ✅ **ListOfTutorRevenue.jsx**: Có `columns` parameter ← Vấn đề khác
- ❌ **TutorHireStatistics.jsx**: THIẾU `columns` parameter ← Fixed
- ✅ **TutorRevenueStatistics.jsx**: Không có `columns` nhưng vẫn work ← Cần investigation
- ✅ **TutorAssessmentStatistics.jsx**: Working fine

## Các Thay Đổi Đã Thực Hiện

### 1. TutorHireStatistics.jsx ✅ FIXED

- ✅ Thêm `exportColumns` definition với structure phù hợp
- ✅ Cập nhật `exportData` để match với `columns.dataKey`
- ✅ Thêm `columns: exportColumns` vào `exportToExcel` call
- ✅ Fixed syntax errors và formatting issues

### 2. ListOfTutorRevenue.jsx ⏳ DEBUGGING

- ✅ Đã có `columns` parameter từ trước
- ✅ Structure có vẻ đúng
- ⏳ Thêm debug logs để identify issue
- ❓ Vấn đề có thể là với `summaryStats` format hoặc data structure

### 3. Debug Enhancements

- ✅ Thêm console.log debug cho `ListOfTutorRevenue.jsx`
- ✅ Thêm console.log debug cho `TutorHireStatistics.jsx`
- ⏳ Start dev server để test functionality

## Expected Results

### TutorHireStatistics.jsx

Should now work because:

```jsx
const exportColumns = [
  { title: "STT", dataKey: "stt" },
  { title: "Mã học viên", dataKey: "userId" },
  // ... more columns
];

await exportToExcel({
  data: exportData,
  columns: exportColumns, // ← ADDED
  // ... other params
});
```

### ListOfTutorRevenue.jsx

Cần investigation thêm vì:

- Already has `columns` parameter
- Structure looks correct
- Might be data-related issue

## Next Steps

1. ⏳ Test với dev server
2. ⏳ Check console logs để identify exact error
3. ⏳ Compare working vs non-working implementations
4. ⏳ Fix remaining issues in ListOfTutorRevenue.jsx

---

_Status: IN PROGRESS_
_Last Updated: 21/06/2025_
