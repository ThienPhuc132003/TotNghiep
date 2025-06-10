# 🔧 QUERY DEBUGGING GUIDE - TutorRevenueStatistics

## 🎯 MỤC TIÊU

Xác định tham số query nào đang gây lỗi trong API call

## 📋 QUY TRÌNH TEST

### Bước 1: Test Query Tối Giản ✅ (Đã thực hiện)

```javascript
const query = {
  rpp: itemsPerPage,
  page: currentPage + 1,
};
```

**KẾT QUẢ MONG ĐỢI:**

- ✅ Nếu thành công: API hoạt động bình thường, vấn đề ở tham số khác
- ❌ Nếu thất bại: Vấn đề cơ bản với API hoặc authentication

---

### Bước 2: Thêm Period Parameters (Nếu Bước 1 thành công)

Thay đổi query trong component:

```javascript
const query = {
  rpp: itemsPerPage,
  page: currentPage + 1,
  periodType: periodType,
  periodValue: periodValue,
};
```

**KẾT QUẢ MONG ĐỢI:**

- ✅ Nếu thành công: Period params không phải vấn đề
- ❌ Nếu thất bại: `periodType` hoặc `periodValue` gây lỗi

---

### Bước 3: Thêm Sort Parameter (Nếu Bước 2 thành công)

```javascript
const query = {
  rpp: itemsPerPage,
  page: currentPage + 1,
  periodType: periodType,
  periodValue: periodValue,
  sort: JSON.stringify([
    { key: sortConfig.key, type: sortConfig.direction.toUpperCase() },
  ]),
};
```

**KẾT QUẢ MONG ĐỢI:**

- ✅ Nếu thành công: Sort param hoạt động
- ❌ Nếu thất bại: Format sort JSON có vấn đề

---

### Bước 4: Thử Format Sort Khác (Nếu Bước 3 thất bại)

#### Format 1: Simple String

```javascript
sort: `${sortConfig.key},${sortConfig.direction.toUpperCase()}`;
```

#### Format 2: Different JSON Structure

```javascript
sort: JSON.stringify({
  field: sortConfig.key,
  order: sortConfig.direction.toUpperCase(),
});
```

#### Format 3: Array without nested object

```javascript
sort: `[{"${sortConfig.key}":"${sortConfig.direction.toUpperCase()}"}]`;
```

---

## 🛠️ CÁCH THỰC HIỆN

### 1. Kiểm tra Console

- Mở Developer Tools (F12)
- Vào tab Console
- Reload trang và xem log "🔍 Minimal query test:"

### 2. Kiểm tra Network Tab

- Vào tab Network
- Reload trang
- Tìm request đến `manage-payment/search-with-time-for-tutor-revenue`
- Xem query parameters và response

### 3. Thay đổi Code Từng Bước

- Copy code snippet từ bước tiếp theo
- Thay thế query trong TutorRevenueStatistics.jsx
- Save file và test lại

---

## 🚨 COMMON ISSUES

### Issue 1: periodType không hợp lệ

```javascript
// Thử giá trị cụ thể thay vì variable
periodType: "MONTH"; // thay vì periodType variable
```

### Issue 2: Sort JSON format sai

```javascript
// Thử format đơn giản hơn
sort: "totalRevenueWithTime,DESC";
```

### Issue 3: periodValue không đúng type

```javascript
periodValue: parseInt(periodValue) || 1; // Đảm bảo là number
```

---

## 📊 TRACKING RESULTS

### ✅ Bước 1 - Minimal Query

**Status:** 🧪 TESTING
**Result:** [TBD]

### ⏳ Bước 2 - Add Period Params

**Status:** ⏸️ PENDING
**Result:** [TBD]

### ⏳ Bước 3 - Add Sort Param

**Status:** ⏸️ PENDING  
**Result:** [TBD]

### ⏳ Bước 4 - Alternative Sort Format

**Status:** ⏸️ PENDING
**Result:** [TBD]

---

## 🎯 NEXT STEPS

1. **Test Bước 1** với query tối giản
2. **Report kết quả** - thành công hay thất bại?
3. **Tiếp tục** với bước tiếp theo nếu thành công
4. **Debug sâu hơn** nếu bước 1 thất bại

---

**💡 Tip:** Nếu query tối giản cũng thất bại, vấn đề có thể là:

- Authentication issues
- API endpoint không tồn tại
- CORS configuration
- Backend server issues
