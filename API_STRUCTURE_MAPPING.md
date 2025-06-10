# 📋 API STRUCTURE MAPPING - Trang Thống Kê Doanh Thu Gia Sư

## 🔄 Cập Nhật API Field Mapping

### ✅ Current API Structure Mapping:

#### Endpoint: `manage-payment/search-with-time-for-tutor-revenue`

#### Query Parameters:

```javascript
{
  rpp: number,           // Records per page
  page: number,          // Page number (1-based)
  periodType: string,    // "DAY" | "WEEK" | "MONTH" | "YEAR"
  periodValue: number,   // Number of periods (e.g., 1, 2, 3...)
  sort: string          // JSON string: [{"key": "fieldName", "type": "ASC|DESC"}]
}
```

#### Response Structure:

```javascript
{
  success: boolean,
  data: {
    items: [
      {
        // Thông tin học viên
        user: {
          userId: string,      // Mã học viên
          fullname: string     // Tên học viên
        },

        // Thông tin gia sư
        tutor: {
          userId: string,      // Mã gia sư
          fullname: string     // Tên gia sư
        },

        // Thông tin tiền
        coinOfUserPayment: number,    // Tiền học viên đóng
        coinOfTutorReceive: number,   // Tiền gia sư nhận được
        coinOfWebReceive: number,     // Doanh thu của website

        // Metadata
        createdAt: string,
        // ... other fields
      }
    ],
    total: number,           // Tổng số records
    totalRevenue: number     // Tổng doanh thu (sum of coinOfWebReceive)
  }
}
```

## 📊 Table Column Mapping:

| Cột trong UI       | API Field Path       | Mô tả                       |
| ------------------ | -------------------- | --------------------------- |
| STT                | -                    | Auto-generated index        |
| Mã học viên        | `user.userId`        | ID của học viên             |
| Tên học viên       | `user.fullname`      | Tên đầy đủ của học viên     |
| Mã gia sư          | `tutor.userId`       | ID của gia sư               |
| Tên gia sư         | `tutor.fullname`     | Tên đầy đủ của gia sư       |
| Tiền học viên đóng | `coinOfUserPayment`  | Số tiền học viên thanh toán |
| Tiền trả gia sư    | `coinOfTutorReceive` | Số tiền gia sư nhận được    |
| Doanh thu          | `coinOfWebReceive`   | Doanh thu của website       |

## 🔄 Thay Đổi Đã Thực Hiện:

### From (Incorrect):

```javascript
// Học viên info - WRONG
student.userId;
student.fullname;
```

### To (Correct):

```javascript
// Học viên info - CORRECT
user.userId;
user.fullname;
```

### Confirmed Correct:

```javascript
// Gia sư info - Already correct
tutor.userId;
tutor.fullname;

// Payment info - Already correct
coinOfUserPayment; // Tiền học viên đóng
coinOfTutorReceive; // Tiền gia sư nhận được
coinOfWebReceive; // Doanh thu website
```

## 💰 Currency Formatting:

- **Library:** numeral.js với locale 'vi'
- **Format:** `0,0 đ`
- **Example:** `1,000,000 đ`
- **Null handling:** Hiển thị "N/A"

## 🔍 Safe Data Access:

```javascript
// Using getSafeNestedValue helper function
getSafeNestedValue(row, "user.userId", "...");
getSafeNestedValue(row, "user.fullname", "...");
getSafeNestedValue(row, "tutor.userId", "...");
getSafeNestedValue(row, "tutor.fullname", "...");
```

## ✅ Implementation Status:

- **✅ Field mapping corrected:** `student.*` → `user.*`
- **✅ Currency fields confirmed:** `coinOfUserPayment`, `coinOfTutorReceive`, `coinOfWebReceive`
- **✅ Tutor fields confirmed:** `tutor.userId`, `tutor.fullname`
- **✅ Total revenue:** `totalRevenue` from API response

---

**Updated:** June 9, 2025  
**Status:** API Structure Mapping Complete ✅
